import React from 'react';
import styles from './Tabs.module.css';

const Tabs = ({ tabs, activeTab, onTabClick, onTabClose, isDarkTheme }) => {
  const theme = isDarkTheme ? 'dark' : 'light';

  return (
    <div className={`${styles.tabContainer} ${styles[theme]}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`${styles.tab} ${styles[theme]} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.tabTitle}>
              {tab.title}
            </span>
            {tab.id !== 'untitled-1' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className={`${styles.closeButton} ${styles[theme]} ${isActive ? styles.active : ''}`}
              >
                ×
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Tabs;