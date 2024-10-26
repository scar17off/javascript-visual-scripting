class Camera {
  constructor(x = 0, y = 0, scale = 1, minZoom = 0.1, maxZoom = 5) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
  }

  move(dx, dy) {
    const zoomFactor = Math.max(0.1, Math.min(1, this.scale));
    const adjustedDx = (dx / this.scale) * zoomFactor;
    const adjustedDy = (dy / this.scale) * zoomFactor;
    this.x += adjustedDx;
    this.y += adjustedDy;
  }

  zoom(factor, centerX, centerY) {
    const oldScale = this.scale;
    this.scale *= factor;
    this.scale = Math.min(Math.max(this.scale, this.minZoom), this.maxZoom);

    // Adjust the position to zoom towards the mouse position
    this.x += (centerX - this.x) * (1 - this.scale / oldScale);
    this.y += (centerY - this.y) * (1 - this.scale / oldScale);
  }

  applyToContext(ctx) {
    ctx.setTransform(this.scale, 0, 0, this.scale, this.x, this.y);
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.x) / this.scale,
      y: (screenY - this.y) / this.scale
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.scale + this.x,
      y: worldY * this.scale + this.y
    };
  }
}

export default Camera;