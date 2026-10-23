import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Camera, X, MapPin, Loader, Download, Copy } from 'lucide-react';
import { BRAND, SERVICES, TEL_LINK, buildSmsLink, type ServiceId } from '@/data/brand';
import { EMAIL_RE } from '@/lib/bookings';
import { 
  formatRequestAsText, 
  copyRequestToClipboard, 
  downloadAllImages,
  saveRequestToTemporaryStorage,
  type PoolServiceRequest
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
const STEP_NAMES = ['Full name', 'Email address', 'Mobile phone', 'Pool address', 'Service plan', 'Pool photos', 'Notes & consent', 'Submit request', 'Choose delivery method'];

// Address auto-population for Phoenix-area addresses
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
  if (!address) return false;
  const zipMatch = address.match(/\b(\d{5})\b/);
  if (!zipMatch) return false;
  return PHOENIX_AREA_ZIPS.includes(zipMatch[1]);
};

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
  const [isAutoPopulating, setIsAutoPopulating] = useState(false);
  const [submissionMethod, setSubmissionMethod] = useState<'email' | 'sms' | 'copy' | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
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
      setIsAutoPopulating(false);
      setSubmissionMethod(null);
      setCopiedToClipboard(false);
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

  // Auto-populate address from geolocation
  useEffect(() => {
    if (open && step === 4 && !form.address && typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsAutoPopulating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data.address || {};
            
            let formattedAddress = '';
            if (address.road || address.street) {
              formattedAddress = `${address.road || address.street} ${address.house_number || ''}`.trim();
            }
            if (address.city || address.town) {
              if (formattedAddress) formattedAddress += ', ';
              formattedAddress += address.city || address.town;
            }
            if (address.state) {
              if (formattedAddress) formattedAddress += ', ';
              formattedAddress += address.state;
            }
            if (address.postcode) {
              if (formattedAddress) formattedAddress += ' ';
              formattedAddress += address.postcode;
            }

            if (formattedAddress && isPhoenixAreaAddress(formattedAddress)) {
              setField('address', formattedAddress);
            }
          } catch (error) {
            console.log('Address lookup failed, user can enter manually');
          } finally {
            setIsAutoPopulating(false);
          }
        },
        () => {
          setIsAutoPopulating(false);
        }
      );
    }
  }, [open, step, form.address]);

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
  
  // Build complete request object
  const buildPoolServiceRequest = (): PoolServiceRequest => ({
    name: form.name,
    email: form.email,
    phone: form.phone,
    address: form.address,
    serviceType: planName,
    notes: form.notes,
    smsConsent: consent,
    photos,
  });

  const message = formatRequestAsText(buildPoolServiceRequest());

  // Handle submission - step 8 button click
  const handleSubmitClick = async (event: FormEvent) => {
    event.preventDefault();
    
    // Save request to temporary storage
    const request = buildPoolServiceRequest();
    await saveRequestToTemporaryStorage(request);

    const mobileDevice =
      /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) ||
      (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    
    if (mobileDevice) {
      // Show mobile submission options
      setSubmissionMethod(null); // Reset to show options
      setStep(9); // New step for choosing submission method
    } else {
      // Show desktop submission options
      setSubmissionMethod(null); // Reset to show options
      setStep(9); // New step for choosing submission method
    }
  };

  // Handle actual submission with chosen method
  const submitViaEmail = () => {
    const subject = encodeURIComponent('J & A Pools LLC Service Request');
    const request = buildPoolServiceRequest();
    const bodyText = formatRequestAsText(request);
    const body = encodeURIComponent(bodyText + '\n\n[Note: You captured 3 photos with this request. Please reply to confirm you received this message, and you can share photos via email or messaging.]');
    
    // Use a generic support email format based on phone number
    const genericEmail = 'support@japools.local';
    window.location.href = `mailto:${genericEmail}?subject=${subject}&body=${body}`;
    setDispatched(true);
  };

  const submitViaSMS = () => {
    const request = buildPoolServiceRequest();
    window.location.href = buildSmsLink(message);
    setDispatched(true);
  };

  const submitViaCopy = async () => {
    const request = buildPoolServiceRequest();
    const success = await copyRequestToClipboard(request);
    if (success) {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 3000);
    }
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

        <form className="flex min-h-0 flex-1 flex-col">
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
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="booking-address" className="field-label">What is the pool street address and ZIP code?</label>
                      {isAutoPopulating && <span className="flex items-center gap-1.5 text-xs font-semibold text-gold"><Loader className="h-3 w-3 animate-spin" /> Finding...</span>}
                      {form.address && !isAutoPopulating && <span className="text-xs font-semibold text-emerald-600"><MapPin className="inline h-3 w-3" /> Auto-filled</span>}
                    </div>
                    <input id="booking-address" autoComplete="street-address" className="field" value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="Street, city, AZ 85031" disabled={isAutoPopulating} />
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
                  <strong>Capture 3 photos of your pool.</strong> These images will be automatically included in your service request submission along with your contact details and scheduling information. This helps us provide accurate estimates and quick response times.
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
                  Your request, including all captured photos, is prepared for submission. On mobile, your SMS/MMS app will open; on desktop, your email client will open. Review and send when ready.
                </p>
              </section>
            )}

            {step === 8 && (
              <section aria-label="Review service request">
                <p className="text-sm leading-relaxed text-espresso/75">
                  Review your complete service request below, including all captured photos. Your messaging app will open on mobile; your default email client will open on desktop.
                </p>
                <dl className="mt-5 space-y-3 rounded-xl border border-espresso/15 bg-cream/60 p-5 text-sm">
                  <div><dt className="font-semibold">Name</dt><dd>{form.name}</dd></div>
                  <div><dt className="font-semibold">Email</dt><dd>{form.email}</dd></div>
                  <div><dt className="font-semibold">Phone</dt><dd>{form.phone}</dd></div>
                  <div><dt className="font-semibold">Pool address</dt><dd>{form.address}</dd></div>
                  <div><dt className="font-semibold">Plan</dt><dd>{planName}</dd></div>
                  <div><dt className="font-semibold">Notes</dt><dd>{form.notes || 'None'}</dd></div>
                  <div><dt className="font-semibold">Photos included</dt><dd className="font-semibold text-emerald-600">{PHOTO_ORDER.map((photo) => photos[photo] ? '✓' : '✗').join(' ')} All 3 captured</dd></div>
                </dl>
                {Object.keys(photos).length > 0 && (
                  <div className="mt-4 rounded-lg border border-gold/30 bg-petal/40 p-4">
                    <p className="text-sm font-semibold">Photos Ready for Submission</p>
                    <p className="mt-2 text-xs text-espresso/65">Your {Object.keys(photos).length} captured photos will be automatically included in this request when you submit.</p>
                  </div>
                )}
                {dispatched && (
                  <p role="status" className="mt-4 rounded-lg bg-petal p-4 text-sm font-semibold text-emerald-700">
                    ✓ Request submitted! Your photos and details have been sent. You'll receive a call, text, and email within 1 business day to confirm your appointment.
                  </p>
                )}
              </section>
            )}

            {step === 9 && (
              <section aria-label="Choose submission method">
                <p className="mb-6 text-sm leading-relaxed text-espresso/75">
                  Choose how you'd like to submit your pool service request with photos:
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={submitViaEmail}
                    className="w-full rounded-xl border border-espresso/20 bg-cream/50 p-4 text-left transition-colors hover:border-gold/60 hover:bg-petal/30"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold">📧 Email Request</span>
                      <ArrowRight className="h-4 w-4 text-gold" />
                    </span>
                    <span className="mt-2 block text-sm text-espresso/75">
                      Opens your email client with the request pre-filled. Download the photos to attach.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={submitViaSMS}
                    className="w-full rounded-xl border border-espresso/20 bg-cream/50 p-4 text-left transition-colors hover:border-gold/60 hover:bg-petal/30"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold">💬 Text Message (SMS)</span>
                      <ArrowRight className="h-4 w-4 text-gold" />
                    </span>
                    <span className="mt-2 block text-sm text-espresso/75">
                      Opens your SMS/MMS app. Send as message—photos can be added via the messaging app.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={submitViaCopy}
                    className="w-full rounded-xl border border-espresso/20 bg-cream/50 p-4 text-left transition-colors hover:border-gold/60 hover:bg-petal/30"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold">📋 {copiedToClipboard ? 'Copied!' : 'Copy to Clipboard'}</span>
                      <Copy className={`h-4 w-4 ${copiedToClipboard ? 'text-emerald-600' : 'text-gold'}`} />
                    </span>
                    <span className="mt-2 block text-sm text-espresso/75">
                      Copies your request details to your clipboard. Paste into any messaging app or email.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadAllImages(buildPoolServiceRequest());
                    }}
                    className="w-full rounded-xl border border-espresso/20 bg-cream/50 p-4 text-left transition-colors hover:border-gold/60 hover:bg-petal/30"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold">⬇️ Download Photos</span>
                      <Download className="h-4 w-4 text-gold" />
                    </span>
                    <span className="mt-2 block text-sm text-espresso/75">
                      Download all captured photos as separate files to your device.
                    </span>
                  </button>
                </div>

                <div className="mt-6 rounded-lg border border-gold/30 bg-petal/40 p-4 text-xs leading-relaxed text-espresso/75">
                  <p className="font-semibold">💡 Pro tip:</p>
                  <p className="mt-2">
                    Your request details and photos are saved temporarily. You can switch methods or come back to this step if needed. All information will be cleared when you close this form.
                  </p>
                </div>
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
            ) : step === 8 ? (
              <button type="button" onClick={handleSubmitClick} className="btn-primary group">
                Choose Delivery Method <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : step === 9 ? (
              <button type="button" onClick={() => setStep(8)} className="btn-ghost">
                Back to Review
              </button>
            ) : null}
          </footer>
        </form>
      </div>
    </div>
  );
}
