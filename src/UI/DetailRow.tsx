import React, { useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import styles from '../Styles/ResponsiveTable.module.css';

interface DetailRowProps<TData> {
  row: TData;
  rowIndex: number;
  colSpan: number;
  expandRowRenderer: (row: TData, rowIndex: number) => React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  expandChevronClassName?: string;
}

export function DetailRow<TData>({ row, rowIndex, colSpan, expandRowRenderer, isExpanded, onToggle, expandChevronClassName }: DetailRowProps<TData>) {
  const content = expandRowRenderer(row, rowIndex);
  const hasContent = content != null;

  const [everExpanded, setEverExpanded] = useState(false);
  if (isExpanded && !everExpanded) setEverExpanded(true);

  const tdClass = [
    styles.detailCell,
    hasContent ? styles.detailCellHasContent : '',
    isExpanded ? styles.detailCellExpanded : '',
  ].join(' ').trim();

  const chevronClass = [
    styles.detailChevron,
    isExpanded ? styles.detailChevronExpanded : '',
    expandChevronClassName ?? '',
  ].join(' ').trim();

  return (
    <tr>
      <td colSpan={colSpan} className={tdClass}>
        <div
          className={`${styles.detailToggleBar} ${hasContent ? styles.detailToggleBarVisible : ''}`}
          {...(hasContent ? {
            role: 'button',
            tabIndex: 0,
            'aria-expanded': isExpanded,
            onClick: onToggle,
            onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } },
            'data-rt-ignore-row-click': true,
          } : {})}
        >
          {hasContent && (
            <span className={chevronClass}>
              <MdArrowDropDown />
            </span>
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
