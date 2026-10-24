import { useState } from 'react';
import { ChevronDown, HelpCircle, Phone } from 'lucide-react';
import { BRAND, QUICK_QA, TEL_LINK, buildSmsLink } from '@/data/brand';
import Reveal from './Reveal';
import { MessageIcon } from './icons';

export default function Retail() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="retail" className="relative bg-cream border-t border-espresso/15">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
        {/* Quick Q&A Section from the J & A Pools Flyer */}
        <Reveal className="mb-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
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

      </div>
    </section>
  );
}
