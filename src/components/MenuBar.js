import React from 'react';

const MenuBar = ({ menuOpen, handleMenuClick, handleMenuItemClick }) => {
  return (
    <div style={{
      backgroundColor: '#333',
      padding: '5px',
      display: 'flex',
      borderBottom: '1px solid #555'
    }}>
      {['File', 'Edit', 'View', 'Run', 'Help'].map((menu) => (
        <div key={menu} style={{ position: 'relative' }}>
          <button
            onClick={() => handleMenuClick(menu)}
            style={{
              backgroundColor: menuOpen === menu ? '#555' : 'transparent',
              border: 'none',
              color: '#fff',
              padding: '5px 10px',
              cursor: 'pointer'
            }}
          >
            {menu}
          </button>
          {menuOpen === menu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: '#444',
              border: '1px solid #555',
              zIndex: 1000
            }}>
              {menu === 'File' && [
                <button key="new" onClick={() => handleMenuItemClick('new')}>New</button>,
                <button key="open" onClick={() => handleMenuItemClick('open')}>Open</button>,
                <button key="save" onClick={() => handleMenuItemClick('save')}>Save</button>
              ]}
              {menu === 'Edit' && [
                <button key="undo" onClick={() => handleMenuItemClick('undo')}>Undo</button>,
                <button key="redo" onClick={() => handleMenuItemClick('redo')}>Redo</button>,
                <button key="delete" onClick={() => handleMenuItemClick('delete')}>Delete</button>
              ]}
              {menu === 'View' && [
                <button key="zoomIn" onClick={() => handleMenuItemClick('zoomIn')}>Zoom In</button>,
                <button key="zoomOut" onClick={() => handleMenuItemClick('zoomOut')}>Zoom Out</button>,
                <button key="resetView" onClick={() => handleMenuItemClick('resetView')}>Reset View</button>
              ]}
              {menu === 'Run' && [
                <button key="runWithoutDebugging" onClick={() => handleMenuItemClick('runWithoutDebugging')}>Run without debugging</button>,
                <button key="runWithDebugging" onClick={() => handleMenuItemClick('runWithDebugging')}>Run with debugging</button>,
                <button key="generateCode" onClick={() => handleMenuItemClick('generateCode')}>Generate code</button>
              ]}
              {menu === 'Help' && [
                <button key="example1" onClick={() => handleMenuItemClick('loadExample', 'example1')}>Example 1: Hello World</button>,
                <button key="example2" onClick={() => handleMenuItemClick('loadExample', 'example2')}>Example 2: Basic Math</button>
              ]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBar;