import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PHOTO_BUCKET, REQUEST_TABLE, supabase } from '@/lib/supabase';

interface RequestRow {
  request_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  service_type: string;
  notes: string | null;
  photo_status: string;
  sms_status: string;
}
interface PhotoView { slot: string; url: string }

/** Protected office viewer. Access is enforced by Supabase Auth + RLS (is_staff()), not by this page. */
export default function OfficeRequest() {
  const [params, setParams] = useSearchParams();
  const [requestId, setRequestId] = useState(params.get('id') ?? '');
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [row, setRow] = useState<RequestRow | null>(null);
  const [photos, setPhotos] = useState<PhotoView[]>([]);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? 'Sign in failed.' : '');
  };

  const lookup = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!supabase || !requestId.trim()) return;
    setParams({ id: requestId.trim() });
    setMessage('');
    setRow(null);
    setPhotos([]);
    const { data: request } = await supabase.from(REQUEST_TABLE).select('*').eq('request_id', requestId.trim()).maybeSingle();
    if (!request) {
      setMessage('No request found (or you are not office staff).');
      return;
    }
    setRow(request as RequestRow);
    const { data: rows } = await supabase.from('service_request_photos').select('slot, storage_path').eq('request_id', requestId.trim());
    const list = rows ?? [];
    const { data: signed, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(list.map((r) => r.storage_path), 600);
    if (error || !signed) {
      setMessage('Could not load photos.');
      return;
    }
    setPhotos(list.flatMap((r, i) => (signed[i]?.signedUrl ? [{ slot: r.slot, url: signed[i].signedUrl }] : [])));
  };

  const markReceived = async () => {
    if (!supabase || !row) return;
    const { error } = await supabase.from(REQUEST_TABLE).update({ sms_status: 'received' }).eq('request_id', row.request_id);
    if (!error) setRow({ ...row, sms_status: 'received' });
  };

  useEffect(() => {
    if (signedIn && params.get('id')) void lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  if (!supabase) return <main className="p-6">Backend is not configured.</main>;

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Service request viewer</h1>
      {!signedIn ? (
        <form onSubmit={signIn} className="space-y-3">
          <input className="field" type="email" placeholder="Office email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          <button className="btn-primary" type="submit">Sign in</button>
        </form>
      ) : (
        <>
          <form onSubmit={lookup} className="flex gap-2">
            <input className="field" placeholder="Request ID" value={requestId} onChange={(e) => setRequestId(e.target.value)} />
            <button className="btn-primary" type="submit">View</button>
            <button className="btn-ghost" type="button" onClick={() => void supabase?.auth.signOut()}>Sign out</button>
          </form>
          {row && (
            <section className="space-y-2">
              <p className="text-sm">{row.name} · {row.phone} · {row.email}</p>
              <p className="text-sm">{row.address} · {row.service_type}</p>
              {row.notes && <p className="text-sm">Notes: {row.notes}</p>}
              <p className="text-sm">Photo upload: <b>{row.photo_status}</b> · SMS: <b>{row.sms_status}</b></p>
              {row.sms_status !== 'received' && <button className="btn-ghost" onClick={() => void markReceived()}>Mark text received</button>}
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  <a key={p.slot} href={p.url} target="_blank" rel="noreferrer">
                    <img src={p.url} alt={p.slot} className="aspect-[4/3] w-full rounded-lg object-cover" />
                    <span className="text-xs">{p.slot}</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
    </main>
  );
}
