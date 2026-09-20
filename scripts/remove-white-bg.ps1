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
Write-Output "Loaded $w x $h"
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bytes = New-Object byte[] ($w * $h * 4)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
$bmp.UnlockBits($data)

$total = $w * $h
$removed = New-Object bool[] $total
$stack = New-Object 'System.Collections.Generic.Stack[int]'
for ($x = 0; $x -lt $w; $x++) { $stack.Push($x); $stack.Push(($h - 1) * $w + $x) }
for ($y = 0; $y -lt $h; $y++) { $stack.Push($y * $w); $stack.Push($y * $w + $w - 1) }

while ($stack.Count -gt 0) {
  $i = $stack.Pop()
  if ($removed[$i]) { continue }
  $o = $i * 4
  $b = $bytes[$o]; $g = $bytes[$o + 1]; $r = $bytes[$o + 2]; $a = $bytes[$o + 3]
  if ($a -eq 0 -or ($r -ge 244 -and $g -ge 244 -and $b -ge 244)) {
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

# Feather anti-aliased edges: pixels near white touching a removed pixel get proportional alpha.
$feathered = 0
for ($i = 0; $i -lt $total; $i++) {
  if ($removed[$i]) { continue }
  $o = $i * 4
  if ($bytes[$o + 3] -eq 0) { continue }
  $r = $bytes[$o + 2]; $g = $bytes[$o + 1]; $b = $bytes[$o]
  $m = [math]::Min($r, [math]::Min($g, $b))
  if ($m -ge 225) {
    $x = $i % $w
    $y = [math]::Floor($i / $w)
    $adjT = $false
    if (($x -gt 0 -and $removed[$i - 1]) -or ($x -lt $w - 1 -and $removed[$i + 1]) -or ($y -gt 0 -and $removed[$i - $w]) -or ($y -lt $h - 1 -and $removed[$i + $w])) { $adjT = $true }
    if ($adjT) {
      $bytes[$o + 3] = [int][math]::Min(255, [math]::Max(0, (255 - $m) * 12))
      $feathered++
    }
  }
}

$removedCount = 0
foreach ($v in $removed) { if ($v) { $removedCount++ } }
Write-Output ("Removed {0:P1} of pixels (exterior white). Feathered {1} edge pixels." -f ($removedCount / $total), $feathered)

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
Write-Output "Saved transparent background version to $path"