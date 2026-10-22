import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { BRAND, CORE_PILLARS, IMAGES, TEL_LINK } from '@/data/brand';

interface HeroProps {
  onBook: () => void;
}

export default function Hero({ onBook }: HeroProps) {
  return (
    <section id="top" className="relative overflow-hidden bg-cream pt-[76px]">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 lg:min-h-[calc(100vh-76px)] lg:grid-cols-12 lg:items-center lg:gap-10">
        {/* Text column */}
        <div className="order-2 flex flex-col justify-between px-5 pb-14 pt-8 md:px-10 lg:order-1 lg:col-span-6 lg:py-14 lg:pr-2">
          <div className="flex flex-wrap items-center gap-3 animate-fade-in">
            <span className="h-0.5 w-8 bg-gold" />
            <span className="eyebrow">{BRAND.tagline}</span>
          </div>

          <div className="my-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-ivory/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
              <span>{BRAND.serviceArea} · BBB A+ Rated</span>
            </div>

            <h1 className="display mt-6 text-[clamp(3rem,5.8vw,5.8rem)] font-medium text-espresso">
              Clean, clear pools. <em className="font-normal italic text-bronze">Happier days.</em>
            </h1>

            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-espresso/85">
              Dependable residential and commercial pool cleaning, precision water balancing, filter &amp; pump care,
              equipment upgrades, and repairs across Phoenix, AZ.{' '}
              <strong className="font-semibold text-espresso">
                Call or text {BRAND.phoneDisplay} and we’ll get you set up quickly.
              </strong>
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button onClick={onBook} className="btn-primary group">
                Schedule Your Pool Service
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.8} />
              </button>
              <a
                href={TEL_LINK}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-espresso hover:text-bronze"
              >
                <Phone className="h-3.5 w-3.5 text-gold" /> Call {BRAND.phoneDisplay}
              </a>
            </div>
          </div>

          {/* 6 Core Service Pillars from J & A Pools LLC Service Board */}
          <dl className="grid grid-cols-2 gap-4 border-t border-espresso/15 pt-6 sm:grid-cols-3">
            {CORE_PILLARS.map((pillar) => (
              <div
                id={pillar.id}
                key={pillar.id}
                className="scroll-mt-24 rounded-lg border border-espresso/10 bg-ivory/80 p-3.5 shadow-sm"
              >
                <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-bronze">{pillar.title}</dt>
                <dd className="mt-1 text-[13px] leading-snug text-espresso/80">{pillar.subtitle}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual Showcase Column */}
        <div className="order-1 px-4 pt-6 sm:px-6 md:px-10 lg:order-2 lg:col-span-6 lg:py-14 lg:pl-2">
          <div className="space-y-4">
            <figure className="relative animate-fade-in overflow-hidden rounded-xl bg-ivory shadow-[0_28px_70px_-28px_rgba(0,119,145,0.45)] ring-1 ring-gold/35">
              <img
                src={IMAGES.poster}
                alt="J & A Pools LLC — Pool Service, Cleaning, Repairs & Maintenance in Phoenix, AZ 85031"
                width={1400}
                height={933}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="block h-auto w-full object-cover"
              />
            </figure>

            <div className="grid grid-cols-2 gap-4">
              <figure className="relative overflow-hidden rounded-xl ring-1 ring-gold/30 shadow-md">
                <img
                  src={IMAGES.heroTriptych}
                  alt="Crystal clear Arizona pool reflecting clouds in the sky"
                  className="aspect-[16/10] w-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  Mirror-Clear Water
                </figcaption>
              </figure>
              <figure className="relative overflow-hidden rounded-xl ring-1 ring-gold/30 shadow-md">
                <img
                  src={IMAGES.headshot}
                  alt="J & A Pools LLC technician servicing a luxury Phoenix swimming pool"
                  className="aspect-[16/10] w-full object-cover object-center"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  Weekly &amp; Bi-Weekly Care
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
