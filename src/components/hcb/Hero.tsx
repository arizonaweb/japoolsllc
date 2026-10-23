import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BRAND, IMAGES } from '@/data/brand';

interface HeroProps {
  onBook: () => void;
}

const slides = [
  {
    image: IMAGES.heroPrimary,
    alt: 'Backyard pool with spa maintained by J & A Pools Phoenix',
    headline: 'Turning Backyard Pools Into Crystal-Clear Retreats',
    description: 'From weekly maintenance and chemical balancing to equipment automation, we care for Phoenix pools with precision and pride.',
    cta: 'Request an Estimate',
    action: 'estimate',
  },
  {
    image: IMAGES.heroSlide2,
    alt: 'Residential pool service and maintenance in Phoenix',
    badge: true,
    headline: 'Trusted Pool Care Across Phoenix & the Valley',
    description: 'BBB Accredited Business with A+ Rating. Dependable, honest, and accredited since 2023.',
    cta: 'Explore Pool Care',
    action: 'services',
  },
  {
    image: IMAGES.equipment,
    alt: 'Pool equipment and filtration systems',
    headline: 'Effortless Pool Care — One Text Away',
    description: 'Pump replacements, filter cleanings, plumbing repairs, and reliable weekly service plans for residential and commercial properties.',
    cta: 'Explore Service Plans',
    action: 'services',
  },
  {
    image: IMAGES.heroWater,
    alt: 'Crystal clear swimming pool water restoration',
    headline: 'Complete Green-to-Clean Pool Recovery',
    description: 'Restore your water with expert algae treatment, brushing, vacuuming, and chemical testing.',
    cta: 'Contact J & A Pools Today',
    action: 'contact',
  },
];

export default function Hero({ onBook }: HeroProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const changeSlide = (direction: number) => {
    setActive((index) => (index + direction + slides.length) % slides.length);
  };

  const selected = slides[active];

  return (
    <section
      id="top"
      className="relative flex min-h-[640px] flex-col justify-center overflow-hidden bg-slate-900 pt-[148px] sm:min-h-[700px] sm:pt-[156px] lg:min-h-[760px] text-white"
      aria-roledescription="carousel"
      aria-label="J & A Pools services"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {slides.map((slide, index) => {
        const isActive = active === index;
        return (
          <div
            key={slide.headline}
            className={`absolute inset-0 transition-opacity [transition-duration:1400ms] ease-in-out ${
              isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-hidden={!isActive}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                transform: isActive ? 'scale(1.03)' : 'scale(1)',
                transition: 'transform 7000ms ease-out',
              }}
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.4)_55%,rgba(0,0,0,0.18)_100%)]" />
          </div>
        );
      })}

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center px-6 py-12 sm:px-12 lg:px-24">
        <div className="max-w-3xl text-left" key={selected.headline}>
          {selected.badge ? (
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-amber-400/80 bg-slate-950/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-md backdrop-blur-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F5A623] text-[10px] font-black text-slate-950">A+</span>
              <span>BBB Accredited Business · Accredited Since 2023</span>
            </div>
          ) : (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-amber-300" />
              {BRAND.serviceArea}
            </p>
          )}
          <h1 className="font-heading text-[clamp(2.25rem,5.5vw,5rem)] font-bold leading-[1.06] tracking-[-0.035em]">
            {selected.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-[1.7] text-white/90 sm:text-lg">
            {selected.description}
          </p>
          <button
            onClick={() => {
              if (selected.action === 'estimate') onBook();
              else document.getElementById(selected.action)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-8 inline-flex min-h-12 items-center gap-3 rounded bg-[#F5A623] px-7 py-4 font-heading text-xs font-bold uppercase tracking-[0.12em] text-slate-950 transition-colors hover:bg-[#E09612] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {selected.cta}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        onClick={() => changeSlide(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white transition hover:bg-black/60 sm:left-6"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => changeSlide(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white transition hover:bg-black/60 sm:right-6"
      >
        <ArrowRight className="h-6 w-6" />
      </button>
      <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 gap-2" aria-label="Choose slide">
        {slides.map((slide, index) => (
          <button
            key={slide.headline}
            onClick={() => setActive(index)}
            aria-label={`Show slide ${index + 1}`}
            aria-current={active === index ? 'true' : undefined}
            className={`h-2.5 rounded-full transition-all ${active === index ? 'w-8 bg-[#F5A623]' : 'w-2.5 bg-white/70 hover:bg-white'}`}
          />
        ))}
      </div>
    </section>
  );
}
