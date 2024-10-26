import React, { useRef, useEffect, useState, useCallback } from 'react';
import MenuBar from './components/MenuBar';
import ContextMenu from './components/ContextMenu';
import Minimap from './components/Minimap';  // Add this import
import Camera from './Camera';
import CodeGenerator from './CodeGenerator';
import { nodeTypes, nodeGroups } from './nodeDefinitions';
import examples from './examples';

const GRID_SIZE = 20;

const VisualScripting = () => {
  const canvasRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [draggingNode, setDraggingNode] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [menuOpen, setMenuOpen] = useState(null);
  const [camera] = useState(new Camera(0, 0, 1, 0.75, 2));
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [isMinimapVisible, setIsMinimapVisible] = useState(true);

  const drawGrid = useCallback((ctx, canvasWidth, canvasHeight) => {
    if (!isGridVisible) return;

    const { x: offsetX, y: offsetY, scale } = camera;
    const gridSize = GRID_SIZE * scale;

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;

    const visibleLeft = -offsetX / scale;
    const visibleTop = -offsetY / scale;
    const visibleRight = (canvasWidth - offsetX) / scale;
    const visibleBottom = (canvasHeight - offsetY) / scale;

    const startX = Math.floor(visibleLeft / gridSize) * gridSize;
    const startY = Math.floor(visibleTop / gridSize) * gridSize;
    const endX = Math.ceil(visibleRight / gridSize) * gridSize;
    const endY = Math.ceil(visibleBottom / gridSize) * gridSize;

    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, visibleTop);
      ctx.lineTo(x, visibleBottom);
      ctx.stroke();
    }

    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(visibleLeft, y);
      ctx.lineTo(visibleRight, y);
      ctx.stroke();
    }
  }, [camera, isGridVisible]);

  const getNodeHeight = (nodeType) => {
    let height = 60 + Math.max(nodeType.inputs.length, nodeType.outputs.length) * 20;

    // Add extra height for properties
    if (nodeType.properties) {
      height += nodeType.properties.length * 20; // 20 pixels per property
    }

    return height;
  };

  const getNodeDimensions = useCallback((node, ctx) => {
    const nodeType = nodeTypes[node.type];
    ctx.font = 'bold 14px Arial';
    const titleWidth = ctx.measureText(node.type).width;
    
    ctx.font = '10px Arial';
    const descriptionLines = wrapText(ctx, nodeType.description, 180);
    const descriptionHeight = descriptionLines.length * 12;

    const inputsHeight = nodeType.inputs.length * 20;
    const outputsHeight = nodeType.outputs.length * 20;
    const propertiesHeight = (nodeType.properties?.length || 0) * 20;

    const width = Math.max(200, titleWidth + 20, ...descriptionLines.map(line => ctx.measureText(line).width + 20));
    const height = 35 + descriptionHeight + Math.max(inputsHeight, outputsHeight) + propertiesHeight;

    return { 
      width, 
      height,
      portStartY: 35 + descriptionHeight // This is the y-coordinate where ports start
    };
  }, [nodeTypes]);

  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    camera.applyToContext(ctx);

    drawGrid(ctx, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(edge => {
      const startNode = nodes.find(n => n.id === edge.start.nodeId);
      const endNode = nodes.find(n => n.id === edge.end.nodeId);
      if (startNode && endNode) {
        const startDimensions = getNodeDimensions(startNode, ctx);
        const endDimensions = getNodeDimensions(endNode, ctx);

        const startPort = edge.start.isInput
          ? { x: startNode.x, y: startNode.y + startDimensions.portStartY + edge.start.index * 20 }
          : { x: startNode.x + startDimensions.width, y: startNode.y + startDimensions.portStartY + edge.start.index * 20 };
        const endPort = edge.end.isInput
          ? { x: endNode.x, y: endNode.y + endDimensions.portStartY + edge.end.index * 20 }
          : { x: endNode.x + endDimensions.width, y: endNode.y + endDimensions.portStartY + edge.end.index * 20 };

        // Calculate control points for the Bezier curve
        const dx = endPort.x - startPort.x;
        const dy = endPort.y - startPort.y;
        const controlPoint1 = { x: startPort.x + dx * 0.5, y: startPort.y };
        const controlPoint2 = { x: endPort.x - dx * 0.5, y: endPort.y };

        // Draw the smooth curve
        ctx.beginPath();
        ctx.moveTo(startPort.x, startPort.y);
        ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endPort.x, endPort.y);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw arrow for control flow
        if (nodeTypes[startNode.type].outputs[edge.start.index].type === 'control') {
          const arrowSize = 10;
          const angle = Math.atan2(endPort.y - controlPoint2.y, endPort.x - controlPoint2.x);
          ctx.save();
          ctx.translate(endPort.x, endPort.y);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-arrowSize, -arrowSize / 2);
          ctx.lineTo(-arrowSize, arrowSize / 2);
          ctx.closePath();
          ctx.fillStyle = '#666';
          ctx.fill();
          ctx.restore();
        }
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const nodeType = nodeTypes[node.type];
      const { width, height, portStartY } = getNodeDimensions(node, ctx);

      // Node body
      ctx.fillStyle = nodeType.color;
      ctx.fillRect(node.x, node.y, width, height);

      // Node outline (highlight if selected)
      ctx.strokeStyle = node === selectedNode ? '#FFFF00' : '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(node.x, node.y, width, height);

      let currentHeight = 0;

      // Node title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      currentHeight += 20;
      ctx.fillText(node.type, node.x + 10, node.y + currentHeight);

      // Node description
      ctx.font = '10px Arial';
      const descriptionLines = wrapText(ctx, nodeType.description, width - 20);
      descriptionLines.forEach((line, index) => {
        currentHeight += 12;
        ctx.fillText(line, node.x + 10, node.y + currentHeight + 3);
      });

      currentHeight += 15; // Add some padding after description

      // Input ports
      nodeType.inputs.forEach((input, i) => {
        ctx.fillStyle = connecting && connecting.nodeId === node.id && connecting.isInput && connecting.index === i ? '#FFFF00' : '#FFA500';
        ctx.beginPath();
        ctx.arc(node.x, node.y + currentHeight + i * 20, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText(`${input.type === 'control' ? '▶' : '●'} ${input.name}`, node.x + 10, node.y + currentHeight + 5 + i * 20);
      });

      // Output ports
      nodeType.outputs.forEach((output, i) => {
        ctx.fillStyle = connecting && connecting.nodeId === node.id && !connecting.isInput && connecting.index === i ? '#FFFF00' : '#FFA500';
        ctx.beginPath();
        ctx.arc(node.x + width, node.y + currentHeight + i * 20, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText(`${output.name} ${output.type === 'control' ? '▶' : '●'}`, node.x + width - 70, node.y + currentHeight + 5 + i * 20);
      });

      currentHeight += Math.max(nodeType.inputs.length, nodeType.outputs.length) * 15;

      // Node properties
      if (nodeType.properties) {
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        
        nodeType.properties.forEach((prop, index) => {
          let displayValue = node.properties[prop.name] !== undefined ? node.properties[prop.name] : prop.default;
          const text = `${prop.name}: ${displayValue}`;
          currentHeight += 20;
          ctx.fillText(text, node.x + 10, node.y + currentHeight);
        });
      }
    });

    // Draw connection line
    if (connecting) {
      const startNode = nodes.find(n => n.id === connecting.nodeId);
      if (startNode) {
        const { width, portStartY } = getNodeDimensions(startNode, ctx);
        const startX = connecting.isInput ? startNode.x : startNode.x + width;
        const startY = startNode.y + portStartY + connecting.index * 20;
        const endX = mousePosition.x;
        const endY = mousePosition.y;

        // Calculate control points for the Bezier curve
        const dx = endX - startX;
        const dy = endY - startY;
        const controlPoint1 = { x: startX + dx * 0.5, y: startY };
        const controlPoint2 = { x: endX - dx * 0.5, y: endY };

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endX, endY);
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [nodes, edges, connecting, mousePosition, drawGrid, camera, selectedNode, getNodeDimensions]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    setContextMenu({ visible: true, x, y });
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
      setSelectedNode(clickedNode || null);
    }
  };

  const findClickedNode = (x, y) => {
    return nodes.find(node => {
      const nodeType = nodeTypes[node.type];
      const width = 200;
      const height = getNodeHeight(nodeType);
      
      return x >= node.x && x <= node.x + width && y >= node.y && y <= node.y + height;
    });
  };

  const findClickedPort = (x, y) => {
    const PORT_RADIUS = 5;
    const PORT_RADIUS_SQUARED = PORT_RADIUS * PORT_RADIUS;

    for (const node of nodes) {
      const nodeType = nodeTypes[node.type];
      const { width, portStartY } = getNodeDimensions(node, canvasRef.current.getContext('2d'));

      // Check input ports
      for (let i = 0; i < nodeType.inputs.length; i++) {
        const portX = node.x;
        const portY = node.y + portStartY + i * 20;
        const dx = x - portX;
        const dy = y - portY;
        if (dx * dx + dy * dy <= PORT_RADIUS_SQUARED) {
          return { nodeId: node.id, isInput: true, index: i };
        }
      }

      // Check output ports
      for (let i = 0; i < nodeType.outputs.length; i++) {
        const portX = node.x + width;
        const portY = node.y + portStartY + i * 20;
        const dx = x - portX;
        const dy = y - portY;
        if (dx * dx + dy * dy <= PORT_RADIUS_SQUARED) {
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
  };

  const updateNodeProperty = (property, value) => {
    const updatedNodes = nodes.map(node => 
      node.id === selectedNode.id 
        ? { ...node, properties: { ...node.properties, [property]: value } }
        : node
    );
    setUndoStack([...undoStack, { nodes, edges }]);
    setRedoStack([]);
    setNodes(updatedNodes);
    setSelectedNode({ ...selectedNode, properties: { ...selectedNode.properties, [property]: value } });
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

    const clickedPort = findClickedPort(x, y);
    if (clickedPort) {
      setConnecting(clickedPort);
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
    drawCanvas();
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
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    camera.zoom(factor, x, y);
    drawCanvas();
  }, [camera, drawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setUndoStack([...undoStack, { nodes, edges }]);
      setRedoStack([]);
      setNodes(nodes.filter(node => node.id !== selectedNode.id));
      setEdges(edges.filter(edge => 
        edge.start.nodeId !== selectedNode.id && edge.end.nodeId !== selectedNode.id
      ));
      setSelectedNode(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Delete' && selectedNode) {
      deleteSelectedNode();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNode]);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        deleteSelectedNode();
        break;
      case 'zoomIn':
        camera.zoom(1.1, canvasSize.width / 2, canvasSize.height / 2);
        drawCanvas();
        break;
      case 'zoomOut':
        camera.zoom(0.9, canvasSize.width / 2, canvasSize.height / 2);
        drawCanvas();
        break;
      case 'resetView':
        camera.x = 0;
        camera.y = 0;
        camera.scale = 1;
        drawCanvas();
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
        setIsGridVisible(!isGridVisible);
        break;
      case 'toggleMinimap':
        setIsMinimapVisible(!isMinimapVisible);
        break;
      default:
        console.log(`Unhandled menu action: ${action}`);
    }
    setMenuOpen(null);
  };

  const runScript = (debug = false) => {
    const codeGenerator = new CodeGenerator(nodes, edges);
    codeGenerator.runScript(debug);
  };

  const generateCode = () => {
    const codeGenerator = new CodeGenerator(nodes, edges);
    const generatedCode = codeGenerator.generate();
    console.log('Generated Code:');
    console.log(generatedCode);
  };

  return (
    <div 
      style={{ 
        backgroundColor: '#1e1e1e', 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
      tabIndex={0} 
      onKeyDown={handleKeyDown}
    >
      <MenuBar
        menuOpen={menuOpen}
        handleMenuClick={handleMenuClick}
        handleMenuItemClick={handleMenuItemClick}
        isGridVisible={isGridVisible}
        isMinimapVisible={isMinimapVisible}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height - 30}
          onContextMenu={handleContextMenu}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ backgroundColor: '#2d2d2d', display: 'block' }}
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
        {selectedNode && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#3d3d3d',
            border: '1px solid #555',
            padding: '10px',
            color: '#fff',
          }}>
            <h3>{selectedNode.type} Properties</h3>
            {nodeTypes[selectedNode.type].properties && nodeTypes[selectedNode.type].properties.map(prop => (
              <div key={prop.name}>
                <label>
                  {prop.name}:
                  {prop.type === 'select' ? (
                    <select
                      value={selectedNode.properties[prop.name] || prop.default}
                      onChange={(e) => updateNodeProperty(prop.name, e.target.value)}
                      style={{ backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #555', width: '100%', marginBottom: '5px' }}
                    >
                      {prop.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : prop.type === 'number' ? (
                    <input
                      type="number"
                      value={selectedNode.properties[prop.name] || prop.default}
                      onChange={(e) => updateNodeProperty(prop.name, parseFloat(e.target.value))}
                      style={{ backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #555', width: '100%', marginBottom: '5px' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={selectedNode.properties[prop.name] || prop.default}
                      onChange={(e) => updateNodeProperty(prop.name, e.target.value)}
                      style={{ backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #555', width: '100%', marginBottom: '5px' }}
                    />
                  )}
                </label>
              </div>
            ))}
          </div>
        )}
        {isMinimapVisible && (
          <div style={{ 
            position: 'absolute', 
            right: 0, 
            top: 0, 
            width: '200px', 
            height: canvasSize.height - 30, 
            backgroundColor: '#1e1e1e', 
            borderLeft: '1px solid #555' 
          }}>
            <Minimap
              nodes={nodes}
              edges={edges}
              camera={camera}
              canvasSize={canvasSize}
              getNodeDimensions={getNodeDimensions}
              nodeTypes={nodeTypes}
              wrapText={wrapText}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualScripting;
