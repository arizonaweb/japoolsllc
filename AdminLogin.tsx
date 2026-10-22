import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { IMAGES } from '@/data/brand';

export default function AdminLogin() {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'err' | 'ok'; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const fn = mode === 'in' ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { data, error } = await fn.call(supabase.auth, { email: email.trim(), password });
    setBusy(false);
    if (error) return setMsg({ tone: 'err', text: error.message });
    if (mode === 'up' && !data.session) setMsg({ tone: 'ok', text: 'Check your email to confirm your account, then sign in.' });
  };

  return (
    <div className="grain relative flex min-h-screen items-center justify-center bg-cream px-5 text-espresso">
      <form onSubmit={submit} className="relative w-full max-w-sm rounded-2xl border border-espresso/15 bg-ivory p-8 shadow-xl">
        <img src={IMAGES.monogram} alt="J & A Pools LLC" className="mx-auto h-16 w-auto rounded bg-white p-1.5 shadow-sm" />
        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.34em] text-bronze">Dispatch Portal</p>
        <h1 className="mt-2 text-center font-serif text-3xl font-semibold">
          {mode === 'in' ? 'Welcome back.' : 'Create dispatch login.'}
        </h1>
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="ad-email" className="field-label">Email</label>
            <input id="ad-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
              className="field mt-1" />
          </div>
          <div>
            <label htmlFor="ad-pass" className="field-label">Password</label>
            <input id="ad-pass" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              className="field mt-1" />
          </div>
        </div>
        {msg && <p className={`mt-6 text-[13px] ${msg.tone === 'err' ? 'text-destructive' : 'text-bronze'}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="btn-primary mt-8 w-full">
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {mode === 'in' ? 'Sign in' : 'Create account'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="mt-5 w-full text-center text-[12px] text-espresso/70 hover:text-bronze">
          {mode === 'in' ? 'First time here? Create dispatch login' : 'Already have a login? Sign in'}
        </button>
      </form>
    </div>
  );
}
