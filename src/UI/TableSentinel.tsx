import React, { useEffect, useRef } from 'react';

interface TableSentinelProps {
  onIntersect: () => void;
  isLoading?: boolean;
}

export const TableSentinel: React.FC<TableSentinelProps> = ({ onIntersect, isLoading }) => {
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
        root: null, // use the viewport
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
  }, [onIntersect, isLoading]);

  return <div ref={sentinelRef} style={{ height: '1px' }} aria-hidden="true" />;
};
