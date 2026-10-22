import { useEffect, useState, type ReactNode } from 'react';
import { Check, Download, Home, Monitor, MoreVertical, PlusSquare, Share, Smartphone, X } from 'lucide-react';
import { BRAND, IMAGES } from '@/data/brand';
import {
  canPromptInstall,
  detectPlatform,
  isStandalone,
  onInstallAvailabilityChange,
  promptInstall,
  type Platform,
} from '@/lib/pwa';

const DISMISS_KEY = 'ja-pools-get-app-dismissed-at';
const DISMISS_DAYS = 7;

type Tab = 'iphone' | 'android' | 'computer';

interface Step {
  icon: ReactNode;
  title: string;
  body: string;
}

const iconCls = 'h-4 w-4';

const STEPS: Record<Tab, Step[]> = {
  iphone: [
    {
      icon: <Share className={iconCls} strokeWidth={1.5} />,
      title: 'Tap the Share button',
      body: 'In Safari, tap the square with an arrow pointing up at the bottom of your screen.',
    },
    {
      icon: <PlusSquare className={iconCls} strokeWidth={1.5} />,
      title: 'Choose “Add to Home Screen”',
      body: 'Scroll down the share menu and select “Add to Home Screen”.',
    },
    {
      icon: <Check className={iconCls} strokeWidth={1.5} />,
      title: 'Tap “Add”',
      body: 'The J & A Pools LLC icon will appear on your home screen.',
    },
    {
      icon: <Home className={iconCls} strokeWidth={1.5} />,
      title: 'Open anytime in one tap',
      body: `Schedule pool service or text ${BRAND.phoneDisplay} right from your home screen.`,
    },
  ],
  android: [
    {
      icon: <MoreVertical className={iconCls} strokeWidth={1.5} />,
      title: 'Tap the browser menu',
      body: 'In Chrome, tap the three dots in the top right corner.',
    },
    {
      icon: <Download className={iconCls} strokeWidth={1.5} />,
      title: 'Tap “Install app” or “Add to Home screen”',
      body: 'Confirm to add the J & A Pools shortcut to your phone.',
    },
    {
      icon: <Check className={iconCls} strokeWidth={1.5} />,
      title: 'Confirm “Install”',
      body: 'J & A Pools LLC will appear alongside your apps.',
    },
    {
      icon: <Home className={iconCls} strokeWidth={1.5} />,
      title: 'Open anytime in one tap',
      body: `Request pool cleaning, repairs, or text ${BRAND.phoneDisplay} in seconds.`,
    },
  ],
  computer: [
    {
      icon: <Download className={iconCls} strokeWidth={1.5} />,
      title: 'Chrome or Edge: click the install icon',
      body: 'Click the install icon in the address bar and choose “Install J & A Pools LLC”.',
    },
    {
      icon: <PlusSquare className={iconCls} strokeWidth={1.5} />,
      title: 'Safari on Mac: File → Add to Dock',
      body: 'Or click Share in the toolbar and choose “Add to Dock”.',
    },
    {
      icon: <Check className={iconCls} strokeWidth={1.5} />,
      title: 'Confirm “Install” or “Add”',
      body: 'J & A Pools LLC opens in its own dedicated window whenever you need it.',
    },
  ],
};

const platformToTab = (p: Platform): Tab =>
  p === 'ios' || p === 'ios-other' ? 'iphone' : p === 'android' ? 'android' : 'computer';

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>('desktop');
  const [tab, setTab] = useState<Tab>('computer');
  const [nativeReady, setNativeReady] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem('ja-pools-app-installed') === '1') return;
      const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (at && Date.now() - at < DISMISS_DAYS * 86400000) return;
    } catch {
      /* ignore */
    }
    const p = detectPlatform();
    setPlatform(p);
    setTab(platformToTab(p));
    setNativeReady(canPromptInstall());
    const off = onInstallAvailabilityChange(() => setNativeReady(canPromptInstall()));
    const t = setTimeout(() => setVisible(true), 2500);
    return () => {
      off();
      clearTimeout(t);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const installNow = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      setInstalled(true);
      setTimeout(() => {
        setOpen(false);
        setVisible(false);
      }, 1800);
    }
  };

  const onPillTap = async () => {
    if (!canPromptInstall()) {
      setOpen(true);
      return;
    }
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      setVisible(false);
    } else if (outcome === 'unavailable') {
      setOpen(true);
    }
  };

  if (!visible) return null;

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: 'iphone', label: 'iPhone / iPad', icon: <Smartphone className="h-3.5 w-3.5" strokeWidth={1.5} /> },
    { id: 'android', label: 'Android', icon: <Smartphone className="h-3.5 w-3.5" strokeWidth={1.5} /> },
    { id: 'computer', label: 'Computer', icon: <Monitor className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  ];

  return (
    <>
      {!open && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 animate-slide-in sm:bottom-6 sm:justify-start sm:px-6">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-gold/40 bg-ivory/95 py-1.5 pl-2 pr-1.5 text-espresso shadow-lg backdrop-blur-md">
            <button
              onClick={onPillTap}
              className="flex items-center gap-3 rounded-full py-0.5 pl-1 pr-3 text-left transition-colors hover:bg-cream"
              aria-haspopup="dialog"
            >
              <img src={IMAGES.monogram} alt="" className="h-8 w-auto rounded bg-white px-1 object-contain" />
              <span className="leading-tight">
                <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-bronze">Save Pool App</span>
                <span className="block text-[11px] text-espresso/75">
                  {nativeReady ? 'Tap to install on your device' : 'Add J & A Pools to home screen'}
                </span>
              </span>
            </button>
            <button
              onClick={dismiss}
              className="rounded-full p-2 text-espresso/55 transition-colors hover:bg-cream hover:text-espresso"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="presentation">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="get-app-title"
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-ivory text-espresso shadow-2xl animate-slide-in sm:rounded-2xl"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 p-2 text-espresso/60 hover:text-espresso"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <div className="px-6 pb-8 pt-8 sm:px-9">
              <div className="flex items-center gap-4">
                <img src={IMAGES.monogram} alt="" className="h-12 w-auto rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-gold/30" />
                <div>
                  <p className="eyebrow">Quick Access</p>
                  <h2 id="get-app-title" className="mt-1 font-serif text-3xl font-semibold leading-tight">
                    J &amp; A Pools <em className="italic text-bronze">on your phone.</em>
                  </h2>
                </div>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-espresso/75">
                Add J &amp; A Pools LLC to your home screen for one-tap service requests and texting {BRAND.phoneDisplay}.
              </p>

              {nativeReady && !installed && (
                <button onClick={installNow} className="btn-primary mt-6 w-full">
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} /> Install now
                </button>
              )}
              {installed && (
                <p className="mt-6 flex items-center gap-2 border-l-2 border-gold pl-4 text-[14px] text-espresso">
                  <Check className="h-4 w-4 text-gold" strokeWidth={1.5} /> Installed — look for J &amp; A Pools on your home screen.
                </p>
              )}

              {!installed && (
                <>
                  <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-espresso/15 bg-espresso/15" role="tablist">
                    {tabs.map((t) => (
                      <button
                        key={t.id}
                        role="tab"
                        aria-selected={tab === t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center justify-center gap-1.5 px-2 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                          tab === t.id ? 'bg-gold text-[#07141C]' : 'bg-ivory text-espresso/75 hover:bg-cream'
                        }`}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <ol className="mt-5 space-y-4">
                    {STEPS[tab].map((s, i) => (
                      <li key={s.title} className="flex gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold text-bronze">
                          {s.icon}
                        </span>
                        <div className="pt-0.5">
                          <p className="text-[14px] font-semibold text-espresso">
                            <span className="mr-2 text-[10px] tracking-[0.26em] text-bronze">0{i + 1}</span>
                            {s.title}
                          </p>
                          <p className="mt-1 text-[13px] leading-relaxed text-espresso/75">{s.body}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              <div className="mt-8 flex items-center justify-between border-t border-espresso/15 pt-5">
                <button onClick={dismiss} className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso/60 hover:text-espresso">
                  Not now
                </button>
                <button onClick={() => setOpen(false)} className="btn-ghost !px-5 !py-2.5">
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
