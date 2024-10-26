import React from 'react';

const Tabs = ({ tabs, activeTab, onTabClick, onTabClose, isDarkTheme }) => {
  const getStyles = (isActive) => ({
    tab: {
      padding: '0 30px 0 15px',
      backgroundColor: isActive
        ? (isDarkTheme ? '#252526' : '#ffffff')
        : (isDarkTheme ? '#1e1e1e' : '#f0f0f0'),
      color: isActive
        ? (isDarkTheme ? '#ffffff' : '#000000')
        : (isDarkTheme ? '#909090' : '#606060'),
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRight: isDarkTheme ? '1px solid #252526' : '1px solid #e0e0e0',
      height: '35px',
      fontSize: '13px',
      transition: 'background-color 0.2s',
      position: 'relative',
      whiteSpace: 'nowrap',
    },
    closeButton: {
      padding: '2px 6px',
      borderRadius: '4px',
      backgroundColor: isActive
        ? (isDarkTheme ? '#3c3c3c' : '#e0e0e0')
        : 'transparent',
      color: isDarkTheme ? '#909090' : '#606060',
      fontSize: '14px',
      lineHeight: '14px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      position: 'absolute',
      right: '5px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <div style={{
      display: 'flex',
      backgroundColor: isDarkTheme ? '#1e1e1e' : '#f0f0f0',
      padding: '0',
      whiteSpace: 'nowrap',
      height: '35px',
      alignItems: 'stretch',
      borderBottom: isDarkTheme ? '1px solid #252526' : '1px solid #e0e0e0',
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const styles = getStyles(isActive);

        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            style={styles.tab}
          >
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '150px',
            }}>
              {tab.title}
            </span>
            {tab.id !== 'untitled-1' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                style={styles.closeButton}
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