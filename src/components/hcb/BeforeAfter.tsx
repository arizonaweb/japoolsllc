import { useState } from 'react';
import { IMAGES } from '@/data/brand';
import Reveal from './Reveal';

export default function BeforeAfter() {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <section id="green-to-clean" className="relative scroll-mt-32 bg-ivory py-16 md:py-20" aria-labelledby="transformation-title">
      <Reveal from="bottom" className="mx-auto max-w-[1200px] px-5 md:px-10">
        <div className="rounded-2xl border border-espresso/15 bg-cream/80 p-5 shadow-md sm:p-7 backdrop-blur-sm">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Try Me!</p>
              <h2 id="transformation-title" className="mt-1 font-serif text-3xl text-espresso">
                Before &amp; After <em className="italic text-bronze">Green-to-Clean</em>
              </h2>
            </div>
            <span className="text-[12px] font-medium text-espresso/75">Drag slider to compare Before vs. After</span>
          </div>

          <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-xl ring-1 ring-espresso/15 select-none shadow-lg">
            <img
              src={IMAGES.afterPool}
              alt="Pool after cleaning showing clear blue water"
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute right-3 top-3 rounded bg-[#2E7D32] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow">
              After
            </span>
            <img
              src={IMAGES.beforePool}
              alt="Pool before cleaning showing algae and green water"
              loading="eager"
              decoding="async"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span
              className="absolute left-3 top-3 rounded bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow transition-opacity"
              style={{ opacity: sliderPos > 12 ? 1 : 0 }}
            >
              Before
            </span>
            <div
              className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)]"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute -left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#2E7D32] font-bold text-white shadow-lg ring-2 ring-white">
                ⇄
              </div>
            </div>
            <input
              type="range"
              min={5}
              max={95}
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              aria-label="Compare Before and After pool cleaning"
              className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
