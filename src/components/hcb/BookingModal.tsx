import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Camera, X, Loader, Send } from 'lucide-react';
import { BRAND, SERVICES, TEL_LINK, type ServiceId } from '@/data/brand';
import { EMAIL_RE } from '@/lib/bookings';
import { removeRequestPhoto, saveRequestDetails, supabase, uploadRequestPhoto } from '@/lib/supabase';
import {
  copyRecipientNumber,
  deliverRequest,
  saveRequestToTemporaryStorage,
  type DeliveryResult,
  type PoolServiceRequest,
} from '@/lib/pool-request-utils';

interface Props {
  open: boolean;
  onClose: () => void;
  serviceId: ServiceId;
  onService: (id: ServiceId) => void;
}

type FormFields = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

type PhotoKey = 'equipment' | 'pool' | 'otherSide' | 'spa';
type PlanChoice = ServiceId | 'consultation';

const STEP_NAMES = ['Name', 'Email', 'Phone', 'Address', 'Service', 'Photos', 'Send'];

const PHOTO_GUIDES: Record<PhotoKey, { title: string; short: string; guide: string }> = {
  equipment: {
    title: 'Pump system',
    short: 'Pump',
    guide: 'Stand in front of the equipment. Hold the phone sideways and get the pump, filter, and valves in the frame.',
  },
  pool: {
    title: 'Pool',
    short: 'Pool',
    guide: 'Stand at one end of the pool. Step back, hold the phone sideways, and aim down so the whole pool is in the shot.',
  },
  otherSide: {
    title: 'Other side of the pool',
    short: 'Other side',
    guide: 'Walk to the opposite end. Face back across the water, hold the phone sideways, and take the photo.',
  },
  spa: {
    title: 'Spa',
    short: 'Spa',
    guide: 'Stand at the spa. Hold the phone sideways and step back so the whole spa is in the frame.',
  },
};

const photoSlots = (hasSpa: boolean): PhotoKey[] =>
  hasSpa ? ['equipment', 'pool', 'spa'] : ['equipment', 'pool', 'otherSide'];

const PHOENIX_AREA_ZIPS = [
  '85001', '85004', '85006', '85007', '85008', '85009', '85012', '85013', '85014', '85015',
  '85016', '85017', '85018', '85019', '85020', '85021', '85022', '85023', '85024', '85025',
  '85026', '85027', '85028', '85029', '85030', '85031', '85032', '85033', '85034', '85035',
  '85036', '85037', '85038', '85039', '85040', '85041', '85042', '85043', '85044', '85045',
  '85046', '85048', '85050', '85051', '85053', '85054', '85201', '85202', '85203', '85204',
  '85205', '85206', '85207', '85208', '85209', '85210', '85211', '85212', '85213', '85214',
  '85215', '85216', '85217', '85218', '85219', '85220', '85224', '85225', '85226', '85249',
  '85250', '85251', '85252', '85253', '85254', '85255', '85256', '85257', '85258', '85259',
  '85260', '85262', '85263', '85264', '85266', '85268', '85269', '85271', '85281', '85282',
  '85283', '85284', '85286', '85301', '85302', '85303', '85304', '85305', '85306', '85307',
  '85308', '85309', '85310', '85311', '85312', '85313', '85326', '85331', '85335', '85351',
];

const isPhoenixAreaAddress = (address: string): boolean => {
  const zipMatch = address.match(/\b(\d{5})\b/);
  return Boolean(zipMatch && PHOENIX_AREA_ZIPS.includes(zipMatch[1]));
};

export default function BookingModal({ open, onClose, serviceId, onService }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormFields>({ name: '', email: '', phone: '', address: '', notes: '' });
  const [consent, setConsent] = useState(false);
  const [planChoice, setPlanChoice] = useState<PlanChoice>(serviceId);
  const [hasSpa, setHasSpa] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<Partial<Record<PhotoKey, string>>>({});
  const [cameraError, setCameraError] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [flash, setFlash] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dispatched, setDispatched] = useState(false);
  const [isAutoPopulating, setIsAutoPopulating] = useState(false);
  const [sending, setSending] = useState(false);
  const [shareOutcome, setShareOutcome] = useState<DeliveryResult | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraToken = useRef(0);
  const requestIdRef = useRef<string | null>(null);
  const uploadedRef = useRef<Set<string>>(new Set());
  const activeStepRef = useRef(step);
  const activeOpenRef = useRef(open);
  activeStepRef.current = step;
  activeOpenRef.current = open;

  const slots = hasSpa === null ? [] : photoSlots(hasSpa);
  const nextPhoto = slots.find((photo) => !photos[photo]);
  const allPhotosCaptured = slots.length === 3 && slots.every((photo) => photos[photo]);
  const showContinue = step === 6 && allPhotosCaptured;
  const showSend = step === 7;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const timer = window.setTimeout(() => {
        dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
      }, 50);
      return () => window.clearTimeout(timer);
    }
    document.body.style.overflow = '';
    setStep(1);
    setForm({ name: '', email: '', phone: '', address: '', notes: '' });
    setConsent(false);
    setHasSpa(null);
    setPhotos({});
    setCameraError('');
    setIsCameraReady(false);
    setFlash(false);
    setErrors({});
    setDispatched(false);
    setIsAutoPopulating(false);
    setSending(false);
    setShareOutcome(null);
    requestIdRef.current = null;
    uploadedRef.current = new Set();
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) setPlanChoice(serviceId);
  }, [open, serviceId]);

  useEffect(() => {
    if (open && step === 6) return;
    cameraToken.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraReady(false);
  }, [open, step]);

  useEffect(() => {
    if (!open || step !== 4 || form.address || typeof navigator === 'undefined' || !navigator.geolocation) return;
    setIsAutoPopulating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await response.json();
          const address = data.address || {};
          const parts = [
            [address.house_number, address.road || address.street].filter(Boolean).join(' '),
            address.city || address.town,
            address.state,
            address.postcode,
          ].filter(Boolean);
          const formattedAddress = parts.join(', ').replace(', ,', ',');
          if (formattedAddress && isPhoenixAreaAddress(formattedAddress)) {
            setForm((current) => (current.address ? current : { ...current, address: formattedAddress }));
          }
        } catch {
          // Leave the field empty for manual entry.
        } finally {
          setIsAutoPopulating(false);
        }
      },
      () => setIsAutoPopulating(false),
    );
  }, [open, step, form.address]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const setField = (key: keyof FormFields, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }));
  };

  const stopCamera = () => {
    cameraToken.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraReady(false);
  };

  const startCamera = async () => {
    const token = ++cameraToken.current;
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not available in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      if (token !== cameraToken.current || !activeOpenRef.current || activeStepRef.current !== 6) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 50));
      if (token !== cameraToken.current || !activeOpenRef.current || activeStepRef.current !== 6) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraError('Camera did not start. Try again.');
        return;
      }
      video.srcObject = stream;
      await video.play();
      if (token !== cameraToken.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      setIsCameraReady(true);
    } catch (error) {
      if (token !== cameraToken.current) return;
      const name = error instanceof DOMException ? error.name : '';
      setCameraError(
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'Allow camera access, then try again.'
          : name === 'NotFoundError'
            ? 'No camera found on this device.'
            : 'Camera did not start. Try again.',
      );
      setIsCameraReady(false);
    }
  };

  const rememberPhoto = (key: PhotoKey, photoData: string) => {
    setPhotos((current) => ({ ...current, [key]: photoData }));
    if (!supabase) return;
    if (!requestIdRef.current) requestIdRef.current = String(Date.now());
    uploadedRef.current.delete(key);
    void uploadRequestPhoto(requestIdRef.current, key, photoData).then((ok) => {
      if (ok) uploadedRef.current.add(key);
    });
  };

  const dropPhoto = (key: PhotoKey) => {
    setPhotos((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    uploadedRef.current.delete(key);
    if (requestIdRef.current) void removeRequestPhoto(requestIdRef.current, key);
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    const key = nextPhoto;
    if (!video || !video.videoWidth || !video.videoHeight || !key) return;
    const scale = Math.min(1, 1600 / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    rememberPhoto(key, canvas.toDataURL('image/jpeg', 0.82));
    setFlash(true);
    window.setTimeout(() => setFlash(false), 140);
    const done = slots.every((photo) => photo === key || photos[photo]);
    if (done) stopCamera();
  };

  const chooseSpa = (value: boolean) => {
    if (hasSpa !== value) {
      dropPhoto('spa');
      dropPhoto('otherSide');
    }
    setHasSpa(value);
    setCameraError('');
    if (!streamRef.current) void startCamera();
  };

  const choosePlan = (choice: PlanChoice) => {
    setPlanChoice(choice);
    if (choice !== 'consultation') onService(choice);
    setStep(6);
  };

  const goNext = () => {
    if (step === 1 && !form.name.trim()) {
      setErrors({ name: 'Enter your full name.' });
      return;
    }
    if (step === 2 && !EMAIL_RE.test(form.email.trim())) {
      setErrors({ email: 'Enter a valid email.' });
      return;
    }
    if (step === 3 && form.phone.replace(/\D/g, '').length < 10) {
      setErrors({ phone: 'Enter a mobile number.' });
      return;
    }
    if (step === 4 && (!form.address.trim() || !/\b\d{5}\b/.test(form.address))) {
      setErrors({ address: 'Enter the street address and ZIP.' });
      return;
    }
    setErrors({});
    setStep((current) => Math.min(current + 1, STEP_NAMES.length));
  };

  const selectedService = SERVICES.find((service) => service.id === serviceId) ?? SERVICES[0];
  const planName = planChoice === 'consultation' ? 'Not sure — call me' : selectedService.name;
  const stepReady =
    (step === 1 && form.name.trim().length > 0) ||
    (step === 2 && EMAIL_RE.test(form.email.trim())) ||
    (step === 3 && form.phone.replace(/\D/g, '').length >= 10) ||
    (step === 4 && Boolean(form.address.trim()) && /\b\d{5}\b/.test(form.address));

  const buildPoolServiceRequest = (): PoolServiceRequest => ({
    name: form.name,
    email: form.email,
    phone: form.phone,
    address: form.address,
    serviceType: planName,
    notes: form.notes,
    smsConsent: consent,
    hasSpa: hasSpa === true,
    photos,
  });

  const persistBackend = async (request: PoolServiceRequest) => {
    if (!supabase) return;
    try {
      if (!requestIdRef.current) requestIdRef.current = String(Date.now());
      const requestId = requestIdRef.current;
      const keys = Object.keys(request.photos).filter((key) => request.photos[key]);
      await Promise.all(
        keys
          .filter((key) => !uploadedRef.current.has(key))
          .map(async (key) => {
            if (await uploadRequestPhoto(requestId, key, request.photos[key] as string)) uploadedRef.current.add(key);
          }),
      );
      await saveRequestDetails(requestId, request, keys);
    } catch {
      // Photos still go out with the text message.
    }
  };

  const handleSubmitClick = async (event: FormEvent) => {
    event.preventDefault();
    if (sending || !allPhotosCaptured) return;
    const request = buildPoolServiceRequest();
    setSending(true);
    setShareOutcome(null);
    void saveRequestToTemporaryStorage(request);
    void persistBackend(request);
    try {
      const result = await deliverRequest(request);
      if (result === 'cancelled') {
        setShareOutcome('cancelled');
        return;
      }
      setShareOutcome(result);
      setDispatched(true);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  const ErrorMessage = ({ field }: { field: string }) =>
    errors[field] ? <p className="mt-1.5 text-sm text-destructive">{errors[field]}</p> : null;

  const shooting = step === 6 && hasSpa !== null && !allPhotosCaptured;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-5">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close request dialog" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden bg-ivory text-espresso shadow-2xl sm:max-h-[94vh] sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-espresso/15 px-5 py-5 sm:px-8">
          <div>
            <p className="eyebrow">Step {step} of {STEP_NAMES.length}</p>
            <h2 id="booking-title" className="mt-1 font-serif text-2xl font-semibold sm:text-3xl">
              Request service
            </h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-espresso/75 hover:bg-cream" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="px-5 pt-4 sm:px-8">
          <div className="grid grid-cols-7 gap-1.5" aria-label={`Step ${step} of ${STEP_NAMES.length}`}>
            {STEP_NAMES.map((name, index) => (
              <div key={name} className={`h-1.5 rounded-full ${index < step ? 'bg-gold' : 'bg-espresso/15'}`} />
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold text-espresso/65">{STEP_NAMES[step - 1]}</p>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            if (step <= 4) goNext();
            else if (step === 7) void handleSubmitClick(event);
          }}
        >
          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            {step === 1 && (
              <div>
                <label htmlFor="booking-name" className="field-label">Full name</label>
                <input id="booking-name" autoComplete="name" enterKeyHint="next" className="field" value={form.name} onChange={(event) => setField('name', event.target.value)} />
                <ErrorMessage field="name" />
              </div>
            )}
            {step === 2 && (
              <div>
                <label htmlFor="booking-email" className="field-label">Email</label>
                <input id="booking-email" type="email" autoComplete="email" inputMode="email" enterKeyHint="next" className="field" value={form.email} onChange={(event) => setField('email', event.target.value)} />
                <ErrorMessage field="email" />
              </div>
            )}
            {step === 3 && (
              <div>
                <label htmlFor="booking-phone" className="field-label">Mobile phone</label>
                <input id="booking-phone" type="tel" autoComplete="tel" inputMode="tel" enterKeyHint="next" className="field" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="(480) 000-0000" />
                <ErrorMessage field="phone" />
              </div>
            )}
            {step === 4 && (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="booking-address" className="field-label">Pool address</label>
                  {isAutoPopulating && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gold">
                      <Loader className="h-3 w-3 animate-spin" /> Finding address…
                    </span>
                  )}
                </div>
                <input id="booking-address" autoComplete="street-address" enterKeyHint="next" className="field" value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="Street, city, AZ 85031" disabled={isAutoPopulating} />
                <ErrorMessage field="address" />
              </div>
            )}
            {step <= 4 && stepReady && (
              <button type="button" onClick={goNext} className="btn-primary mt-5">
                Next <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {step === 5 && (
              <section aria-label="Service">
                <p className="mb-3 text-sm font-semibold">Tap a service.</p>
                <div className="space-y-3">
                  {SERVICES.map((service) => {
                    const selected = planChoice === service.id;
                    return (
                      <button
                        type="button"
                        key={service.id}
                        onClick={() => choosePlan(service.id)}
                        className={`w-full rounded-xl border p-4 text-left ${
                          selected ? 'border-gold bg-petal/70' : 'border-espresso/20 bg-cream/50'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-3 font-semibold">
                          {service.name}
                          {selected && <Check className="h-4 w-4 shrink-0 text-gold" />}
                        </span>
                        <span className="mt-1 block text-sm text-espresso/70">{service.priceLabel}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => choosePlan('consultation')}
                    className={`w-full rounded-xl border p-4 text-left ${
                      planChoice === 'consultation' ? 'border-gold bg-petal/70' : 'border-espresso/20 bg-cream/50'
                    }`}
                  >
                    <span className="font-semibold">Not sure</span>
                    <span className="mt-1 block text-sm text-espresso/70">We'll call you.</span>
                  </button>
                </div>
              </section>
            )}

            {step === 6 && (
              <section aria-label="Photos">
                {hasSpa === null ? (
                  <div>
                    <p className="font-semibold">Do you have a spa?</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => chooseSpa(true)} className="rounded-xl border border-espresso/20 bg-cream/50 py-6 text-lg font-semibold">
                        Yes
                      </button>
                      <button type="button" onClick={() => chooseSpa(false)} className="rounded-xl border border-espresso/20 bg-cream/50 py-6 text-lg font-semibold">
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <ol className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
                        {slots.map((key, index) => (
                          <li key={key} className={photos[key] ? 'text-emerald-700' : key === nextPhoto ? 'text-espresso' : 'text-espresso/40'}>
                            {index + 1}. {PHOTO_GUIDES[key].short}
                          </li>
                        ))}
                      </ol>
                      <button type="button" onClick={() => chooseSpa(!hasSpa)} className="text-xs font-semibold text-espresso/70 underline">
                        {hasSpa ? 'No spa' : 'I have a spa'}
                      </button>
                    </div>
                    <p className="sr-only" aria-live="polite">
                      {nextPhoto
                        ? `Photo ${slots.indexOf(nextPhoto) + 1} of 3. ${PHOTO_GUIDES[nextPhoto].guide}`
                        : 'All 3 photos saved.'}
                    </p>
                    {nextPhoto && !isCameraReady && (
                      <div className="mt-4">
                        <p className="font-semibold">{PHOTO_GUIDES[nextPhoto].title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-espresso/75">{PHOTO_GUIDES[nextPhoto].guide}</p>
                      </div>
                    )}
                  </>
                )}

                <div className={shooting ? 'relative mt-4' : 'hidden'}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="aspect-video max-h-[42vh] w-full rounded-xl bg-black object-cover"
                    aria-label="Camera"
                  />
                  {isCameraReady && nextPhoto && (
                    <>
                      <div className="pointer-events-none absolute inset-3 rounded-lg border-2 border-white/80" />
                      <div className="pointer-events-none absolute inset-x-0 top-0 rounded-t-xl bg-black/60 px-3 py-2 text-white">
                        <p className="text-sm font-semibold">
                          {slots.indexOf(nextPhoto) + 1} of 3 · {PHOTO_GUIDES[nextPhoto].title}
                        </p>
                        <p className="mt-0.5 text-xs leading-snug">{PHOTO_GUIDES[nextPhoto].guide}</p>
                      </div>
                      <button
                        type="button"
                        onClick={takeSnapshot}
                        aria-label={`Take photo of ${PHOTO_GUIDES[nextPhoto].title}`}
                        className="absolute bottom-4 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-white/25"
                      >
                        <span className="h-12 w-12 rounded-full bg-white" />
                      </button>
                    </>
                  )}
                  {flash && <div className="pointer-events-none absolute inset-0 rounded-xl bg-white" />}
                  {!isCameraReady && !cameraError && (
                    <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-white">Opening camera…</p>
                  )}
                </div>

                {cameraError && (
                  <div role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
                    <p>{cameraError}</p>
                    <button type="button" onClick={() => void startCamera()} className="btn-primary mt-3">
                      <Camera className="h-4 w-4" /> Open camera
                    </button>
                    <a href={TEL_LINK} className="mt-3 block font-semibold underline">Call us</a>
                  </div>
                )}

                {slots.some((key) => photos[key]) && (
                  <ul className="mt-4 grid grid-cols-3 gap-2">
                    {slots.map((key) => (
                      <li key={key}>
                        {photos[key] ? (
                          <>
                            <img src={photos[key]} alt={PHOTO_GUIDES[key].title} className="aspect-[4/3] w-full rounded-lg object-cover" />
                            <button type="button" onClick={() => { dropPhoto(key); setCameraError(''); void startCamera(); }} className="mt-1 text-xs font-semibold underline">
                              Retake
                            </button>
                          </>
                        ) : (
                          <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-espresso/20 text-xs text-espresso/40">
                            {PHOTO_GUIDES[key].short}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {allPhotosCaptured && <p className="mt-4 text-sm font-semibold">All 3 photos saved.</p>}
              </section>
            )}

            {step === 7 && (
              <section className="space-y-5" aria-label="Send request">
                <dl className="space-y-1 text-sm">
                  <div>{form.name}</div>
                  <div>{form.email}</div>
                  <div>{form.phone}</div>
                  <div>{form.address}</div>
                  <div>{planName}</div>
                  <div>3 photos</div>
                </dl>
                <div>
                  <label htmlFor="booking-notes" className="field-label">Notes</label>
                  <textarea
                    id="booking-notes"
                    rows={4}
                    maxLength={1000}
                    className="field resize-y"
                    value={form.notes}
                    onChange={(event) => setField('notes', event.target.value)}
                    placeholder="Gate code, dogs, or a good time to come by."
                  />
                </div>
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-[#2E7D32]" />
                  <span>OK to text me about this request.</span>
                </label>
                <p className="text-sm">
                  Opens Messages with your photos. Sends to{' '}
                  <button type="button" onClick={copyRecipientNumber} className="font-semibold underline">
                    {BRAND.phonePaste}
                  </button>
                </p>
                {shareOutcome === 'shared' && dispatched && (
                  <p role="status" className="text-sm font-semibold text-emerald-700">
                    If To is empty, paste {BRAND.phonePaste} and tap Send.
                  </p>
                )}
                {shareOutcome === 'sms' && dispatched && (
                  <p role="status" className="text-sm font-semibold text-emerald-700">Messages is open. Tap Send.</p>
                )}
                {shareOutcome === 'packet' && dispatched && (
                  <p role="status" className="text-sm font-semibold text-emerald-700">
                    Photos downloaded. Text them to {BRAND.phonePaste}.
                  </p>
                )}
                {shareOutcome === 'cancelled' && (
                  <p role="status" className="text-sm">Not sent. Tap Send when you're ready.</p>
                )}
              </section>
            )}
          </div>

          {(step > 1 || showContinue || showSend) && (
            <footer className="flex flex-row items-center justify-between gap-3 border-t border-espresso/15 bg-ivory px-4 py-3 sm:px-8 sm:py-4 [&_.btn-primary]:px-4 [&_.btn-primary]:py-3 [&_.btn-ghost]:px-4 [&_.btn-ghost]:py-3 sm:[&_.btn-primary]:px-7 sm:[&_.btn-primary]:py-4 sm:[&_.btn-ghost]:px-7 sm:[&_.btn-ghost]:py-4">
              {step > 1 ? (
                <button type="button" onClick={() => { setErrors({}); setCameraError(''); setStep((current) => current - 1); }} className="btn-ghost">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : <span />}
              {showContinue ? (
                <button type="button" onClick={() => setStep(7)} className="btn-primary">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : showSend ? (
                <button type="submit" disabled={sending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                  {sending ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" /> Opening…
                    </>
                  ) : (
                    <>
                      Send <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : <span />}
            </footer>
          )}
        </form>
      </div>
    </div>
  );
}
