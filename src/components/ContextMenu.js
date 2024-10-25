import React, { useState, useRef, useEffect } from 'react';
import { nodeGroups } from '../nodeDefinitions';
import styles from './ContextMenu.module.css';

const ContextMenu = ({ visible, x, y, nodeTypes, addNode, camera }) => {
  const [openGroup, setOpenGroup] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      setOpenGroup(null);
    }
  }, [visible]);

  if (!visible) return null;

  const handleGroupClick = (group) => {
    setOpenGroup(openGroup === group ? null : group);
  };

  const renderNodeButton = (type) => (
    <button 
      key={type} 
      onClick={() => addNode(type)} 
      className={styles.nodeButton}
    >
      {type}
    </button>
  );

  return (
    <div
      ref={menuRef}
      className={styles.contextMenu}
      style={{
        top: `${y * camera.scale + camera.y}px`,
        left: `${x * camera.scale + camera.x}px`,
      }}
    >
      <div className={styles.mainMenu}>
        {Object.entries(nodeGroups).map(([group, types]) => (
          <div key={group}>
            <button 
              onClick={() => handleGroupClick(group)}
              className={styles.groupButton}
            >
              {group}
              <span>{openGroup === group ? '◄' : '►'}</span>
            </button>
          </div>
        ))}
      </div>
      {openGroup && (
        <div className={styles.submenu}>
          {nodeGroups[openGroup].map(type => renderNodeButton(type))}
        </div>
      )}
    </div>
  );
};

export default ContextMenu;