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

    ctx.font = `600 14px ${FONT_FAMILY}`;

    const titleHeight = 25;
    const portSpacing = 14;
    const portVerticalGap = 5;
    const portsHeight = maxPorts > 0 ? (maxPorts - 1) * portSpacing + 20 + portVerticalGap : 0;

    let propertiesHeight = 0;
    if (nodeType.properties) {
      const visibleProps = nodeType.properties.filter(prop => {
        if (prop.type === 'array') return false;
        if (prop.visible === undefined) return true;
        return typeof prop.visible === 'function' ? prop.visible(node.properties) : prop.visible;
      });
      propertiesHeight = visibleProps.length * 16;
    }

    ctx.font = `500 12px ${FONT_FAMILY}`;

    const maxInputWidth = nodeType.inputs.reduce((max, input) =>
      Math.max(max, ctx.measureText(input.name).width), 0);

    const maxOutputWidth = nodeType.outputs.reduce((max, output) =>
      Math.max(max, ctx.measureText(output.name).width), 0);

    const portPadding = 40;
    const centerPadding = 40;
    const inputSection = maxInputWidth + portPadding;
    const outputSection = maxOutputWidth + portPadding;

    const width = inputSection + outputSection + centerPadding;
    const height = titleHeight +
      (maxPorts > 0 ? portsHeight : 0) +
      (propertiesHeight > 0 ? propertiesHeight + 10 : 0) +
      5;

    return {
      width,
      height,
      portStartY: titleHeight,
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
    this.drawEdges(ctx, edges, nodes);
    this.drawNodes(ctx, nodes, edges, selectedNodes);
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

      const startDims = this.getNodeDimensions(startNode, ctx);
      const endDims = this.getNodeDimensions(endNode, ctx);

      if (!this.isRectInView(startNode.x, startNode.y, startDims.width, startDims.height, ctx.canvas.width, ctx.canvas.height, 200) &&
        !this.isRectInView(endNode.x, endNode.y, endDims.width, endDims.height, ctx.canvas.width, ctx.canvas.height, 200)) {
        return;
      }

      const getPortY = (node, dims, index) => {
        const titleHeight = 25;
        const portSpacing = 14;
        const portVerticalGap = 5;
        return node.y + titleHeight + portVerticalGap + (index * portSpacing) + 4;
      };

      const startPort = {
        x: edge.start.isInput ? startNode.x : startNode.x + startDims.width,
        y: getPortY(startNode, startDims, edge.start.index)
      };

      const endPort = {
        x: edge.end.isInput ? endNode.x : endNode.x + endDims.width,
        y: getPortY(endNode, endDims, edge.end.index)
      };

      const dx = endPort.x - startPort.x;
      const controlPoint1 = { x: startPort.x + dx * 0.5, y: startPort.y };
      const controlPoint2 = { x: endPort.x - dx * 0.5, y: endPort.y };

      // Draw the connection line
      ctx.beginPath();
      ctx.moveTo(startPort.x, startPort.y);
      ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endPort.x, endPort.y);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Get the port types
      const startPortType = edge.start.isInput
        ? nodeTypes[startNode.type].inputs[edge.start.index].type
        : nodeTypes[startNode.type].outputs[edge.start.index].type;

      const endPortType = edge.end.isInput
        ? nodeTypes[endNode.type].inputs[edge.end.index].type
        : nodeTypes[endNode.type].outputs[edge.end.index].type;

      // Draw arrow if either port is a control type or if it's a data connection
      if (startPortType === 'control' || endPortType === 'control' || startPortType === 'data' || endPortType === 'data') {
        this.drawArrow(ctx, endPort.x, endPort.y, Math.atan2(endPort.y - controlPoint2.y, endPort.x - controlPoint2.x));
      }
    });
  }

  drawArrow(ctx, x, y, angle, size = 10) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size / 2);
    ctx.lineTo(-size, size / 2);
    ctx.closePath();
    ctx.fillStyle = '#666';
    ctx.fill();
    ctx.restore();
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
      const dimensions = this.getNodeDimensions(node, ctx);
      if (!this.isRectInView(node.x, node.y, dimensions.width, dimensions.height, ctx.canvas.width, ctx.canvas.height)) {
        return;
      }

      const nodeType = nodeTypes[node.type];
      this.drawNodeBody(ctx, node, dimensions, selectedNodes.includes(node));
      this.drawNodeContent(ctx, node, dimensions, nodeType, edges);
      this.drawNodeLabel(ctx, node, dimensions);
    });
  }

  drawNodeBody(ctx, node, dimensions, isSelected) {
    const nodeType = nodeTypes[node.type];
    ctx.fillStyle = nodeType.color;
    ctx.strokeStyle = isSelected ? '#FFFF00' : '#000000';
    ctx.lineWidth = 2;

    if (this.isNodeRoundingEnabled) {
      this.drawRoundedRect(ctx, node.x, node.y, dimensions.width, dimensions.height, 10);
    } else {
      ctx.fillRect(node.x, node.y, dimensions.width, dimensions.height);
      ctx.strokeRect(node.x, node.y, dimensions.width, dimensions.height);
    }
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawNodeContent(ctx, node, dimensions, nodeType, edges) {
    let currentHeight = 20;

    // Draw title with icon
    this.drawNodeTitle(ctx, node, currentHeight);
    currentHeight = this.drawNodeDescription(ctx, node, nodeType, dimensions, currentHeight);
    currentHeight = this.drawNodePorts(ctx, node, nodeType, dimensions, edges, currentHeight);
    this.drawNodeProperties(ctx, node, nodeType, currentHeight);
  }

  drawNodeTitle(ctx, node, yPosition) {
    ctx.fillStyle = 'white';
    ctx.font = `900 14px "Font Awesome 5 Free"`;
    ctx.fillText(this.getIconUnicode(getIconForNodeType(node.type)), node.x + 10, node.y + yPosition);

    ctx.font = `600 14px ${FONT_FAMILY}`;
    ctx.fillText(node.type, node.x + 30, node.y + yPosition);
  }

  drawNodeDescription(ctx, node, nodeType, dimensions, startHeight) {
    let currentHeight = startHeight;
    if (this.renderDescription) {
      ctx.font = `400 13px ${FONT_FAMILY}`;
      const descriptionLines = this.wrapText(ctx, nodeType.description, dimensions.width - 20);
      descriptionLines.forEach(line => {
        currentHeight += 14;
        ctx.fillText(line, node.x + 10, node.y + currentHeight + 3);
      });
      currentHeight += 15;
    } else {
      currentHeight += 15;
    }
    return currentHeight;
  }

  drawNodePorts(ctx, node, nodeType, dimensions, edges, startHeight) {
    let currentHeight = startHeight;

    nodeType.inputs.forEach((input, i) => {
      const portY = node.y + currentHeight + (i * 14);
      const isConnected = edges.some(edge =>
        edge.end.nodeId === node.id &&
        edge.end.index === i &&
        edge.end.isInput
      );

      if (!isConnected) {
        this.drawPortIcon(ctx, node.x, portY, true);
      }

      this.drawLabelArrow(ctx, node.x + 15, portY, input.type === 'control');
      ctx.fillStyle = 'white';
      ctx.fillText(input.name, node.x + 35, portY + 4);
    });

    nodeType.outputs.forEach((output, i) => {
      const portY = node.y + currentHeight + (i * 14);
      const isConnected = edges.some(edge =>
        edge.start.nodeId === node.id &&
        edge.start.index === i &&
        !edge.start.isInput
      );

      if (!isConnected) {
        this.drawPortIcon(ctx, node.x + dimensions.width, portY, false);
      }

      ctx.fillStyle = 'white';
      const textWidth = ctx.measureText(output.name).width;
      ctx.fillText(output.name, node.x + dimensions.width - textWidth - 35, portY + 4);
      this.drawLabelArrow(ctx, node.x + dimensions.width - 25, portY, output.type === 'control');
    });

    return currentHeight + Math.max(nodeType.inputs.length, nodeType.outputs.length) * 14 +
      (nodeType.inputs.length > 0 && nodeType.outputs.length > 0 ? 5 : 0);
  }

  drawNodeProperties(ctx, node, nodeType, startHeight) {
    if (!nodeType.properties) return;

    ctx.fillStyle = 'white';
    ctx.font = `500 12px ${FONT_FAMILY}`;
    let currentHeight = startHeight;

    nodeType.properties.forEach(prop => {
      if (prop.type === 'array') return;

      const isVisible = prop.visible === undefined ||
        (typeof prop.visible === 'function' ? prop.visible(node.properties) : prop.visible);

      if (isVisible) {
        const displayValue = node.properties[prop.name] !== undefined ? node.properties[prop.name] : prop.default;
        if (typeof displayValue === 'object') return;

        currentHeight += 16;
        ctx.fillText(`${prop.name}: ${displayValue}`, node.x + 10, node.y + currentHeight);
      }
    });
  }

  drawNodeLabel(ctx, node, dimensions) {
    if (!node.label) return;

    ctx.fillStyle = 'white';
    ctx.font = `400 12px ${FONT_FAMILY}`;
    const labelWidth = ctx.measureText(node.label).width;

    // Draw label centered below the node
    ctx.fillText(
      node.label,
      node.x + (dimensions.width - labelWidth) / 2,
      node.y + dimensions.height + 20
    );
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