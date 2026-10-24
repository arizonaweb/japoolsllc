import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SiteControls({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      <label className="sr-only" htmlFor={compact ? 'footer-language' : 'header-language'}>
        Language / Idioma
      </label>
      <select
        id={compact ? 'footer-language' : 'header-language'}
        value={language}
        onChange={(event) => {
          if (event.target.value === 'en' || event.target.value === 'es') {
            setLanguage(event.target.value);
          }
        }}
        className="rounded border border-current/20 bg-transparent px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-inherit"
        aria-label="Language / Idioma"
      >
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-current/10"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Light mode' : 'Dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}
