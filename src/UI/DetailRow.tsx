import React, { useState } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';

interface DetailRowProps<TData> {
  row: TData;
  rowIndex: number;
  colSpan: number;
  expandRowRenderer: (row: TData, rowIndex: number) => React.ReactNode;
  isExpanded: boolean;
}

export function DetailRow<TData>({ row, rowIndex, colSpan, expandRowRenderer, isExpanded }: DetailRowProps<TData>) {
  const content = expandRowRenderer(row, rowIndex);
  const hasContent = content != null;

  const [everExpanded, setEverExpanded] = useState(false);
  if (isExpanded && !everExpanded) setEverExpanded(true);

  const tdClass = [
    styles.detailCell,
    isExpanded && hasContent ? styles.detailCellHasContent : '',
    isExpanded ? styles.detailCellExpanded : '',
  ].join(' ').trim();

  return (
    <tr>
      <td colSpan={colSpan} className={tdClass}>
        <div className={`${styles.detailContentWrapper} ${isExpanded ? styles.detailContentWrapperExpanded : ''}`}>
          <div className={styles.detailContentInner}>
            {everExpanded && content}
          </div>
        </div>
      </td>
    </tr>
  );
}
