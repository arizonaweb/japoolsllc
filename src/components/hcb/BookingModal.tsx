import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { X, ArrowRight, Loader2, Check } from 'lucide-react';
import { EMAIL_RE } from '@/lib/bookings';
import {
  ALL_ADDONS,
  BRAND,
  IMAGES,
  SERVICES,
  TRAVEL_OPTIONS,
  buildSmsLink,
  calculateEstimate,
  getService,
  type ServiceId,
  type TravelId,
} from '@/data/brand';
import EstimateSummary from './EstimateSummary';
import { MessageIcon } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
  serviceId: ServiceId;
  guests: number;
  travel: TravelId;
  addOnIds: string[];
  onService: (id: ServiceId) => void;
  onTravel: (t: TravelId) => void;
  onGuests: (n: number) => void;
  onToggleAddOn: (id: string) => void;
}

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const formatDate = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};
const formatTime = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const STEPS = [
  'Select your service plan & focus tasks',
  'Share your Phoenix-area pool address & contact info',
  'Receive fast confirmation from Joe & the J & A Pools team',
];

export default function BookingModal(props: Props) {
  const { open, onClose, serviceId, guests, travel, addOnIds } = props;
  const service = getService(serviceId);
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '', location: '', notes: '' });
  const [consent, setConsent] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { emailed?: boolean }>(null);
  const [submitError, setSubmitError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', onKey);
    setTimeout(() => dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus(), 50);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, busy]);

  useEffect(() => {
    if (!open) {
      setDone(null);
      setSubmitError('');
    }
  }, [open]);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const est = calculateEstimate({ serviceId, guests, travel, addOnIds });
  const chosen = ALL_ADDONS.filter((a) => addOnIds.includes(a.id));

  const summary = useMemo(() => {
    const lines = [
      `Hi J & A Pools! I'd like a quote / to schedule pool service.`,
      ``,
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Plan: ${service.name} (${service.priceLabel})`,
      `Property: ${est.people > 1 ? `Commercial / Multi-Pool (${est.people} pools)` : 'Residential Pool'}`,
      `Focus Tasks: ${chosen.length ? chosen.map((a) => a.name).join(', ') : 'Standard Pool Cleaning & Water Balancing'}`,
      `Preferred Date: ${formatDate(form.date) || 'Flexible'}`,
      `Preferred Window: ${formatTime(form.time) || 'Flexible'}`,
      `Service Area: ${TRAVEL_OPTIONS.find((t) => t.id === travel)?.label}`,
      `Pool Address: ${form.location.trim()}`,
    ];
    if (form.notes.trim()) lines.push(`Notes: ${form.notes.trim()}`);
    return lines.join('\n');
  }, [form, service, est.people, chosen, travel]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please add your full name.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Add a valid email for your service confirmation.';
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Add a mobile number so Joe & the team can text or call you.';
    if (!form.date) e.date = 'Choose a preferred start or inspection date.';
    else if (form.date < todayISO()) e.date = 'Choose a date from today onward.';
    if (!form.location.trim()) e.location = 'Please enter the pool street address or cross streets in Phoenix/Valley.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (busy || !validate()) return;
    setSubmitError('');
    setDone({});
    window.location.href = buildSmsLink(summary);
  };

  if (!open) return null;

  const Err = ({ k }: { k: string }) =>
    errors[k] ? <p className="mt-1.5 text-[12px] text-destructive">{errors[k]}</p> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !busy && onClose()} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-none bg-ivory text-espresso shadow-2xl animate-slide-in sm:h-auto sm:max-h-[92vh] sm:rounded-2xl md:flex-row"
      >
        <button
          onClick={onClose}
          disabled={busy}
          className="absolute right-4 top-4 z-10 rounded-full bg-ivory/80 p-2 text-espresso/80 transition-colors hover:text-bronze"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Summary column */}
        <aside className="relative hidden w-[38%] shrink-0 overflow-y-auto border-r border-espresso/15 bg-cream text-espresso md:block">
          <img
            src={IMAGES.artistCutout}
            alt="J & A Pools LLC service team"
            className="h-52 w-full object-cover object-center"
          />
          <div className="relative p-8">
            <p className="eyebrow">Your Pool Service Request</p>
            <h3 className="mt-2 font-serif text-3xl font-semibold italic leading-tight text-espresso">
              {service.name}
            </h3>
            <div className="mt-6">
              <EstimateSummary serviceId={serviceId} guests={guests} travel={travel} addOnIds={addOnIds} tone="light" />
            </div>
            {chosen.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {chosen.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => props.onToggleAddOn(a.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-ivory px-3 py-1 text-[11px] font-medium text-espresso transition-colors hover:border-destructive hover:text-destructive"
                  >
                    {a.name} <X className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            )}
            <ol className="mt-8 space-y-3 border-t border-espresso/15 pt-6">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-baseline gap-3 text-[13px] text-espresso/80">
                  <span className="text-[10px] font-bold tracking-[0.28em] text-bronze">0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* Form column */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 pt-12 sm:px-10">
          {!done ? (
            <form onSubmit={submit} noValidate>
              <p className="eyebrow">J &amp; A Pools LLC · Fast Setup</p>
              <h2 id="booking-title" className="display mt-3 text-4xl text-espresso sm:text-5xl">
                Schedule Your <em className="italic text-bronze">Pool Service.</em>
              </h2>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-espresso/75">
                Share your pool details below or text us directly at{' '}
                <strong className="text-espresso">{BRAND.phoneDisplay}</strong> and we’ll get you set up quickly.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="bk-name" className="field-label">Full name</label>
                  <input
                    id="bk-name"
                    className="field"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    autoComplete="name"
                    placeholder="Your full name"
                    required
                  />
                  <Err k="name" />
                </div>
                <div>
                  <label htmlFor="bk-email" className="field-label">Email</label>
                  <input
                    id="bk-email"
                    type="email"
                    inputMode="email"
                    className="field"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    autoComplete="email"
                    placeholder="you@email.com"
                    required
                  />
                  <Err k="email" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="bk-phone" className="field-label">Mobile phone</label>
                  <input
                    id="bk-phone"
                    type="tel"
                    className="field"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    autoComplete="tel"
                    placeholder="(480) 000-0000"
                    required
                  />
                  <Err k="phone" />
                </div>

                <div>
                  <label htmlFor="bk-service" className="field-label">Service Plan</label>
                  <select
                    id="bk-service"
                    className="field cursor-pointer"
                    value={serviceId}
                    onChange={(e) => props.onService(e.target.value as ServiceId)}
                  >
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.id} className="bg-ivory text-espresso">
                        {s.name} ({s.priceLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="bk-guests" className="field-label">Pools (1 = Residential, 2+ = Commercial)</label>
                  <input
                    id="bk-guests"
                    type="number"
                    min={1}
                    max={10}
                    className="field"
                    value={est.people}
                    onChange={(e) => props.onGuests(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                  />
                </div>

                <div>
                  <label htmlFor="bk-date" className="field-label">Preferred Start / Inspection Date</label>
                  <input
                    id="bk-date"
                    type="date"
                    min={todayISO()}
                    className="field"
                    value={form.date}
                    onChange={(e) => set('date', e.target.value)}
                  />
                  <Err k="date" />
                </div>
                <div>
                  <label htmlFor="bk-time" className="field-label">Preferred Time Window (Optional)</label>
                  <input
                    id="bk-time"
                    type="time"
                    className="field"
                    value={form.time}
                    onChange={(e) => set('time', e.target.value)}
                  />
                  <Err k="time" />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="bk-location" className="field-label">Pool Street Address / City</label>
                  <input
                    id="bk-location"
                    className="field"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    autoComplete="street-address"
                    placeholder="Street address in Phoenix, Mesa, Glendale, or surrounding area"
                  />
                  <Err k="location" />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="bk-travel" className="field-label">Phoenix Metro Area</label>
                  <select
                    id="bk-travel"
                    className="field cursor-pointer"
                    value={travel}
                    onChange={(e) => props.onTravel(e.target.value as TravelId)}
                  >
                    {TRAVEL_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id} className="bg-ivory text-espresso">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="bk-notes" className="field-label">Pool Details &amp; Notes</label>
                  <textarea
                    id="bk-notes"
                    rows={3}
                    className="field resize-none"
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Gate code, pets, filter type (cartridge/DE/sand), green water, pump issue, or questions…"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-espresso/75">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-gold"
                    />
                    <span>
                      Text me my quote confirmation and service updates from J &amp; A Pools LLC ({BRAND.phoneDisplay}).
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-cream p-5 text-espresso md:hidden">
                <EstimateSummary serviceId={serviceId} guests={guests} travel={travel} addOnIds={addOnIds} tone="light" compact />
              </div>

              {submitError && <p className="mt-6 text-[13px] text-destructive">{submitError}</p>}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={busy}
                  aria-busy={busy}
                  className="btn-primary group disabled:cursor-wait disabled:opacity-70"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} /> Sending Request…
                    </>
                  ) : (
                    <>
                      Submit Service Request
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.8} />
                    </>
                  )}
                </button>
                <a href={buildSmsLink(summary)} className="btn-ghost">
                  <MessageIcon /> Text {BRAND.phoneDisplay} Directly
                </a>
              </div>
            </form>
          ) : (
            <div className="flex h-full flex-col justify-center py-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold bg-petal text-bronze">
                <Check className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <p className="eyebrow mt-6">Request Ready to Send</p>
              <h2 id="booking-title" className="display mt-3 text-4xl text-espresso sm:text-5xl">
                We’ll Get You <em className="italic text-bronze">Set Up Quickly.</em>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-espresso/80">
                Thank you, <strong className="text-espresso">{form.name}</strong>! Your text message is ready — send it to
                {BRAND.phoneDisplay} and Joe and the J &amp; A Pools LLC team will reach out to confirm your pool service
                schedule and quote. If your messaging app didn't open, use the button below or call us.
              </p>
              <div className="mt-6 rounded-xl border border-espresso/15 bg-cream p-5 text-[13px] leading-relaxed text-espresso/85">
                <p className="font-semibold">{service.name} · {formatDate(form.date)}</p>
                <p className="mt-1">Address: {form.location}</p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={onClose} className="btn-primary">
                  Done
                </button>
                <a href={buildSmsLink(summary)} className="btn-ghost">
                  <MessageIcon /> Text {BRAND.phoneDisplay}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
