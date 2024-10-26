import React, { useRef, useEffect, useCallback } from 'react';

const Minimap = ({ nodes, edges, camera, canvasSize, getNodeDimensions, nodeTypes, wrapText }) => {
  const minimapRef = useRef(null);

  const drawMinimap = useCallback(() => {
    const minimap = minimapRef.current;
    const minimapCtx = minimap.getContext('2d');

    // Clear the minimap
    minimapCtx.clearRect(0, 0, minimap.width, minimap.height);

    // Calculate the bounds of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      const { width, height } = getNodeDimensions(node, minimapCtx);
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + width);
      maxY = Math.max(maxY, node.y + height);
    });

    // Add some padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Calculate the scale to fit the nodes in the minimap
    const scaleX = minimap.width / (maxX - minX);
    const scaleY = minimap.height / (maxY - minY);
    const scale = Math.min(scaleX, scaleY);

    // Draw edges
    edges.forEach(edge => {
      const startNode = nodes.find(n => n.id === edge.start.nodeId);
      const endNode = nodes.find(n => n.id === edge.end.nodeId);
      if (startNode && endNode) {
        const startDimensions = getNodeDimensions(startNode, minimapCtx);
        const endDimensions = getNodeDimensions(endNode, minimapCtx);

        const startPort = edge.start.isInput
          ? { x: startNode.x, y: startNode.y + startDimensions.portStartY + edge.start.index * 20 }
          : { x: startNode.x + startDimensions.width, y: startNode.y + startDimensions.portStartY + edge.start.index * 20 };
        const endPort = edge.end.isInput
          ? { x: endNode.x, y: endNode.y + endDimensions.portStartY + edge.end.index * 20 }
          : { x: endNode.x + endDimensions.width, y: endNode.y + endDimensions.portStartY + edge.end.index * 20 };

        minimapCtx.beginPath();
        minimapCtx.moveTo((startPort.x - minX) * scale, (startPort.y - minY) * scale);
        minimapCtx.lineTo((endPort.x - minX) * scale, (endPort.y - minY) * scale);
        minimapCtx.strokeStyle = '#666';
        minimapCtx.lineWidth = 1;
        minimapCtx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const { width, height, portStartY } = getNodeDimensions(node, minimapCtx);
      const nodeType = nodeTypes[node.type];

      // Node body
      minimapCtx.fillStyle = nodeType.color;
      minimapCtx.fillRect(
        (node.x - minX) * scale,
        (node.y - minY) * scale,
        width * scale,
        height * scale
      );

      // Node outline
      minimapCtx.strokeStyle = '#000000';
      minimapCtx.lineWidth = 1;
      minimapCtx.strokeRect(
        (node.x - minX) * scale,
        (node.y - minY) * scale,
        width * scale,
        height * scale
      );

      // Node title
      minimapCtx.fillStyle = 'white';
      minimapCtx.font = `bold ${8 * scale}px Arial`;
      minimapCtx.fillText(node.type, (node.x - minX + 5) * scale, (node.y - minY + 15) * scale);

      // Ports
      const drawPort = (x, y, isInput, name) => {
        minimapCtx.beginPath();
        minimapCtx.arc(x, y, 3 * scale, 0, 2 * Math.PI);
        minimapCtx.fillStyle = isInput ? '#FFA500' : '#00FF00';
        minimapCtx.fill();

        // Port name
        minimapCtx.fillStyle = 'white';
        minimapCtx.font = `${6 * scale}px Arial`;
        minimapCtx.fillText(name, x + (isInput ? 5 * scale : -35 * scale), y + 3 * scale);
      };

      nodeType.inputs.forEach((input, i) => {
        drawPort(
          (node.x - minX) * scale,
          (node.y - minY + portStartY + i * 20) * scale,
          true,
          input.name
        );
      });

      nodeType.outputs.forEach((output, i) => {
        drawPort(
          (node.x - minX + width) * scale,
          (node.y - minY + portStartY + i * 20) * scale,
          false,
          output.name
        );
      });
    });

    // Draw the viewport rectangle
    const viewportWidth = canvasSize.width / camera.scale;
    const viewportHeight = canvasSize.height / camera.scale;
    minimapCtx.strokeStyle = 'red';
    minimapCtx.lineWidth = 2;
    minimapCtx.strokeRect(
      (-camera.x - minX) * scale,
      (-camera.y - minY) * scale,
      viewportWidth * scale,
      viewportHeight * scale
    );
  }, [nodes, edges, camera, canvasSize, getNodeDimensions, nodeTypes]);

  useEffect(() => {
    drawMinimap();
  }, [drawMinimap]);

  return (
    <canvas
      ref={minimapRef}
      width={200}
      height={canvasSize.height - 30}
      style={{ display: 'block' }}
    />
  );
};

export default Minimap;