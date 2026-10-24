import { CalendarCheck, Phone } from 'lucide-react';
import { BRAND, TEL_LINK, buildSmsLink } from '@/data/brand';
import { MessageIcon } from './icons';
import SiteControls from './SiteControls';
import { useLanguage } from '@/contexts/LanguageContext';

interface FooterProps {
  onBook: () => void;
}

export default function Footer({ onBook }: FooterProps) {
  const { language } = useLanguage();
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-espresso/15 bg-ivory text-espresso">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-espresso/15 py-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-serif text-2xl font-semibold">J &amp; A Pools LLC</p>
            <p className="mt-1 text-[13px] text-espresso/75">Phoenix, AZ {BRAND.zipCode}</p>
            <button type="button" onClick={onBook} className="btn-primary mt-5">
              <CalendarCheck className="h-4 w-4" strokeWidth={1.8} />
              {language === 'es' ? 'Solicitar servicio / presupuesto' : 'Request Service / Estimate'}
            </button>
          </div>
          <ul className="flex flex-col gap-4 text-[14px] text-espresso/85 sm:items-end">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-bronze" />
              <a href={TEL_LINK} className="link-underline font-semibold">
                {language === 'es' ? 'Llamar' : 'Call Now'}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageIcon className="h-4 w-4 text-bronze" />
              <a href={buildSmsLink('Hi J & A Pools! I would like to schedule pool service.')} className="link-underline">
                {language === 'es' ? 'Envíenos un texto' : 'Text Us'}
              </a>
            </li>
            <li className="flex justify-end pt-2">
              <SiteControls compact />
            </li>
          </ul>
        </div>
        <div className="py-5 pb-16 text-xs leading-relaxed text-espresso/70 md:pb-5">
          <p>&copy; 2026 All rights reserved.</p>
          <p className="mt-2">{language === 'es'
            ? 'Este es un sitio web real, espero que le guste. Lo hice especialmente para usted. Para obtener este sitio web, todos los derechos del contenido, diseño y nombre de dominio, no dude en llamar.'
            : 'This is a real website, I hope you like it. I made it just for you. To obtain this website, all rights to the content, design, and domain name, please don’t hesitate to call me.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
