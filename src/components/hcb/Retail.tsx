import { useState } from 'react';
import { ArrowUpRight, ChevronDown, HelpCircle, Phone } from 'lucide-react';
import { BRAND, DIRECTORY_LINKS, QUICK_QA, TEL_LINK, buildSmsLink } from '@/data/brand';
import Reveal from './Reveal';
import { MessageIcon } from './icons';

export default function Retail() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="retail" className="relative bg-cream border-t border-espresso/15">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        {/* Quick Q&A Section from the J & A Pools Flyer */}
        <Reveal className="mb-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">Quick Q&amp;A</p>
              <h2 className="display mt-4 text-[clamp(2.4rem,4.5vw,4.2rem)] text-espresso">
                Common Questions About <em className="italic text-bronze">Our Pool Service.</em>
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-espresso/80">
                Have a question about weekly scheduling, green pool recovery, or equipment repairs in Phoenix, AZ{' '}
                {BRAND.zipCode}? Reach out directly — we answer fast.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={TEL_LINK} className="btn-primary">
                  <Phone className="h-4 w-4" strokeWidth={1.8} />
                  Call Now
                </a>
                <a href={buildSmsLink('Hi J & A Pools! I have a question about pool service.')} className="btn-ghost">
                  <MessageIcon className="h-4 w-4" />
                  Text Us
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {QUICK_QA.map((item, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <div
                    key={item.question}
                    className="overflow-hidden rounded-xl border border-espresso/15 bg-ivory shadow-sm transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="flex items-center gap-3 font-serif text-xl font-semibold text-espresso md:text-2xl">
                        <HelpCircle className="h-5 w-5 shrink-0 text-gold" />
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-bronze transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-espresso/10 bg-petal/40 px-6 py-4 text-[15px] leading-relaxed text-espresso/85">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Official Business Profiles & Verification Directory */}
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-10 pt-10 border-t border-espresso/15">
          <div>
            <p className="eyebrow">Learn more about J &amp; A Pools LLC</p>
            <h3 className="display mt-4 text-[clamp(2.2rem,4vw,3.6rem)] text-espresso">
              Connect With <em className="italic text-bronze">J &amp; A Pools LLC.</em>
            </h3>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {DIRECTORY_LINKS.map((item) => (
            <Reveal key={item.id}>
              <a
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex flex-col justify-between h-full rounded-2xl border border-espresso/15 bg-ivory p-6 shadow-sm transition-all duration-300 hover:border-gold hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold">{item.brand}</p>
                  <div className="flex justify-between items-start gap-2 mt-2 mb-3">
                    <h4 className="text-xl font-serif font-semibold text-espresso group-hover:text-bronze transition-colors">
                      {item.name}
                    </h4>
                    <ArrowUpRight className="w-5 h-5 shrink-0 text-espresso/45 group-hover:text-bronze group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p className="text-sm text-espresso/80 leading-relaxed">{item.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-espresso/10 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-bronze">
                  <span>{item.cta}</span>
                  <span>&rarr;</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
