import React from 'react';
import styles from './GraphInspector.module.css';
import { getIconForNodeType } from './ContextMenu';

const GraphInspector = ({ 
  selectedNodes, 
  nodeTypes, 
  updateNodeProperty, 
  config 
}) => {
  if (selectedNodes.length === 0) {
    return (
      <div className={`${styles.emptyMessage} ${config.isDarkTheme ? styles.emptyMessageDark : styles.emptyMessageLight}`}>
        No node selected
      </div>
    );
  }

  const node = selectedNodes[0];
  const nodeType = nodeTypes[node.type];

  return (
    <div className={`${styles.container} ${config.isDarkTheme ? styles.containerDark : styles.containerLight}`}>
      {/* Header */}
      <div className={`${styles.header} ${config.isDarkTheme ? styles.headerDark : styles.headerLight}`}>
        <div className={styles.headerContent}>
          <i 
            className={`fas ${getIconForNodeType(node.type)} ${styles.nodeIcon}`}
            style={{ color: nodeType.color }}
          />
          <span className={`${styles.nodeTitle} ${config.isDarkTheme ? styles.nodeTitleDark : styles.nodeTitleLight}`}>
            {node.type}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className={`${styles.description} ${config.isDarkTheme ? styles.descriptionDark : styles.descriptionLight}`}>
        {nodeType.description}
      </div>

      <hr></hr>

      {/* Properties */}
      {nodeType.properties && nodeType.properties.length > 0 && (
        <div className={styles.section}>
          <div className={`${styles.sectionTitle} ${config.isDarkTheme ? styles.sectionTitleDark : styles.sectionTitleLight}`}>
            Properties
          </div>
          {nodeType.properties.map(prop => (
            <div key={prop.name} className={styles.propertyContainer}>
              <label className={`${styles.propertyLabel} ${config.isDarkTheme ? styles.propertyLabelDark : styles.propertyLabelLight}`}>
                {prop.name}
              </label>
              {prop.type === 'select' ? (
                <select
                  value={node.properties[prop.name] || prop.default}
                  onChange={(e) => updateNodeProperty(prop.name, e.target.value)}
                  className={`${styles.input} ${config.isDarkTheme ? styles.inputDark : styles.inputLight}`}
                >
                  {prop.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={prop.type === 'number' ? 'number' : 'text'}
                  value={node.properties[prop.name] || prop.default}
                  onChange={(e) => updateNodeProperty(prop.name, e.target.value)}
                  className={`${styles.input} ${config.isDarkTheme ? styles.inputDark : styles.inputLight}`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <hr></hr>
      
      {/* Ports */}
      <div className={styles.section}>
        {/* Input Ports */}
        <div className={`${styles.sectionTitle} ${config.isDarkTheme ? styles.sectionTitleDark : styles.sectionTitleLight}`}>
          Input Ports
        </div>
        {nodeType.inputs.map((input, index) => (
          <div key={index} className={`${styles.portContainer} ${config.isDarkTheme ? styles.portContainerDark : styles.portContainerLight}`}>
            <div className={styles.portIcon} style={{ transform: 'rotate(180deg)' }} />
            <span>"{input.name}"</span>
            <span className={styles.portType}>({input.type})</span>
          </div>
        ))}

        {/* Output Ports */}
        <div className={`${styles.sectionTitle} ${config.isDarkTheme ? styles.sectionTitleDark : styles.sectionTitleLight}`}
             style={{ marginTop: '20px' }}>
          Output Ports
        </div>
        {nodeType.outputs.map((output, index) => (
          <div key={index} className={`${styles.portContainer} ${config.isDarkTheme ? styles.portContainerDark : styles.portContainerLight}`}>
            <div className={styles.portIcon} />
            <span>"{output.name}"</span>
            <span className={styles.portType}>({output.type})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraphInspector;