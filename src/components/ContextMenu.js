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

  const getIconForNodeType = (type) => {
    switch (type) {
      case 'OnStart': return 'fa-play';
      case 'Log': return 'fa-terminal';
      case 'Variable': return 'fa-cube';
      case 'Function': return 'fa-code';
      case 'MathOperation': return 'fa-calculator';
      case 'Condition': return 'fa-code-branch';
      case 'WhileLoop': return 'fa-sync';
      case 'ForLoop': return 'fa-redo';
      case 'ArrayOperation': return 'fa-list';
      case 'ObjectOperation': return 'fa-cube';
      case 'HttpRequest': return 'fa-globe';
      case 'JSONParse': return 'fa-file-code';
      case 'JSONStringify': return 'fa-file-alt';
      case 'Base64Encode': return 'fa-lock';
      case 'Base64Decode': return 'fa-unlock';
      default: return 'fa-puzzle-piece';
    }
  };

  const getIconForGroup = (group) => {
    switch (group) {
      case 'Control Flow': return 'fa-random';
      case 'Data Manipulation': return 'fa-database';
      case 'Functions': return 'fa-code';
      case 'Input/Output': return 'fa-exchange-alt';
      case 'Encoding': return 'fa-key';
      default: return 'fa-folder';
    }
  };

  const renderNodeButton = (type) => (
    <button 
      key={type} 
      onClick={() => addNode(type)} 
      className={styles.nodeButton}
    >
      <i className={`fas ${getIconForNodeType(type)} ${styles.icon}`}></i>
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
              <i className={`fas ${getIconForGroup(group)} ${styles.icon}`}></i>
              {group}
              <span className={styles.arrow}>{openGroup === group ? '◄' : '►'}</span>
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