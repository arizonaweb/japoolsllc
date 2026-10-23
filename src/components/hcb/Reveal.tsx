import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  /** Direction the content glides in from as it scrolls into view. */
  from?: 'bottom' | 'left' | 'bottom-left' | 'bottom-right';
}

const HIDDEN: Record<NonNullable<RevealProps['from']>, string> = {
  bottom: 'opacity-0 translate-y-6',
  left: 'opacity-0 -translate-x-10',
  'bottom-left': 'opacity-0 -translate-x-10 translate-y-8',
  'bottom-right': 'opacity-0 translate-x-10 translate-y-8',
};

export default function Reveal({ children, className = '', delay = 0, as: Tag = 'div', from = 'bottom' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = HIDDEN[from];
  const shown = 'opacity-100 translate-x-0 translate-y-0';

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[1100ms] ease-[cubic-bezier(.2,.7,.2,1)] ${visible ? shown : hidden} ${className}`}
    >
      {children}
    </Tag>
  );
}
