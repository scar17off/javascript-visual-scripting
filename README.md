# JavaScript Visual Scripting

A visual scripting tool for JavaScript, built with React.

## Description

This project is a web-based visual scripting environment that allows users to create JavaScript programs using a node-based interface. It provides a canvas where users can add, connect, and manipulate nodes representing various programming concepts and operations.

## Features

- Node-based visual programming interface
- Support for various node types:
  - Control flow (If, Switch, Loops)
  - Data manipulation (Variables, Math Operations)
  - Array and Object operations
  - HTTP Requests
  - JSON handling (Parse, Stringify)
  - Base64 encoding/decoding
- Real-time code generation with customizable settings
- Ability to run scripts with debugging support
- Undo/Redo functionality
- Canvas controls (zoom, pan)
- Project management (save, load)
- Export options (JSON, JavaScript, Image)
- Theme customization (dark/light)
- Grid and minimap visualization
- Graph inspector panel
- Predefined example projects

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/scar17off/javascript-visual-scripting.git
   ```

2. Navigate to the project directory:
   ```
   cd javascript-visual-scripting
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and visit `http://localhost:3000`

## Usage

1. Use the menu bar to create a new project or load an example
2. Add nodes by right-clicking on the canvas
3. Connect nodes by dragging from one port to another
4. Configure node properties using the Graph Inspector panel
5. Use the Settings tab to customize:
   - Theme preferences
   - Canvas display options
   - Code generation settings
6. Generate and run your script using the Run menu
7. Export your project in various formats

## Project Structure

- `src/App.js`: Main application component
- `src/VisualScripting.js`: Core visual scripting component
- `src/CodeGenerator.js`: Handles code generation from nodes
- `src/nodeDefinitions.js`: Defines available node types
- `src/engine/`: Core engine components
  - `Camera.js`: Manages canvas zoom and pan
  - `Renderer.js`: Handles rendering of nodes and connections
  - `Node.js`: Node class implementation
- `src/components/`: React components for UI elements
  - `GraphInspector.js`: Node properties panel
  - `MenuBar.js`: Application menu
  - `SettingsTab.js`: Configuration interface
- `src/examples.js`: Predefined example projects

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
