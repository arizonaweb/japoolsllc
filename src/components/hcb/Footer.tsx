import { CalendarCheck, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { BRAND, TEL_LINK, buildSmsLink } from '@/data/brand';
import { MessageIcon } from './icons';

interface FooterProps {
  onBook: () => void;
}

export default function Footer({ onBook }: FooterProps) {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-espresso/15 bg-ivory text-espresso">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-col justify-between gap-8 border-b border-espresso/15 py-12 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Contact &amp; Profiles</p>
            <p className="mt-2 font-serif text-2xl font-semibold">J &amp; A Pools LLC</p>
            <p className="mt-1 text-[13px] text-espresso/75">Phoenix, AZ {BRAND.zipCode}</p>
            <button type="button" onClick={onBook} className="btn-primary mt-5">
              <CalendarCheck className="h-4 w-4" strokeWidth={1.8} />
              Request Service / Estimate
            </button>
          </div>
          <ul className="flex flex-col gap-4 text-[14px] text-espresso/85 sm:items-end">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold" />
              <a href={TEL_LINK} className="link-underline font-semibold">Call Now</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageIcon className="h-4 w-4 text-gold" />
              <a href={buildSmsLink('Hi J & A Pools! I would like to schedule pool service.')} className="link-underline">
                Text Us
              </a>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <a href={BRAND.bbbUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
                BBB Accredited Business (A+)
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" />
              <a href={BRAND.websiteUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
                EthicalCommunity.org/jandapools
              </a>
            </li>
          </ul>
        </div>
        <div className="py-7 pb-24 text-xs leading-relaxed text-espresso/70 md:pb-7">
          <p>To obtain this domain and website please contact Nick</p>
          <p className="mt-2">
            This website is owned and operated by Arizona Web Design Services. &copy; 2026. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
