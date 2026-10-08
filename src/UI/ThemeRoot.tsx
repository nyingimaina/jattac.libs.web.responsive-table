import React, { ReactNode } from 'react';
import styles from '../Styles/Theme.module.css';

interface ThemeRootProps {
  theme: 'light' | 'dark';
  children: ReactNode;
}

/** Scopes the table's colour variables; switching theme only changes a class. */
function ThemeRoot({ theme, children }: ThemeRootProps) {
  return (
    <div
      className={`${styles.themeRoot} ${theme === 'dark' ? styles.themeDark : styles.themeLight}`}
      data-rt-theme={theme}
      style={{ colorScheme: theme }}
    >
      {children}
    </div>
  );
}

export default ThemeRoot;
