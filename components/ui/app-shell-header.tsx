import Link from 'next/link';

type HeaderLink = {
  href: string;
  label: string;
};

interface AppShellHeaderProps {
  current: string;
  links?: HeaderLink[];
}

export function AppShellHeader({ current, links = [] }: AppShellHeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 h-12 md:h-14 flex items-center px-6 md:px-10 border-b"
      style={{
        background: 'rgba(254,250,224,0.94)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(212,163,115,0.15)',
      }}
    >
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto gap-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0">
          <div
            className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
            style={{ backgroundColor: 'rgba(212,163,115,0.12)' }}
          >
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" style={{ color: '#8A6A4A' }}>
              <path d="M11 2C11 2 3 7 3 13C3 17.4 6.6 20 11 20C15.4 20 19 17.4 19 13C19 7 11 2 11 2Z" fill="currentColor" fillOpacity="0.5"/>
              <path d="M11 8C11 8 6 11 6 14.5C6 16.99 8.24 18.5 11 18.5C13.76 18.5 16 16.99 16 14.5C16 11 11 8 11 8Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-base font-medium tracking-tight hidden sm:block" style={{ color: 'var(--charcoal)' }}>
            Memory Project
          </span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--bronze)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
            {current}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-all duration-200 hover:brightness-95 active:scale-95"
              style={{
                borderColor: 'rgba(212,163,115,0.22)',
                color: 'var(--charcoal)',
                backgroundColor: 'rgba(255,253,246,0.72)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
