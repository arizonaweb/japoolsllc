import { ArrowRight } from 'lucide-react';
import { SERVICES, type ServiceId } from '@/data/brand';
import Reveal from './Reveal';

interface Props {
  selected: ServiceId;
  onSelect: (id: ServiceId) => void;
  onBook: () => void;
}

const PILLAR_LINKS: Record<ServiceId, { labels: string[]; ids: string[] }> = {
  'weekly-service': { labels: ['Scheduled Service'], ids: ['scheduled-service'] },
  'biweekly-service': { labels: ['Scheduled Service'], ids: ['scheduled-service'] },
  'repair-upgrade': {
    labels: ['Filter & Pump Care', 'Repairs', 'Equipment Upgrades'],
    ids: ['filter-pump-care', 'repairs', 'equipment-upgrades'],
  },
  'green-to-clean': {
    labels: ['Pool Cleaning', 'Water Balancing'],
    ids: ['pool-cleaning', 'water-balancing'],
  },
};

export default function ServicesShowcase({ selected, onSelect, onBook }: Props) {
  return (
    <section id="services" className="relative overflow-hidden border-y border-espresso/15 bg-cream text-espresso">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">Services &amp; Maintenance Plans</p>
          <h2 className="display mt-5 text-[clamp(2.8rem,5.2vw,5rem)] text-espresso">
            Complete Pool Care, <em className="italic text-bronze">Every Visit.</em>
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-espresso/80">
            Choose the care that fits your pool, from dependable routine maintenance to full green-to-clean recovery.
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {SERVICES.map((service) => {
            const active = selected === service.id;
            const pillarLinks = PILLAR_LINKS[service.id];
            return (
              <Reveal key={service.id}>
                <article
                  className={`h-full rounded-2xl border p-6 transition-colors sm:p-8 ${
                    active
                      ? 'border-gold bg-petal/70 ring-1 ring-gold'
                      : 'border-espresso/15 bg-ivory hover:border-gold/60'
                  }`}
                >
                  <h3 className="font-serif text-2xl font-semibold text-espresso sm:text-3xl">{service.name}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-espresso/80">{service.description}</p>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-bronze">
                    {service.priceLabel}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-semibold text-bronze">
                    {pillarLinks.ids.map((id, index) => (
                      <a key={id} href={`#${id}`} className="link-underline">
                        {pillarLinks.labels[index]}
                      </a>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(service.id);
                      onBook();
                    }}
                    aria-pressed={active}
                    className="btn-primary group mt-7 w-full sm:w-auto"
                  >
                    Schedule Your Pool Service
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={1.8}
                    />
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
