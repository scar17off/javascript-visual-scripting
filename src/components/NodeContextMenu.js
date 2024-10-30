import React from 'react';
import styles from './ContextMenu.module.css';

const NodeContextMenu = ({ visible, x, y, camera, onAction }) => {
  if (!visible) return null;

  const menuItems = [
    { icon: 'fa-copy', label: 'Copy', action: 'copy' },
    { icon: 'fa-trash', label: 'Delete', action: 'delete' },
    { icon: 'fa-cut', label: 'Cut', action: 'cut' },
    { icon: 'fa-clone', label: 'Duplicate', action: 'duplicate' },
    { icon: 'fa-tag', label: 'Set Label', action: 'setLabel' },
  ];

  return (
    <div
      className={styles.contextMenu}
      style={{
        top: `${y * camera.scale + camera.y}px`,
        left: `${x * camera.scale + camera.x}px`,
      }}
    >
      <div className={styles.mainMenu}>
        {menuItems.map(({ icon, label, action }) => (
          <button
            key={action}
            onClick={() => onAction(action)}
            className={styles.nodeButton}
          >
            <i className={`fas ${icon} ${styles.icon}`}></i>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NodeContextMenu;