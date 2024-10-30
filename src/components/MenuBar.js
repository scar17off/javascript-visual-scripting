import React from 'react';
import styles from './MenuBar.module.css';

const MenuBar = ({
  menuOpen,
  handleMenuClick,
  handleMenuItemClick,
  config,
  toggleTheme,
  toggleNodeRounding
}) => {
  const theme = config.isDarkTheme ? 'dark' : 'light';

  return (
    <div className={`${styles.menuBar} ${styles[theme]}`}>
      {['File', 'Edit', 'View', 'Export', 'Run', 'Help'].map((menu) => (
        <div key={menu} className={styles.menuItem}>
          <button
            onClick={() => handleMenuClick(menu)}
            className={`${styles.menuButton} ${styles[theme]} ${menuOpen === menu ? styles.active : ''}`}
          >
            {menu}
          </button>
          {menuOpen === menu && (
            <div className={`${styles.dropdownMenu} ${styles[theme]}`}>
              {menu === 'File' && [
                <button key="new" onClick={() => handleMenuItemClick('new')} className={`${styles.menuItemButton} ${styles[theme]}`}>New</button>,
                <button key="open" onClick={() => handleMenuItemClick('open')} className={`${styles.menuItemButton} ${styles[theme]}`}>Open</button>,
                <button key="settings" onClick={() => handleMenuItemClick('projectSettings')} className={`${styles.menuItemButton} ${styles[theme]}`}>Settings</button>,
              ]}
              {menu === 'Edit' && [
                <button key="undo" onClick={() => handleMenuItemClick('undo')} className={`${styles.menuItemButton} ${styles[theme]}`}>Undo</button>,
                <button key="redo" onClick={() => handleMenuItemClick('redo')} className={`${styles.menuItemButton} ${styles[theme]}`}>Redo</button>,
                <button key="copy" onClick={() => handleMenuItemClick('copy')} className={`${styles.menuItemButton} ${styles[theme]}`}>Copy</button>,
                <button key="paste" onClick={() => handleMenuItemClick('paste')} className={`${styles.menuItemButton} ${styles[theme]}`}>Paste</button>,
                <button key="cut" onClick={() => handleMenuItemClick('cut')} className={`${styles.menuItemButton} ${styles[theme]}`}>Cut</button>,
                <button key="selectAll" onClick={() => handleMenuItemClick('selectAll')} className={`${styles.menuItemButton} ${styles[theme]}`}>Select All</button>,
                <button key="delete" onClick={() => handleMenuItemClick('delete')} className={`${styles.menuItemButton} ${styles[theme]}`}>Delete</button>
              ]}
              {menu === 'View' && [
                <button key="zoomIn" onClick={() => handleMenuItemClick('zoomIn')} className={`${styles.menuItemButton} ${styles[theme]}`}>Zoom In</button>,
                <button key="zoomOut" onClick={() => handleMenuItemClick('zoomOut')} className={`${styles.menuItemButton} ${styles[theme]}`}>Zoom Out</button>,
                <button key="resetView" onClick={() => handleMenuItemClick('resetView')} className={`${styles.menuItemButton} ${styles[theme]}`}>Reset View</button>,
                <button key="toggleGrid" onClick={() => handleMenuItemClick('toggleGrid')} className={`${styles.menuItemButton} ${styles[theme]}`}>
                  {config.isGridVisible ? 'Hide Grid' : 'Show Grid'}
                </button>,
                <button key="toggleMinimap" onClick={() => handleMenuItemClick('toggleMinimap')} className={`${styles.menuItemButton} ${styles[theme]}`}>
                  {config.isMinimapVisible ? 'Hide Minimap' : 'Show Minimap'}
                </button>,
                <button key="toggleTheme" onClick={toggleTheme} className={`${styles.menuItemButton} ${styles[theme]}`}>
                  {config.isDarkTheme ? 'Light Theme' : 'Dark Theme'}
                </button>,
                <button key="toggleNodeRounding" onClick={() => handleMenuItemClick('toggleNodeRounding')} className={`${styles.menuItemButton} ${styles[theme]}`}>
                  {config.isNodeRoundingEnabled ? 'Disable Node Rounding' : 'Enable Node Rounding'}
                </button>,
                <button key="toggleGraphInspector" onClick={() => handleMenuItemClick('toggleGraphInspector')} className={`${styles.menuItemButton} ${styles[theme]}`}>
                  {config.isGraphInspectorVisible ? 'Hide Graph Inspector' : 'Show Graph Inspector'}
                </button>
              ]}
              {menu === 'Export' && [
                <button key="exportImage" onClick={() => handleMenuItemClick('exportImage')} className={`${styles.menuItemButton} ${styles[theme]}`}>Export as Image</button>,
                <button key="exportSVG" onClick={() => handleMenuItemClick('exportSVG')} className={`${styles.menuItemButton} ${styles[theme]}`}>Export as SVG</button>,
                <button key="exportJSON" onClick={() => handleMenuItemClick('exportJSON')} className={`${styles.menuItemButton} ${styles[theme]}`}>Export as JSON</button>,
                <button key="exportJavaScript" onClick={() => handleMenuItemClick('exportJavaScript')} className={`${styles.menuItemButton} ${styles[theme]}`}>Export as JavaScript</button>
              ]}
              {menu === 'Run' && [
                <button key="runWithoutDebugging" onClick={() => handleMenuItemClick('runWithoutDebugging')} className={`${styles.menuItemButton} ${styles[theme]}`}>Run without debugging</button>,
                <button key="runWithDebugging" onClick={() => handleMenuItemClick('runWithDebugging')} className={`${styles.menuItemButton} ${styles[theme]}`}>Run with debugging</button>,
                <button key="generateCode" onClick={() => handleMenuItemClick('generateCode')} className={`${styles.menuItemButton} ${styles[theme]}`}>Generate code</button>
              ]}
              {menu === 'Help' && [
                <button key="example1" onClick={() => handleMenuItemClick('loadExample', 'example1')} className={`${styles.menuItemButton} ${styles[theme]}`}>Example 1: Hello World</button>,
                <button key="example2" onClick={() => handleMenuItemClick('loadExample', 'example2')} className={`${styles.menuItemButton} ${styles[theme]}`}>Example 2: Basic Math</button>,
                <button key="example3" onClick={() => handleMenuItemClick('loadExample', 'example3')} className={`${styles.menuItemButton} ${styles[theme]}`}>Example 3: If Statement</button>,
                <button key="example4" onClick={() => handleMenuItemClick('loadExample', 'example4')} className={`${styles.menuItemButton} ${styles[theme]}`}>Example 4: Random Number</button>,
                <button key="example5" onClick={() => handleMenuItemClick('loadExample', 'example5')} className={`${styles.menuItemButton} ${styles[theme]}`}>Example 5: Switch Statement</button>
              ]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBar;