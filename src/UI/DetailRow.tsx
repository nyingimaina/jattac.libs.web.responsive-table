import React, { useState } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';

interface DetailRowProps<TData> {
  row: TData;
  colSpan: number;
  expandRowRenderer: (row: TData) => React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

export function DetailRow<TData>({ row, colSpan, expandRowRenderer, isExpanded, onToggle }: DetailRowProps<TData>) {
  const content = expandRowRenderer(row);
  const hasContent = content != null;

  // Mount content on first expand; keep mounted so collapse animation plays.
  const [everExpanded, setEverExpanded] = useState(false);
  if (isExpanded && !everExpanded) setEverExpanded(true);

  return (
    <tr>
      <td colSpan={colSpan} className={styles.detailCell}>
        <div className={`${styles.detailToggleBar} ${hasContent ? styles.detailToggleBarVisible : ''}`}>
          {hasContent && (
            <button
              className={styles.detailToggleBtn}
              onClick={onToggle}
              aria-expanded={isExpanded}
              data-rt-ignore-row-click
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>
        <div className={`${styles.detailContentWrapper} ${isExpanded ? styles.detailContentWrapperExpanded : ''}`}>
          <div className={styles.detailContentInner}>
            {everExpanded && content}
          </div>
        </div>
      </td>
    </tr>
  );
}
