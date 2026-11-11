import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { GRAPHIC_DESIGN, VIDEO_EDITING, WEB_DEVELOPMENT } from '@/lib/creative-services';

const cards = [WEB_DEVELOPMENT, VIDEO_EDITING, GRAPHIC_DESIGN];

export default function CreativeServices() {
  return (
    <section id="creative-services" className="section-padding cv-auto" aria-labelledby="creative-services-title">
      <div className="container-custom">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-[hsl(var(--primary))]">Services</p>
        <h2 id="creative-services-title" className="mt-4 font-display text-4xl font-light sm:text-6xl">
          Web, video, design &amp; lead generation
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.path} href={card.path} className="glass glass-hover group rounded-2xl p-7">
              <h3 className="font-display text-3xl font-light">{card.eyebrow}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{card.intro}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[hsl(var(--primary))]">
                Explore <ArrowUpRight size={13} aria-hidden="true" />
              </span>
            </Link>
          ))}
          <a
            href="https://leadgen-project-smoky.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass-hover group rounded-2xl p-7 md:col-span-2 lg:col-span-3"
          >
            <h3 className="font-display text-3xl font-light">Lead Generation System</h3>
            <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              A multi-source B2B lead generator with email verification and deliverability scoring. Want proof? Try it yourself.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[hsl(var(--primary))]">
              Try the live demo <ArrowUpRight size={13} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
