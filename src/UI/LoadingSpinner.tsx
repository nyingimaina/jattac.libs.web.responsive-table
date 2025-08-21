import React from 'react';
import styles from '../Styles/LoadingSpinner.module.css';
import infoStyles from '../Styles/NoMoreDataMessage.module.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className={infoStyles.infoContainer}>
      <div className={styles.spinner}></div>
      <span>Loading more items...</span>
    </div>
  );
};

export default LoadingSpinner;