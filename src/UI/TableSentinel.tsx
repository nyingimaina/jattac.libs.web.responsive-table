import React, { useEffect, useRef } from 'react';

interface TableSentinelProps {
  onIntersect: () => void;
  isLoading?: boolean;
  /** Fix Bug C: pass the scroll container ref so IntersectionObserver reads it inside the
   *  effect (post-commit) rather than at render time when the ref is still null.
   *  Required when maxHeight is set (internal-scroll mode); omit for page-level scroll. */
  scrollableRootRef?: React.RefObject<HTMLDivElement>;
}

export const TableSentinel: React.FC<TableSentinelProps> = ({ onIntersect, isLoading, scrollableRootRef }) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      {
        // Read .current inside the effect (post-commit) so the DOM element is available.
        root: scrollableRootRef?.current ?? null,
        rootMargin: '200px', // start loading 200px before reaching the end
        threshold: 0.1,
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [onIntersect, isLoading, scrollableRootRef]);

  return <div ref={sentinelRef} style={{ height: '1px' }} aria-hidden="true" />;
};
