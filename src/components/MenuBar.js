import React from 'react';

const MenuBar = ({ menuOpen, handleMenuClick, handleMenuItemClick, isGridVisible, isMinimapVisible, isDarkTheme, toggleTheme, isNodeRoundingEnabled, toggleNodeRounding }) => {
  return (
    <div style={{
      backgroundColor: isDarkTheme ? '#333' : '#e0e0e0',
      color: isDarkTheme ? '#fff' : '#000',
      padding: '5px',
      display: 'flex',
      borderBottom: isDarkTheme ? '1px solid #555' : '1px solid #999'
    }}>
      {['File', 'Edit', 'View', 'Export', 'Run', 'Help'].map((menu) => (
        <div key={menu} style={{ position: 'relative' }}>
          <button
            onClick={() => handleMenuClick(menu)}
            style={{
              backgroundColor: menuOpen === menu ? (isDarkTheme ? '#555' : '#ccc') : 'transparent',
              border: 'none',
              color: isDarkTheme ? '#fff' : '#000',
              padding: '5px 10px',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
          >
            {menu}
          </button>
          {menuOpen === menu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: isDarkTheme ? '#444' : '#f0f0f0',
              border: isDarkTheme ? '1px solid #555' : '1px solid #999',
              zIndex: 1000,
              whiteSpace: 'nowrap'
            }}>
              {menu === 'File' && [
                <button key="new" onClick={() => handleMenuItemClick('new')} style={{ width: '100%', textAlign: 'left' }}>New</button>,
                <button key="open" onClick={() => handleMenuItemClick('open')} style={{ width: '100%', textAlign: 'left' }}>Open</button>,
                <button key="settings" onClick={() => handleMenuItemClick('projectSettings')} style={{ width: '100%', textAlign: 'left' }}>Settings</button>,
              ]}
              {menu === 'Edit' && [
                <button key="undo" onClick={() => handleMenuItemClick('undo')} style={{ width: '100%', textAlign: 'left' }}>Undo</button>,
                <button key="redo" onClick={() => handleMenuItemClick('redo')} style={{ width: '100%', textAlign: 'left' }}>Redo</button>,
                <button key="copy" onClick={() => handleMenuItemClick('copy')} style={{ width: '100%', textAlign: 'left' }}>Copy</button>,
                <button key="paste" onClick={() => handleMenuItemClick('paste')} style={{ width: '100%', textAlign: 'left' }}>Paste</button>,
                <button key="cut" onClick={() => handleMenuItemClick('cut')} style={{ width: '100%', textAlign: 'left' }}>Cut</button>,
                <button key="selectAll" onClick={() => handleMenuItemClick('selectAll')} style={{ width: '100%', textAlign: 'left' }}>Select All</button>,
                <button key="delete" onClick={() => handleMenuItemClick('delete')} style={{ width: '100%', textAlign: 'left' }}>Delete</button>
              ]}
              {menu === 'View' && [
                <button key="zoomIn" onClick={() => handleMenuItemClick('zoomIn')} style={{ width: '100%', textAlign: 'left' }}>Zoom In</button>,
                <button key="zoomOut" onClick={() => handleMenuItemClick('zoomOut')} style={{ width: '100%', textAlign: 'left' }}>Zoom Out</button>,
                <button key="resetView" onClick={() => handleMenuItemClick('resetView')} style={{ width: '100%', textAlign: 'left' }}>Reset View</button>,
                <button key="toggleGrid" onClick={() => handleMenuItemClick('toggleGrid')} style={{ width: '100%', textAlign: 'left' }}>
                  {isGridVisible ? 'Hide Grid' : 'Show Grid'}
                </button>,
                <button key="toggleMinimap" onClick={() => handleMenuItemClick('toggleMinimap')} style={{ width: '100%', textAlign: 'left' }}>
                  {isMinimapVisible ? 'Hide Minimap' : 'Show Minimap'}
                </button>,
                <button key="toggleTheme" onClick={toggleTheme} style={{ width: '100%', textAlign: 'left' }}>
                  {isDarkTheme ? 'Light Theme' : 'Dark Theme'}
                </button>,
                <button key="toggleNodeRounding" onClick={() => handleMenuItemClick('toggleNodeRounding')} style={{ width: '100%', textAlign: 'left' }}>
                  {isNodeRoundingEnabled ? 'Disable Node Rounding' : 'Enable Node Rounding'}
                </button>
              ]}
              {menu === 'Export' && [
                <button key="exportImage" onClick={() => handleMenuItemClick('exportImage')} style={{ width: '100%', textAlign: 'left' }}>Export as Image</button>,
                <button key="exportSVG" onClick={() => handleMenuItemClick('exportSVG')} style={{ width: '100%', textAlign: 'left' }}>Export as SVG</button>,
                <button key="exportJSON" onClick={() => handleMenuItemClick('exportJSON')} style={{ width: '100%', textAlign: 'left' }}>Export as JSON</button>,
                <button key="exportJavaScript" onClick={() => handleMenuItemClick('exportJavaScript')} style={{ width: '100%', textAlign: 'left' }}>Export as JavaScript</button>
              ]}
              {menu === 'Run' && [
                <button key="runWithoutDebugging" onClick={() => handleMenuItemClick('runWithoutDebugging')} style={{ width: '100%', textAlign: 'left' }}>Run without debugging</button>,
                <button key="runWithDebugging" onClick={() => handleMenuItemClick('runWithDebugging')} style={{ width: '100%', textAlign: 'left' }}>Run with debugging</button>,
                <button key="generateCode" onClick={() => handleMenuItemClick('generateCode')} style={{ width: '100%', textAlign: 'left' }}>Generate code</button>
              ]}
              {menu === 'Help' && [
                <button key="example1" onClick={() => handleMenuItemClick('loadExample', 'example1')} style={{ width: '100%', textAlign: 'left' }}>Example 1: Hello World</button>,
                <button key="example2" onClick={() => handleMenuItemClick('loadExample', 'example2')} style={{ width: '100%', textAlign: 'left' }}>Example 2: Basic Math</button>
              ]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBar;
