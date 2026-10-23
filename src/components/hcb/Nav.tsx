import { useEffect, useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';
import { BRAND, IMAGES, TEL_LINK } from '@/data/brand';

interface NavProps {
  onBook: () => void;
  onBlog?: () => void;
}

const primaryLinks = [
  { id: 'maintenance', label: 'Weekly Maintenance' },
  { id: 'pool-cleaning', label: 'Pool Cleaning' },
  { id: 'equipment-upgrades', label: 'Equipment & Automation' },
  { id: 'filter-pump-care', label: 'Filter & Pump Care' },
  { id: 'repairs', label: 'Plumbing & Leaks' },
  { id: 'services', label: 'Commercial' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'retail', label: 'Pool Care Center' },
  { id: 'credentials', label: 'Service Guarantee' },
  { id: 'blog', label: 'Pool Service Guide' },
  { id: 'contact', label: 'Connect' },
];

export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <img
      src={IMAGES.logoPng}
      alt="J & A Pools LLC"
      className={`w-auto object-contain ${size === 'lg' ? 'h-12' : 'h-9 sm:h-10'}`}
    />
  );
}

export default function Nav({ onBook, onBlog }: NavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    if (id === 'blog') {
      onBlog?.();
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const requestEstimate = () => {
    setOpen(false);
    onBook();
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 shadow-sm">
        <div className="bg-[#111111] text-white">
          <div className="mx-auto flex min-h-10 max-w-[1440px] items-center justify-between gap-4 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] sm:px-6 lg:px-10">
            <div className="flex items-center gap-4 sm:gap-6">
              <a href={TEL_LINK} className="inline-flex items-center gap-2 whitespace-nowrap hover:text-amber-300">
                <Phone className="h-3.5 w-3.5" />
                {BRAND.phoneDisplay}
              </a>
              <a href={`sms:${BRAND.phoneE164}`} className="hidden hover:text-amber-300 sm:inline">
                Text Us
              </a>
            </div>
            <nav className="hidden items-center gap-5 xl:flex" aria-label="Quick links">
              <button onClick={requestEstimate} className="hover:text-amber-300">Request an Estimate</button>
              <button onClick={() => go('maintenance')} className="hover:text-amber-300">Schedule Maintenance</button>
              <button onClick={() => go('green-to-clean')} className="hover:text-amber-300">Green-to-Clean</button>
              <button onClick={() => go('credentials')} className="hover:text-amber-300">BBB A+ Accredited</button>
            </nav>
            <button onClick={requestEstimate} className="ml-auto hover:text-amber-300 xl:hidden">
              Request an Estimate
            </button>
          </div>
        </div>

        <div className="bg-white text-slate-800">
          <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-10">
            <a href="#top" onClick={(event) => { event.preventDefault(); go('top'); }} aria-label="J & A Pools LLC home">
              <Wordmark />
            </a>
            <nav className="hidden flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2 2xl:flex" aria-label="Primary">
              {primaryLinks.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className="font-heading text-[10px] font-semibold uppercase tracking-[0.045em] text-slate-700 transition-colors hover:text-[#005A9C]"
                >
                  {label}
                </button>
              ))}
            </nav>
            <button
              className="inline-flex items-center gap-2 rounded-md p-2 text-slate-800 hover:bg-slate-100 2xl:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-x-0 bottom-0 top-[116px] z-[45] overflow-y-auto bg-white transition-all duration-300 2xl:hidden ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
        aria-hidden={!open}
      >
        <nav className="mx-auto flex max-w-2xl flex-col px-6 pb-8" aria-label="Mobile navigation">
          <button onClick={requestEstimate} className="border-b border-slate-200 py-4 text-left font-heading text-sm font-bold uppercase tracking-wide text-[#005A9C]">
            Request an Estimate
          </button>
          <button onClick={() => go('maintenance')} className="border-b border-slate-200 py-4 text-left font-heading text-sm font-semibold uppercase tracking-wide">
            Schedule Maintenance
          </button>
          <button onClick={() => go('green-to-clean')} className="border-b border-slate-200 py-4 text-left font-heading text-sm font-semibold uppercase tracking-wide">
            Green-to-Clean
          </button>
          <button onClick={() => go('credentials')} className="border-b border-slate-200 py-4 text-left font-heading text-sm font-semibold uppercase tracking-wide">
            BBB A+ Accredited
          </button>
          {primaryLinks.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="border-b border-slate-200 py-4 text-left font-heading text-sm font-semibold uppercase tracking-wide hover:text-[#005A9C]"
            >
              {label}
            </button>
          ))}
          <a href={TEL_LINK} className="py-5 text-sm font-semibold text-[#005A9C]">
            Call {BRAND.phoneDisplay}
          </a>
        </nav>
      </div>
    </>
  );
}
