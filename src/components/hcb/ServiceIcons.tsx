import type { ReactNode } from 'react';
import { BRAND } from '@/data/brand';

interface ServiceIcon {
  name: string;
  label: string;
  href?: string;
  mark: ReactNode;
  outline?: boolean;
}

const icons: ServiceIcon[] = [
  {
    name: 'Google',
    label: 'Google Business Profile',
    href: BRAND.googleShareUrl1,
    mark: <text x="3" y="19" fontSize="19" fontWeight="700" fontFamily="Arial, sans-serif" fill="#4285F4">G</text>,
  },
  {
    name: 'Apple',
    label: 'Apple Maps',
    mark: <path d="M16.4 12.7c0-2 1.6-3 1.7-3.1-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7s1.7.7 2.8.7 1.8-1 2.5-2c.8-1.1 1.1-2.2 1.1-2.2s-2-.8-2-3.9ZM14.3 6.6c.6-.7 1-1.7.9-2.6-.9 0-2 .6-2.7 1.3-.6.6-1.1 1.6-1 2.5 1 .1 2-.5 2.8-1.2Z" />,
  },
  {
    name: 'Facebook',
    label: 'Facebook',
    mark: <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4Z" />,
  },
  {
    name: 'Instagram',
    label: 'Instagram',
    mark: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.7" r=".8" fill="currentColor" stroke="none" /></>,
    outline: true,
  },
  {
    name: 'WhatsApp',
    label: 'WhatsApp',
    mark: <><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4Z" /><path d="M8.5 8.5c.4 2.4 2.6 4.6 5 5l1.2-1.2 2 .9c.1 1.1-.8 2-2 2.1-3.8-.4-7-3.6-7.3-7.3.1-1.2 1-2.1 2.1-2l.9 2-1.9 1.5Z" /></>,
    outline: true,
  },
  {
    name: 'TikTok',
    label: 'TikTok',
    mark: <path d="M15.5 3h-3v12.2a2.6 2.6 0 1 1-2.2-2.6v-3a5.6 5.6 0 1 0 5.2 5.6V9a8.1 8.1 0 0 0 4.5 1.4v-3a5.1 5.1 0 0 1-4.5-4.4Z" />,
  },
  {
    name: 'X',
    label: 'X',
    mark: <path d="M18.9 3H22l-6.8 7.8L23.2 21h-6.3L12 14.7 6.5 21H3.3l7.3-8.4L2.8 3h6.5l4.5 5.9L18.9 3Zm-1.1 16h1.7L8.3 4.9H6.5L17.8 19Z" />,
  },
  {
    name: 'Thumbtack',
    label: 'Thumbtack',
    mark: <path d="M14 3H9l.8 5.2-3.4 3.4v1.7h4.3l-.6 7.7h1.8l.6-7.7h4.3v-1.7l-3.4-3.4L14 3Z" />,
  },
  {
    name: 'BBB',
    label: 'Better Business Bureau A+ Profile',
    href: BRAND.bbbUrl,
    mark: <path d="M12 2.5 20 6v5.3c0 4.8-3.3 8.6-8 10.2-4.7-1.6-8-5.4-8-10.2V6l8-3.5Zm-3.5 9.2h7M8.7 15h6.6" />,
    outline: true,
  },
];

export default function ServiceIcons() {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Business and social profiles">
      {icons.map(({ name, label, href, mark, outline }) => {
        const className = 'inline-flex h-7 w-7 items-center justify-center rounded-full text-current transition-colors hover:bg-current/10';
        // Add each verified profile URL here when J & A Pools supplies it; unlinked icons stay disabled.
        return href ? (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            aria-label={label}
            title={label}
          >
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill={outline ? 'none' : 'currentColor'} stroke={outline ? 'currentColor' : 'none'} strokeWidth={outline ? '1.8' : undefined} aria-hidden="true">
              {mark}
            </svg>
          </a>
        ) : (
          <button
            key={name}
            type="button"
            disabled
            className={`${className} cursor-not-allowed opacity-45`}
            aria-label={`${label} profile link coming soon`}
            title={`${label} profile link coming soon`}
          >
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill={outline ? 'none' : 'currentColor'} stroke={outline ? 'currentColor' : 'none'} strokeWidth={outline ? '1.8' : undefined} aria-hidden="true">
              {mark}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
