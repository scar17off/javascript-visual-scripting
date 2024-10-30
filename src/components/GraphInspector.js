import React from 'react';
import styles from './GraphInspector.module.css';
import { getIconForNodeType } from './ContextMenu';

const PortItem = ({ port, isDarkTheme }) => (
  <div className={`${styles.portContainer} ${isDarkTheme ? styles.portContainerDark : styles.portContainerLight}`}>
    <div className={port.type === 'control' ? styles.portIconControl : styles.portIconData} />
    <div className={styles.portInfo}>
      <div className={styles.portNameRow}>
        <span>"{port.name}"</span>
        <span className={styles.portType}>({port.type})</span>
      </div>
      {port.description && (
        <div className={`${styles.portDescription} ${isDarkTheme ? styles.portDescriptionDark : styles.portDescriptionLight}`}>
          {port.description}
        </div>
      )}
    </div>
  </div>
);

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

  const renderPropertyInput = (property) => {
    switch (property.type) {
      case 'select':
        return (
          <select
            value={node.properties[property.name] || property.default}
            onChange={(e) => updateNodeProperty(property.name, e.target.value)}
            className={`${styles.input} ${config.isDarkTheme ? styles.inputDark : styles.inputLight}`}
          >
            {property.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={node.properties[property.name] || property.default}
            onChange={(e) => updateNodeProperty(property.name, e.target.checked)}
            className={`${styles.checkbox} ${config.isDarkTheme ? styles.checkboxDark : styles.checkboxLight}`}
          />
        );

      case 'array':
        if (property.name === 'parameters') {
          return (
            <div className={styles.parametersContainer}>
              {(node.properties.parameters || []).map((param, index) => (
                <div key={index} className={styles.parameterRow}>
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => {
                      const newParams = [...node.properties.parameters];
                      newParams[index] = { ...param, name: e.target.value };
                      updateNodeProperty('parameters', newParams);
                      
                      // Update the input port name (index + 1 since we removed Params port)
                      const nodeTypeCopy = { ...nodeTypes[node.type] };
                      nodeTypeCopy.inputs[index + 1] = {
                        type: 'data',
                        name: e.target.value,
                        description: `Parameter of type ${param.type}`
                      };
                      nodeTypes[node.type] = nodeTypeCopy;
                    }}
                    placeholder="Parameter name"
                    className={`${styles.input} ${config.isDarkTheme ? styles.inputDark : styles.inputLight}`}
                  />
                  <select
                    value={param.type}
                    onChange={(e) => {
                      const newParams = [...node.properties.parameters];
                      newParams[index] = { ...param, type: e.target.value };
                      updateNodeProperty('parameters', newParams);
                      
                      // Update the input port description (index + 1 since we removed Params port)
                      const nodeTypeCopy = { ...nodeTypes[node.type] };
                      nodeTypeCopy.inputs[index + 1] = {
                        type: 'data',
                        name: param.name,
                        description: `Parameter of type ${e.target.value}`
                      };
                      nodeTypes[node.type] = nodeTypeCopy;
                    }}
                    className={`${styles.typeSelect} ${config.isDarkTheme ? styles.inputDark : styles.inputLight}`}
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="object">Object</option>
                    <option value="array">Array</option>
                  </select>
                  <button
                    onClick={() => {
                      const newParams = node.properties.parameters.filter((_, i) => i !== index);
                      updateNodeProperty('parameters', newParams);
                      
                      // Remove the corresponding input port (index + 1 since we removed Params port)
                      const nodeTypeCopy = { ...nodeTypes[node.type] };
                      nodeTypeCopy.inputs = [
                        ...nodeTypeCopy.inputs.slice(0, index + 1),
                        ...nodeTypeCopy.inputs.slice(index + 2)
                      ];
                      nodeTypes[node.type] = nodeTypeCopy;
                    }}
                    className={`${styles.removeButton} ${config.isDarkTheme ? styles.removeButtonDark : styles.removeButtonLight}`}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newParams = [
                    ...(node.properties.parameters || []),
                    { name: `param${(node.properties.parameters || []).length + 1}`, type: 'string' }
                  ];
                  updateNodeProperty('parameters', newParams);
                  
                  // Add a new input port (no +2 offset since we removed Params port)
                  const nodeTypeCopy = { ...nodeTypes[node.type] };
                  const newParamName = `param${(node.properties.parameters || []).length + 1}`;
                  nodeTypeCopy.inputs.push({
                    type: 'data',
                    name: newParamName,
                    description: `Parameter of type string`
                  });
                  nodeTypes[node.type] = nodeTypeCopy;
                }}
                className={`${styles.addButton} ${config.isDarkTheme ? styles.addButtonDark : styles.addButtonLight}`}
              >
                <i className="fas fa-plus"></i> Add Parameter
              </button>
            </div>
          );
        }
        if (property.name === 'cases') {
          return (
            <div className={styles.casesContainer}>
              {(node.properties.cases || []).map((caseObj, index) => (
                <div key={index} className={styles.caseRow}>
                  <select
                    value={caseObj.type || 'string'}
                    onChange={(e) => {
                      const newCases = [...node.properties.cases];
                      newCases[index] = { 
                        ...caseObj, 
                        type: e.target.value,
                        // Convert value to match new type
                        value: e.target.value === 'number' ? 
                          (isNaN(caseObj.value) ? '0' : caseObj.value) : 
                          String(caseObj.value)
                      };
                      updateNodeProperty('cases', newCases);
                    }}
                    className={`${styles.typeSelect} ${config.isDarkTheme ? styles.inputDark : styles.inputLight}`}
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  {caseObj.type === 'boolean' ? (
                    <select
                      value={caseObj.value}
                      onChange={(e) => {
                        const newCases = [...node.properties.cases];
                        newCases[index] = { ...caseObj, value: e.target.value };
                        updateNodeProperty('cases', newCases);
                      }}
                      className={`${styles.input} ${config.isDarkTheme ? styles.inputDark : styles.inputLight}`}
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : (
                    <input
                      type={caseObj.type === 'number' ? 'number' : 'text'}
                      value={caseObj.value}
                      onChange={(e) => {
                        const newCases = [...node.properties.cases];
                        newCases[index] = { ...caseObj, value: e.target.value };
                        updateNodeProperty('cases', newCases);
                      }}
                      placeholder="Case value"
                      className={`${styles.input} ${config.isDarkTheme ? styles.inputDark : styles.inputLight}`}
                    />
                  )}
                  <button
                    onClick={() => {
                      const newCases = node.properties.cases.filter((_, i) => i !== index);
                      updateNodeProperty('cases', newCases);
                      nodeType.outputs = nodeType.outputs.filter((_, i) => i !== index + 1);
                    }}
                    className={`${styles.removeButton} ${config.isDarkTheme ? styles.removeButtonDark : styles.removeButtonLight}`}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newCases = [
                    ...(node.properties.cases || []),
                    { 
                      value: '',
                      type: 'string',
                      output: `Case ${(node.properties.cases || []).length + 1}` 
                    }
                  ];
                  updateNodeProperty('cases', newCases);
                  nodeType.outputs.push({
                    type: 'control',
                    name: `Case ${node.properties.cases.length + 1}`,
                    description: `Triggered when case ${node.properties.cases.length + 1} matches`
                  });
                }}
                className={`${styles.addButton} ${config.isDarkTheme ? styles.addButtonDark : styles.addButtonLight}`}
              >
                <i className="fas fa-plus"></i> Add Case
              </button>
            </div>
          );
        }
        return null;

      default:
        return (
          <input
            type={property.type === 'number' ? 'number' : 'text'}
            value={node.properties[property.name] || property.default}
            onChange={(e) => updateNodeProperty(property.name, e.target.value)}
            className={`${styles.input} ${config.isDarkTheme ? styles.inputDark : styles.inputLight}`}
          />
        );
    }
  };

  // Helper function to determine if a property should be visible
  const isPropertyVisible = (property) => {
    if (property.visible === undefined) return true;
    if (typeof property.visible === 'function') {
      return property.visible(node.properties);
    }
    return property.visible;
  };

  return (
    <div className={`${styles.container} ${config.isDarkTheme ? styles.containerDark : styles.containerLight}`}>
      {/* Header */}
      <div className={`${styles.header} ${config.isDarkTheme ? styles.headerDark : styles.headerLight}`}>
        <div className={styles.headerContent}>
          <i
            className={`fas ${getIconForNodeType(node.type)} ${styles.nodeIcon}`}
            style={{ color: nodeType.color }}
          />
          <span className={styles.nodeTitle}>
            {node.type}
          </span>
        </div>
      </div>

      {/* Description */}
      <hr className={styles.divider} />
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Description</div>
        <div className={styles.description}>
          {nodeType.description}
        </div>
      </div>

      <hr className={styles.divider} />

      {/* Properties */}
      {nodeType.properties && nodeType.properties.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Properties</div>
          {nodeType.properties.map(prop => (
            isPropertyVisible(prop) && (
              <div key={prop.name} className={styles.propertyContainer}>
                <label className={styles.propertyLabel}>
                  {prop.name}
                </label>
                {renderPropertyInput(prop)}
              </div>
            )
          ))}
        </div>
      )}

      <hr className={styles.divider} />

      {/* Ports */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Input Ports</div>
        {nodeType.inputs.map((input, index) => (
          <PortItem key={index} port={input} isDarkTheme={config.isDarkTheme} />
        ))}

        <hr className={styles.divider} />
        <div className={styles.sectionTitle}>
          Output Ports
        </div>
        {nodeType.outputs.map((output, index) => (
          <PortItem key={index} port={output} isDarkTheme={config.isDarkTheme} />
        ))}
      </div>
    </div>
  );
};

export default GraphInspector;