import React from 'react';

const MenuBar = ({ menuOpen, handleMenuClick, handleMenuItemClick, isGridVisible, isMinimapVisible, isDarkTheme, toggleTheme, isNodeRoundingEnabled, toggleNodeRounding, isGraphInspectorVisible }) => {
  const menuButtonStyle = {
    width: '100%',
    textAlign: 'left',
    backgroundColor: 'transparent',
    border: 'none',
    color: isDarkTheme ? '#fff' : '#000',
    padding: '5px 10px',
    cursor: 'pointer'
  };

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
                <button key="new" onClick={() => handleMenuItemClick('new')} style={menuButtonStyle}>New</button>,
                <button key="open" onClick={() => handleMenuItemClick('open')} style={menuButtonStyle}>Open</button>,
                <button key="settings" onClick={() => handleMenuItemClick('projectSettings')} style={menuButtonStyle}>Settings</button>,
              ]}
              {menu === 'Edit' && [
                <button key="undo" onClick={() => handleMenuItemClick('undo')} style={menuButtonStyle}>Undo</button>,
                <button key="redo" onClick={() => handleMenuItemClick('redo')} style={menuButtonStyle}>Redo</button>,
                <button key="copy" onClick={() => handleMenuItemClick('copy')} style={menuButtonStyle}>Copy</button>,
                <button key="paste" onClick={() => handleMenuItemClick('paste')} style={menuButtonStyle}>Paste</button>,
                <button key="cut" onClick={() => handleMenuItemClick('cut')} style={menuButtonStyle}>Cut</button>,
                <button key="selectAll" onClick={() => handleMenuItemClick('selectAll')} style={menuButtonStyle}>Select All</button>,
                <button key="delete" onClick={() => handleMenuItemClick('delete')} style={menuButtonStyle}>Delete</button>
              ]}
              {menu === 'View' && [
                <button key="zoomIn" onClick={() => handleMenuItemClick('zoomIn')} style={menuButtonStyle}>Zoom In</button>,
                <button key="zoomOut" onClick={() => handleMenuItemClick('zoomOut')} style={menuButtonStyle}>Zoom Out</button>,
                <button key="resetView" onClick={() => handleMenuItemClick('resetView')} style={menuButtonStyle}>Reset View</button>,
                <button key="toggleGrid" onClick={() => handleMenuItemClick('toggleGrid')} style={menuButtonStyle}>
                  {isGridVisible ? 'Hide Grid' : 'Show Grid'}
                </button>,
                <button key="toggleMinimap" onClick={() => handleMenuItemClick('toggleMinimap')} style={menuButtonStyle}>
                  {isMinimapVisible ? 'Hide Minimap' : 'Show Minimap'}
                </button>,
                <button key="toggleTheme" onClick={toggleTheme} style={menuButtonStyle}>
                  {isDarkTheme ? 'Light Theme' : 'Dark Theme'}
                </button>,
                <button key="toggleNodeRounding" onClick={() => handleMenuItemClick('toggleNodeRounding')} style={menuButtonStyle}>
                  {isNodeRoundingEnabled ? 'Disable Node Rounding' : 'Enable Node Rounding'}
                </button>,
                <button key="toggleGraphInspector" onClick={() => handleMenuItemClick('toggleGraphInspector')} style={menuButtonStyle}>
                  {isGraphInspectorVisible ? 'Hide Graph Inspector' : 'Show Graph Inspector'}
                </button>
              ]}
              {menu === 'Export' && [
                <button key="exportImage" onClick={() => handleMenuItemClick('exportImage')} style={menuButtonStyle}>Export as Image</button>,
                <button key="exportSVG" onClick={() => handleMenuItemClick('exportSVG')} style={menuButtonStyle}>Export as SVG</button>,
                <button key="exportJSON" onClick={() => handleMenuItemClick('exportJSON')} style={menuButtonStyle}>Export as JSON</button>,
                <button key="exportJavaScript" onClick={() => handleMenuItemClick('exportJavaScript')} style={menuButtonStyle}>Export as JavaScript</button>
              ]}
              {menu === 'Run' && [
                <button key="runWithoutDebugging" onClick={() => handleMenuItemClick('runWithoutDebugging')} style={menuButtonStyle}>Run without debugging</button>,
                <button key="runWithDebugging" onClick={() => handleMenuItemClick('runWithDebugging')} style={menuButtonStyle}>Run with debugging</button>,
                <button key="generateCode" onClick={() => handleMenuItemClick('generateCode')} style={menuButtonStyle}>Generate code</button>
              ]}
              {menu === 'Help' && [
                <button key="example1" onClick={() => handleMenuItemClick('loadExample', 'example1')} style={menuButtonStyle}>Example 1: Hello World</button>,
                <button key="example2" onClick={() => handleMenuItemClick('loadExample', 'example2')} style={menuButtonStyle}>Example 2: Basic Math</button>,
                <button key="example3" onClick={() => handleMenuItemClick('loadExample', 'example3')} style={menuButtonStyle}>Example 3: If Statement</button>
              ]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBar;