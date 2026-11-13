import Link from 'next/link';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { PROFILE } from '@/lib/zubair-profile';
import type { CreativeService } from '@/lib/creative-services';

const eyebrow = 'text-xs font-mono uppercase tracking-[0.3em] text-[hsl(var(--primary))]';
const heading = 'mt-4 font-display text-4xl font-light sm:text-5xl';
const muted = 'text-sm leading-relaxed text-[hsl(var(--muted-foreground))]';

/**
 * Server-rendered body of the web development page. Everything is drawn from
 * the service data, so the copy, the schema and the page never drift apart.
 */
export default function WebDevelopmentDesign({ service }: { service: CreativeService }) {
  const marketplaces = PROFILE.freelanceProfiles.filter((profile) => profile.href.startsWith('http'));

  return (
    <>
      <section className="relative overflow-hidden border-b border-[hsl(var(--border))] pb-24 pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60"
          style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(var(--brand-rgb),0.22), transparent 70%)' }}
        />
        <div className="container-custom relative max-w-4xl text-center">
          <p className="glass mx-auto mb-8 w-fit rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--primary))]">
            {service.eyebrow} · Hyderabad, Pakistan
          </p>
          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-8xl">
            {service.title}
            <br />
            <em className="text-[hsl(var(--primary))]">{service.accent}</em>
          </h1>
          <p className={`mx-auto mt-8 max-w-xl md:text-lg ${muted}`}>{service.intro}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row">
            {/* /book is a static page outside the app router, so it needs a full navigation. */}
            <a href={PROFILE.actions.schedule.publicPath} className="btn-primary text-sm">
              <Calendar size={16} aria-hidden="true" /> Book a free call
            </a>
            <Link href={service.hero.href} className="btn-outline text-sm">
              See projects <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <div className="container-custom">
        <section className="cv-auto mt-20" aria-labelledby="web-offerings">
          <p className={eyebrow}>What I build</p>
          <h2 id="web-offerings" className={heading}>Web development services</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.offerings.map((item) => (
              <article key={item.title} className="glass rounded-2xl p-6">
                <h3 className="font-display text-2xl font-light">{item.title}</h3>
                <p className={`mt-3 ${muted}`}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cv-auto mt-20" aria-labelledby="web-stack">
          <p className={eyebrow}>Stack</p>
          <h2 id="web-stack" className={heading}>Tools I build with</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {service.tools.map((tool) => (
              <li key={tool.name} className="glass flex items-start gap-4 rounded-2xl p-5">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[hsl(var(--border))] font-mono text-xs text-[hsl(var(--primary))]"
                >
                  {tool.mark}
                </span>
                <span>
                  <strong className="block font-medium">{tool.name}</strong>
                  <span className={muted}>{tool.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section id="process" className="cv-auto mt-20" aria-labelledby="web-process">
          <p className={eyebrow}>Process</p>
          <h2 id="web-process" className={heading}>From first call to launch</h2>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, index) => (
              <li key={step.title} className="glass rounded-2xl p-6">
                <span className="font-mono text-xs text-[hsl(var(--primary))]">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 font-display text-2xl font-light">{step.title}</h3>
                <p className={`mt-3 ${muted}`}>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="cv-auto mt-20" aria-labelledby="web-hire">
          <p className={eyebrow}>Hire</p>
          <h2 id="web-hire" className={heading}>Ways to work together</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <a href={PROFILE.actions.schedule.publicPath} className="glass glass-hover rounded-2xl p-6">
              <h3 className="font-display text-2xl font-light">Direct consultation</h3>
              <p className={`mt-3 ${muted}`}>Book a free 30-minute Google Meet call for a custom quote and scope review.</p>
            </a>
            {marketplaces.map((profile) => (
              <a
                key={profile.id}
                href={profile.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass glass-hover rounded-2xl p-6"
              >
                <h3 className="font-display text-2xl font-light">{profile.label}</h3>
                <p className={`mt-3 ${muted}`}>{profile.description}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
