import { useEffect, useState } from 'react';
import { Menu, Monitor, Moon, Phone, Sun, X } from 'lucide-react';
import { BRAND, IMAGES, NAV_LINKS, TEL_LINK } from '@/data/brand';
import { useTheme } from '@/components/theme-provider';

interface NavProps {
  onBook: () => void;
}

/** "J & A POOLS LLC / PHOENIX, AZ" wordmark + logo */
export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const big = size === 'lg';
  return (
    <span className="flex items-center gap-3 leading-none">
      <img
        src={IMAGES.monogram}
        alt="J & A Pools LLC logo"
        className={`object-contain ${
          big ? 'h-12 w-auto' : 'h-9 w-auto sm:h-11'
        }`}
      />
      <span className="block">
        <span
          className={`block whitespace-nowrap font-serif font-semibold text-espresso ${
            big ? 'text-[26px]' : 'text-[17px] min-[390px]:text-[19px] sm:text-[22px] lg:text-[24px]'
          }`}
        >
          <span className="tracking-[0.14em]">J &amp; A</span>{' '}
          <em className="font-normal italic tracking-[0.04em] text-bronze">Pools LLC</em>
        </span>
        <span
          className={`mt-1 block font-sans font-semibold uppercase text-gold ${
            big ? 'text-[11px] tracking-[0.34em]' : 'text-[9px] tracking-[0.28em] sm:text-[10px]'
          }`}
        >
          Phoenix, AZ · {BRAND.phoneDisplay}
        </span>
      </span>
    </span>
  );
}

export default function Nav({ onBook }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const themeLabel =
    theme === 'system' ? 'Auto (Device)' : theme === 'light' ? 'Light (Cloud)' : 'Dark (Lagoon)';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          open
            ? 'border-b border-espresso/15 bg-cream'
            : scrolled
              ? 'border-b border-espresso/15 bg-ivory/95 backdrop-blur-md shadow-sm'
              : 'bg-ivory/85 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 md:px-10">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go('top');
            }}
            className="text-left"
            aria-label="J & A Pools LLC — back to top"
          >
            <Wordmark />
          </a>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="link-underline text-[11px] font-semibold uppercase tracking-[0.24em] text-espresso/85 hover:text-bronze"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <button
              type="button"
              onClick={cycleTheme}
              title={`Theme: ${themeLabel} — click to switch (Auto / Light / Dark)`}
              aria-label={`Theme: ${themeLabel}`}
              className="inline-flex items-center gap-2 rounded-full border border-espresso/20 bg-cream/70 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-espresso transition-colors hover:border-gold hover:text-bronze"
            >
              {theme === 'system' ? (
                <Monitor className="h-3.5 w-3.5 text-gold" />
              ) : theme === 'light' ? (
                <Sun className="h-3.5 w-3.5 text-gold" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-gold" />
              )}
              <span>{themeLabel}</span>
            </button>

            <a
              href={TEL_LINK}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.14em] text-espresso hover:text-bronze"
            >
              <Phone className="h-3.5 w-3.5 text-gold" />
              {BRAND.phoneDisplay}
            </a>

            <button onClick={onBook} className="btn-primary !px-6 !py-3">
              Schedule Your Pool Service
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={cycleTheme}
              aria-label={`Theme: ${themeLabel}`}
              className="rounded-full border border-espresso/20 bg-cream/70 p-2 text-espresso"
            >
              {theme === 'system' ? (
                <Monitor className="h-4 w-4 text-gold" />
              ) : theme === 'light' ? (
                <Sun className="h-4 w-4 text-gold" />
              ) : (
                <Moon className="h-4 w-4 text-gold" />
              )}
            </button>
            <button
              className="-mr-2 p-2 text-espresso"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="h-7 w-7" strokeWidth={1.3} /> : <Menu className="h-7 w-7" strokeWidth={1.3} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 bottom-0 top-[76px] z-[45] overflow-y-auto bg-cream transition-all duration-300 lg:hidden ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="relative flex min-h-full flex-col justify-between px-6 pb-10 pt-4">
          <nav className="flex flex-col" aria-label="Mobile">
            <button
              onClick={() => {
                setOpen(false);
                onBook();
              }}
              className="border-b border-espresso/15 py-5 text-left text-[13px] font-semibold uppercase tracking-[0.28em] text-bronze"
            >
              Schedule Your Pool Service
            </button>
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="border-b border-espresso/15 py-5 text-left text-[13px] font-semibold uppercase tracking-[0.28em] text-espresso"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="mt-12">
            <div className="mb-8">
              <Wordmark />
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.24em] text-espresso/75">
                {BRAND.positioning}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-espresso/15 pt-6 text-[12px] font-semibold tracking-[0.14em] text-espresso">
              <a href={TEL_LINK}>Call/Text {BRAND.phoneDisplay}</a>
              <a href={BRAND.bbbUrl} target="_blank" rel="noopener noreferrer" className="text-bronze underline">
                BBB A+ Accredited
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
