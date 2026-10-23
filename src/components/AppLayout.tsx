import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { type ServiceId } from '@/data/brand';
import Nav from './hcb/Nav';
import Hero from './hcb/Hero';
import BeforeAfter from './hcb/BeforeAfter';
import Gallery from './hcb/Gallery';
import ServicesShowcase from './hcb/ServicesShowcase';
import About from './hcb/About';
import Retail from './hcb/Retail';
import Footer from './hcb/Footer';
import BookingModal from './hcb/BookingModal';
import InstallPrompt from './hcb/InstallPrompt';

type ReturnNotice = null | { tone: 'ok' | 'info'; text: string };

export default function AppLayout() {
  const [serviceId, setServiceId] = useState<ServiceId>('weekly-service');
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState<ReturnNotice>(null);

  const openBooking = useCallback(() => setModalOpen(true), []);
  const closeBooking = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const booking = params.get('booking');
    if (!booking) return;
    const clean = () => window.history.replaceState({}, '', window.location.pathname);
    if (booking === 'complete') {
      setNotice({
        tone: 'ok',
        text: 'Pool service request received! Joe & the J & A Pools team will text or call you from 480-688-7254 to confirm.',
      });
      clean();
    }
  }, []);

  const handleService = (id: ServiceId) => {
    setServiceId(id);
  };

  return (
    <div className="min-h-screen bg-ivory text-espresso">
      <Nav onBook={openBooking} />

      {notice && (
        <div className="fixed inset-x-0 top-[116px] z-30 flex justify-center px-4 pt-3 animate-slide-in">
          <div
            role="status"
            className="flex max-w-2xl items-start gap-4 rounded-xl border border-gold bg-cream px-5 py-4 text-[13px] leading-relaxed text-espresso shadow-lg"
          >
            <span className="flex-1">{notice.text}</span>
            <button onClick={() => setNotice(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      <main>
        <Hero onBook={openBooking} />
        <BeforeAfter />
        <Gallery />
        <About />
        <ServicesShowcase selected={serviceId} onSelect={handleService} onBook={openBooking} />
        <Retail />
      </main>
      <Footer />

      <InstallPrompt />

      <BookingModal
        open={modalOpen}
        onClose={closeBooking}
        serviceId={serviceId}
        onService={handleService}
      />
    </div>
  );
}
