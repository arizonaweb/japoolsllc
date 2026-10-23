import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Camera, X } from 'lucide-react';
import { BRAND, SERVICES, TEL_LINK, buildSmsLink, type ServiceId } from '@/data/brand';
import { EMAIL_RE } from '@/lib/bookings';

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

type PhotoKey = 'pool' | 'spa' | 'equipment';
type PlanChoice = ServiceId | 'consultation';

const PHOTO_ORDER: PhotoKey[] = ['pool', 'spa', 'equipment'];
const PHOTO_LABELS: Record<PhotoKey, string> = {
  pool: 'Pool photo',
  spa: 'Spa / detail photo',
  equipment: 'Equipment pad photo',
};
const PHOTO_PROMPTS: Record<PhotoKey, string> = {
  pool: 'Please take a picture of your pool. Ensure all of the pool is showing. Stand as far back as you can safely.',
  spa: 'Please take a photo of your spa. If you do not have a spa, please take another photo of your pool showing any concerns or details needed.',
  equipment: 'Please take a photo of your pool equipment pad (pump, filter, valves, and timers).',
};
const STEP_NAMES = ['Full name', 'Email address', 'Mobile phone', 'Pool address', 'Service plan', 'Pool photos', 'Notes & consent', 'Submit request'];

export default function BookingModal({ open, onClose, serviceId, onService }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormFields>({ name: '', email: '', phone: '', address: '', notes: '' });
  const [consent, setConsent] = useState(false);
  const [planChoice, setPlanChoice] = useState<PlanChoice>(serviceId);
  const [photos, setPhotos] = useState<Partial<Record<PhotoKey, string>>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dispatched, setDispatched] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeStepRef = useRef(step);
  const activeOpenRef = useRef(open);
  activeStepRef.current = step;
  activeOpenRef.current = open;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setStep(1);
      setForm({ name: '', email: '', phone: '', address: '', notes: '' });
      setConsent(false);
      setPhotos({});
      setPreview(null);
      setCameraError('');
      setIsCameraReady(false);
      setErrors({});
      setDispatched(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) setPlanChoice(serviceId);
  }, [open, serviceId]);

  useEffect(() => {
    if (open && step === 6) return;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraReady(false);
  }, [open, step]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const selectedService = SERVICES.find((service) => service.id === serviceId) ?? SERVICES[0];
  const nextPhoto = PHOTO_ORDER.find((photo) => !photos[photo]);
  const allPhotosCaptured = PHOTO_ORDER.every((photo) => photos[photo]);

  const setField = (key: keyof FormFields, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }));
  };

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera capture is not available in this browser. Use a current browser over HTTPS and allow camera access, then retry.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      if (!activeOpenRef.current || activeStepRef.current !== 6 || !videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsCameraReady(true);
    } catch (error) {
      const cameraErrorName = error instanceof DOMException ? error.name : '';
      setCameraError(
        cameraErrorName === 'NotAllowedError' || cameraErrorName === 'SecurityError'
          ? 'Camera permission was not granted. Allow camera access in your browser settings and try again. Camera capture requires a secure HTTPS connection.'
          : cameraErrorName === 'NotFoundError'
            ? 'No camera was found on this device. Try another camera-enabled device or call us for help.'
            : 'The camera could not be started. Check browser permissions and try again, or call us for help.',
      );
      setIsCameraReady(false);
    }
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('The live camera preview is not ready yet. Wait a moment and try again.');
      return;
    }
    const scale = Math.min(1, 1600 / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('This browser could not capture the camera preview. Please try again.');
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPreview(canvas.toDataURL('image/jpeg', 0.82));
    setCameraError('');
  };

  const savePhoto = () => {
    if (!preview || !nextPhoto) return;
    setPhotos((current) => ({ ...current, [nextPhoto]: preview }));
    setPreview(null);
    setCameraError('');
  };

  const choosePlan = (choice: PlanChoice) => {
    setPlanChoice(choice);
    if (choice !== 'consultation') onService(choice);
  };

  const planName = planChoice === 'consultation' ? 'Quick consultation callback' : selectedService.name;
  const message = [
    'J & A Pools LLC — Pool Service Request',
    '',
    `Name: ${form.name.trim()}`,
    `Email: ${form.email.trim()}`,
    `Phone: ${form.phone.trim()}`,
    `Pool address: ${form.address.trim()}`,
    `Service plan: ${planName}`,
    `Notes / gate codes: ${form.notes.trim() || 'None'}`,
    `SMS consent: ${consent ? 'Yes' : 'No'}`,
    '',
    'ATTACHED PHOTOS:',
    ...PHOTO_ORDER.map((photo) => `• ${PHOTO_LABELS[photo]}: ${photos[photo] ? 'Captured ✓' : 'Not captured'}`),
  ].join('\n');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const mobileDevice =
      /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) ||
      (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    
    const capturedPhotos = PHOTO_ORDER.filter((photo) => photos[photo]);
    
    if (mobileDevice) {
      // Mobile: Send SMS/MMS with message + indicate photos to attach
      window.location.href = buildSmsLink(message);
    } else {
      // Desktop: Send email with instructions to attach photos from captured images
      const emailBody = message + '\n\n---\nTo attach your captured photos:\n1. Open this email in your device\'s mail app\n2. Use the attachment button and select from your device\'s photos\n3. Attach the pool, spa/detail, and equipment photos you captured';
      const subject = encodeURIComponent('J & A Pools LLC Service Request');
      window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(emailBody)}`;
    }
    setDispatched(true);
  };

  const ErrorMessage = ({ field }: { field: string }) =>
    errors[field] ? <p className="mt-1.5 text-sm text-destructive">{errors[field]}</p> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-5">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close scheduling dialog" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden bg-ivory text-espresso shadow-2xl sm:max-h-[94vh] sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-espresso/15 px-5 py-5 sm:px-8">
          <div>
            <p className="eyebrow">J &amp; A Pools LLC · Step {step} of {STEP_NAMES.length}</p>
            <h2 id="booking-title" className="mt-1 font-serif text-2xl font-semibold sm:text-3xl">
              Schedule Your Pool Service
            </h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-espresso/75 hover:bg-cream" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="px-5 pt-4 sm:px-8">
          <div className="grid grid-cols-8 gap-1.5" aria-label={`Step ${step} of ${STEP_NAMES.length}`}>
            {STEP_NAMES.map((name, index) => (
              <div key={name} className={`h-1.5 rounded-full ${index < step ? 'bg-gold' : 'bg-espresso/15'}`} />
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold text-espresso/65">{STEP_NAMES[step - 1]}</p>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            {step >= 1 && step <= 4 && (
              <section className="space-y-5" aria-label="Customer and property information">
                <p className="text-sm leading-relaxed text-espresso/75">
                  Share your contact details and Phoenix / Valley pool address. The address and ZIP are required before photos.
                </p>
                {step === 1 && (
                  <div>
                    <label htmlFor="booking-name" className="field-label">What is your full name?</label>
                    <input id="booking-name" autoComplete="name" className="field" value={form.name} onChange={(event) => setField('name', event.target.value)} />
                    <ErrorMessage field="name" />
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <label htmlFor="booking-email" className="field-label">What email address should we use?</label>
                    <input id="booking-email" type="email" autoComplete="email" inputMode="email" className="field" value={form.email} onChange={(event) => setField('email', event.target.value)} />
                    <ErrorMessage field="email" />
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <label htmlFor="booking-phone" className="field-label">What is your mobile phone number?</label>
                    <input id="booking-phone" type="tel" autoComplete="tel" className="field" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="(480) 000-0000" />
                    <ErrorMessage field="phone" />
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <label htmlFor="booking-address" className="field-label">What is the pool street address and ZIP code?</label>
                    <input id="booking-address" autoComplete="street-address" className="field" value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="Street, city, AZ 85031" />
                    <ErrorMessage field="address" />
                  </div>
                )}
              </section>
            )}

            {step === 5 && (
              <section aria-label="Select a service plan">
                <p className="mb-4 text-sm text-espresso/75">Select the service that best fits your pool.</p>
                <div className="space-y-3">
                  {SERVICES.map((service) => {
                    const selected = planChoice === service.id;
                    return (
                      <button
                        type="button"
                        key={service.id}
                        onClick={() => choosePlan(service.id)}
                        aria-pressed={selected}
                        className={`w-full rounded-xl border p-4 text-left transition-colors ${
                          selected ? 'border-gold bg-petal/70 ring-1 ring-gold' : 'border-espresso/20 bg-cream/50 hover:border-gold/60'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-3 font-semibold">
                          {service.name}
                          {selected && <Check className="h-4 w-4 shrink-0 text-gold" />}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-espresso/75">{service.description}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => choosePlan('consultation')}
                    aria-pressed={planChoice === 'consultation'}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      planChoice === 'consultation' ? 'border-gold bg-petal/70 ring-1 ring-gold' : 'border-espresso/20 bg-cream/50 hover:border-gold/60'
                    }`}
                  >
                    <span className="font-semibold">I’m not sure what to select</span>
                    <span className="mt-1 block text-sm text-espresso/75">Click here if you don’t know what to select and we’ll reach out for a quick consultation.</span>
                  </button>
                </div>
              </section>
            )}

            {step === 6 && (
              <section aria-label="Required live camera photos">
                <p className="rounded-lg border border-gold/30 bg-petal/50 p-4 text-sm leading-relaxed">
                  Do you allow J &amp; A Pools LLC to access your camera to document your pool condition?
                </p>
                {!isCameraReady && (
                  <button type="button" onClick={startCamera} className="btn-primary mt-4">
                    <Camera className="h-4 w-4" /> Allow Camera &amp; Start
                  </button>
                )}
                {cameraError && (
                  <div role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm leading-relaxed">
                    <p>{cameraError}</p>
                    <a href={TEL_LINK} className="mt-2 inline-block font-semibold underline">Call {BRAND.phoneDisplay} for help</a>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`mt-4 aspect-video w-full rounded-xl bg-black object-cover ${isCameraReady ? 'block' : 'hidden'}`}
                  aria-label="Live camera preview"
                />
                {preview ? (
                  <div className="mt-4">
                    <img src={preview} alt="Preview of the live camera photo to save" className="max-h-64 w-full rounded-xl object-contain" />
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button type="button" onClick={savePhoto} className="btn-primary">
                        Preview &amp; Save
                      </button>
                      <button type="button" onClick={() => setPreview(null)} className="btn-ghost">Retake</button>
                    </div>
                  </div>
                ) : nextPhoto ? (
                  <div className="mt-4 rounded-xl border border-espresso/15 bg-cream/60 p-4">
                    <p className="font-semibold">{PHOTO_LABELS[nextPhoto]} · Photo {PHOTO_ORDER.indexOf(nextPhoto) + 1} of 3</p>
                    <p className="mt-2 text-sm leading-relaxed text-espresso/75">{PHOTO_PROMPTS[nextPhoto]}</p>
                    <button type="button" onClick={takeSnapshot} disabled={!isCameraReady} className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-50">
                      <Camera className="h-4 w-4" /> Take Live Snapshot
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-gold/35 bg-petal/40 p-4">
                    <p className="font-semibold">All three photos are saved for this request.</p>
                    <ul className="mt-3 space-y-2">
                      {PHOTO_ORDER.map((photo) => (
                        <li key={photo} className="flex items-center justify-between gap-3 text-sm">
                          <span>{PHOTO_LABELS[photo]}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPhotos((current) => {
                                const updated = { ...current };
                                delete updated[photo];
                                return updated;
                              });
                              setCameraError('');
                            }}
                            className="text-xs font-semibold text-bronze underline"
                          >
                            Retake
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-4 text-xs leading-relaxed text-espresso/65">
                  Photos are captured directly from the live camera (no gallery uploads) and stay on this device; this form cannot attach them to a text or email.
                </p>
              </section>
            )}

            {step === 7 && (
              <section className="space-y-6" aria-label="Scheduling notes and consent">
                <div>
                  <label htmlFor="booking-notes" className="field-label">Optional scheduling notes</label>
                  <textarea
                    id="booking-notes"
                    rows={5}
                    maxLength={1000}
                    className="field resize-y"
                    value={form.notes}
                    onChange={(event) => setField('notes', event.target.value)}
                    placeholder="Please leave us any notes or gate codes for scheduling."
                  />
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-espresso/15 bg-cream/50 p-4 text-sm leading-relaxed">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-[#2E7D32]" />
                  <span>I consent to one-time text messages from J &amp; A Pools LLC. Standard carrier SMS and data rates may apply.</span>
                </label>
                <p className="text-xs text-espresso/65">
                  Your request is prepared in your device’s messaging app or default email client for you to review and send.
                </p>
              </section>
            )}

            {step === 8 && (
              <section aria-label="Review service request">
                <p className="text-sm leading-relaxed text-espresso/75">
                  Review the request below. Your messaging app will open on mobile; your default email client will open on desktop.
                </p>
                <dl className="mt-5 space-y-3 rounded-xl border border-espresso/15 bg-cream/60 p-5 text-sm">
                  <div><dt className="font-semibold">Name</dt><dd>{form.name}</dd></div>
                  <div><dt className="font-semibold">Email</dt><dd>{form.email}</dd></div>
                  <div><dt className="font-semibold">Phone</dt><dd>{form.phone}</dd></div>
                  <div><dt className="font-semibold">Pool address</dt><dd>{form.address}</dd></div>
                  <div><dt className="font-semibold">Plan</dt><dd>{planName}</dd></div>
                  <div><dt className="font-semibold">Notes</dt><dd>{form.notes || 'None'}</dd></div>
                  <div><dt className="font-semibold">Live camera photos</dt><dd>{PHOTO_ORDER.map((photo) => `${PHOTO_LABELS[photo]} ${photos[photo] ? 'captured' : 'missing'}`).join(' · ')}</dd></div>
                </dl>
                {dispatched && (
                  <p role="status" className="mt-4 rounded-lg bg-petal p-4 text-sm">
                    Your message draft is ready. Review it in your messaging or email app and send it to J &amp; A Pools LLC.
                  </p>
                )}
              </section>
            )}
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-espresso/15 bg-ivory px-5 py-4 sm:flex-row sm:justify-between sm:px-8">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((current) => current - 1)} className="btn-ghost">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : <span />}
            {step < 8 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !form.name.trim()) {
                    setErrors({ name: 'Please enter your full name.' });
                    return;
                  }
                  if (step === 2 && !EMAIL_RE.test(form.email.trim())) {
                    setErrors({ email: 'Please enter a valid email address.' });
                    return;
                  }
                  if (step === 3 && form.phone.replace(/\D/g, '').length < 10) {
                    setErrors({ phone: 'Please enter a valid mobile phone number.' });
                    return;
                  }
                  if (step === 4 && (!form.address.trim() || !/\b\d{5}\b/.test(form.address))) {
                    setErrors({ address: 'Enter the street address and 5-digit ZIP code before continuing to photos.' });
                    return;
                  }
                  if (step === 6 && !allPhotosCaptured) {
                    setCameraError('Please capture and save all three live camera photos before continuing.');
                    return;
                  }
                  setStep((current) => current + 1);
                }}
                className="btn-primary group"
              >
                Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button type="submit" className="btn-primary group">
                Submit Service Request <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </footer>
        </form>
      </div>
    </div>
  );
}
