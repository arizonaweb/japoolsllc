import { Star } from 'lucide-react';
import { ABOUT, IMAGES, REVIEWS } from '@/data/brand';
import Reveal from './Reveal';

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-32 bg-ivory" aria-labelledby="about-title">
      <div className="mx-auto grid max-w-[1300px] grid-cols-1 gap-8 px-5 py-16 md:grid-cols-12 md:gap-8 md:px-8 md:py-20">
        {/* Left column — Owner & Crew photos, stays in view while scrolling */}
        <div className="md:col-span-4 lg:col-span-4">
          <Reveal from="left" className="md:sticky md:top-28 space-y-6">
            <div id="credentials" className="scroll-mt-32 rounded-xl border border-espresso/15 bg-cream/70 p-4 shadow-sm">
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

            <Reveal from="bottom-left" delay={140}>
              <picture>
                <source srcSet={IMAGES.joeWebp} type="image/webp" />
                <img
                  src={IMAGES.joe}
                  alt="Owner Joe C. Campos of J & A Pools LLC servicing pool equipment in Phoenix"
                  loading="eager"
                  decoding="async"
                  className="aspect-square w-full rounded-xl object-cover object-center shadow-[0_20px_50px_-25px_rgba(46,125,50,0.24)] ring-1 ring-gold/30"
                />
              </picture>
            </Reveal>
          </Reveal>
        </div>

        {/* Right column — Story and Verified Customer Reviews */}
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
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {REVIEWS.map((r) => (
                <article
                  key={r.id}
                  className="flex flex-col justify-between rounded-xl border border-espresso/15 bg-cream/60 p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif text-xl font-semibold text-espresso">{r.author}</span>
                      <span className="flex items-center gap-0.5 text-bronze" aria-label="5 out of 5 stars">
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
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
