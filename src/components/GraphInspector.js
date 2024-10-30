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

const PropertyInput = ({ property, node, updateNodeProperty, isDarkTheme }) => {
  const renderArrayProperty = () => {
    if (property.name === 'parameters') {
      return renderParametersInput();
    }
    if (property.name === 'cases') {
      return renderCasesInput();
    }
    return null;
  };

  const renderParametersInput = () => (
    <div className={styles.parametersContainer}>
      {(node.properties.parameters || []).map((param, index) => (
        <div key={index} className={styles.parameterRow}>
          <input
            type="text"
            value={param.name}
            onChange={(e) => updateParameter(index, 'name', e.target.value)}
            placeholder="Parameter name"
            className={`${styles.input} ${isDarkTheme ? styles.inputDark : styles.inputLight}`}
          />
          <select
            value={param.type}
            onChange={(e) => updateParameter(index, 'type', e.target.value)}
            className={`${styles.typeSelect} ${isDarkTheme ? styles.inputDark : styles.inputLight}`}
          >
            {['string', 'number', 'boolean', 'object', 'array'].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button
            onClick={() => removeParameter(index)}
            className={`${styles.removeButton} ${isDarkTheme ? styles.removeButtonDark : styles.removeButtonLight}`}
          >
            <i className="fas fa-minus"></i>
          </button>
        </div>
      ))}
      <button
        onClick={addParameter}
        className={`${styles.addButton} ${isDarkTheme ? styles.addButtonDark : styles.addButtonLight}`}
      >
        <i className="fas fa-plus"></i> Add Parameter
      </button>
    </div>
  );

  const renderCasesInput = () => (
    <div className={styles.casesContainer}>
      {(node.properties.cases || []).map((caseObj, index) => (
        <div key={index} className={styles.caseRow}>
          <select
            value={caseObj.type || 'string'}
            onChange={(e) => updateCase(index, 'type', e.target.value)}
            className={`${styles.typeSelect} ${isDarkTheme ? styles.inputDark : styles.inputLight}`}
          >
            {['string', 'number', 'boolean'].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {caseObj.type === 'boolean' ? (
            <select
              value={caseObj.value}
              onChange={(e) => updateCase(index, 'value', e.target.value)}
              className={`${styles.input} ${isDarkTheme ? styles.inputDark : styles.inputLight}`}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <input
              type={caseObj.type === 'number' ? 'number' : 'text'}
              value={caseObj.value}
              onChange={(e) => updateCase(index, 'value', e.target.value)}
              placeholder="Case value"
              className={`${styles.input} ${isDarkTheme ? styles.inputDark : styles.inputLight}`}
            />
          )}
          <button
            onClick={() => removeCase(index)}
            className={`${styles.removeButton} ${isDarkTheme ? styles.removeButtonDark : styles.removeButtonLight}`}
          >
            <i className="fas fa-minus"></i>
          </button>
        </div>
      ))}
      <button
        onClick={addCase}
        className={`${styles.addButton} ${isDarkTheme ? styles.addButtonDark : styles.addButtonLight}`}
      >
        <i className="fas fa-plus"></i> Add Case
      </button>
    </div>
  );

  const updateParameter = (index, field, value) => {
    const newParams = [...node.properties.parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    updateNodeProperty('parameters', newParams);
  };

  const removeParameter = (index) => {
    const newParams = node.properties.parameters.filter((_, i) => i !== index);
    updateNodeProperty('parameters', newParams);
  };

  const addParameter = () => {
    const newParams = [
      ...(node.properties.parameters || []),
      { name: `param${(node.properties.parameters || []).length + 1}`, type: 'string' }
    ];
    updateNodeProperty('parameters', newParams);
  };

  const updateCase = (index, field, value) => {
    const newCases = [...node.properties.cases];
    newCases[index] = {
      ...newCases[index],
      [field]: value,
      value: field === 'type' && value === 'number' ?
        (isNaN(newCases[index].value) ? '0' : newCases[index].value) :
        String(newCases[index].value)
    };
    updateNodeProperty('cases', newCases);
  };

  const removeCase = (index) => {
    const newCases = node.properties.cases.filter((_, i) => i !== index);
    updateNodeProperty('cases', newCases);
  };

  const addCase = () => {
    const newCases = [
      ...(node.properties.cases || []),
      {
        value: '',
        type: 'string',
        output: `Case ${(node.properties.cases || []).length + 1}`
      }
    ];
    updateNodeProperty('cases', newCases);
  };

  switch (property.type) {
    case 'select':
      return (
        <select
          value={node.properties[property.name] || property.default}
          onChange={(e) => updateNodeProperty(property.name, e.target.value)}
          className={`${styles.input} ${isDarkTheme ? styles.inputDark : styles.inputLight}`}
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
          className={`${styles.checkbox} ${isDarkTheme ? styles.checkboxDark : styles.checkboxLight}`}
        />
      );
    case 'array':
      return renderArrayProperty();
    default:
      return (
        <input
          type={property.type === 'number' ? 'number' : 'text'}
          value={node.properties[property.name] || property.default}
          onChange={(e) => updateNodeProperty(property.name, e.target.value)}
          className={`${styles.input} ${isDarkTheme ? styles.inputDark : styles.inputLight}`}
        />
      );
  }
};

const GraphInspector = ({ selectedNodes, nodeTypes, updateNodeProperty, config }) => {
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
      <div className={`${styles.header} ${config.isDarkTheme ? styles.headerDark : styles.headerLight}`}>
        <div className={styles.headerContent}>
          <i className={`fas ${getIconForNodeType(node.type)} ${styles.nodeIcon}`} style={{ color: nodeType.color }} />
          <span className={styles.nodeTitle}>{node.type}</span>
        </div>
      </div>

      <hr className={styles.divider} />
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Description</div>
        <div className={styles.description}>{nodeType.description}</div>
      </div>

      <hr className={styles.divider} />

      {nodeType.properties && nodeType.properties.length > 0 && (
        <>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Properties</div>
            {nodeType.properties.map(prop => (
              prop.visible === undefined ||
              (typeof prop.visible === 'function' ? prop.visible(node.properties) : prop.visible)
            ) && (
                <div key={prop.name} className={styles.propertyContainer}>
                  <label className={styles.propertyLabel}>{prop.name}</label>
                  <PropertyInput
                    property={prop}
                    node={node}
                    updateNodeProperty={updateNodeProperty}
                    isDarkTheme={config.isDarkTheme}
                  />
                </div>
              ))}
          </div>
          <hr className={styles.divider} />
        </>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Input Ports</div>
        {nodeType.inputs.map((input, index) => (
          <PortItem key={index} port={input} isDarkTheme={config.isDarkTheme} />
        ))}

        <hr className={styles.divider} />
        <div className={styles.sectionTitle}>Output Ports</div>
        {nodeType.outputs.map((output, index) => (
          <PortItem key={index} port={output} isDarkTheme={config.isDarkTheme} />
        ))}
      </div>
    </div>
  );
};

export default GraphInspector;