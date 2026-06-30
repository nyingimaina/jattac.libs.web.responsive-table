import { renderHook, act } from '@testing-library/react';
import { useResponsiveTable } from './useResponsiveTable';

function makeHeaderEl() {
  const el = document.createElement('thead');
  document.body.appendChild(el);
  return el;
}

describe('useResponsiveTable — Bug B: stale closure blocks un-sticky transition', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.innerWidth = 1024;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('transitions isHeaderSticky back to false when header scrolls back into view', () => {
    const headerEl = makeHeaderEl();
    const headerRef = { current: headerEl };
    const gbcr = jest.spyOn(headerEl, 'getBoundingClientRect');

    // Phase 1: header is above the viewport — should become sticky
    gbcr.mockReturnValue({
      top: -50, bottom: 0, left: 0, right: 0, width: 100, height: 50,
      toJSON: () => ({}),
    } as DOMRect);

    const { result } = renderHook(() =>
      useResponsiveTable({ enablePageLevelStickyHeader: true, headerRef })
    );

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isHeaderSticky).toBe(true);

    // Phase 2: header scrolls back into view — should become un-sticky
    gbcr.mockReturnValue({
      top: 100, bottom: 150, left: 0, right: 0, width: 100, height: 50,
      toJSON: () => ({}),
    } as DOMRect);

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(200);
    });

    // BUG B: stale isHeaderSticky=false in closure → guard (false !== false) is always false
    // → setIsHeaderSticky(false) is never called → header is permanently stuck as sticky
    expect(result.current.isHeaderSticky).toBe(false);
  });
});

describe('useResponsiveTable — Bug A: scroll listener not removed on cleanup', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.innerWidth = 1024;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('passes the same function reference to removeEventListener as addEventListener', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useResponsiveTable({ enablePageLevelStickyHeader: true })
    );

    const scrollAdds = addSpy.mock.calls.filter(([event]) => event === 'scroll');
    expect(scrollAdds).toHaveLength(1);
    const registeredFn = scrollAdds[0][1] as EventListenerOrEventListenerObject;

    unmount();

    const scrollRemoves = removeSpy.mock.calls.filter(([event]) => event === 'scroll');
    // BUG A: two separate anonymous arrows → remove reference never matches add reference
    expect(scrollRemoves.some(([, fn]) => fn === registeredFn)).toBe(true);
  });
});
