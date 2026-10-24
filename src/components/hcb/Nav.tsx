import { useEffect, useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';
import { BRAND, IMAGES, TEL_LINK } from '@/data/brand';
import { useLanguage } from '@/contexts/LanguageContext';
import SiteControls from './SiteControls';
import ServiceIcons from './ServiceIcons';

interface NavProps {
  onBook: () => void;
  onBlog?: () => void;
}

const primaryLinks = {
  en: [
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
  ],
  es: [
    { id: 'maintenance', label: 'Mantenimiento semanal' },
    { id: 'pool-cleaning', label: 'Limpieza de piscinas' },
    { id: 'equipment-upgrades', label: 'Equipos y automatización' },
    { id: 'filter-pump-care', label: 'Filtros y bombas' },
    { id: 'repairs', label: 'Plomería y fugas' },
    { id: 'services', label: 'Comercial' },
    { id: 'gallery', label: 'Galería' },
    { id: 'retail', label: 'Centro de cuidado' },
    { id: 'credentials', label: 'Garantía de servicio' },
    { id: 'blog', label: 'Guía de piscinas' },
    { id: 'contact', label: 'Contacto' },
  ],
};

export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <img
      src={IMAGES.logoPng}
      alt="J & A Pools LLC"
      className={`w-auto object-contain ${size === 'lg' ? 'h-14' : 'h-11 sm:h-12'}`}
    />
  );
}

export default function Nav({ onBook, onBlog }: NavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language } = useLanguage();
  const links = primaryLinks[language];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          <div className="mx-auto flex min-h-10 max-w-[1440px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] sm:px-4 lg:px-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <a href={TEL_LINK} className="inline-flex items-center gap-2 whitespace-nowrap hover:text-amber-300">
                <Phone className="h-3.5 w-3.5" />
                {language === 'es' ? 'Llamar' : 'Call Now'}
              </a>
              <a href={`sms:${BRAND.phoneE164}`} className="hidden hover:text-amber-300 sm:inline">
                {language === 'es' ? 'Envíenos un texto' : 'Text Us'}
              </a>
            </div>
            <nav className="hidden items-center gap-5 xl:flex" aria-label="Quick links">
              <button onClick={requestEstimate} className="hover:text-amber-300">{language === 'es' ? 'Solicitar presupuesto' : 'Request an Estimate'}</button>
              <button onClick={() => go('maintenance')} className="hover:text-amber-300">{language === 'es' ? 'Programar mantenimiento' : 'Schedule Maintenance'}</button>
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <ServiceIcons />
              </div>
              <SiteControls />
              <button onClick={requestEstimate} className="hidden hover:text-amber-300 xl:hidden sm:inline">
                {language === 'es' ? 'Solicitar presupuesto' : 'Request an Estimate'}
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-white text-slate-800 shadow-sm">
          <div
            className={`relative mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-4 transition-[height] duration-500 ease-out sm:px-4 lg:px-8 ${
              scrolled ? 'h-[64px] sm:h-[68px]' : 'h-[96px] sm:h-[100px]'
            }`}
          >
            <a
              href="#top"
              onClick={(event) => { event.preventDefault(); go('top'); }}
              aria-label="J & A Pools LLC home"
              className="flex items-center transition-all duration-500 ease-out origin-left select-none"
            >
              <img
                src={IMAGES.logoPng}
                alt="J & A Pools LLC"
                className={`w-auto object-contain transition-all duration-500 ease-out origin-left ${
                  scrolled ? 'h-10 sm:h-12' : 'h-16 sm:h-20 lg:h-22'
                }`}
              />
            </a>
            <nav className="hidden flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2 2xl:flex" aria-label="Primary">
              {links.map(({ id, label }) => (
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
        style={{ top: scrolled ? 112 : 148 }}
        className={`fixed inset-x-0 bottom-0 z-[45] overflow-y-auto bg-white transition-all duration-300 2xl:hidden ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
        aria-hidden={!open}
      >
        <nav className="mx-auto flex max-w-2xl flex-col px-6 pb-8" aria-label="Mobile navigation">
          <button onClick={requestEstimate} className="border-b border-slate-200 py-4 text-left font-heading text-sm font-bold uppercase tracking-wide text-[#005A9C]">
            {language === 'es' ? 'Solicitar presupuesto' : 'Request an Estimate'}
          </button>
          <button onClick={() => go('maintenance')} className="border-b border-slate-200 py-4 text-left font-heading text-sm font-semibold uppercase tracking-wide">
            {language === 'es' ? 'Programar mantenimiento' : 'Schedule Maintenance'}
          </button>
          {links.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="border-b border-slate-200 py-4 text-left font-heading text-sm font-semibold uppercase tracking-wide hover:text-[#005A9C]"
            >
              {label}
            </button>
          ))}
          <div className="flex items-center gap-6 py-5">
            <a href={TEL_LINK} className="inline-flex items-center gap-2 text-sm font-semibold text-[#005A9C]">
              <Phone className="h-4 w-4" />
              {language === 'es' ? 'Llamar' : 'Call Now'}
            </a>
            <a href={`sms:${BRAND.phoneE164}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#005A9C]">
              {language === 'es' ? 'Envíenos un texto' : 'Text Us'}
            </a>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 py-5 text-slate-700">
            <ServiceIcons />
            <SiteControls compact />
          </div>
        </nav>
      </div>
    </>
  );
}
