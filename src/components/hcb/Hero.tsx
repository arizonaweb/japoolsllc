import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BRAND, IMAGES } from '@/data/brand';

interface HeroProps {
  onBook: () => void;
  onVideo?: () => void;
}

const slides = [
  {
    image: IMAGES.heroPrimary,
    alt: 'Backyard pool with spa',
    headline: 'Turning Backyard Pools Into Crystal-Clear Retreats',
    description: 'From weekly maintenance and chemical balancing to equipment automation, we care for Phoenix pools with precision and pride.',
    cta: 'Request an Estimate',
    action: 'estimate',
  },
  {
    image: IMAGES.heroPrimary,
    alt: 'Residential pool',
    badge: true,
    headline: 'Trusted Pool Care Across Phoenix & the Valley',
    description: 'BBB Accredited Business · A+ Rating · Accredited since 2023',
    cta: 'Explore Pool Care',
    action: 'services',
  },
  {
    image: IMAGES.equipment,
    alt: 'Pool equipment and filters',
    headline: 'Effortless Pool Care — One Text Away',
    description: 'Pump replacements, filter cleanings, plumbing repairs, and reliable weekly service plans for residential and commercial properties.',
    cta: 'Explore Service Plans',
    action: 'services',
  },
  {
    image: IMAGES.heroWater,
    alt: 'Residential pool',
    headline: 'Complete Green-to-Clean Pool Recovery',
    description: 'Restore your water with expert algae treatment, brushing, vacuuming, and chemical testing.',
    cta: 'Contact J & A Pools Today',
    action: 'contact',
  },
  {
    image: IMAGES.heroTriptych,
    alt: 'Drone footage of J & A Pools service',
    headline: 'Professional Pool Service You Can Trust',
    description: 'Watch our team in action as we deliver the premium pool care that keeps Phoenix pools pristine year-round.',
    cta: 'Watch Drone Footage',
    action: 'video',
  },
];

export default function Hero({ onBook, onVideo }: HeroProps) {
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
      className="relative min-h-[82vh] overflow-hidden bg-slate-900 pt-[116px] text-white"
      aria-roledescription="carousel"
      aria-label="J & A Pools services"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.headline}
          className={`absolute inset-0 transition-opacity duration-1000 ${active === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          aria-hidden={active !== index}
        >
          <img src={slide.image} alt={slide.alt} className="absolute inset-0 h-full w-full object-cover" fetchPriority={index === 0 ? 'high' : 'auto'} />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.34)_60%,rgba(0,0,0,0.12)_100%)]" />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex min-h-[calc(82vh-116px)] max-w-[1440px] items-center px-6 py-24 sm:px-12 lg:px-24">
        <img
          src={IMAGES.logoJpg}
          alt="J & A Pools LLC"
          className="absolute left-6 top-6 w-36 rounded bg-white/95 p-2 shadow-lg sm:left-12 sm:w-44"
        />
        <div className={`max-w-3xl ${selected.badge ? 'mx-auto text-center' : ''}`} key={selected.headline}>
          {selected.badge && (
            <div className="mx-auto mb-7 flex h-64 w-64 flex-col items-center justify-center rounded-full border-4 border-[#F5A623] bg-slate-900/45 p-5 text-center shadow-[0_0_0_7px_rgba(255,255,255,0.85),0_0_0_12px_rgba(245,166,35,0.85)] sm:h-72 sm:w-72">
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200">J &amp; A Pools LLC</span>
              <span className="my-3 h-px w-32 bg-white/80" />
              <span className="font-heading text-lg font-bold uppercase leading-snug">BBB Accredited Business</span>
              <span className="mt-1 font-heading text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">A+ Rating</span>
              <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em]">Accredited Since 2023</span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em]">Phoenix &amp; the Valley</span>
            </div>
          )}
          {!selected.badge && (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              <CheckCircle2 className="h-4 w-4 text-amber-300" />
              {BRAND.serviceArea}
            </p>
          )}
          <h1 className="font-heading text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.035em]">
            {selected.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-[1.7] text-white/90 sm:text-lg">
            {selected.description}
          </p>
          <button
            onClick={() => {
              if (selected.action === 'estimate') onBook();
              else if (selected.action === 'video' && onVideo) onVideo();
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
