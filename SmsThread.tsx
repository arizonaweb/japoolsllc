import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2, Send } from 'lucide-react';
import { fetchThread, sendSms, type Appointment, type SmsMessage } from '@/lib/admin';

interface Props {
  appointment: Appointment;
  smsReady: boolean;
  onSent: () => void;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function SmsThread({ appointment, smsReady, onSent }: Props) {
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    try {
      setMessages(await fetchThread(appointment));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [appointment]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await sendSms(appointment.id, text.trim());
      setText('');
      onSent();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      load();
    }
  };

  return (
    <div id="sms-thread" className="flex flex-col rounded-xl border border-espresso/15 bg-ivory">
      <div className="flex items-center justify-between border-b border-espresso/15 px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-espresso/70">SMS Dispatch · {appointment.phone}</p>
        <button onClick={load} className="text-[11px] text-bronze hover:underline">Refresh</button>
      </div>
      <div className="max-h-80 min-h-[160px] space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && <p className="py-6 text-center text-[13px] text-espresso/55">No messages yet.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-[14px] leading-relaxed ${
                m.direction === 'outbound' ? 'bg-gold text-[#07141C]' : 'bg-cream text-espresso'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className="mt-1 text-[10px] opacity-70">
                {fmt(m.created_at)}
                {m.kind !== 'manual' && m.kind !== 'inbound' ? ` · ${m.kind}` : ''}
                {m.status === 'failed' ? ` · failed${m.error ? `: ${m.error}` : ''}` : ''}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="border-t border-espresso/15 p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            data-sms-input
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={smsReady ? `Text ${appointment.name.split(' ')[0]}…` : 'SMS not connected yet'}
            disabled={!smsReady}
            className="flex-1 resize-none rounded border border-espresso/20 bg-ivory px-3 py-2 text-[14px] text-espresso focus:border-gold focus:outline-none disabled:bg-espresso/5"
          />
          <button type="submit" disabled={!smsReady || busy || !text.trim()} className="btn-primary !px-4 !py-3 disabled:opacity-40" aria-label="Send message">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>
        {error && <p className="mt-2 text-[12px] text-destructive">{error}</p>}
      </form>
    </div>
  );
}
