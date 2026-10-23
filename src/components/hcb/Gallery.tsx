import { useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import Reveal from './Reveal';

const photos = [
  {
    src: `${import.meta.env.BASE_URL}assets/japoolsllc_pool_cleaning_service_phoenix_arizona_05.png`,
    alt: 'Luxury Phoenix backyard pool with spa and Baja shelf',
    title: 'Backyard Pool & Spa',
  },
  {
    src: `${import.meta.env.BASE_URL}assets/japoolsllc_pool_cleaning_service_phoenix_arizona_04.jpg`,
    alt: 'Crystal-clear pool reflecting the Arizona sky',
    title: 'Crystal-Clear Water',
  },
  {
    src: `${import.meta.env.BASE_URL}assets/japoolsllc_pool_cleaning_service_phoenix_arizona.jpg`,
    alt: 'Sparkling clean residential swimming pool',
    title: 'Residential Pool Care',
  },
  {
    src: `${import.meta.env.BASE_URL}assets/japoolsllc_pool_cleaning_service_phoenix_arizona_03.jpg`,
    alt: 'Pool maintenance in progress',
    title: 'Professional Maintenance',
  },
  {
    src: `${import.meta.env.BASE_URL}assets/japoolsllc_pool_cleaning_service_phoenix_arizona_02.jpg`,
    alt: 'Well-maintained pool filtration equipment',
    title: 'Equipment & Filtration',
  },
];

export default function Gallery() {
  const [selected, setSelected] = useState<number | null>(null);

  const move = (direction: number) => {
    setSelected((index) => index === null ? null : (index + direction + photos.length) % photos.length);
  };

  return (
    <Dialog.Root open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <section id="gallery" className="bg-white py-20 sm:py-24" aria-labelledby="gallery-title">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <p className="eyebrow">Pool Care in Phoenix, Arizona</p>
            <h2 id="gallery-title" className="display mt-3 text-4xl text-espresso sm:text-5xl">
              Pools Worth <span className="text-[#005A9C]">Coming Home To.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Explore pool and equipment photography from J &amp; A Pools LLC.
            </p>
          </Reveal>
          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <Reveal key={photo.src} delay={index * 40}>
                <Dialog.Trigger asChild>
                  <button
                    type="button"
                    onClick={() => setSelected(index)}
                    aria-label={`Enlarge photo: ${photo.title}`}
                    className="group relative block w-full overflow-hidden rounded-xl bg-slate-100 text-left shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005A9C]"
                  >
                    <img src={photo.src} alt={photo.alt} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-12 font-heading text-sm font-semibold text-white">
                      {photo.title}
                    </span>
                  </button>
                </Dialog.Trigger>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/90" />
        <Dialog.Content
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') move(-1);
            if (event.key === 'ArrowRight') move(1);
          }}
          className="fixed inset-0 z-[71] flex items-center justify-center border-0 bg-transparent p-4 outline-none sm:p-8"
        >
          {selected !== null && (
            <>
              <Dialog.Title className="sr-only">{`Pool gallery: ${photos[selected].title}`}</Dialog.Title>
              <Dialog.Close aria-label="Close photo" className="absolute right-4 top-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/30">
                <X className="h-6 w-6" />
              </Dialog.Close>
              <button onClick={() => move(-1)} aria-label="Previous photo" className="absolute left-3 rounded-full bg-white/15 p-3 text-white hover:bg-white/30 sm:left-8">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <figure className="max-h-full max-w-6xl">
                <img src={photos[selected].src} alt={photos[selected].alt} className="max-h-[82vh] max-w-full rounded-lg object-contain" />
                <figcaption className="mt-3 text-center font-heading text-sm font-semibold text-white">{photos[selected].title}</figcaption>
              </figure>
              <button onClick={() => move(1)} aria-label="Next photo" className="absolute right-3 rounded-full bg-white/15 p-3 text-white hover:bg-white/30 sm:right-8">
                <ArrowRight className="h-6 w-6" />
              </button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
