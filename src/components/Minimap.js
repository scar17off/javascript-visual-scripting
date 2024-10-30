import React, { useRef, useEffect, useCallback } from 'react';

const Minimap = ({ nodes, edges, camera, canvasSize, getNodeDimensions, nodeTypes }) => {
  const minimapRef = useRef(null);

  const calculateBounds = useCallback((nodes, ctx) => {
    if (!nodes.length) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      try {
        const { width, height } = getNodeDimensions(node, ctx);
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + width);
        maxY = Math.max(maxY, node.y + height);
      } catch (error) {
        console.warn('Error calculating node dimensions:', error);
      }
    });

    return minX === Infinity ? null : { minX, minY, maxX, maxY };
  }, [getNodeDimensions]);

  const drawEdge = useCallback((ctx, edge, nodes, scale, bounds) => {
    const startNode = nodes.find(n => n.id === edge.start.nodeId);
    const endNode = nodes.find(n => n.id === edge.end.nodeId);
    if (!startNode || !endNode) return;

    const startDimensions = getNodeDimensions(startNode, ctx);
    const endDimensions = getNodeDimensions(endNode, ctx);

    const startPort = startNode.getPortPosition(edge.start.index, edge.start.isInput, startDimensions);
    const endPort = endNode.getPortPosition(edge.end.index, edge.end.isInput, endDimensions);

    ctx.beginPath();
    ctx.moveTo((startPort.x - bounds.minX) * scale, (startPort.y - bounds.minY) * scale);
    ctx.lineTo((endPort.x - bounds.minX) * scale, (endPort.y - bounds.minY) * scale);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [getNodeDimensions]);

  const drawNode = useCallback((ctx, node, scale, bounds) => {
    const { width, height } = getNodeDimensions(node, ctx);
    const nodeType = nodeTypes[node.type];

    // Node body
    ctx.fillStyle = nodeType.color;
    ctx.fillRect(
      (node.x - bounds.minX) * scale,
      (node.y - bounds.minY) * scale,
      width * scale,
      height * scale
    );

    // Node outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      (node.x - bounds.minX) * scale,
      (node.y - bounds.minY) * scale,
      width * scale,
      height * scale
    );

    // Node title
    ctx.fillStyle = 'white';
    ctx.font = `bold ${8 * scale}px Arial`;
    ctx.fillText(
      node.type,
      (node.x - bounds.minX + 5) * scale,
      (node.y - bounds.minY + 15) * scale
    );
  }, [getNodeDimensions, nodeTypes]);

  const drawViewport = (ctx, camera, canvasSize, scale, bounds) => {
    const viewportWidth = canvasSize.width / camera.scale;
    const viewportHeight = canvasSize.height / camera.scale;

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      (-camera.x - bounds.minX) * scale,
      (-camera.y - bounds.minY) * scale,
      viewportWidth * scale,
      viewportHeight * scale
    );
  };

  const drawMinimap = useCallback(() => {
    const minimap = minimapRef.current;
    if (!minimap || !nodes || !edges) return;

    const minimapCtx = minimap.getContext('2d');
    if (!minimapCtx) return;

    // Clear the minimap
    minimapCtx.fillStyle = '#1e1e1e';
    minimapCtx.fillRect(0, 0, minimap.width, minimap.height);

    // Calculate bounds
    const bounds = calculateBounds(nodes, minimapCtx);
    if (!bounds) return;

    // Add padding
    const padding = 50;
    bounds.minX -= padding;
    bounds.minY -= padding;
    bounds.maxX += padding;
    bounds.maxY += padding;

    // Calculate scale
    const scaleX = minimap.width / (bounds.maxX - bounds.minX);
    const scaleY = minimap.height / (bounds.maxY - bounds.minY);
    const scale = Math.min(scaleX, scaleY, 1);

    // Draw elements
    edges.forEach(edge => drawEdge(minimapCtx, edge, nodes, scale, bounds));
    nodes.forEach(node => drawNode(minimapCtx, node, scale, bounds));
    drawViewport(minimapCtx, camera, canvasSize, scale, bounds);

  }, [nodes, edges, camera, canvasSize, calculateBounds, drawEdge, drawNode]);

  useEffect(() => {
    try {
      drawMinimap();
    } catch (error) {
      console.error('Error drawing minimap:', error);
    }
  }, [drawMinimap]);

  useEffect(() => {
    const canvas = minimapRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => drawMinimap());
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [drawMinimap]);

  return (
    <canvas
      ref={minimapRef}
      width={200}
      height={200}
      style={{
        display: 'block',
        width: '200px',
        height: '200px',
        backgroundColor: '#1e1e1e',
        border: '1px solid #333'
      }}
    />
  );
};

export default Minimap;