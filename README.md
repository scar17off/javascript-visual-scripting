# JavaScript Visual Scripting

A visual scripting tool for JavaScript, built with React.

## Description

This project is a web-based visual scripting environment that allows users to create JavaScript programs using a node-based interface. It provides a canvas where users can add, connect, and manipulate nodes representing various programming concepts and operations.

## Features

- Node-based visual programming interface
- Support for various node types including control flow, data manipulation, functions, and more
- Real-time code generation
- Ability to run scripts with or without debugging
- Undo/Redo functionality
- Zoom and pan canvas controls
- Save and load projects
- Example projects included

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

1. Use the menu bar to create a new project, open an existing one, or load an example.
2. Right-click on the canvas to open the context menu and add nodes.
3. Connect nodes by clicking and dragging from one port to another.
4. Use the property panel on the right to adjust node properties.
5. Run your script using the "Run" menu options.
6. Generate code using the "Generate code" option in the "Run" menu.

## Project Structure

- `src/App.js`: Main application component
- `src/VisualScripting.js`: Core visual scripting component
- `src/CodeGenerator.js`: Handles code generation from nodes
- `src/Camera.js`: Manages canvas zoom and pan
- `src/nodeDefinitions.js`: Defines available node types
- `src/components/`: Contains React components for UI elements
- `src/examples.js`: Predefined example projects

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.