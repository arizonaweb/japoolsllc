import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { IMAGES } from '@/data/brand';

interface CarouselItem {
  id: string;
  title: string;
  blurb: string;
  src: string;
  alt: string;
}

// Existing J & A Pools service content paired with supplied brand imagery
const ITEMS: CarouselItem[] = [
  {
    id: 'pool-cleaning',
    title: 'Pool Cleaning',
    blurb: 'Skimming, vacuuming, brushing & filter care',
    src: IMAGES.heroWater,
    alt: 'Crystal-clear pool water after a J & A Pools cleaning visit',
  },
  {
    id: 'water-balancing',
    title: 'Water Balancing',
    blurb: 'Safe, clear, comfortable water',
    src: IMAGES.heroPrimary,
    alt: 'Balanced blue pool water at a Phoenix home serviced by J & A Pools',
  },
  {
    id: 'filter-pump-care',
    title: 'Filter & Pump Care',
    blurb: 'Inspection, cleaning & replacements',
    src: IMAGES.pumpLandscape,
    alt: 'Pool pump and filter equipment cared for by J & A Pools technicians',
  },
  {
    id: 'repairs',
    title: 'Repairs',
    blurb: 'Leaks, equipment & plumbing',
    src: IMAGES.artistCutout,
    alt: 'J & A Pools technician performing pool equipment repairs',
  },
  {
    id: 'equipment-upgrades',
    title: 'Equipment Upgrades',
    blurb: 'Pumps, filters & automation',
    src: IMAGES.equipment,
    alt: 'Modern pool equipment upgrade installed by J & A Pools',
  },
  {
    id: 'scheduled-service',
    title: 'Scheduled Service',
    blurb: 'Weekly, bi-weekly, or custom plans',
    src: IMAGES.residentialService,
    alt: 'Residential Phoenix backyard pool on a J & A Pools service plan',
  },
];

const SPEED = 42; // px per second — steady, moderate drift
const DRAG_CLICK_THRESHOLD = 8; // px of travel that cancels a click
const RESUME_DELAY_MS = 600; // brief settle before auto motion resumes

/** Wrap an offset into the range (-period, 0] so the doubled track loops seamlessly. */
const wrap = (value: number, period: number) => {
  if (period <= 0) return 0;
  let result = value % period;
  if (result > 0) result -= period;
  return result;
};

interface Tween {
  from: number;
  to: number;
  start: number;
  duration: number;
}

interface ServiceCarouselProps {
  onBook: () => void;
}

/**
 * Compact, continuously moving service showcase. A lightweight rAF loop drifts a
 * doubled track from left to right; pointer, touch, keyboard, hover, and
 * reduced-motion preferences all pause or steer the motion. Cleans up every
 * listener, observer, and animation frame on unmount.
 */
export default function ServiceCarousel({ onBook }: ServiceCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const periodRef = useRef(0);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const reducedRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const tweenRef = useRef<Tween | null>(null);
  const dragRef = useRef({ active: false, lastX: 0, moved: 0 });

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      reducedRef.current = media.matches;
    };
    onMotionChange();
    media.addEventListener('change', onMotionChange);

    // The track holds two identical groups; the second group's offsetLeft is
    // exactly one set width plus one gap — the seamless loop period.
    const measure = () => {
      const second = track.children[1] as HTMLElement | undefined;
      periodRef.current = second ? second.offsetLeft : track.scrollWidth / 2;
      offsetRef.current = wrap(offsetRef.current, periodRef.current);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const period = periodRef.current;
      if (period > 0) {
        const tween = tweenRef.current;
        if (tween) {
          const progress = Math.min((now - tween.start) / tween.duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          offsetRef.current = wrap(tween.from + (tween.to - tween.from) * eased, period);
          if (progress >= 1) tweenRef.current = null;
        } else if (
          !reducedRef.current &&
          !hoverRef.current &&
          !focusRef.current &&
          !dragRef.current.active &&
          now >= pauseUntilRef.current
        ) {
          offsetRef.current = wrap(offsetRef.current + SPEED * dt, period);
        }
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      media.removeEventListener('change', onMotionChange);
    };
  }, []);

  const nudge = (direction: 1 | -1) => {
    const track = trackRef.current;
    const first = track?.querySelector<HTMLElement>('li');
    if (!track || !first) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = first.offsetWidth + gap;
    pauseUntilRef.current = performance.now() + RESUME_DELAY_MS + 320;
    tweenRef.current = {
      from: offsetRef.current,
      to: offsetRef.current + direction * step,
      start: performance.now(),
      duration: 320,
    };
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = { active: true, lastX: event.clientX, moved: 0 };
    tweenRef.current = null;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* pointer already gone — drag still works without capture */
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = event.clientX - drag.lastX;
    drag.lastX = event.clientX;
    drag.moved += Math.abs(dx);
    offsetRef.current = wrap(offsetRef.current + dx, periodRef.current);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    pauseUntilRef.current = performance.now() + RESUME_DELAY_MS;
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      /* no active pointer to release */
    }
  };

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.moved > DRAG_CLICK_THRESHOLD) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current.moved = 0;
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      nudge(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      nudge(1);
    }
  };

  return (
    <section aria-labelledby="service-carousel-title" className="bg-white py-16 sm:py-20">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <div className="max-w-xl">
          <p className="eyebrow">J &amp; A Pools Service Lineup</p>
          <h2 id="service-carousel-title" className="display mt-3 text-3xl text-espresso sm:text-4xl">
            Every Visit, <span className="text-[#005A9C]">Covered.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            A quick tour of the care J &amp; A Pools LLC brings to Phoenix pools — tap any card to request service.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Scroll services backward"
            className="rounded-full border border-espresso/20 p-2.5 text-espresso transition-colors hover:border-[#005A9C] hover:text-[#005A9C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005A9C]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Scroll services forward"
            className="rounded-full border border-espresso/20 p-2.5 text-espresso transition-colors hover:border-[#005A9C] hover:text-[#005A9C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005A9C]"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="J & A Pools service highlights"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onPointerEnter={() => { hoverRef.current = true; }}
        onPointerLeave={() => { hoverRef.current = false; }}
        onFocusCapture={() => { focusRef.current = true; }}
        onBlurCapture={() => { focusRef.current = false; }}
        className="mt-8 cursor-grab select-none overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#005A9C] active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
      >
        <div ref={trackRef} className="flex w-max gap-4 px-5 py-1 sm:px-8 lg:px-10">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 list-none gap-4 p-0"
            >
              {ITEMS.map((item) => (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={onBook}
                    tabIndex={copy === 1 ? -1 : undefined}
                    aria-label={copy === 1 ? undefined : `Request service: ${item.title}`}
                    className="group block w-56 max-w-[76vw] overflow-hidden rounded-xl bg-ivory text-left shadow-sm ring-1 ring-espresso/10 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005A9C] sm:w-64 lg:w-72"
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="eager"
                      decoding="async"
                      draggable={false}
                      className="pointer-events-none aspect-[4/3] w-full object-cover"
                    />
                    <span className="block px-4 py-3">
                      <span className="block font-heading text-sm font-semibold text-espresso">{item.title}</span>
                      <span className="mt-1 block text-[12px] leading-snug text-espresso/70">{item.blurb}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
