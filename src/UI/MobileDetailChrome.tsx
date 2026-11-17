import React from 'react';
import { MdKeyboardArrowUp } from 'react-icons/md';
import styles from '../Styles/ResponsiveTable.module.css';

interface MobileDetailChromeProps {
  /** Breadcrumb title — normally the row's name. */
  title: React.ReactNode;
  isExpanded: boolean;
  /** Collapse the section. Wired to the rail, the header and the footer. */
  onCollapse: () => void;
  children: React.ReactNode;
}

/**
 * Orientation chrome for an expanded mobile detail section:
 *  - a tappable rail down the left (indentation + "you are inside something" signal),
 *  - a sticky breadcrumb header ("Title › Details") that collapses on tap,
 *  - a footer "Hide details" button so the control is never a long scroll away.
 *
 * Only the header is exposed to assistive tech as the expanded/collapsed control; the rail is
 * a pointer-only shortcut (aria-hidden) and the footer is a plain action button.
 * While collapsed (the pane is animating shut) none of the controls are focusable.
 */
export function MobileDetailChrome({ title, isExpanded, onCollapse, children }: MobileDetailChromeProps) {
  const tabIndex = isExpanded ? 0 : -1;
  const hidden = isExpanded ? undefined : true;

  return (
    <div className={styles.mobileDetailPane}>
      <button
        type="button"
        className={styles.mobileDetailRail}
        data-testid="rt-mobile-detail-rail"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onCollapse}
      />
      <div className={styles.mobileDetailMain}>
        <button
          type="button"
          className={styles.mobileDetailHeader}
          data-testid="rt-mobile-detail-header"
          aria-expanded={isExpanded}
          aria-hidden={hidden}
          tabIndex={tabIndex}
          onClick={onCollapse}
        >
          <span className={styles.mobileDetailBreadcrumb}>
            <span className={styles.mobileDetailTitle}>{title}</span>
            <span className={styles.mobileDetailSeparator} aria-hidden="true">›</span>
            <span>Details</span>
          </span>
          <MdKeyboardArrowUp aria-hidden="true" />
        </button>
        <div className={styles.mobileDetailBody}>{children}</div>
        <button
          type="button"
          className={styles.mobileDetailFooter}
          data-testid="rt-mobile-detail-footer"
          aria-hidden={hidden}
          tabIndex={tabIndex}
          onClick={onCollapse}
        >
          <span>Hide details</span>
          <MdKeyboardArrowUp aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
