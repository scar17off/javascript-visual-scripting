import React, { useRef, useEffect, useState, useCallback } from 'react';
import MenuBar from './components/MenuBar';
import ContextMenu from './components/ContextMenu';
import Minimap from './components/Minimap';
import Tabs from './components/Tabs';
import SettingsTab from './components/SettingsTab';
import Camera from './engine/Camera';
import Renderer from './engine/Renderer';
import CodeGenerator from './CodeGenerator';
import { nodeTypes, nodeGroups } from './nodeDefinitions';
import examples from './examples';
import { saveAs } from 'file-saver';
import GraphInspector from './components/GraphInspector';

const VisualScripting = () => {
  // #region State Declarations
  const canvasRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [draggingNode, setDraggingNode] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null); // eslint-disable-line no-unused-vars
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [menuOpen, setMenuOpen] = useState(null);
  const [camera] = useState(new Camera(0, 0, 1, 0.75, 2));
  const [config, setConfig] = useState({
    isDarkTheme: true,
    isGridVisible: true,
    isMinimapVisible: false,
    isNodeRoundingEnabled: true,
    isGraphInspectorVisible: true,
    codeGenerator: {
      useStrict: true,
      useSemicolons: true,
      useConst: false,
      generateComments: true,
    }
  });
  const [needsRedraw, setNeedsRedraw] = useState(true);
  const [renderer] = useState(() => new Renderer(camera, config.isDarkTheme, config.isGridVisible, config.isNodeRoundingEnabled));
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [copiedNodes, setCopiedNodes] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [tabs, setTabs] = useState([{ id: 'untitled-1', title: 'Untitled-1', type: 'Export' }]);
  const [activeTab, setActiveTab] = useState('untitled-1');
  // #endregion

  // #region Drawing Functions
  const drawCanvas = useCallback(() => {
    if (!needsRedraw) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderer.drawCanvas(ctx, nodes, edges, connecting, mousePosition, selectedNodes);
    setNeedsRedraw(false);
  }, [nodes, edges, connecting, mousePosition, selectedNodes, needsRedraw, renderer]);
  // #endregion

  // #region Event Handlers
  const handleContextMenu = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    setContextMenu({ visible: true, x, y });
    setNeedsRedraw(true);
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }

    if (connecting) {
      const clickedPort = findClickedPort(x, y);
      if (clickedPort && clickedPort.nodeId !== connecting.nodeId) {
        const newEdge = {
          start: connecting.isInput ? clickedPort : connecting,
          end: connecting.isInput ? connecting : clickedPort
        };
        setEdges([...edges, newEdge]);
      }
      setConnecting(null);
    } else {
      const clickedNode = findClickedNode(x, y);
      if (clickedNode) {
        if (isMultiSelectMode) {
          setSelectedNodes(prevSelected =>
            prevSelected.includes(clickedNode)
              ? prevSelected.filter(node => node !== clickedNode)
              : [...prevSelected, clickedNode]
          );
        } else {
          setSelectedNodes([clickedNode]);
        }
      } else {
        setSelectedNodes([]);
      }
    }
    setNeedsRedraw(true);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

    const clickedPort = findClickedPort(x, y);
    if (clickedPort) {
      const node = nodes.find(n => n.id === clickedPort.nodeId);
      const { width } = renderer.getNodeDimensions(node, canvasRef.current.getContext('2d'));
      
      const triangleWidth = 6;
      const triangleHeight = 10;
      const portOffset = 5;
      
      const portY = node.y + 35 + (clickedPort.index * 14);
      const portYMiddle = portY + (triangleHeight / 2);
      
      const portX = clickedPort.isInput 
        ? node.x - portOffset - (triangleWidth / 2)
        : node.x + width + portOffset + (triangleWidth / 2);
      
      setConnecting({
        ...clickedPort,
        portY: portYMiddle,
        portX
      });
    } else {
      const clickedNode = findClickedNode(x, y);
      if (clickedNode) {
        setSelectedNode(clickedNode);
        setDraggingNode({ id: clickedNode.id, offsetX: x - clickedNode.x, offsetY: y - clickedNode.y });
      } else {
        setSelectedNode(null);
        setIsDraggingCanvas(true);
        setLastMousePosition({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

    if (isDraggingCanvas) {
      const dx = e.clientX - lastMousePosition.x;
      const dy = e.clientY - lastMousePosition.y;
      camera.move(dx, dy);
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    } else if (draggingNode) {
      setNodes(nodes.map(node =>
        node.id === draggingNode.id
          ? {
            ...node,
            x: x - draggingNode.offsetX,
            y: y - draggingNode.offsetY
          }
          : node
      ));
    }

    setMousePosition({ x, y });
    setNeedsRedraw(true);
  };

  const handleMouseUp = (e) => {
    if (connecting) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { x, y } = camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const clickedPort = findClickedPort(x, y);
      if (clickedPort && clickedPort.nodeId !== connecting.nodeId) {
        const newEdge = {
          start: connecting.isInput ? clickedPort : connecting,
          end: connecting.isInput ? connecting : clickedPort
        };
        setEdges([...edges, newEdge]);
      }
      setConnecting(null);
    }

    if (isDraggingCanvas) {
      setIsDraggingCanvas(false);
    } else if (draggingNode) {
      const draggedNode = nodes.find(node => node.id === draggingNode.id);
      setSelectedNode(draggedNode);
    } else {
      const rect = canvasRef.current.getBoundingClientRect();
      const { x, y } = camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const clickedNode = findClickedNode(x, y);
      if (clickedNode) {
        setSelectedNode(clickedNode);
      }
    }

    setDraggingNode(null);
  };

  const handleWheel = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const { x, y } = camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    camera.zoom(factor, x, y);
    setNeedsRedraw(true);
  }, [camera, drawCanvas]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e) => {
    if (e.key === 'Delete' && selectedNodes.length > 0) {
      deleteSelectedNodes();
    } else if (e.key === 'Control') {
      setIsMultiSelectMode(true);
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Control') {
      setIsMultiSelectMode(false);
    }
  };
  // #endregion

  // #region Node Operations
  const findClickedNode = (x, y) => {
    return nodes.find(node => {
      const { width, height } = renderer.getNodeDimensions(node, canvasRef.current.getContext('2d'));

      return x >= node.x && x <= node.x + width && y >= node.y && y <= node.y + height;
    });
  };

  const findClickedPort = (x, y) => {
    const PORT_WIDTH = 6;
    const PORT_HEIGHT = 10;
    const PORT_OFFSET = 5;
    const SCALE_MULTIPLIER = 1.5;
    const VERTICAL_OFFSET = 2;

    for (const node of nodes) {
      const nodeType = nodeTypes[node.type];
      const { width } = renderer.getNodeDimensions(node, canvasRef.current.getContext('2d'));

      let currentHeight = 35; // Start after title (25 + 10 padding)

      // Check input ports
      for (let i = 0; i < nodeType.inputs.length; i++) {
        const portX = node.x - PORT_OFFSET - PORT_WIDTH;
        const portY = node.y + currentHeight + (i * 14);

        if (x >= portX && x <= portX + PORT_WIDTH * SCALE_MULTIPLIER &&
            y >= portY - VERTICAL_OFFSET && y <= portY + PORT_HEIGHT + VERTICAL_OFFSET) {
          return { nodeId: node.id, isInput: true, index: i };
        }
      }

      // Check output ports
      for (let i = 0; i < nodeType.outputs.length; i++) {
        const portX = node.x + width + PORT_OFFSET;
        const portY = node.y + currentHeight + (i * 14);

        if (x >= portX && x <= portX + PORT_WIDTH * SCALE_MULTIPLIER &&
            y >= portY - VERTICAL_OFFSET && y <= portY + PORT_HEIGHT + VERTICAL_OFFSET) {
          return { nodeId: node.id, isInput: false, index: i };
        }
      }
    }
    return null;
  };

  const addNode = (type) => {
    const nodeType = nodeTypes[type];
    const newNode = {
      id: Date.now(),
      type,
      x: contextMenu.x,
      y: contextMenu.y,
      properties: {}
    };

    // Initialize properties with default values
    if (nodeType.properties) {
      nodeType.properties.forEach(prop => {
        newNode.properties[prop.name] = prop.default;
      });
    }

    const newNodes = [...nodes, newNode];
    setUndoStack([...undoStack, { nodes, edges }]);
    setRedoStack([]);
    setNodes(newNodes);
    setContextMenu({ ...contextMenu, visible: false });
    setNeedsRedraw(true);
  };

  const updateNodeProperty = (property, value) => {
    const updatedNodes = nodes.map(node =>
      node.id === selectedNodes[0].id
        ? { ...node, properties: { ...node.properties, [property]: value } }
        : node
    );
    setUndoStack([...undoStack, { nodes, edges }]);
    setRedoStack([]);
    setNodes(updatedNodes);

    // Update the selectedNodes state as well
    setSelectedNodes(prevSelected => prevSelected.map(node =>
      node.id === selectedNodes[0].id
        ? { ...node, properties: { ...node.properties, [property]: value } }
        : node
    ));
    setNeedsRedraw(true);
  };

  const deleteSelectedNodes = () => {
    if (selectedNodes.length > 0) {
      setUndoStack([...undoStack, { nodes, edges }]);
      setRedoStack([]);
      const selectedNodeIds = selectedNodes.map(node => node.id);
      setNodes(nodes.filter(node => !selectedNodeIds.includes(node.id)));
      setEdges(edges.filter(edge =>
        !selectedNodeIds.includes(edge.start.nodeId) && !selectedNodeIds.includes(edge.end.nodeId)
      ));
      setSelectedNodes([]);
      setNeedsRedraw(true);
    }
  };
  // #endregion

  // #region Menu Operations
  const handleMenuClick = (menu) => {
    setMenuOpen(menuOpen === menu ? null : menu);
  };

  const handleMenuItemClick = (action, param) => {
    switch (action) {
      case 'new':
        if (window.confirm('Are you sure you want to create a new project? All unsaved changes will be lost.')) {
          setNodes([]);
          setEdges([]);
          setUndoStack([]);
          setRedoStack([]);
        }
        break;
      case 'open':
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const content = JSON.parse(event.target.result);
              setNodes(content.nodes);
              setEdges(content.edges);
              setUndoStack([]);
              setRedoStack([]);
            };
            reader.readAsText(file);
          }
        };
        input.click();
        break;
      case 'loadExample':
        if (examples[param]) {
          // Find any Switch nodes and update nodeTypes with dynamic outputs
          examples[param].nodes.forEach(node => {
            if (node.type === 'Switch' && node.properties.cases) {
              const switchNode = nodeTypes['Switch'];
              // Create a copy of the original outputs
              const baseOutputs = [...switchNode.outputs];
              
              // Add case outputs dynamically
              node.properties.cases.forEach((caseItem, index) => {
                baseOutputs.splice(index, 0, {
                  type: 'control',
                  name: caseItem.output,
                  description: `Triggered when value matches ${caseItem.value}`
                });
              });
              
              // Create a temporary node type with the dynamic outputs
              nodeTypes['Switch'] = {
                ...switchNode,
                outputs: baseOutputs
              };
            }
          });
          
          setNodes(examples[param].nodes);
          setEdges(examples[param].edges);
          setUndoStack([]);
          setRedoStack([]);
        }
        break;
      case 'save':
        // Implement file saving logic here
        const projectData = JSON.stringify({ nodes, edges });
        const blob = new Blob([projectData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'visual_script.json';
        a.click();
        URL.revokeObjectURL(url);
        break;
      case 'undo':
        if (undoStack.length > 0) {
          const prevState = undoStack[undoStack.length - 1];
          setRedoStack([...redoStack, { nodes, edges }]);
          setNodes(prevState.nodes);
          setEdges(prevState.edges);
          setUndoStack(undoStack.slice(0, -1));
        }
        break;
      case 'redo':
        if (redoStack.length > 0) {
          const nextState = redoStack[redoStack.length - 1];
          setUndoStack([...undoStack, { nodes, edges }]);
          setNodes(nextState.nodes);
          setEdges(nextState.edges);
          setRedoStack(redoStack.slice(0, -1));
        }
        break;
      case 'delete':
        deleteSelectedNodes();
        break;
      case 'zoomIn':
        camera.zoom(1.1, canvasSize.width / 2, canvasSize.height / 2);
        setNeedsRedraw(true);
        break;
      case 'zoomOut':
        camera.zoom(0.9, canvasSize.width / 2, canvasSize.height / 2);
        setNeedsRedraw(true);
        break;
      case 'resetView':
        camera.reset();
        setNeedsRedraw(true);
        break;
      case 'runWithoutDebugging':
        runScript(false);
        break;
      case 'runWithDebugging':
        runScript(true);
        break;
      case 'generateCode':
        generateCode();
        break;
      case 'toggleGrid':
        updateConfig('isGridVisible', !config.isGridVisible);
        break;
      case 'toggleMinimap':
        updateConfig('isMinimapVisible', !config.isMinimapVisible);
        break;
      case 'copy':
        setCopiedNodes([...selectedNodes]);
        break;
      case 'paste':
        if (copiedNodes.length > 0) {
          const newNodes = copiedNodes.map(node => ({
            ...node,
            id: Date.now() + Math.random(),
            x: node.x + 20,
            y: node.y + 20,
          }));
          setNodes([...nodes, ...newNodes]);
          setUndoStack([...undoStack, { nodes, edges }]);
          setRedoStack([]);
        }
        break;
      case 'cut':
        setCopiedNodes([...selectedNodes]);
        deleteSelectedNodes();
        break;
      case 'selectAll':
        setSelectedNodes([...nodes]);
        break;
      case 'projectSettings':
        openSettings();
        break;
      case 'exportImage':
        exportAsImage();
        break;
      case 'exportSVG':
        exportAsSVG();
        break;
      case 'exportJSON':
        exportAsJSON();
        break;
      case 'exportJavaScript':
        exportAsJavaScript();
        break;
      case 'toggleNodeRounding':
        toggleNodeRounding();
        break;
      case 'toggleGraphInspector':
        updateConfig('isGraphInspectorVisible', !config.isGraphInspectorVisible);
        break;
      default:
        console.log(`Unhandled menu action: ${action}`);
    }
    setMenuOpen(null);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleTabClose = (tabId) => {
    if (tabId === 'untitled-1') return; // Don't close the default tab
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };

  const openSettings = () => {
    const settingsTabId = 'settings';
    if (!tabs.some(tab => tab.id === settingsTabId)) {
      setTabs([...tabs, { id: settingsTabId, title: 'Settings', type: 'settings' }]);
    }
    setActiveTab(settingsTabId);
  };
  // #endregion

  // #region Code Generation
  const runScript = (debug = false) => {
    const codeGenerator = new CodeGenerator(nodes, edges);
    codeGenerator.runScript(debug);
  };

  const generateCode = () => {
    const codeGenerator = new CodeGenerator(nodes, edges, config.codeGenerator);
    const generatedCode = codeGenerator.generate();
    console.log('Generated Code:');
    console.log(generatedCode);
  };
  // #endregion

  // #region Effects
  useEffect(() => {
    if (activeTab === 'untitled-1') {
      drawCanvas();
    }
  }, [drawCanvas, activeTab, needsRedraw]);

  useEffect(() => {
    if (activeTab === 'untitled-1') {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
          canvas.removeEventListener('wheel', handleWheel);
        };
      }
    }
  }, [handleWheel, activeTab]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNodes]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    renderer.setDarkTheme(config.isDarkTheme);
    renderer.setGridVisible(config.isGridVisible);
    renderer.setNodeRoundingEnabled(config.isNodeRoundingEnabled);
    setNeedsRedraw(true);
  }, [config.isDarkTheme, config.isGridVisible, config.isNodeRoundingEnabled, renderer]);
  // #endregion

  const toggleTheme = () => updateConfig('isDarkTheme', !config.isDarkTheme);
  const toggleGrid = () => updateConfig('isGridVisible', !config.isGridVisible);
  const toggleMinimap = () => updateConfig('isMinimapVisible', !config.isMinimapVisible);
  const toggleNodeRounding = () => updateConfig('isNodeRoundingEnabled', !config.isNodeRoundingEnabled);

  const updateCodeGeneratorSettings = (setting, value) => {
    updateConfig(`codeGenerator.${setting}`, value);
  };

  const updateConfig = (path, value) => {
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig };
      const parts = path.split('.');
      let current = newConfig;

      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...current[parts[i]] };
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = value;
      return newConfig;
    });
  };

  // #region Export Functions
  const exportAsImage = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      saveAs(blob, 'visual_script.png');
    });
  };

  const exportAsSVG = () => {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const canvasRect = canvasRef.current.getBoundingClientRect();
    svg.setAttribute("width", canvasRect.width);
    svg.setAttribute("height", canvasRect.height);
    svg.setAttribute("viewBox", `0 0 ${canvasRect.width} ${canvasRect.height}`);

    // Create a background rectangle
    const background = document.createElementNS(svgNS, "rect");
    background.setAttribute("width", "100%");
    background.setAttribute("height", "100%");
    background.setAttribute("fill", config.isDarkTheme ? "#2d2d2d" : "#e0e0e0");
    svg.appendChild(background);

    // Draw grid if visible
    if (config.isGridVisible) {
      const gridGroup = document.createElementNS(svgNS, "g");
      gridGroup.setAttribute("stroke", config.isDarkTheme ? "#3a3a3a" : "#d0d0d0");
      gridGroup.setAttribute("stroke-width", "1");

      for (let x = 0; x <= canvasRect.width; x += renderer.GRID_SIZE) {
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", 0);
        line.setAttribute("x2", x);
        line.setAttribute("y2", canvasRect.height);
        gridGroup.appendChild(line);
      }

      for (let y = 0; y <= canvasRect.height; y += renderer.GRID_SIZE) {
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", 0);
        line.setAttribute("y1", y);
        line.setAttribute("x2", canvasRect.width);
        line.setAttribute("y2", y);
        gridGroup.appendChild(line);
      }

      svg.appendChild(gridGroup);
    }

    // Draw edges
    const edgeGroup = document.createElementNS(svgNS, "g");
    edges.forEach(edge => {
      const startNode = nodes.find(n => n.id === edge.start.nodeId);
      const endNode = nodes.find(n => n.id === edge.end.nodeId);
      if (startNode && endNode) {
        const startDimensions = renderer.getNodeDimensions(startNode, canvasRef.current.getContext('2d'));
        const endDimensions = renderer.getNodeDimensions(endNode, canvasRef.current.getContext('2d'));

        const startPort = edge.start.isInput
          ? { x: startNode.x, y: startNode.y + startDimensions.portStartY + edge.start.index * 20 }
          : { x: startNode.x + startDimensions.width, y: startNode.y + startDimensions.portStartY + edge.start.index * 20 };
        const endPort = edge.end.isInput
          ? { x: endNode.x, y: endNode.y + endDimensions.portStartY + edge.end.index * 20 }
          : { x: endNode.x + endDimensions.width, y: endNode.y + endDimensions.portStartY + edge.end.index * 20 };

        const dx = endPort.x - startPort.x;
        const controlPoint1 = { x: startPort.x + dx * 0.5, y: startPort.y };
        const controlPoint2 = { x: endPort.x - dx * 0.5, y: endPort.y };

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", `M ${startPort.x} ${startPort.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${endPort.x} ${endPort.y}`);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#666");
        path.setAttribute("stroke-width", "2");
        edgeGroup.appendChild(path);
      }
    });
    svg.appendChild(edgeGroup);

    // Draw nodes
    const nodeGroup = document.createElementNS(svgNS, "g");
    nodes.forEach(node => {
      const nodeType = nodeTypes[node.type];
      const { width, height, portStartY } = renderer.getNodeDimensions(node, canvasRef.current.getContext('2d'));

      const nodeRect = document.createElementNS(svgNS, "rect");
      nodeRect.setAttribute("x", node.x);
      nodeRect.setAttribute("y", node.y);
      nodeRect.setAttribute("width", width);
      nodeRect.setAttribute("height", height);
      nodeRect.setAttribute("fill", nodeType.color);
      nodeRect.setAttribute("stroke", selectedNodes.includes(node) ? "#FFFF00" : "#000000");
      nodeRect.setAttribute("stroke-width", "2");
      nodeGroup.appendChild(nodeRect);

      // Node title
      const title = document.createElementNS(svgNS, "text");
      title.setAttribute("x", node.x + 10);
      title.setAttribute("y", node.y + 20);
      title.setAttribute("fill", "white");
      title.setAttribute("font-family", "Arial");
      title.setAttribute("font-size", "14px");
      title.setAttribute("font-weight", "bold");
      title.textContent = node.type;
      nodeGroup.appendChild(title);

      // Node description (simplified, not wrapping text)
      const description = document.createElementNS(svgNS, "text");
      description.setAttribute("x", node.x + 10);
      description.setAttribute("y", node.y + 40);
      description.setAttribute("fill", "white");
      description.setAttribute("font-family", "Arial");
      description.setAttribute("font-size", "10px");
      description.textContent = nodeType.description;
      nodeGroup.appendChild(description);

      // Input and output ports
      nodeType.inputs.forEach((input, i) => {
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", node.x);
        circle.setAttribute("cy", node.y + portStartY + i * 20);
        circle.setAttribute("r", "5");
        circle.setAttribute("fill", "#FFA500");
        nodeGroup.appendChild(circle);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", node.x + 10);
        text.setAttribute("y", node.y + portStartY + 5 + i * 20);
        text.setAttribute("fill", "white");
        text.setAttribute("font-family", "Arial");
        text.setAttribute("font-size", "10px");
        text.textContent = `${input.type === 'control' ? '▶' : '●'} ${input.name}`;
        nodeGroup.appendChild(text);
      });

      nodeType.outputs.forEach((output, i) => {
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", node.x + width);
        circle.setAttribute("cy", node.y + portStartY + i * 20);
        circle.setAttribute("r", "5");
        circle.setAttribute("fill", "#FFA500");
        nodeGroup.appendChild(circle);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", node.x + width - 70);
        text.setAttribute("y", node.y + portStartY + 5 + i * 20);
        text.setAttribute("fill", "white");
        text.setAttribute("font-family", "Arial");
        text.setAttribute("font-size", "10px");
        text.textContent = `${output.name} ${output.type === 'control' ? '▶' : '●'}`;
        nodeGroup.appendChild(text);
      });
    });
    svg.appendChild(nodeGroup);

    // Convert SVG to string and save
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, "visual_script.svg");
  };

  const exportAsJSON = () => {
    const projectData = JSON.stringify({ nodes, edges });
    const blob = new Blob([projectData], { type: 'application/json' });
    saveAs(blob, 'visual_script.json');
  };

  const exportAsJavaScript = () => {
    const codeGenerator = new CodeGenerator(nodes, edges, config.codeGenerator);
    const generatedCode = codeGenerator.generate();
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    saveAs(blob, 'generated_script.js');
  };
  // #endregion

  // #region Render
  return (
    <div
      style={{
        backgroundColor: config.isDarkTheme ? '#1e1e1e' : '#f0f0f0',
        color: config.isDarkTheme ? '#fff' : '#000',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <MenuBar
        menuOpen={menuOpen}
        handleMenuClick={handleMenuClick}
        handleMenuItemClick={handleMenuItemClick}
        config={config}
        toggleTheme={toggleTheme}
        toggleNodeRounding={toggleNodeRounding}
      />
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        isDarkTheme={config.isDarkTheme}
      />
      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        {activeTab === 'untitled-1' ? (
          <>
            {config.isGraphInspectorVisible && (
              <div style={{
                width: '300px',
                height: '100%',
                flexShrink: 0,
                borderRight: config.isDarkTheme ? '1px solid #555' : '1px solid #999',
              }}>
                <GraphInspector
                  selectedNodes={selectedNodes}
                  nodeTypes={nodeTypes}
                  updateNodeProperty={updateNodeProperty}
                  config={config}
                />
              </div>
            )}
            {config.isMinimapVisible && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                margin: '10px',
                width: '200px',
                height: '200px',
                backgroundColor: config.isDarkTheme ? '#1e1e1e' : '#f0f0f0',
                border: config.isDarkTheme ? '1px solid #555' : '1px solid #999',
                borderRadius: '4px',
                overflow: 'hidden',
                zIndex: 1000
              }}>
                <Minimap
                  nodes={nodes}
                  edges={edges}
                  camera={camera}
                  canvasSize={canvasSize}
                  getNodeDimensions={(node, ctx) => renderer.getNodeDimensions(node, ctx)}
                  nodeTypes={nodeTypes}
                  config={config}
                />
              </div>
            )}
            <div style={{ flex: 1, position: 'relative' }}>
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height - 65}
                onContextMenu={handleContextMenu}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ backgroundColor: config.isDarkTheme ? '#2d2d2d' : '#e0e0e0', display: 'block' }}
              />
              <ContextMenu
                visible={contextMenu.visible}
                x={contextMenu.x}
                y={contextMenu.y}
                nodeTypes={nodeTypes}
                nodeGroups={nodeGroups}
                addNode={addNode}
                camera={camera}
              />
            </div>
          </>
        ) : activeTab === 'settings' ? (
          <SettingsTab
            config={config}
            toggleTheme={toggleTheme}
            toggleGrid={toggleGrid}
            toggleMinimap={toggleMinimap}
            updateCodeGeneratorSettings={updateCodeGeneratorSettings}
            toggleNodeRounding={toggleNodeRounding}
          />
        ) : null}
      </div>
    </div>
  );
  // #endregion
};

export default VisualScripting;