import { nodeTypes } from '../nodeDefinitions';
import { getIconForNodeType } from '../components/ContextMenu';

const FONT_FAMILY = "'Inter', sans-serif";

class Renderer {
  constructor(camera, isDarkTheme, isGridVisible, isNodeRoundingEnabled) {
    this.camera = camera;
    this.isDarkTheme = isDarkTheme;
    this.isGridVisible = isGridVisible;
    this.isNodeRoundingEnabled = isNodeRoundingEnabled;
    this.renderDescription = false;
    this.GRID_SIZE = 20;
  }

  drawGrid(ctx, canvasWidth, canvasHeight) {
    if (!this.isGridVisible) return;

    const { x: offsetX, y: offsetY, scale } = this.camera;
    const gridSize = this.GRID_SIZE * scale;

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
  }

  getNodeDimensions(node, ctx) {
    const nodeType = nodeTypes[node.type];
    const maxPorts = Math.max(nodeType.inputs.length, nodeType.outputs.length);
    
    // Set font for measurements
    ctx.font = `600 14px ${FONT_FAMILY}`;
    
    // Calculate title height
    const titleHeight = 25;
    
    // Calculate ports area height with tighter spacing
    const portSpacing = 14;
    const portVerticalGap = 5; // Gap between input and output sections
    const portsHeight = maxPorts > 0 ? (maxPorts - 1) * portSpacing + 20 + portVerticalGap : 0;
    
    // Calculate properties height - only for visible properties
    let propertiesHeight = 0;
    if (nodeType.properties) {
      const visibleProps = nodeType.properties.filter(prop => {
        if (prop.type === 'array') return false;
        if (prop.visible === undefined) return true;
        if (typeof prop.visible === 'function') {
          return prop.visible(node.properties);
        }
        return prop.visible;
      });
      
      propertiesHeight = visibleProps.length * 16;
    }
    
    // Calculate required width based on port names
    let maxInputWidth = 0;
    let maxOutputWidth = 0;
    
    ctx.font = `500 12px ${FONT_FAMILY}`;
    
    // Measure input port names
    nodeType.inputs.forEach(input => {
      const textWidth = ctx.measureText(input.name).width;
      maxInputWidth = Math.max(maxInputWidth, textWidth);
    });
    
    // Measure output port names
    nodeType.outputs.forEach(output => {
      const textWidth = ctx.measureText(output.name).width;
      maxOutputWidth = Math.max(maxOutputWidth, textWidth);
    });
    
    // Calculate total width needed with guaranteed minimum spacing
    const portPadding = 40;
    const centerPadding = 40;
    const inputSection = maxInputWidth + portPadding;
    const outputSection = maxOutputWidth + portPadding;
    
    const width = inputSection + outputSection + centerPadding
    
    // Calculate total height with minimal padding
    const height = titleHeight + 
                   (maxPorts > 0 ? portsHeight : 0) + 
                   (propertiesHeight > 0 ? propertiesHeight + 10 : 0) +
                   5;
    
    // Calculate where ports should start (right after title)
    const portStartY = titleHeight;
    
    return {
      width,
      height,
      portStartY,
      maxInputWidth,
      maxOutputWidth,
      inputSection,
      outputSection
    };
  }

  wrapText(ctx, text, maxWidth) {
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
  }

  drawCanvas(ctx, nodes, edges, connecting, mousePosition, selectedNodes) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    this.camera.applyToContext(ctx);

    this.drawGrid(ctx, ctx.canvas.width, ctx.canvas.height);

    // Draw edges
    this.drawEdges(ctx, edges, nodes);

    // Draw nodes
    this.drawNodes(ctx, nodes, edges, selectedNodes);

    // Draw connection line
    if (connecting) {
      this.drawConnectionLine(ctx, connecting, mousePosition, nodes);
    }

    ctx.restore();
  }

  drawEdges(ctx, edges, nodes) {
    edges.forEach(edge => {
      const startNode = nodes.find(n => n.id === edge.start.nodeId);
      const endNode = nodes.find(n => n.id === edge.end.nodeId);

      if (!startNode || !endNode) return;

      // Quick bounds check for edge endpoints
      const startDims = this.getNodeDimensions(startNode, ctx);
      const endDims = this.getNodeDimensions(endNode, ctx);

      // Skip if both nodes are completely outside view (with padding)
      const padding = 200; // Larger padding for edges due to curves
      if (!this.isRectInView(startNode.x, startNode.y, startDims.width, startDims.height, ctx.canvas.width, ctx.canvas.height, padding) &&
        !this.isRectInView(endNode.x, endNode.y, endDims.width, endDims.height, ctx.canvas.width, ctx.canvas.height, padding)) {
        return;
      }

      const startPort = edge.start.isInput
        ? { x: startNode.x, y: startNode.y + startDims.portStartY + (edge.start.index * 14) + 8 }
        : { x: startNode.x + startDims.width, y: startNode.y + startDims.portStartY + (edge.start.index * 14) + 8 };
      const endPort = edge.end.isInput
        ? { x: endNode.x, y: endNode.y + endDims.portStartY + (edge.end.index * 14) + 8 }
        : { x: endNode.x + endDims.width, y: endNode.y + endDims.portStartY + (edge.end.index * 14) + 8 };

      // Calculate control points for the Bezier curve
      const dx = endPort.x - startPort.x;
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
    });
  }

  drawPortIcon(ctx, x, y, isInput) {
    const offset = 5; // Distance from node border
    const arrowX = isInput ? x - offset : x + offset;
    const portY = y;

    ctx.beginPath();
    if (isInput) {
      ctx.moveTo(arrowX - 6, portY - 5);
      ctx.lineTo(arrowX - 6, portY + 5);
      ctx.lineTo(arrowX, portY);
    } else {
      ctx.moveTo(arrowX, portY - 5);
      ctx.lineTo(arrowX, portY + 5);
      ctx.lineTo(arrowX + 6, portY);
    }
    ctx.closePath();
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawLabelArrow(ctx, x, y, isControl) {
    if (isControl) {
      const lineLength = 10;

      // Draw line
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + lineLength, y);
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw arrow
      ctx.beginPath();
      ctx.moveTo(x + lineLength, y - 5);
      ctx.lineTo(x + lineLength, y + 5);
      ctx.lineTo(x + lineLength + 6, y);
      ctx.closePath();
      ctx.fillStyle = '#4CAF50';
      ctx.fill();
    } else {
      // Draw orange circle for data ports
      ctx.beginPath();
      ctx.arc(x + 5, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFA500';
      ctx.fill();
    }
  }

  drawNodes(ctx, nodes, edges, selectedNodes) {
    nodes.forEach(node => {
      const { width, height, inputSection, outputSection } = this.getNodeDimensions(node, ctx);

      if (!this.isRectInView(node.x, node.y, width, height, ctx.canvas.width, ctx.canvas.height)) {
        return;
      }

      const nodeType = nodeTypes[node.type];

      // Node body
      ctx.fillStyle = nodeType.color;
      ctx.strokeStyle = selectedNodes.includes(node) ? '#FFFF00' : '#000000';
      ctx.lineWidth = 2;

      if (this.isNodeRoundingEnabled) {
        const radius = 10;
        ctx.beginPath();
        ctx.moveTo(node.x + radius, node.y);
        ctx.lineTo(node.x + width - radius, node.y);
        ctx.quadraticCurveTo(node.x + width, node.y, node.x + width, node.y + radius);
        ctx.lineTo(node.x + width, node.y + height - radius);
        ctx.quadraticCurveTo(node.x + width, node.y + height, node.x + width - radius, node.y + height);
        ctx.lineTo(node.x + radius, node.y + height);
        ctx.quadraticCurveTo(node.x, node.y + height, node.x, node.y + height - radius);
        ctx.lineTo(node.x, node.y + radius);
        ctx.quadraticCurveTo(node.x, node.y, node.x + radius, node.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(node.x, node.y, width, height);
        ctx.strokeRect(node.x, node.y, width, height);
      }

      let currentHeight = 0;

      // Node title with icon
      ctx.fillStyle = 'white';
      ctx.font = `600 14px ${FONT_FAMILY}`;
      currentHeight += 20;
      
      // Draw icon using Font Awesome unicode
      const iconClass = getIconForNodeType(node.type);
      const iconUnicode = this.getIconUnicode(iconClass);
      ctx.font = `900 14px "Font Awesome 5 Free"`;
      ctx.fillText(iconUnicode, node.x + 10, node.y + currentHeight);
      
      // Draw title after icon
      ctx.font = `600 14px ${FONT_FAMILY}`;
      ctx.fillText(node.type, node.x + 30, node.y + currentHeight);

      // Node description - only render if renderDescription is true
      if (this.renderDescription) {
        ctx.font = `400 13px ${FONT_FAMILY}`;
        const descriptionLines = this.wrapText(ctx, nodeType.description, width - 20);
        descriptionLines.forEach((line, index) => {
          currentHeight += 14;
          ctx.fillText(line, node.x + 10, node.y + currentHeight + 3);
        });
        currentHeight += 15; // Add padding after description
      } else {
        currentHeight += 15; // Add minimal padding between title and ports
      }

      // Input ports
      nodeType.inputs.forEach((input, i) => {
        const portY = node.y + currentHeight + (i * 14);
        const isControl = input.type === 'control';

        const isPortConnected = edges.some(edge =>
          edge.end.nodeId === node.id &&
          edge.end.index === i &&
          edge.end.isInput
        );

        if (!isPortConnected) {
          this.drawPortIcon(ctx, node.x, portY, true);
        }

        this.drawLabelArrow(ctx, node.x + 15, portY, isControl);
        ctx.fillStyle = 'white';
        ctx.fillText(input.name, node.x + 35, portY + 4);
      });

      // Output ports - removed the initial gap
      nodeType.outputs.forEach((output, i) => {
        // Calculate portY without the conditional gap
        const portY = node.y + currentHeight + (i * 14);
        const isControl = output.type === 'control';

        const isPortConnected = edges.some(edge =>
          edge.start.nodeId === node.id &&
          edge.start.index === i &&
          !edge.start.isInput
        );

        if (!isPortConnected) {
          this.drawPortIcon(ctx, node.x + width, portY, false);
        }

        ctx.fillStyle = 'white';
        const textWidth = ctx.measureText(output.name).width;
        ctx.fillText(output.name, node.x + width - textWidth - 35, portY + 4);
        this.drawLabelArrow(ctx, node.x + width - 25, portY, isControl);
      });

      // Add the gap after drawing all ports if needed
      currentHeight += Math.max(nodeType.inputs.length, nodeType.outputs.length) * 14;
      if (nodeType.inputs.length > 0 && nodeType.outputs.length > 0) {
        currentHeight += 5; // Only add gap if both inputs and outputs exist
      }

      // Node properties - only render non-array properties
      if (nodeType.properties) {
        ctx.fillStyle = 'white';
        ctx.font = `500 12px ${FONT_FAMILY}`; // Slightly smaller font for properties

        nodeType.properties.forEach(prop => {
          // Skip array type properties and check visibility
          if (prop.type === 'array') return;
          
          const isVisible = prop.visible === undefined ||
            (typeof prop.visible === 'function' ?
              prop.visible(node.properties) :
              prop.visible);

          if (isVisible) {
            let displayValue = node.properties[prop.name] !== undefined ? node.properties[prop.name] : prop.default;
            if (typeof displayValue === 'object') return;
            
            const text = `${prop.name}: ${displayValue}`;
            currentHeight += 16; // Reduced from 20
            ctx.fillText(text, node.x + 10, node.y + currentHeight);
          }
        });
      }
    });
  }

  drawConnectionLine(ctx, connecting, mousePosition, nodes) {
    if (!connecting) return;

    const node = nodes.find(n => n.id === connecting.nodeId);
    if (!node) return;

    const { width } = this.getNodeDimensions(node, ctx);
    const portY = node.y + this.getNodeDimensions(node, ctx).portStartY + (connecting.index * 14) + 8;
    
    // Calculate X position to start from middle of port
    const portOffset = 5;
    let portX;
    
    if (connecting.isInput) {
      if (nodeTypes[node.type].inputs[connecting.index].type === 'control') {
        // For control input ports: start from middle of triangle
        const triangleWidth = 6;
        portX = node.x - portOffset - (triangleWidth / 2);
      } else {
        // For data input ports: start from middle of circle
        portX = node.x - portOffset;
      }
    } else {
      if (nodeTypes[node.type].outputs[connecting.index].type === 'control') {
        // For control output ports: start from middle of triangle
        const triangleWidth = 6;
        portX = node.x + width + portOffset + (triangleWidth / 2);
      } else {
        // For data output ports: start from middle of circle
        portX = node.x + width + portOffset + 5; // +5 to match the circle x position in drawLabelArrow
      }
    }

    const startX = portX;
    const startY = portY;
    const endX = mousePosition.x;
    const endY = mousePosition.y;

    // Calculate control points for the Bezier curve
    const dx = endX - startX;
    const controlPoint1 = { x: startX + dx * 0.5, y: startY };
    const controlPoint2 = { x: endX - dx * 0.5, y: endY };

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endX, endY);
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  setDarkTheme(isDarkTheme) {
    this.isDarkTheme = isDarkTheme;
  }

  setGridVisible(isGridVisible) {
    this.isGridVisible = isGridVisible;
  }

  setNodeRoundingEnabled(isNodeRoundingEnabled) {
    this.isNodeRoundingEnabled = isNodeRoundingEnabled;
  }

  isRectInView(x, y, width, height, canvasWidth, canvasHeight, padding = 0) {
    const { scale } = this.camera;
    const viewBounds = {
      left: -this.camera.x / scale,
      top: -this.camera.y / scale,
      right: (canvasWidth - this.camera.x) / scale,
      bottom: (canvasHeight - this.camera.y) / scale
    };

    return !(x + width < viewBounds.left - padding ||
      x > viewBounds.right + padding ||
      y + height < viewBounds.top - padding ||
      y > viewBounds.bottom + padding);
  }

  setRenderDescription(renderDescription) {
    this.renderDescription = renderDescription;
  }

  // Add this helper method to convert Font Awesome class names to unicode
  getIconUnicode(iconClass) {
    const iconMap = {
      'fa-play': '\uf04b',
      'fa-terminal': '\uf120',
      'fa-cube': '\uf1b2',
      'fa-code': '\uf121',
      'fa-calculator': '\uf1ec',
      'fa-code-branch': '\uf126',
      'fa-sync': '\uf021',
      'fa-redo': '\uf01e',
      'fa-list': '\uf03a',
      'fa-globe': '\uf0ac',
      'fa-file-code': '\uf1c9',
      'fa-file-alt': '\uf15c',
      'fa-lock': '\uf023',
      'fa-unlock': '\uf09c',
      'fa-puzzle-piece': '\uf12e'
    };
    return iconMap[iconClass] || iconMap['fa-puzzle-piece'];
  }
}

export default Renderer;