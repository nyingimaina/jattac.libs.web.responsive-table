import React from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import { ColumnDefinition } from './ResponsiveTable';

interface SkeletonViewProps<TData> {
  isMobile: boolean;
  columnDefinitions: ColumnDefinition<TData>[];
}

function SkeletonView<TData>(props: SkeletonViewProps<TData>) {
  const { isMobile, columnDefinitions } = props;
  const skeletonRowCount = 5;
  const columnCount = columnDefinitions.length;

  if (isMobile) {
    return (
      <div>
        {[...Array(skeletonRowCount)].map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            {[...Array(columnCount)].map((_, j) => (
              <div key={j} className={`${styles.skeleton} ${styles.skeletonText}`} style={{ marginBottom: '0.5rem' }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <table className={styles.responsiveTable}>
      <thead>
        <tr>
          {[...Array(columnCount)].map((_, i) => (
            <th key={i}>
              <div className={`${styles.skeleton} ${styles.skeletonText}`} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(skeletonRowCount)].map((_, i) => (
          <tr key={i}>
            {[...Array(columnCount)].map((_, j) => (
              <td key={j}>
                <div className={`${styles.skeleton} ${styles.skeletonText}`} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default SkeletonView;
