import React from 'react';
import './CustomCheckbox.css';

const SettingsTab = ({
  config,
  toggleTheme,
  toggleGrid,
  toggleMinimap,
  updateCodeGeneratorSettings,
  toggleNodeRounding
}) => {
  const sectionStyle = {
    backgroundColor: config.isDarkTheme ? '#2d2d2d' : '#f0f0f0',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  };

  const headingStyle = {
    color: config.isDarkTheme ? '#ffffff' : '#000000',
    paddingBottom: '10px',
    marginBottom: '20px',
  };

  const CustomCheckbox = ({ checked, onChange, label }) => (
    <label className={`checkbox-container ${config.isDarkTheme ? 'dark' : 'light'}`}>
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
      color: config.isDarkTheme ? '#fff' : '#000',
      backgroundColor: config.isDarkTheme ? '#1e1e1e' : '#ffffff'
    }}>
      <h2 style={{ ...headingStyle, fontSize: '24px' }}>Settings</h2>

      <div style={sectionStyle}>
        <h3 style={headingStyle}>Theme</h3>
        <CustomCheckbox
          checked={config.isDarkTheme}
          onChange={toggleTheme}
          label="Dark Theme"
        />
      </div>

      <div style={sectionStyle}>
        <h3 style={headingStyle}>Canvas</h3>
        <CustomCheckbox
          checked={config.isGridVisible}
          onChange={toggleGrid}
          label="Show Grid"
        />
        <CustomCheckbox
          checked={config.isMinimapVisible}
          onChange={toggleMinimap}
          label="Show Minimap"
        />
        <CustomCheckbox
          checked={config.isNodeRoundingEnabled}
          onChange={toggleNodeRounding}
          label="Enable Node Rounding"
        />
      </div>

      <div style={sectionStyle}>
        <h3 style={headingStyle}>Code Generator</h3>
        <CustomCheckbox
          checked={config.codeGenerator.useStrict}
          onChange={() => updateCodeGeneratorSettings('useStrict', !config.codeGenerator.useStrict)}
          label="Use Strict Mode"
        />
        <CustomCheckbox
          checked={config.codeGenerator.useSemicolons}
          onChange={() => updateCodeGeneratorSettings('useSemicolons', !config.codeGenerator.useSemicolons)}
          label="Use Semicolons"
        />
        <CustomCheckbox
          checked={config.codeGenerator.useConst}
          onChange={() => updateCodeGeneratorSettings('useConst', !config.codeGenerator.useConst)}
          label="Use Const (instead of Let)"
        />
        <CustomCheckbox
          checked={config.codeGenerator.generateComments}
          onChange={() => updateCodeGeneratorSettings('generateComments', !config.codeGenerator.generateComments)}
          label="Generate Comments"
        />
      </div>
    </div>
  );
};

export default SettingsTab;