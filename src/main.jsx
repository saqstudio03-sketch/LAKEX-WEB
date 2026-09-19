import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDownRight, ArrowUpRight, Check, ChevronDown, Menu, MoveUpRight, Plus, X } from 'lucide-react'
import './styles.css'

const navItems = [
  ['Home', 'home'],
  ['About', 'about'],
  ['Services', 'services'],
  ['Work', 'work'],
  ['Contact', 'contact'],
]

const services = [
  { number: '01', title: 'AI & Automation', text: 'Intelligent systems and workflow automation that remove friction and accelerate decisions.', tag: 'AI' },
  { number: '02', title: 'Software & SaaS', text: 'Custom software and scalable SaaS platforms designed for real business operations.', tag: 'SOFTWARE' },
  { number: '03', title: 'Mobile Applications', text: 'Modern iOS and Android apps built around usability, performance and business value.', tag: 'APPS' },
  { number: '04', title: 'IoT & Smart Hardware', text: 'Connected product experiences that bring physical systems into a smarter digital layer.', tag: 'IOT' },
  { number: '05', title: 'Data & Intelligent Solutions', text: 'Data-driven systems that turn information into insight, speed, and measurable outcomes.', tag: 'DATA' },
  { number: '06', title: 'AI Creative Technology', text: 'Creative AI experiences that blend storytelling, media and intelligent product design.', tag: 'CREATIVE' },
  { number: '07', title: 'AI-Powered Business Solutions', text: 'End-to-end digital transformation strategies that align automation with growth goals.', tag: 'BUSINESS' },
]

const projects = [
  { type: 'APP DEVELOPMENT', title: 'Digital Commerce', description: 'A sharper way to move products and people.', visual: 'commerce', accent: '#1264FF', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=85' },
  { type: 'AI / SOFTWARE', title: 'Smart Mobility', description: 'Smarter systems for faster, calmer decisions.', visual: 'mobility', accent: '#8fe4ff', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=85' },
  { type: 'WEB DEVELOPMENT', title: 'Business Intelligence', description: 'Clarity for decisions that matter.', visual: 'intelligence', accent: '#ffae78', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85' },
]

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('is-visible')
        observer.disconnect()
      }
    }, { threshold: 0.12 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return ref
}

function Logo() {
  return <a className="logo" href="#home" aria-label="LAKEX home"><img src="/logo.png" alt="LAKEX" /></a>
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [morphed, setMorphed] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    let frame = 0
    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        const scrollY = window.scrollY
        setScrolled(scrollY > 30)
        setMorphed(scrollY > window.innerHeight * 0.7)
        frame = 0
      })
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])
  const close = () => setOpen(false)
  return <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${morphed ? 'navbar-morphed' : ''} ${open ? 'navbar-open' : ''}`}>
    <div className="nav-inner">
      <Logo />
      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>
      <a className="nav-cta" href="#contact">Let's talk <ArrowUpRight size={15} /></a>
      <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navItems.map(([label, id]) => <a key={id} href={`#${id}`} onClick={close}>{label}<ArrowUpRight size={16} /></a>)}
      <a href="#contact" onClick={close}>Start a project <ArrowUpRight size={16} /></a>
    </nav>
  </header>
}

function Hero() {
  const [pointer, setPointer] = useState({ x: 50, y: 50 })
  const pointerFrame = useRef(0)
  const handlePointerMove = (event) => {
    if (pointerFrame.current) return
    pointerFrame.current = window.requestAnimationFrame(() => {
      setPointer({ x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 })
      pointerFrame.current = 0
    })
  }
  return <section id="home" className="hero" onMouseMove={handlePointerMove}>
    <div className="hero-image" style={{ transform: `scale(1.04) translate(${(pointer.x - 50) * -0.015}%, ${(pointer.y - 50) * -0.015}%)` }} />
    <div className="hero-shade" />
    <div className="hero-orbit orbit-one" />
    <div className="hero-orbit orbit-two" />
    <div className="hero-content container">
      <p className="eyebrow reveal reveal-delay-1"><span className="eyebrow-dot" /> Building what's next</p>
      <h1 className="hero-title"><span className="line reveal reveal-delay-2">We build digital</span><span className="line reveal reveal-delay-3">experiences that</span><span className="line hero-title-accent reveal reveal-delay-4">move businesses.</span></h1>
      <div className="hero-bottom reveal reveal-delay-5">
        <p className="hero-description">LAKEX creates modern apps, websites and technology solutions that help businesses turn ideas into digital products.</p>
        <div className="hero-actions"><a className="button button-light" href="#work">Explore our work <ArrowDownRight size={17} /></a><a className="button button-ghost" href="#contact">Start a project <ArrowUpRight size={17} /></a></div>
      </div>
    </div>
    <div className="hero-meta"><span>Scroll to explore <ArrowDownRight size={14} /></span></div>
  </section>
}

function SectionIntro({ kicker, title, copy, id }) {
  return <div className="section-intro reveal" id={id}><p className="eyebrow">{kicker}</p><h2>{title}</h2>{copy && <p className="intro-copy">{copy}</p>}</div>
}

function About() {
  const ref = useReveal()
  return <section className="about section container" ref={ref} id="about"><div className="about-grid"><SectionIntro kicker="About LAKEX" title={<>
Building technology<br /><em>for the real world.</em></>} copy="LakeX is an AI-first technology company focused on turning ideas and real-world problems into practical technology solutions. We build across Artificial Intelligence, Software, Mobile Applications, IoT, Smart Hardware, Data, and Creative Technology, helping businesses, organizations, and individuals use emerging technology in meaningful ways." /><div className="about-visual"><div className="signal-grid" /><div className="signal-ring ring-large" /><div className="signal-ring ring-small" /><div className="signal-core"><span>LKX</span><i /></div><p>AI-FIRST / FUTURE READY</p><span className="visual-coordinate">Starting from Kerala<br />Built for a global mindset</span></div></div><div className="stat-row">{['AI-first', 'Software', 'Mobile apps', 'IoT & data'].map((stat, index) => <div className="stat" key={stat}><span>0{index + 1}</span><strong>{stat}</strong><ArrowUpRight size={16} /></div>)}</div></section>
}

function Team() {
  const ref = useReveal()
  const members = [
    ['01', 'Full stack development', 'Anandu & Jithin'],
    ['02', 'Android / iOS app development', 'Akash & Ahad'],
    ['03', 'Creative technology', 'Abhinav & Abhimanue'],
    ['04', 'Hardware and IoT', 'Yaseen'],
  ]
  return <section className="team section" id="team" ref={ref}><div className="container"><div className="team-header"><SectionIntro kicker="The people behind LAKEX" title={<>Our <em>team.</em></>} /><div className="team-photo" aria-label="Group photo space"><span>GROUP PHOTO</span></div></div><div className="team-grid">{members.map(([number, responsibility, names]) => <article className="team-card" key={number}><span className="team-number">{number}</span><h3>{responsibility}</h3><p>{names}</p></article>)}</div></div></section>
}

function Services() {
  const ref = useReveal()
  return <section className="services section" id="services" ref={ref}><div className="container"><SectionIntro kicker="Capabilities" title="What We Do" copy="We turn ideas into intelligent technology. At LakeX, we combine AI, software, hardware, and creative technology to build practical solutions for real-world needs." /><div className="services-list">{services.map((service) => <article className="service-row" key={service.number}><span className="service-number">{service.number}</span><div className="service-name"><h3>{service.title}</h3><p>{service.text}</p></div><span className="service-tag">{service.tag}</span><span className="service-plus"><Plus size={20} /></span></article>)}</div></div></section>
}

function ProjectVisual({ type, accent, image }) {
  return <div className={`project-visual project-${type}`} style={{ '--project-accent': accent, '--project-image': `url(${image})` }}><div className="visual-noise" /><div className="visual-label">LAKEX / 2026</div>{type === 'commerce' && <><div className="commerce-orb" /><div className="commerce-line line-a" /><div className="commerce-line line-b" /><div className="commerce-card"><span>03</span><b>MOVE / MORE</b><small>Digital commerce system</small></div></>}{type === 'mobility' && <><div className="mobility-map"><i /><i /><i /><i /><i /></div><div className="mobility-route" /><div className="mobility-coordinate">40.7128° N<br />74.0060° W</div></>}{type === 'intelligence' && <><div className="chart-bars"><i /><i /><i /><i /><i /><i /><i /></div><div className="chart-caption">SYSTEM / INSIGHT<br /><strong>94.8%</strong></div><div className="chart-line" /></>}</div>
}

function Projects() {
  const ref = useReveal()
  return <section className="projects section container" id="work" ref={ref}><div className="projects-head"><SectionIntro kicker="Selected work" title="Built for the next move." /><a className="text-link" href="#contact">View all projects <ArrowUpRight size={16} /></a></div><div className="project-grid">{projects.map((project, index) => <article className={`project-card project-card-${index + 1}`} key={project.title}><ProjectVisual type={project.visual} accent={project.accent} image={project.image} /><div className="project-info"><p>{project.type}</p><h3>{project.title}</h3><span>{project.description}</span><ArrowUpRight size={18} /></div></article>)}</div></section>
}

function Process() {
  const ref = useReveal()
  const steps = [['01', 'Discover', 'Understand the idea, problem and business goals.'], ['02', 'Design', 'Plan the experience, interface and technical direction.'], ['03', 'Build', 'Develop, test and refine the product.'], ['04', 'Launch', 'Deploy, improve and support the solution.']]
  return <section className="process section" ref={ref}><div className="container"><SectionIntro kicker="The process" title="How we work" /><div className="process-grid">{steps.map(([number, title, text]) => <article className="process-step" key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={18} /></article>)}</div></div></section>
}

function WhyLakex() {
  const ref = useReveal()
  return <section className="why section" ref={ref}><div className="container why-inner"><div><p className="eyebrow">The LAKEX approach</p><h2>From <em>idea</em><br />to <em>impact.</em></h2></div><div className="why-list">{['Built around your needs.', 'AI where it creates real value.', 'Simple technology. No unnecessary complexity.', 'From concept to working product.'].map((item, i) => <div className="why-item" key={item}><span>0{i + 1}</span><p>{item}</p><Check size={17} /></div>)}</div></div></section>
}

function Contact() {
  const ref = useReveal()
  const [sent, setSent] = useState(false)
  const submit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const name = (formData.get('name') ?? '').toString().trim()
    const email = (formData.get('email') ?? '').toString().trim()
    const company = (formData.get('company') ?? '').toString().trim()
    const project = (formData.get('project') ?? '').toString().trim()

    if (!name || !email || !project) {
      form.reportValidity?.()
      return
    }

    const message = [
      'Hello LAKEX,',
      '',
      'I would like to discuss a project.',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company}`,
      '',
      'Project:',
      project,
      '',
      'Thank you.'
    ].join('\n')

    const url = `https://wa.me/917306486001?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  return <section className="contact section container" id="contact" ref={ref}><div className="contact-grid"><div className="contact-copy"><p className="eyebrow">Start a conversation</p><h2>Have an idea?<br /><em>Let's build it.</em></h2><p>Tell us what you're building, what you're trying to solve, or where you want to go next.</p><a className="contact-email" href="mailto:hello@lakex.studio">hello@lakex.studio <ArrowUpRight size={16} /></a></div><form className="contact-form" onSubmit={submit}>{sent ? <div className="success-state"><span><Check size={22} /></span><h3>Message received.</h3><p>Thanks for reaching out. We'll be in touch soon.</p><button type="button" className="text-link" onClick={() => setSent(false)}>Send another message <ArrowUpRight size={15} /></button></div> : <><label>Name<input required name="name" type="text" placeholder="Your name" /></label><div className="form-row"><label>Email<input required name="email" type="email" placeholder="you@company.com" /></label><label>Company<input name="company" type="text" placeholder="Your company" /></label></div><label>Tell us about your project<textarea required name="project" rows="4" placeholder="A few words about what you're building..." /></label><button className="button button-light submit-button" type="submit">Send message <ArrowUpRight size={17} /></button></>}</form></div></section>
}

function Footer() {
  return <footer className="footer"><div className="container"><div className="footer-top"><Logo /><p>Building digital experiences<br />for what's next.</p><div className="footer-links"><a href="#home">Home</a><a href="#about">About</a><a href="#services">Services</a><a href="#work">Work</a><a href="#contact">Contact</a></div><div className="social-links"><a href="https://www.instagram.com/lakex.in?stkn=ZTNhOW1nbmxuc3B0" target="_blank" rel="noreferrer">Instagram <MoveUpRight size={13} /></a><a href="#contact">LinkedIn <MoveUpRight size={13} /></a><a href="#contact">GitHub <MoveUpRight size={13} /></a></div></div><div className="footer-bottom"><span>© 2026 <a className="footer-credit-link" href="https://saqstudio.in">SAQ STUDIO</a>. All rights reserved.</span><span>Made for what's next <ArrowUpRight size={14} /></span></div></div></footer>
}

function App() {
  return <><Navbar /><main><Hero /><About /><Team /><Services /><Projects /><Process /><WhyLakex /><Contact /></main><Footer /></>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
