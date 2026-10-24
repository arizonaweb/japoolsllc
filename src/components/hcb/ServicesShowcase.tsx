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
    <section id="services" className="relative scroll-mt-32 overflow-hidden border-y border-espresso/15 bg-cream text-espresso">
      <span id="maintenance" className="absolute top-0 scroll-mt-32" />
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-10 md:px-8 md:py-12">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">Services &amp; Maintenance Plans</p>
          <h2 className="display mt-3 text-[clamp(2.25rem,4vw,3.5rem)] text-espresso">
            Complete Pool Care, <em className="italic text-bronze">Every Visit.</em>
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-espresso/85">
            Choose the care that fits your pool, from dependable routine maintenance to full green-to-clean recovery.
          </p>
        </Reveal>
        <div className="mt-7 grid grid-cols-1 divide-y divide-espresso/15 sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4">
          {SERVICES.map((service, index) => {
            const active = selected === service.id;
            const pillarLinks = PILLAR_LINKS[service.id];
            return (
              <Reveal key={service.id} className="h-full">
                <article
                  className={`h-full border-t border-espresso/15 py-5 sm:px-5 ${
                    index === 0 ? 'sm:pl-0' : ''
                  } ${
                    index % 4 === 0
                      ? 'xl:border-l-0 xl:pl-0'
                      : 'xl:border-l xl:border-t-0'
                  }`}
                >
                  <div className="sr-only" aria-hidden="true">
                    {pillarLinks.ids.map((id) => <span key={id} id={id} />)}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-espresso">{service.name}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-espresso/85">{service.description}</p>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-bronze">
                    {service.priceLabel}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold text-bronze">
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
                    className="group mt-4 inline-flex items-center gap-2 text-[12px] font-bold text-bronze hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze"
                  >
                    Schedule service
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
