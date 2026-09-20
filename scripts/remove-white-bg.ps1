Add-Type -AssemblyName System.Drawing
$path = (Resolve-Path 'public/about.png').Path
$sourceBytes = [System.IO.File]::ReadAllBytes($path)
$memoryStream = New-Object System.IO.MemoryStream(,$sourceBytes)
$sourceImage = [System.Drawing.Image]::FromStream($memoryStream)
$memoryStream.Dispose()
$w = $sourceImage.Width; $h = $sourceImage.Height
# Draw onto a true 32bppArgb canvas so the alpha channel survives processing.
$bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.DrawImage($sourceImage, 0, 0, $w, $h)
$graphics.Dispose()
$sourceImage.Dispose()

$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bytes = New-Object byte[] ($w * $h * 4)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
$bmp.UnlockBits($data)

$total = $w * $h

# ---- Pass 1: flood fill exterior near-white (aggressive threshold) ----
$removed = New-Object bool[] $total
$stack = New-Object 'System.Collections.Generic.Stack[int]'
for ($x = 0; $x -lt $w; $x++) { $stack.Push($x); $stack.Push(($h - 1) * $w + $x) }
for ($y = 0; $y -lt $h; $y++) { $stack.Push($y * $w); $stack.Push($y * $w + $w - 1) }

while ($stack.Count -gt 0) {
  $i = $stack.Pop()
  if ($removed[$i]) { continue }
  $o = $i * 4
  $b = $bytes[$o]; $g = $bytes[$o + 1]; $r = $bytes[$o + 2]; $a = $bytes[$o + 3]
  if ($a -eq 0 -or ($r -ge 238 -and $g -ge 238 -and $b -ge 238)) {
    $removed[$i] = $true
    $bytes[$o + 3] = 0
    $x = $i % $w
    $y = [math]::Floor($i / $w)
    if ($x -gt 0) { $stack.Push($i - 1) }
    if ($x -lt $w - 1) { $stack.Push($i + 1) }
    if ($y -gt 0) { $stack.Push($i - $w) }
    if ($y -lt $h - 1) { $stack.Push($i + $w) }
  }
}

# ---- Pass 2: BFS halo fade from the removed region, travelling only through pale pixels ----
$distArr = New-Object int[] $total
$queue = New-Object 'System.Collections.Generic.Queue[int]'
for ($i = 0; $i -lt $total; $i++) { if ($removed[$i]) { $queue.Enqueue($i) } }
$maxD = 44
$haloSoftened = 0
while ($queue.Count -gt 0) {
  $i = $queue.Dequeue()
  $d = $distArr[$i]
  if ($d -ge $maxD) { continue }
  $x = $i % $w
  $y = [math]::Floor($i / $w)
  $factor = 1.0 - ($d / ($maxD + 6))
  foreach ($n in @(($i - 1), ($i + 1), ($i - $w), ($i + $w))) {
    if ($n -lt 0 -or $n -ge $total) { continue }
    if ($removed[$n]) { continue }
    $nx = $n % $w
    if ([math]::Abs($nx - $x) -gt 1) { continue }  # skip horizontal wrap
    $o = $n * 4
    $m = [math]::Min($bytes[$o], [math]::Min($bytes[$o + 1], $bytes[$o + 2]))
    if ($m -lt 200) { continue }  # stop at saturated artwork content
    if ($distArr[$n] -ne 0) { continue }
    $distArr[$n] = $d + 1
    if ($m -ge 212 -and $bytes[$o + 3] -gt 0) {
      $newAlpha = [int][math]::Min(255, [math]::Max(0, (238 - $m) * 16 * $factor))
      if ($newAlpha -lt $bytes[$o + 3]) { $bytes[$o + 3] = $newAlpha; $haloSoftened++ }
    }
    $queue.Enqueue($n)
  }
}

$removedCount = 0
foreach ($v in $removed) { if ($v) { $removedCount++ } }
Write-Output ("Flood-filled {0:P1} of pixels. Softened {1} halo pixels." -f ($removedCount / $total), $haloSoftened)

$data2 = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data2.Scan0, $bytes.Length)
$bmp.UnlockBits($data2)
$bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

$check = New-Object System.Drawing.Bitmap($path)
$corner = $check.GetPixel(2, 2)
$center = $check.GetPixel([int]($check.Width / 2), [int]($check.Height / 2))
Write-Output "Corner alpha: $($corner.A) | Center alpha: $($center.A)"
$check.Dispose()
Write-Output "Saved to $path"