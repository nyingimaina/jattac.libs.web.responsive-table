import { renderHook, act } from '@testing-library/react';
import { useResolvedTheme } from './useResolvedTheme';

type Listener = (e: { matches: boolean }) => void;

function mockMatchMedia(initial: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches: initial,
    addEventListener: jest.fn((_: string, l: Listener) => listeners.add(l)),
    removeEventListener: jest.fn((_: string, l: Listener) => listeners.delete(l)),
  };
  window.matchMedia = jest.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return {
    mql,
    set(matches: boolean) {
      mql.matches = matches;
      listeners.forEach(l => l({ matches }));
    },
  };
}

describe('useResolvedTheme', () => {
  const original = window.matchMedia;
  afterEach(async () => {
    await act(async () => {
      document.body.className = '';
    });
    window.matchMedia = original;
  });

  it('R1: explicit dark wins over light device and no body.dark', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useResolvedTheme('dark'));
    expect(result.current).toBe('dark');
  });

  it('R1: explicit light wins over dark device and body.dark', () => {
    mockMatchMedia(true);
    document.body.classList.add('dark');
    const { result } = renderHook(() => useResolvedTheme('light'));
    expect(result.current).toBe('light');
  });

  it('R1: system follows the device preference and updates live', () => {
    const mm = mockMatchMedia(true);
    const { result } = renderHook(() => useResolvedTheme('system'));
    expect(result.current).toBe('dark');
    act(() => mm.set(false));
    expect(result.current).toBe('light');
  });

  it('R1: system shows light and does not throw when matchMedia is unavailable', () => {
    // @ts-expect-error simulate an environment without matchMedia
    window.matchMedia = undefined;
    const { result } = renderHook(() => useResolvedTheme('system'));
    expect(result.current).toBe('light');
  });

  it('R2: no theme and no body.dark is light even if device prefers dark', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useResolvedTheme(undefined));
    expect(result.current).toBe('light');
  });

  it('R2: no theme follows body.dark live and the last toggle wins', async () => {
    const { result } = renderHook(() => useResolvedTheme(undefined));
    expect(result.current).toBe('light');
    await act(async () => {
      document.body.classList.add('dark');
      document.body.classList.remove('dark');
      document.body.classList.add('dark');
    });
    expect(result.current).toBe('dark');
    await act(async () => {
      document.body.classList.remove('dark');
    });
    expect(result.current).toBe('light');
  });

  it('R2: unrecognised theme falls back to body.dark default', () => {
    document.body.classList.add('dark');
    const { result } = renderHook(() => useResolvedTheme('purple' as never));
    expect(result.current).toBe('dark');
  });

  it('R2: stops observing body and device changes after unmount', async () => {
    const mm = mockMatchMedia(false);
    const spy = jest.spyOn(MutationObserver.prototype, 'disconnect');
    const a = renderHook(() => useResolvedTheme(undefined));
    a.unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    const b = renderHook(() => useResolvedTheme('system'));
    b.unmount();
    expect(mm.mql.removeEventListener).toHaveBeenCalled();
  });

  it('R2: never changes classes on body', () => {
    mockMatchMedia(true);
    document.body.className = 'app';
    const { unmount } = renderHook(() => useResolvedTheme('system'));
    unmount();
    expect(document.body.className).toBe('app');
  });
});
