import React from 'react';

const MenuBar = ({ menuOpen, handleMenuClick, handleMenuItemClick, isGridVisible }) => {
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
              backgroundColor: '#444',
              border: '1px solid #555',
              zIndex: 1000,
              whiteSpace: 'nowrap'
            }}>
              {menu === 'File' && [
                <button key="new" onClick={() => handleMenuItemClick('new')} style={{width: '100%', textAlign: 'left'}}>New</button>,
                <button key="open" onClick={() => handleMenuItemClick('open')} style={{width: '100%', textAlign: 'left'}}>Open</button>,
                <button key="save" onClick={() => handleMenuItemClick('save')} style={{width: '100%', textAlign: 'left'}}>Save</button>
              ]}
              {menu === 'Edit' && [
                <button key="undo" onClick={() => handleMenuItemClick('undo')} style={{width: '100%', textAlign: 'left'}}>Undo</button>,
                <button key="redo" onClick={() => handleMenuItemClick('redo')} style={{width: '100%', textAlign: 'left'}}>Redo</button>,
                <button key="delete" onClick={() => handleMenuItemClick('delete')} style={{width: '100%', textAlign: 'left'}}>Delete</button>
              ]}
              {menu === 'View' && [
                <button key="zoomIn" onClick={() => handleMenuItemClick('zoomIn')} style={{width: '100%', textAlign: 'left'}}>Zoom In</button>,
                <button key="zoomOut" onClick={() => handleMenuItemClick('zoomOut')} style={{width: '100%', textAlign: 'left'}}>Zoom Out</button>,
                <button key="resetView" onClick={() => handleMenuItemClick('resetView')} style={{width: '100%', textAlign: 'left'}}>Reset View</button>,
                <button key="toggleGrid" onClick={() => handleMenuItemClick('toggleGrid')} style={{width: '100%', textAlign: 'left'}}>
                  {isGridVisible ? 'Hide Grid' : 'Show Grid'}
                </button>
              ]}
              {menu === 'Run' && [
                <button key="runWithoutDebugging" onClick={() => handleMenuItemClick('runWithoutDebugging')} style={{width: '100%', textAlign: 'left'}}>Run without debugging</button>,
                <button key="runWithDebugging" onClick={() => handleMenuItemClick('runWithDebugging')} style={{width: '100%', textAlign: 'left'}}>Run with debugging</button>,
                <button key="generateCode" onClick={() => handleMenuItemClick('generateCode')} style={{width: '100%', textAlign: 'left'}}>Generate code</button>
              ]}
              {menu === 'Help' && [
                <button key="example1" onClick={() => handleMenuItemClick('loadExample', 'example1')} style={{width: '100%', textAlign: 'left'}}>Example 1: Hello World</button>,
                <button key="example2" onClick={() => handleMenuItemClick('loadExample', 'example2')} style={{width: '100%', textAlign: 'left'}}>Example 2: Basic Math</button>
              ]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBar;
