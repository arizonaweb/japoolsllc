import { useState } from 'react';
import { IMAGES } from '@/data/brand';
import Reveal from './Reveal';

export default function BeforeAfter() {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <section className="relative bg-ivory py-16 md:py-20" aria-labelledby="transformation-title">
      <Reveal className="mx-auto max-w-[1200px] px-5 md:px-10">
        <div className="rounded-2xl border border-espresso/15 bg-cream/80 p-5 shadow-md sm:p-7">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Real Phoenix Transformation</p>
              <h2 id="transformation-title" className="mt-1 font-serif text-3xl text-espresso">
                Before &amp; After <em className="italic text-bronze">Green-to-Clean</em>
              </h2>
            </div>
            <span className="text-[12px] font-medium text-espresso/75">Drag slider to compare Before vs. After</span>
          </div>

          <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-xl ring-1 ring-espresso/15 select-none">
            <img
              src={IMAGES.afterPool}
              alt="After J & A Pools LLC service — sparkling clear blue pool"
              className="h-full w-full object-cover"
            />
            <span className="absolute right-3 top-3 rounded bg-[#2E7D32] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow">
              After
            </span>
            <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
              <img
                src={IMAGES.beforePool}
                alt="Before J & A Pools LLC service — green algae-filled pool"
                className="h-full max-w-none object-cover"
                style={{ width: 'min(100vw, 1120px)' }}
              />
              <span className="absolute left-3 top-3 rounded bg-red-700 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow">
                Before
              </span>
            </div>
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
