import { Minus, Plus, ArrowRight } from 'lucide-react';
import {
  SERVICES,
  TREATMENTS,
  MENU_OPTIONS,
  TRAVEL_OPTIONS,
  getService,
  type AddOn,
  type ServiceId,
  type TravelId,
} from '@/data/brand';
import EstimateSummary from './EstimateSummary';
import Reveal from './Reveal';

interface TreatmentsProps {
  serviceId: ServiceId;
  guests: number;
  travel: TravelId;
  addOnIds: string[];
  onService: (id: ServiceId) => void;
  onGuests: (n: number) => void;
  onTravel: (t: TravelId) => void;
  onToggleAddOn: (id: string) => void;
  onClearAddOns: () => void;
  onRequest: () => void;
}

function AddOnRow({ addOn, active, onToggle }: { addOn: AddOn; active: boolean; onToggle: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        className={`group flex w-full items-start gap-5 border-b border-espresso/15 px-3 py-5 text-left transition-colors duration-300 ${
          active ? 'bg-petal/75' : 'hover:bg-cream/70'
        }`}
      >
        <span
          className={`mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-300 ${
            active ? 'border-gold bg-gold' : 'border-espresso/40 group-hover:border-gold'
          }`}
          aria-hidden="true"
        >
          <span className={`h-2 w-2 rounded-full bg-[#07141C] transition-transform duration-300 ${active ? 'scale-100' : 'scale-0'}`} />
        </span>
        <span className="flex-1">
          <span className="flex items-baseline justify-between gap-4">
            <span className="font-serif text-2xl font-medium text-espresso">{addOn.name}</span>
            <span className="shrink-0 rounded-full border border-gold/40 bg-ivory px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-bronze">
              {addOn.badge}
            </span>
          </span>
          {addOn.description && (
            <span className="mt-1.5 block text-[14px] leading-relaxed text-espresso/75">{addOn.description}</span>
          )}
        </span>
      </button>
    </li>
  );
}

export default function Treatments(props: TreatmentsProps) {
  const { serviceId, guests, travel, addOnIds } = props;
  const service = getService(serviceId);

  return (
    <section id="treatments" className="relative bg-ivory">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">Custom Pool Service &amp; Quote Builder</p>
          <h2 className="display mt-5 text-[clamp(2.5rem,4.8vw,4.5rem)] text-espresso">
            Build Your <em className="italic text-bronze">Pool Care Plan.</em>
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-espresso/80">
            Select your preferred service frequency, property type (residential or commercial), and any specific cleaning,
            filter, pump, or repair needs. Then send your checklist directly to J &amp; A Pools LLC at 480-688-7254.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {/* Step 1 — Service Plan */}
            <div>
              <p className="field-label">01 — Choose Your Service Plan</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SERVICES.map((s) => {
                  const active = s.id === serviceId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => props.onService(s.id)}
                      aria-pressed={active}
                      className={`rounded-xl border p-5 text-left transition-all duration-300 ${
                        active
                          ? 'border-gold bg-petal/90 text-espresso shadow-md ring-1 ring-gold'
                          : 'border-espresso/15 bg-cream/60 text-espresso hover:border-gold/60 hover:bg-cream'
                      }`}
                    >
                      <span className="block font-serif text-2xl font-semibold">{s.name}</span>
                      <span className="mt-1 inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-bronze">
                        {s.priceLabel}
                      </span>
                      <span className="mt-2 block text-[13px] leading-snug text-espresso/80">
                        {s.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <p className="field-label">Number of Pools (1 = Residential, 2+ = Commercial / HOA)</p>
                  <div className="mt-3 inline-flex items-center rounded-lg border border-espresso/25 bg-cream/50">
                    <button
                      type="button"
                      onClick={() => props.onGuests(Math.max(1, guests - 1))}
                      className="px-4 py-3 text-espresso/80 hover:text-bronze disabled:opacity-30"
                      disabled={guests <= 1}
                      aria-label="Fewer pools"
                    >
                      <Minus className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </button>
                    <span className="w-14 text-center font-serif text-2xl font-semibold text-espresso">{guests}</span>
                    <button
                      type="button"
                      onClick={() => props.onGuests(Math.min(10, guests + 1))}
                      className="px-4 py-3 text-espresso/80 hover:text-bronze"
                      aria-label="More pools"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="builder-travel" className="field-label">
                    Phoenix Metro Service Area
                  </label>
                  <select
                    id="builder-travel"
                    value={travel}
                    onChange={(e) => props.onTravel(e.target.value as TravelId)}
                    className="field mt-1 cursor-pointer"
                  >
                    {TRAVEL_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id} className="bg-ivory text-espresso">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2 — Core Cleaning, Water Balancing & Filter Care */}
            <div className="mt-14">
              <div className="flex items-baseline justify-between">
                <p className="field-label">02 — Pool Cleaning, Water Balancing &amp; Filter Care</p>
                {addOnIds.length > 0 && (
                  <button
                    type="button"
                    onClick={props.onClearAddOns}
                    className="link-underline text-[10px] font-semibold uppercase tracking-[0.24em] text-bronze"
                  >
                    Clear selections
                  </button>
                )}
              </div>
              <p className="mt-1.5 font-serif text-lg italic text-espresso/75">
                Select the priority care tasks for your pool visit.
              </p>
              <ul className="mt-4 border-t border-espresso/15">
                {TREATMENTS.map((a) => (
                  <AddOnRow
                    key={a.id}
                    addOn={a}
                    active={addOnIds.includes(a.id)}
                    onToggle={() => props.onToggleAddOn(a.id)}
                  />
                ))}
              </ul>
            </div>

            {/* Step 3 — Repairs, Equipment Upgrades & Commercial Options */}
            <div className="mt-14">
              <p className="field-label">03 — Repairs, Equipment Upgrades &amp; Green-to-Clean</p>
              <ul className="mt-4 border-t border-espresso/15">
                {MENU_OPTIONS.map((a) => (
                  <AddOnRow
                    key={a.id}
                    addOn={a}
                    active={addOnIds.includes(a.id)}
                    onToggle={() => props.onToggleAddOn(a.id)}
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* Live Summary Card */}
          <aside className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-cream p-8 text-espresso shadow-lg md:p-10 lg:sticky lg:top-24">
              <div className="grain absolute inset-0" />
              <div className="relative">
                <p className="eyebrow">Your Pool Service Request</p>
                <h3 className="mt-3 font-serif text-3xl font-semibold italic text-espresso">
                  {service.name}
                  {addOnIds.length > 0 && ` + ${addOnIds.length} task${addOnIds.length > 1 ? 's' : ''}`}
                </h3>
                <div className="mt-7">
                  <EstimateSummary
                    serviceId={serviceId}
                    guests={guests}
                    travel={travel}
                    addOnIds={addOnIds}
                    tone="light"
                  />
                </div>
                <button
                  type="button"
                  onClick={props.onRequest}
                  className="btn-primary group mt-8 w-full"
                >
                  Request Quote / Schedule Service
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky quote bar */}
      <div className="sticky bottom-0 z-30 flex items-center justify-between gap-4 border-t border-espresso/15 bg-ivory/95 px-5 py-3 backdrop-blur lg:hidden">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-bronze">Selected Service</p>
          <p className="font-serif text-xl font-semibold leading-none text-espresso">{service.priceLabel}</p>
        </div>
        <button type="button" onClick={props.onRequest} className="btn-primary !px-5 !py-3">
          Get Quote
        </button>
      </div>
    </section>
  );
}
