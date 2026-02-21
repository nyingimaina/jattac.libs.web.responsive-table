import { useState, useEffect, useCallback, useRef } from 'react';

function debounce<T extends (...args: unknown[]) => unknown>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

interface UseResponsiveTableProps {
  mobileBreakpoint?: number;
  enablePageLevelStickyHeader?: boolean;
  maxHeight?: string; // Indicates if internal sticky header is used
  headerRef?: React.RefObject<HTMLElement>;
  scrollableRef?: React.RefObject<HTMLElement>;
}

interface UseResponsiveTableReturn {
  isMobile: boolean;
  isHeaderSticky: boolean;
  debouncedScrollHandler: (currentTarget: HTMLElement) => void;
}

export const useResponsiveTable = (props: UseResponsiveTableProps): UseResponsiveTableReturn => {
  const { mobileBreakpoint = 600, enablePageLevelStickyHeader = true, maxHeight, headerRef, scrollableRef } = props;

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState<boolean>(false);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= mobileBreakpoint);
  }, [mobileBreakpoint]);

  const handleScroll = useCallback((currentTarget: HTMLElement | Window) => {
    // Explicitly use currentTarget to satisfy linter/compiler
    void currentTarget; 
    // Page-level sticky header logic
    if (enablePageLevelStickyHeader && !maxHeight && headerRef?.current) {
      const { top } = headerRef.current.getBoundingClientRect();
      const sticky = top <= 0;
      if (sticky !== isHeaderSticky) {
        setIsHeaderSticky(sticky);
      }
    }
  }, [enablePageLevelStickyHeader, maxHeight, headerRef, isHeaderSticky]);

  const debouncedScrollHandler = useRef(debounce(handleScroll, 200)).current;

  useEffect(() => {
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    const scrollTarget = scrollableRef?.current || window;
    if (enablePageLevelStickyHeader || maxHeight) { // Only add scroll listener if sticky header or internal scroll is enabled
      scrollTarget.addEventListener('scroll', (e) => debouncedScrollHandler(e.currentTarget as HTMLElement | Window));
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (enablePageLevelStickyHeader || maxHeight) {
        scrollTarget.removeEventListener('scroll', (e) => debouncedScrollHandler(e.currentTarget as HTMLElement | Window));
      }
    };
  }, [handleResize, debouncedScrollHandler, enablePageLevelStickyHeader, maxHeight, scrollableRef]);

  return { isMobile, isHeaderSticky, debouncedScrollHandler: debouncedScrollHandler as (currentTarget: HTMLElement) => void };
};
