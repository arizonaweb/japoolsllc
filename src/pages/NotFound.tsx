import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { BRAND, IMAGES, buildSmsLink } from '@/data/brand';
import { MessageIcon } from '@/components/hcb/icons';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = 'Page not found — J & A Pools LLC';
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="grain relative flex min-h-screen flex-col overflow-hidden bg-cream text-espresso">
      <header className="relative mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-6 md:px-10">
        <Link to="/" className="flex items-center gap-3 font-serif text-[20px] font-semibold tracking-[0.12em]">
          <img src={IMAGES.monogram} alt="J & A Pools LLC" className="h-10 w-auto object-contain" />
          J &amp; A POOLS LLC
        </Link>
        <a
          href={`tel:${BRAND.phoneE164}`}
          className="text-sm font-semibold text-bronze hover:underline"
        >
          {BRAND.phoneDisplay}
        </a>
      </header>

      <main className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-5 pb-20 md:px-10">
        <p className="eyebrow animate-fade-in">Error 404</p>
        <h1 className="display mt-6 text-[clamp(3.2rem,9vw,7.5rem)] animate-slide-in">
          Out of the
          <br />
          <em className="italic text-bronze">deep end.</em>
        </h1>
        <p className="mt-6 max-w-md text-[16px] leading-relaxed text-espresso/80">
          The page you’re looking for isn’t here. Head back to J &amp; A Pools LLC, or text us directly at{' '}
          {BRAND.phoneDisplay}.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="btn-primary">
            Back to J &amp; A Pools LLC
          </Link>
          <a href={buildSmsLink("Hi J & A Pools! I'd like to schedule pool service.")} className="btn-ghost">
            <MessageIcon /> Text {BRAND.phoneDisplay}
          </a>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
