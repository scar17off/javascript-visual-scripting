import { nodeTypes } from '../nodeDefinitions';

class Renderer {
  constructor(camera, isDarkTheme, isGridVisible, isNodeRoundingEnabled) {
    this.camera = camera;
    this.isDarkTheme = isDarkTheme;
    this.isGridVisible = isGridVisible;
    this.isNodeRoundingEnabled = isNodeRoundingEnabled;
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
    ctx.font = 'bold 14px Arial';
    const titleWidth = ctx.measureText(node.type).width;

    ctx.font = '10px Arial';
    const descriptionLines = this.wrapText(ctx, nodeType.description, 180);
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
    this.drawNodes(ctx, nodes, selectedNodes);

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
      if (startNode && endNode) {
        const startDimensions = this.getNodeDimensions(startNode, ctx);
        const endDimensions = this.getNodeDimensions(endNode, ctx);

        const startPort = edge.start.isInput
          ? { x: startNode.x, y: startNode.y + startDimensions.portStartY + edge.start.index * 20 }
          : { x: startNode.x + startDimensions.width, y: startNode.y + startDimensions.portStartY + edge.start.index * 20 };
        const endPort = edge.end.isInput
          ? { x: endNode.x, y: endNode.y + endDimensions.portStartY + edge.end.index * 20 }
          : { x: endNode.x + endDimensions.width, y: endNode.y + endDimensions.portStartY + edge.end.index * 20 };

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
      }
    });
  }

  drawNodes(ctx, nodes, selectedNodes) {
    nodes.forEach(node => {
      const nodeType = nodeTypes[node.type];
      const { width, height } = this.getNodeDimensions(node, ctx);

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

      // Node title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      currentHeight += 20;
      ctx.fillText(node.type, node.x + 10, node.y + currentHeight);

      // Node description
      ctx.font = '10px Arial';
      const descriptionLines = this.wrapText(ctx, nodeType.description, width - 20);
      descriptionLines.forEach((line, index) => {
        currentHeight += 12;
        ctx.fillText(line, node.x + 10, node.y + currentHeight + 3);
      });

      currentHeight += 15; // Add some padding after description

      // Input ports
      nodeType.inputs.forEach((input, i) => {
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(node.x, node.y + currentHeight + i * 20, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText(`${input.type === 'control' ? '▶' : '●'} ${input.name}`, node.x + 10, node.y + currentHeight + 5 + i * 20);
      });

      // Output ports
      nodeType.outputs.forEach((output, i) => {
        ctx.fillStyle = '#FFA500';
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
  }

  drawConnectionLine(ctx, connecting, mousePosition, nodes) {
    const startNode = nodes.find(n => n.id === connecting.nodeId);
    if (startNode) {
      const { width } = this.getNodeDimensions(startNode, ctx);
      const startX = connecting.isInput ? startNode.x : startNode.x + width;
      const startY = startNode.y + this.getNodeDimensions(startNode, ctx).portStartY + connecting.index * 20;
      const endX = mousePosition.x;
      const endY = mousePosition.y;

      // Calculate control points for the Bezier curve
      const dx = endX - startX;
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

  setDarkTheme(isDarkTheme) {
    this.isDarkTheme = isDarkTheme;
  }

  setGridVisible(isGridVisible) {
    this.isGridVisible = isGridVisible;
  }

  setNodeRoundingEnabled(isNodeRoundingEnabled) {
    this.isNodeRoundingEnabled = isNodeRoundingEnabled;
  }
}

export default Renderer;