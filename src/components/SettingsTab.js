import React, { useState } from 'react';
import './CustomCheckbox.css';

const SettingsTab = ({ 
  isDarkTheme, 
  toggleTheme, 
  isGridVisible, 
  toggleGrid, 
  isMinimapVisible, 
  toggleMinimap,
  codeGeneratorSettings,
  updateCodeGeneratorSettings
}) => {
  const [gridSize, setGridSize] = useState(20);

  const sectionStyle = {
    backgroundColor: isDarkTheme ? '#2d2d2d' : '#f0f0f0',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  };

  const headingStyle = {
    color: isDarkTheme ? '#ffffff' : '#000000',
    paddingBottom: '10px',
    marginBottom: '20px',
  };

  const inputStyle = {
    backgroundColor: isDarkTheme ? '#3d3d3d' : '#ffffff',
    color: isDarkTheme ? '#ffffff' : '#000000',
    border: isDarkTheme ? '1px solid #555555' : '1px solid #cccccc',
    borderRadius: '4px',
    padding: '5px 10px',
    fontSize: '14px',
    width: '60px',
  };

  const CustomCheckbox = ({ checked, onChange, label }) => (
    <label className={`checkbox-container ${isDarkTheme ? 'dark' : 'light'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className="checkmark"></span>
      <span className="checkbox-label">{label}</span>
    </label>
  );

  return (
    <div style={{ 
      padding: '20px', 
      color: isDarkTheme ? '#fff' : '#000', 
      backgroundColor: isDarkTheme ? '#1e1e1e' : '#ffffff'
    }}>
      <h2 style={{ ...headingStyle, fontSize: '24px' }}>Settings</h2>
      
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Theme</h3>
        <CustomCheckbox
          checked={isDarkTheme}
          onChange={toggleTheme}
          label="Dark Theme"
        />
      </div>

      <div style={sectionStyle}>
        <h3 style={headingStyle}>Canvas</h3>
        <CustomCheckbox
          checked={isGridVisible}
          onChange={toggleGrid}
          label="Show Grid"
        />
        <CustomCheckbox
          checked={isMinimapVisible}
          onChange={toggleMinimap}
          label="Show Minimap"
        />
      </div>

      <div style={sectionStyle}>
        <h3 style={headingStyle}>Code Generator</h3>
        <CustomCheckbox
          checked={codeGeneratorSettings.useStrict}
          onChange={() => updateCodeGeneratorSettings('useStrict', !codeGeneratorSettings.useStrict)}
          label="Use Strict Mode"
        />
        <CustomCheckbox
          checked={codeGeneratorSettings.useSemicolons}
          onChange={() => updateCodeGeneratorSettings('useSemicolons', !codeGeneratorSettings.useSemicolons)}
          label="Use Semicolons"
        />
        <CustomCheckbox
          checked={codeGeneratorSettings.useConst}
          onChange={() => updateCodeGeneratorSettings('useConst', !codeGeneratorSettings.useConst)}
          label="Use Const (instead of Let)"
        />
        <CustomCheckbox
          checked={codeGeneratorSettings.generateComments}
          onChange={() => updateCodeGeneratorSettings('generateComments', !codeGeneratorSettings.generateComments)}
          label="Generate Comments"
        />
      </div>
    </div>
  );
};

export default SettingsTab;
