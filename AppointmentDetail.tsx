import { useEffect, useState } from 'react';
import { Check, Loader2, Lock, MapPin, Phone } from 'lucide-react';
import { PAYMENT_LABELS, STATUS_LABELS, TRAVEL_OPTIONS } from '@/data/brand';
import { chargeCard, updateAppointment, type Appointment } from '@/lib/admin';
import SmsThread from './SmsThread';

interface Props {
  appointment: Appointment;
  smsReady: boolean;
  stripeReady: boolean;
  onChanged: () => void;
}

export const fmtDate = (d: string | null) => {
  if (!d) return 'Flexible';
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};
export const fmtTime = (t: string | null) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export default function AppointmentDetail({ appointment: a, smsReady, stripeReady, onChanged }: Props) {
  const [notes, setNotes] = useState(a.private_notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [savedNotes, setSavedNotes] = useState(false);
  const [amount, setAmount] = useState(String(a.estimate_min || ''));
  const [charging, setCharging] = useState(false);
  const [chargeMsg, setChargeMsg] = useState('');

  useEffect(() => {
    setNotes(a.private_notes ?? '');
    setAmount(String(a.estimate_min || ''));
    setChargeMsg('');
    setSavedNotes(false);
  }, [a.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateAppointment(a.id, { private_notes: notes.trim() || null });
      setSavedNotes(true);
      onChanged();
      setTimeout(() => setSavedNotes(false), 2000);
    } finally {
      setSavingNotes(false);
    }
  };

  const setStatus = async (status: Appointment['status']) => {
    await updateAppointment(a.id, { status });
    onChanged();
  };

  const charge = async () => {
    const n = Number(amount);
    if (!n || n <= 0) return setChargeMsg('Enter an amount.');
    setCharging(true);
    setChargeMsg('');
    try {
      await chargeCard(a.id, n);
      setChargeMsg('Charged successfully.');
      onChanged();
    } catch (e) {
      setChargeMsg((e as Error).message);
    } finally {
      setCharging(false);
    }
  };

  return (
    <div className="space-y-8 rounded-2xl border border-espresso/15 bg-cream/60 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-bronze">{a.source === 'booking' ? 'Online Request' : 'SMS Request'}</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-espresso">{a.name}</h2>
          <p className="mt-1 text-[14px] text-espresso/75">
            {a.service_name}{a.guests > 1 ? ` · ${a.guests} pools` : ' · Residential Pool'}
          </p>
        </div>
        <select
          value={a.status}
          onChange={(e) => setStatus(e.target.value as Appointment['status'])}
          className="rounded border border-espresso/20 bg-ivory px-3 py-2 text-[13px] text-espresso focus:border-gold focus:outline-none"
          aria-label="Service status"
        >
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-espresso/15 bg-espresso/15 sm:grid-cols-2">
        {[
          ['Preferred Date', `${fmtDate(a.preferred_date)}${a.preferred_time ? ` · ${fmtTime(a.preferred_time)}` : ''}`],
          ['Customer Confirmed', a.client_confirmed_at ? `Yes — ${new Date(a.client_confirmed_at).toLocaleString()}` : 'Pending confirmation'],
          ['Status', PAYMENT_LABELS[a.payment_status] ?? a.payment_status],
          ['Service Area', a.travel ? TRAVEL_OPTIONS.find((t) => t.id === a.travel)?.label ?? a.travel : 'Phoenix, AZ 85031'],
        ].map(([k, v]) => (
          <div key={k} className="bg-ivory px-5 py-4">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.24em] text-espresso/60">{k}</dt>
            <dd className="mt-1 text-[14px] text-espresso">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3 text-[14px] text-espresso/85">
        <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-gold" strokeWidth={1.5} /> <a href={`tel:${a.phone}`} className="underline decoration-gold underline-offset-4">{a.phone}</a></p>
        {a.location && (
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
            <a href={`https://maps.google.com/?q=${encodeURIComponent(a.location)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-4">{a.location}</a>
          </p>
        )}
        {a.add_ons?.length > 0 && <p><span className="font-semibold text-espresso/70">Requested Tasks:</span> {a.add_ons.map((x) => x.name).join(', ')}</p>}
        {a.notes && <p className="whitespace-pre-wrap border-l-2 border-gold pl-4 text-espresso/80"><span className="font-semibold text-espresso/70">Pool Notes:</span> {a.notes}</p>}
      </div>

      <div>
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-espresso/70">
          <Lock className="h-3 w-3" strokeWidth={1.5} /> Technician notes · internal only
        </p>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={5000}
          placeholder="Gate code, filter PSI, chlorine/pH readings, parts needed…"
          className="mt-2 w-full resize-y rounded-lg border border-espresso/20 bg-ivory px-3 py-2 text-[14px] text-espresso focus:border-gold focus:outline-none"
        />
        <button onClick={saveNotes} disabled={savingNotes} className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-bronze hover:underline">
          {savingNotes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : savedNotes ? <Check className="h-3.5 w-3.5" /> : null}
          {savedNotes ? 'Saved' : 'Save technician notes'}
        </button>
      </div>

      {a.payment_status === 'card_on_file' && (
        <div className="rounded-xl border border-espresso/15 bg-ivory p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-espresso/70">Charge card on file</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-espresso/70">$</span>
            <input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-32 rounded border border-espresso/20 bg-ivory px-3 py-2 text-[14px] text-espresso focus:border-gold focus:outline-none" />
            <button onClick={charge} disabled={charging || !stripeReady} className="btn-primary !px-5 !py-2.5 disabled:opacity-40">
              {charging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Charge'}
            </button>
          </div>
          {chargeMsg && <p className="mt-2 text-[12px] text-espresso/75">{chargeMsg}</p>}
        </div>
      )}

      <SmsThread appointment={a} smsReady={smsReady} onSent={onChanged} />
    </div>
  );
}
