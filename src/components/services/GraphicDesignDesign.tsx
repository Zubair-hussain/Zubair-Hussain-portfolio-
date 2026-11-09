'use client';

import { useEffect, useRef, useState } from 'react';
import './graphic-design.css';

const MENU = [['Social Media', 'V'], ['Thumbnails', 'H'], ['UI Design', 'K'], ['Branding', 'B']];
const CHIPS = ['Product Design', 'Social Media', 'Landing Pages', 'Logo Design', 'Thumbnails', 'Ad Creatives', 'Illustrations', 'Web Design', 'Mobile App UI', 'Brand Identity', 'Motion Graphics', 'UI/UX'];
const FigmaLogo = (
  <svg width="30" viewBox="0 0 38 57" aria-hidden="true">
    <path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 019.5 0H19v19H9.5A9.5 9.5 0 010 9.5z" />
    <path fill="#ff7262" d="M19 0h9.5a9.5 9.5 0 010 19H19z" />
    <path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z" />
    <path fill="#0acf83" d="M0 47.5A9.5 9.5 0 019.5 38H19v9.5a9.5 9.5 0 01-19 0z" />
    <path fill="#a259ff" d="M0 28.5A9.5 9.5 0 019.5 19H19v19H9.5A9.5 9.5 0 010 28.5z" />
  </svg>
);
const TOOLS = [
  { logo: FigmaLogo, bg: '#1e1e1e', color: '#fff', name: 'Figma', text: 'UI/UX, design systems, prototypes and interactive flows.', w: 96 },
  { logo: 'Pr', bg: '#00005b', color: '#9999ff', name: 'Premiere Pro', text: 'Reels, ads and cinematic edits with motion graphics.', w: 88 },
  { logo: 'Ae', bg: '#00005b', color: '#d291ff', name: 'After Effects', text: 'Motion graphics, animated titles and visual effects.', w: 85 },
  { logo: 'C', bg: 'linear-gradient(135deg, #00c4cc, #7d2ae8)', color: '#fff', name: 'Canva', text: 'Quick social posts, presentations and brand templates.', w: 94 },
  { logo: 'Ps', bg: '#001e36', color: '#31a8ff', name: 'Photoshop', text: 'Thumbnails, photo manipulation, retouching and social posts.', w: 92 },
  { logo: 'Ai', bg: '#330000', color: '#ff9a00', name: 'Illustrator', text: 'Logos, vector illustrations, icons and brand identity.', w: 90 },
];
const WORK = [
  { tag: 'UI/UX · Figma', art: 'UI', title: 'Mobile App UI', text: 'Banking-app style screens and flows.' },
  { tag: 'Branding · Illustrator', art: 'Aa', title: 'Brand Identity', text: 'Logo, packaging and brand guidelines.' },
  { tag: 'Thumbnails · Photoshop', art: '▶', title: 'YouTube Pack', text: 'Thumbnails built for click-through rate.' },
  { tag: 'Motion · Premiere Pro', art: '◐', title: 'Launch Reel', text: '30-second product launch ad with motion.' },
  { tag: 'Social Media', art: '#', title: 'Feed Makeover', text: '30-day Instagram content system.' },
];
const STATS = [[120, 'Projects delivered'], [60, 'Happy clients'], [4, 'Years designing'], [24, 'Hour response']] as const;
const STEPS = [
  ['Discover', 'A quick call to understand your goals, audience and style.'],
  ['Concept', 'Moodboards and first directions you can react to fast.'],
  ['Design', 'Polished visuals in Figma, Photoshop and Illustrator.'],
  ['Deliver', 'All source files, exports and revisions included.'],
];
const PLANS = [
  { name: 'Starter', amt: '$5', unit: '/project', text: 'Perfect for one quick design need.', items: ['5 social media creatives or 3 thumbnails', '2 revisions', 'Source files', '3-day delivery'], cta: 'Get started' },
  { name: 'Pro · Most popular', amt: '$7', unit: '/project', text: 'Full brand or UI/UX package.', items: ['Logo + brand identity or 8 UI screens', 'Figma prototype', 'Unlimited revisions', 'Priority support'], cta: 'Book a call', hot: true },
  { name: 'Monthly', amt: '$20', unit: '/month', text: 'Your on-demand design team.', items: ['Unlimited design requests', 'Motion graphics and video edits', 'Dedicated Slack channel', '48h turnaround'], cta: 'Subscribe' },
];
const WORDS = ['Figma', 'Branding', 'Photoshop', 'UI/UX', 'Illustrator', 'Motion', 'Premiere Pro'];
const TOOLBAR = ['➤', '#', '○', '✎', 'T', '💬', '⧉', '</>'];

function Counter({ n }: { n: number }) {
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      let t = 0;
      const tick = () => {
        t = Math.min(t + 0.02, 1);
        setValue(Math.round(n * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      tick();
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [n]);
  return <b ref={ref}>{value}+</b>;
}

export default function GraphicDesignDesign() {
  const root = useRef<HTMLDivElement>(null);
  const stmt = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const pile = useRef<HTMLDivElement>(null);
  const gal = useRef<HTMLDivElement>(null);
  const [dropped, setDropped] = useState(false);
  const [tool, setTool] = useState(0);

  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const reveal = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('in');
    }), { threshold: 0.15 });
    host.querySelectorAll('.rv').forEach((el) => reveal.observe(el));

    const drop = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setDropped(true); drop.disconnect(); }
    }, { threshold: 0.3 });
    if (pile.current) drop.observe(pile.current);

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!stmt.current || !heading.current) return;
        const r = stmt.current.getBoundingClientRect();
        const p = Math.min(Math.max(-r.top / ((r.height - window.innerHeight) * 0.85), 0), 1);
        heading.current.style.setProperty('--p', `${p * 110}%`);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      reveal.disconnect();
      drop.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const dragChip = (ev: React.PointerEvent<HTMLDivElement>) => {
    const d = ev.currentTarget;
    d.setPointerCapture(ev.pointerId);
    const sx = ev.clientX - d.offsetLeft;
    const sy = ev.clientY - d.offsetTop;
    d.style.transition = 'none';
    d.style.zIndex = '9';
    d.onpointermove = (m) => { d.style.left = `${m.clientX - sx}px`; d.style.top = `${m.clientY - sy}px`; };
    d.onpointerup = () => { d.onpointermove = null; d.style.transition = ''; };
  };

  return (
    <div className="gd" ref={root}>
      <header className="gd-hero">
        <div className="gd-menu" aria-hidden="true">
          {MENU.map(([label, key]) => <div key={label}>{label} <span>{key}</span></div>)}
        </div>
        <div className="gd-frame">
          <i className="h tl" /><i className="h tr" /><i className="h bl" /><i className="h br" />
          <h1 className="gd-big">GRAPHIC<br />DESIGN</h1>
        </div>
        <div className="gd-card"><b>2026 Edition</b><p>Graphic design, UI/UX and motion crafted for brands that want to stand out.</p></div>
        <div className="gd-cursor" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M3 2l18 8-8 2-2 8z" /></svg><em>Zubair Hussain</em>
        </div>
        <div className="gd-toolbar" aria-hidden="true">
          {TOOLBAR.map((t, i) => <button key={t} tabIndex={-1} className={i === tool ? 'on' : ''} onClick={() => setTool(i)}>{t}</button>)}
        </div>
      </header>

      <section className="gd-statement" ref={stmt}>
        <div className="stick">
          <h2 ref={heading}>Design that looks beautiful, feels effortless, and makes your brand impossible to ignore.</h2>
        </div>
      </section>

      <section className="gd-services" id="services">
        <div className="wrap">
          <div className="top">
            <h2 className="rv">ALL YOUR <span className="serif">design needs</span></h2>
            <div className="rv d2">
              <p>Every design service in one place, delivered with care, speed and a sharp eye for detail.</p>
              <a className="gd-white" href="/book">BOOK A CALL</a>
            </div>
          </div>
          <div className="pile" ref={pile}>
            {CHIPS.map((chip, i) => (
              <div
                key={chip}
                className="chip"
                onPointerDown={dragChip}
                style={{
                  left: `${4 + (i * 8.3) % 72}%`,
                  top: dropped ? (i < 4 ? 250 : i < 8 ? 165 : 80) + (i * 7) % 30 : -300,
                  transform: `rotate(${((i * 53) % 40) - 20}deg)`,
                  transitionDelay: `${i * 90}ms`,
                }}
              >{chip}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="pad" id="tools">
        <div className="wrap">
          <div className="eyebrow rv">The toolkit</div>
          <h2 className="title rv d1">Pro tools.<br /><span className="serif">Pro results.</span></h2>
          <div className="tools">
            {TOOLS.map((t, i) => (
              <div key={t.name} className={`tool rv d${i % 3}`}>
                <div className="ico" style={{ background: t.bg, color: t.color }}>{t.logo}</div>
                <div>
                  <h3>{t.name}</h3><p>{t.text}</p>
                  <div className="bar"><span style={{ '--w': `${t.w}%` } as React.CSSProperties} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pad work" id="work">
        <div className="wrap"><div className="eyebrow rv">What I make</div><h2 className="title rv d1">Take a closer <span className="serif">look.</span></h2></div>
        <div className="gal" ref={gal}>
          {WORK.map((w, i) => (
            <article key={w.title} className={`proj p${i + 1}`}>
              <span className="tag">{w.tag}</span><div className="art" aria-hidden="true">{w.art}</div><h3>{w.title}</h3><p>{w.text}</p>
            </article>
          ))}
        </div>
        <div className="gal-nav">
          <button aria-label="Previous" onClick={() => gal.current?.scrollBy({ left: -440, behavior: 'smooth' })}>‹</button>
          <button aria-label="Next" onClick={() => gal.current?.scrollBy({ left: 440, behavior: 'smooth' })}>›</button>
        </div>
      </section>

      <section className="pad"><div className="wrap stats">
        {STATS.map(([n, label], i) => <div key={label} className={`rv d${i}`}><Counter n={n} /><span>{label}</span></div>)}
      </div></section>

      <div className="marq" aria-hidden="true"><div>{[...WORDS, ...WORDS].map((w, i) => <span key={i} className={i % 2 ? 'serif' : ''}>{w} ✦</span>)}</div></div>

      <section className="pad" id="process"><div className="wrap">
        <div className="eyebrow rv">How it works</div>
        <h2 className="title rv d1">Simple process. <span className="serif">Stunning output.</span></h2>
        <div className="steps">
          {STEPS.map(([title, text], i) => (
            <div key={title} className={`step rv d${i}`}><em>0{i + 1}</em><h3>{title}</h3><p>{text}</p></div>
          ))}
        </div>
      </div></section>

      <section className="pad" id="plans"><div className="wrap">
        <h2 className="price-h rv">PRICING <span className="serif">plan</span></h2>
        <div className="plans">
          {PLANS.map((plan, i) => (
            <div key={plan.name} className={`plan rv d${i} ${plan.hot ? 'hot' : ''}`}>
              <h3>{plan.name}</h3>
              <div className="from">Starting from</div>
              <div className="amt">{plan.amt}<small> {plan.unit}</small></div>
              <p>{plan.text}</p>
              <ul>{plan.items.map((item) => <li key={item}>{item}</li>)}</ul>
              <a className="cta" href="/book">{plan.cta}</a>
            </div>
          ))}
        </div>
      </div></section>

      <section className="gd-contact">
        <h2 className="rv">Let&apos;s make<br /><span className="serif">something great.</span></h2>
        <p className="rv d1">Have a project in mind? Book a free 15-minute call and get a custom quote within 24 hours.</p>
        <a className="big-btn rv d2" href="/book">Let&apos;s chat →</a>
      </section>
    </div>
  );
}
