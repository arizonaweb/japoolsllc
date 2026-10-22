import { Star, ExternalLink } from 'lucide-react';
import { ABOUT, BRAND, IMAGES, REVIEWS } from '@/data/brand';
import BrandImage from './BrandImage';
import Reveal from './Reveal';
import { ShieldBadgeIcon } from './icons';

export default function About() {
  return (
    <section id="about" className="relative bg-ivory" aria-labelledby="about-title">
      <div className="mx-auto grid max-w-[1300px] grid-cols-1 gap-12 px-5 py-24 md:grid-cols-12 md:gap-12 md:px-10 md:py-32">
        {/* Left column — Owner & Crew photos, stays in view while scrolling */}
        <div className="md:col-span-4 lg:col-span-4">
          <Reveal from="left" className="md:sticky md:top-28 space-y-6">
            <div className="rounded-xl border border-espresso/15 bg-cream/70 p-4 shadow-sm">
              <img
                src={IMAGES.monogram}
                alt="J & A Pools LLC Official Logo"
                className="mx-auto h-auto w-full max-w-[260px]"
              />
              <div className="mt-4 border-t border-espresso/10 pt-4">
                <p className="font-serif text-2xl font-semibold italic text-espresso">Joe C. Campos</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-bronze">
                  Owner · J &amp; A Pools LLC
                </p>
                <p className="mt-2 text-[12px] text-espresso/75">
                  BBB Accredited Business (A+ Rating) · Phoenix, AZ 85031
                </p>
              </div>
            </div>

            <BrandImage
              src={IMAGES.artistCutout}
              fallback={IMAGES.fallbackSilk}
              alt="J & A Pools LLC technicians servicing a palm-lined Phoenix pool"
              className="aspect-[4/5] w-full rounded-xl shadow-[0_20px_50px_-25px_rgba(0,119,145,0.45)] ring-1 ring-gold/30"
              imgClassName="object-cover object-center"
            />
          </Reveal>
        </div>

        {/* Right column — Story, Interactive Before/After Slider, and Verified Customer Reviews */}
        <div className="md:col-span-8 lg:col-span-8">
          <Reveal>
            <p className="eyebrow">{ABOUT.accolade}</p>
            <h2 id="about-title" className="display mt-5 text-[clamp(2.5rem,4.8vw,4.4rem)] text-espresso">
              Phoenix Pool Care <em className="italic text-bronze">Done Right.</em>
            </h2>
          </Reveal>

          <div className="mt-8 max-w-2xl space-y-5">
            {ABOUT.story.map((p, i) => (
              <Reveal key={i} delay={50}>
                {p.pull ? (
                  <p className="border-l-2 border-gold pl-5 font-serif text-[1.45rem] italic leading-snug text-espresso md:text-[1.65rem]">
                    {p.text}
                  </p>
                ) : (
                  <p className="text-[15px] leading-[1.85] text-espresso/85">{p.text}</p>
                )}
              </Reveal>
            ))}
          </div>

          {/* Verified 5-Star Yelp & BBB Reviews */}
          <Reveal delay={140} className="mt-14">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Verified Phoenix Homeowners</p>
                <h3 className="mt-2 font-serif text-3xl text-espresso">
                  5-Star Reviews on <em className="italic text-bronze">Yelp &amp; BBB</em>
                </h3>
              </div>
              <a
                href={BRAND.bbbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-bronze hover:underline"
              >
                <ShieldBadgeIcon /> View BBB A+ Profile <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {REVIEWS.map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between rounded-xl border border-espresso/15 bg-cream/60 p-5 transition-all hover:border-gold hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif text-xl font-semibold text-espresso">{r.author}</span>
                      <span className="flex items-center gap-0.5 text-gold" aria-label="5 out of 5 stars">
                        {Array.from({ length: r.rating }).map((_, idx) => (
                          <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-bronze">
                      {r.source} · {r.dateLabel}
                    </p>
                    <blockquote className="mt-3 text-[14px] leading-relaxed text-espresso/85">
                      “{r.quote}”
                    </blockquote>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-bronze group-hover:underline">
                    Verified Source <ExternalLink className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
