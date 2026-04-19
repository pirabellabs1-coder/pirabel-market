type IconProps = { s?: number };

export const Icon = {
  Search: ({ s = 16 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  ),
  Bag: ({ s = 16 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8h12l-1 12H7zM9 8V6a3 3 0 0 1 6 0v2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  Heart: ({ s = 16 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M19 14c1.5-1.5 2-3.5 2-5.5C21 5 18.5 3 16 3c-1.8 0-3.5 1-4 2.5C11.5 4 9.8 3 8 3 5.5 3 3 5 3 8.5c0 2 .5 4 2 5.5l7 7z" />
    </svg>
  ),
  User: ({ s = 16 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" strokeLinecap="round" />
    </svg>
  ),
  Arrow: ({ s = 14 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 12h14m-6-7 7 7-7 7" />
    </svg>
  ),
  X: ({ s = 16 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  ),
  Plus: ({ s = 14 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Minus: ({ s = 14 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  ),
  Check: ({ s = 16 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  ),
  Whats: ({ s = 20 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.3-.1-.5-.15-.7.15s-.8.95-1 1.15c-.2.2-.35.2-.65.05a8 8 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2.05-.35 0-.5l-1-2.4c-.25-.55-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4c-.3.3-1.05 1-1.05 2.5s1.1 2.9 1.25 3.1c.15.2 2.15 3.3 5.25 4.6 1.95.8 2.7.9 3.7.75.6-.1 1.7-.7 2-1.4.25-.7.25-1.3.15-1.4-.1-.1-.3-.15-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.4 5 5.2-1.4A10 10 0 1 0 12 2z" />
    </svg>
  ),
  Moon: ({ s = 16 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  ),
  Sun: ({ s = 16 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
};
