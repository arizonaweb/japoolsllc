import { ArrowRight, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BRAND, CORE_PILLARS, IMAGES, NAV_LINKS, SERVICES, TEL_LINK, buildSmsLink } from '@/data/brand';
import Reveal from './Reveal';
import { MessageIcon } from './icons';

interface Props {
  onBook: () => void;
}

export default function Footer({ onBook }: Props) {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer id="contact" className="relative overflow-hidden border-t border-espresso/15 bg-ivory text-espresso">
      <div className="grain absolute inset-0" />
      {/* Before & After Banner Callout */}
      <div className="relative mx-auto max-w-[1400px] px-5 pt-20 md:px-10 md:pt-28">
        <Reveal className="grid grid-cols-1 items-center gap-12 rounded-2xl border border-gold/35 bg-cream p-6 shadow-md md:p-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <img
              src={IMAGES.leatherBanner}
              alt="J & A Pools LLC Before and After Pool Cleaning Transformation"
              loading="lazy"
              className="mx-auto w-full rounded-xl shadow-md ring-1 ring-gold/30"
            />
          </div>
          <div className="text-center lg:col-span-7 lg:text-left">
            <p className="eyebrow">{BRAND.serviceArea}</p>
            <h2 className="display mt-4 text-[clamp(2.5rem,5.2vw,4.8rem)] text-espresso">
              Clean, clear pools. <em className="italic text-bronze">Happier days.</em>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-espresso/80 lg:mx-0">
              Full-service care: {CORE_PILLARS.map((p) => p.title).join(' · ')}. Just call or text{' '}
              <strong className="text-espresso">{BRAND.phoneDisplay}</strong> and we’ll get you set up quickly.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <button onClick={onBook} className="btn-primary group">
                Schedule Service Now
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.8} />
              </button>
              <a
                href={buildSmsLink("Hi J & A Pools! I'd like a quote for pool service.")}
                className="btn-ghost"
              >
                <MessageIcon /> Text {BRAND.phoneDisplay}
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="relative mx-auto mt-16 max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-2 gap-10 border-t border-espresso/15 py-16 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <div className="flex items-center gap-3">
              <img
                src={IMAGES.monogram}
                alt="J & A Pools LLC"
                className="h-12 w-auto rounded-md bg-white px-2 py-1 shadow-sm ring-1 ring-gold/30"
                loading="lazy"
              />
              <div>
                <p className="font-serif text-2xl font-semibold tracking-[0.1em] text-espresso">J &amp; A POOLS LLC</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-bronze">
                  Phoenix, AZ {BRAND.zipCode}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-espresso/80">{BRAND.positioning}</p>
            <p className="mt-2 text-[12px] font-medium text-espresso/70">{BRAND.businessTypes}</p>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-bronze">Explore</p>
            <ul className="mt-5 space-y-3 text-[14px]">
              <li>
                <button onClick={onBook} className="link-underline font-medium text-espresso/85 hover:text-bronze">
                  Get a Quote
                </button>
              </li>
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <button onClick={() => go(l.id)} className="link-underline text-espresso/85 hover:text-bronze">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-bronze">Services</p>
            <ul className="mt-5 space-y-3 text-[14px] text-espresso/85">
              {SERVICES.map((s) => (
                <li key={s.id} className="flex justify-between gap-4">
                  <span>{s.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-bronze">Contact &amp; Profiles</p>
            <ul className="mt-5 space-y-3 text-[14px] text-espresso/85">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                <a href={TEL_LINK} className="link-underline font-semibold">
                  Call {BRAND.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageIcon className="h-4 w-4 text-gold" />
                <a
                  href={buildSmsLink("Hi J & A Pools! I'd like to schedule pool service.")}
                  className="link-underline"
                >
                  Text {BRAND.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" />
                <a
                  href={BRAND.bbbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  BBB Accredited Business (A+)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                <a
                  href={BRAND.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  EthicalCommunity.org/jandapools
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-espresso/15 py-8 pb-24 text-[11px] tracking-[0.14em] text-espresso/65 md:flex-row md:justify-between md:pb-8">
          <p>© {new Date().getFullYear()} J &amp; A Pools LLC · Swimming Pools &amp; Pool Service · Phoenix, AZ 85031</p>
          <p className="flex gap-6">
            <span>Owner: Joe C. Campos · Call or Text {BRAND.phoneDisplay}</span>
            <Link to="/admin" className="text-espresso/50 hover:text-bronze">
              Dispatch Portal
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
