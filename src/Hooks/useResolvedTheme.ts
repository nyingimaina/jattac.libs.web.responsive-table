import { useEffect, useState } from 'react';
import { ResponsiveTableTheme } from '../Data/ResponsiveTableTheme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Resolves the theme prop plus the environment to 'light' | 'dark'.
 * Starts as 'light' (server and first client render) and only reads the
 * environment inside an effect, so there is no hydration mismatch.
 */
export function useResolvedTheme(theme: ResponsiveTableTheme | undefined): 'light' | 'dark' {
  const explicit = theme === 'light' || theme === 'dark' ? theme : undefined;
  const followSystem = theme === 'system';
  const followBody = !explicit && !followSystem;

  const [envDark, setEnvDark] = useState(false);

  useEffect(() => {
    if (!followBody || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    const read = () => setEnvDark(document.body.classList.contains('dark'));
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [followBody]);

  useEffect(() => {
    if (!followSystem || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = (e: { matches: boolean }) => setEnvDark(e.matches);
    setEnvDark(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [followSystem]);

  if (explicit) return explicit;
  return envDark ? 'dark' : 'light';
}
