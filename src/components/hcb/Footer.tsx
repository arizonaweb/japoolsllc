import { MapPin, Phone, ShieldCheck } from 'lucide-react';
import { BRAND, TEL_LINK, buildSmsLink } from '@/data/brand';
import { MessageIcon } from './icons';

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-espresso/15 bg-ivory text-espresso">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-col justify-between gap-8 border-b border-espresso/15 py-12 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Contact &amp; Profiles</p>
            <p className="mt-2 font-serif text-2xl font-semibold">J &amp; A Pools LLC</p>
            <p className="mt-1 text-[13px] text-espresso/75">Phoenix, AZ {BRAND.zipCode}</p>
          </div>
          <ul className="flex flex-col gap-4 text-[14px] text-espresso/85 sm:items-end">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold" />
              <a href={TEL_LINK} className="link-underline font-semibold">Call {BRAND.phoneDisplay}</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageIcon className="h-4 w-4 text-gold" />
              <a href={buildSmsLink('Hi J & A Pools! I would like to schedule pool service.')} className="link-underline">
                Text {BRAND.phoneDisplay}
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
        <p className="py-7 pb-24 text-xs leading-relaxed text-espresso/70 md:pb-7">
          © 2026 Website owned and operated by Arizona Web design. Any use or recreation of the design, its likeness,
          functionality, flow, or any part is strictly prohibited. To obtain full authoritative access or make changes,
          you must purchase by contacting 509-979-4114.
        </p>
      </div>
    </footer>
  );
}
