import { ArrowRight } from 'lucide-react';
import { IMAGES, SERVICES, TRAVEL, type ServiceId } from '@/data/brand';
import Reveal from './Reveal';

interface Props {
  selected: ServiceId;
  onSelect: (id: ServiceId) => void;
  onBook: () => void;
}

export default function ServicesShowcase({ selected, onSelect, onBook }: Props) {
  const pick = (id: ServiceId) => {
    onSelect(id);
    document.getElementById('treatments')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services" className="relative overflow-hidden bg-cream text-espresso border-y border-espresso/15">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-5 py-24 md:px-10 md:py-32 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5 space-y-5">
          <figure className="relative overflow-hidden rounded-2xl bg-ivory p-3 shadow-lg ring-1 ring-gold/35">
            <img
              src={IMAGES.headshot}
              alt="J & A Pools technician cleaning a sparkling aqua pool in Phoenix, AZ"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-xl object-cover"
            />
            <figcaption className="mt-3 flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-bronze">
              <span>J &amp; A Pools LLC · On-Site Crew</span>
              <span>Phoenix, AZ</span>
            </figcaption>
          </figure>
        </Reveal>

        <div className="flex flex-col justify-center lg:col-span-7">
          <Reveal>
            <p className="eyebrow">Services &amp; Maintenance Plans</p>
            <h2 className="display mt-5 text-[clamp(2.8rem,5.2vw,5rem)] text-espresso">
              Complete Pool Care, <em className="italic text-bronze">Every Visit.</em>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-espresso/80">
              Select a service plan below to customize your pool care checklist or request a fast quote for your
              residential or commercial pool in Phoenix and surrounding areas.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-10">
            <ul className="border-t border-espresso/20">
              {SERVICES.map((s) => {
                const active = s.id === selected;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => pick(s.id)}
                      aria-pressed={active}
                      className={`group flex w-full items-baseline justify-between gap-6 border-b border-espresso/20 px-4 py-6 text-left transition-colors ${
                        active ? 'bg-petal/70' : 'hover:bg-ivory/70'
                      }`}
                    >
                      <span>
                        <span
                          className={`font-serif text-2xl font-medium transition-colors md:text-3xl ${
                            active ? 'text-bronze' : 'text-espresso group-hover:text-bronze'
                          }`}
                        >
                          {s.name}
                        </span>
                        <span className="mt-1.5 block text-[14px] text-espresso/75">{s.description}</span>
                      </span>
                      <span className="shrink-0 rounded-full border border-gold/40 bg-ivory px-3.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-bronze">
                        {s.priceLabel}
                      </span>
                    </button>
                  </li>
                );
              })}
              <li className="flex items-baseline justify-between gap-6 border-b border-espresso/20 px-4 py-5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.22em] text-espresso/75">
                  {TRAVEL.name}
                </span>
                <span className="shrink-0 text-[13px] font-semibold tracking-[0.06em] text-bronze">
                  {TRAVEL.label}
                </span>
              </li>
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button onClick={onBook} className="btn-primary group">
                Schedule Service / Quote
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.8} />
              </button>
              <button
                onClick={() => document.getElementById('treatments')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-ghost"
              >
                Customize Service Checklist
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
