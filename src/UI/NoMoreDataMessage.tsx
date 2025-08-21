import React from 'react';
import styles from '../Styles/NoMoreDataMessage.module.css';

const NoMoreDataMessage: React.FC = () => {
  return (
    <div className={`${styles.infoContainer} ${styles.noMoreData}`}>
      <p>You've reached the end!</p>
    </div>
  );
};

export default NoMoreDataMessage;