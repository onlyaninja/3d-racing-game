// Full-HD 1280x720 Hybrid WebGL + Native 640x720 2D Renderer (2x Visual Quality, 3D Wall Occlusion, Battle Balloons & Parallax Skies)

class Mode7Renderer {
  constructor(canvas, skyCanvas, glCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });

    this.skyCanvas = skyCanvas;
    this.skyCtx = skyCanvas ? skyCanvas.getContext('2d', { alpha: false }) : null;

    this.glRenderer = new WebGLSceneRenderer(glCanvas);
    this.useWebGL = this.glRenderer.available;

    // CPU Fallback buffer (used only if WebGL is toggled off or unsupported)
    this.cpuW = 360;
    this.cpuH = 300;
    this.cpuHorizon = 82;
    this.cpuCanvas = document.createElement('canvas');
    this.cpuCanvas.width = this.cpuW;
    this.cpuCanvas.height = this.cpuH;
    this.cpuCtx = this.cpuCanvas.getContext('2d', { alpha: false });
    this.cpuImgData = this.cpuCtx.createImageData(this.cpuW, this.cpuH);
    this.cpuBuf32 = new Uint32Array(this.cpuImgData.data.buffer);

    // 160-column per-viewport 3D wall occlusion buffers (each column = 4px on 640px viewport)
    this.occCols = 160;
    this.wallZ = new Float32Array(this.occCols);
    this.wallTopY = new Float32Array(this.occCols);
    this.wallHitShade = new Float32Array(this.occCols);

    this.minimapCanvas = document.createElement('canvas');
    this.minimapCanvas.width = 148;
    this.minimapCanvas.height = 148;
    this.cachedMapKey = '';

    this.fps = 60;
    this._fpsFrames = 0;
    this._fpsLast = performance.now();
  }

  setGraphicsMode(hdWebGL) {
    this.useWebGL = hdWebGL && this.glRenderer.available;
    this.glRenderer.enabled = this.useWebGL;
    if (this.glRenderer.canvas) {
      this.glRenderer.canvas.style.display = this.useWebGL ? 'block' : 'none';
    }
    if (this.skyCanvas) {
      this.skyCanvas.style.display = this.useWebGL ? 'block' : 'none';
    }
    return this.useWebGL;
  }

  static drawCharacterPortrait(ctx, rosterInfo, w, h) {
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5;
    const cy = h * 0.58;
    const s = w / 44;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.arc(cx, cy - 3 * s, 19 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 230, 0, 0.08)';
    ctx.beginPath();
    ctx.arc(cx, cy - 3 * s, 14 * s, 0, Math.PI * 2);
    ctx.fill();

    // Tires & Alloy Rims
    ctx.fillStyle = '#090d16';
    ctx.fillRect(cx - 16 * s, cy + 2 * s, 6 * s, 10 * s);
    ctx.fillRect(cx + 10 * s, cy + 2 * s, 6 * s, 10 * s);
    ctx.fillStyle = '#27272a';
    ctx.fillRect(cx - 15.5 * s, cy + 3 * s, 5 * s, 2 * s);
    ctx.fillRect(cx - 15.5 * s, cy + 7 * s, 5 * s, 2 * s);
    ctx.fillRect(cx + 10.5 * s, cy + 3 * s, 5 * s, 2 * s);
    ctx.fillRect(cx + 10.5 * s, cy + 7 * s, 5 * s, 2 * s);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 14.5 * s, cy + 5 * s, 3 * s, 4 * s);
    ctx.fillRect(cx + 11.5 * s, cy + 5 * s, 3 * s, 4 * s);

    // Exhausts & Chassis
    ctx.fillStyle = '#64748b';
    ctx.fillRect(cx - 11 * s, cy + 6 * s, 22 * s, 2 * s);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(cx - 9 * s, cy + 1 * s, 3 * s, 5 * s);
    ctx.fillRect(cx + 6 * s, cy + 1 * s, 3 * s, 5 * s);

    ctx.fillStyle = rosterInfo.color;
    ctx.fillRect(cx - 12 * s, cy + 4 * s, 24 * s, 7.5 * s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 9 * s, cy + 5.5 * s, 18 * s, 2 * s);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 4.5 * s, cy + 1.5 * s, 9 * s, 3 * s);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(1, 1.4 * s);
    ctx.beginPath();
    ctx.arc(cx, cy + 2 * s, 4 * s, Math.PI, 0);
    ctx.stroke();

    const id = rosterInfo.id;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(cx - 9.5 * s, cy - 5 * s, 19 * s, 7 * s);

    ctx.fillStyle = rosterInfo.overalls;
    ctx.fillRect(cx - 8 * s, cy - 4.5 * s, 16 * s, 9.5 * s);

    if (id === 0 || id === 1) {
      const shirtCol = id === 0 ? '#dc2626' : '#16a34a';
      ctx.fillStyle = shirtCol;
      ctx.fillRect(cx - 10 * s, cy - 4 * s, 3.5 * s, 6 * s);
      ctx.fillRect(cx + 6.5 * s, cy - 4 * s, 3.5 * s, 6 * s);
      ctx.fillStyle = rosterInfo.overalls;
      ctx.fillRect(cx - 5.5 * s, cy - 4.5 * s, 3 * s, 8 * s);
      ctx.fillRect(cx + 2.5 * s, cy - 4.5 * s, 3 * s, 8 * s);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(cx - 5 * s, cy - 1 * s, 2 * s, 2 * s);
      ctx.fillRect(cx + 3 * s, cy - 1 * s, 2 * s, 2 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 7.5 * s, cy + 0.5 * s, 3.5 * s, 3 * s);
      ctx.fillRect(cx + 4 * s, cy + 0.5 * s, 3.5 * s, 3 * s);

      ctx.fillStyle = rosterInfo.skin;
      ctx.fillRect(cx - 8.5 * s, cy - 12 * s, 17 * s, 5 * s);
      ctx.fillRect(cx - 7 * s, cy - 14 * s, 14 * s, 10 * s);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx - 7.5 * s, cy - 12.5 * s, 2 * s, 4 * s);
      ctx.fillRect(cx + 5.5 * s, cy - 12.5 * s, 2 * s, 4 * s);
      ctx.fillStyle = rosterInfo.hat;
      ctx.fillRect(cx - 8.5 * s, cy - 18.5 * s, 17 * s, 5.5 * s);
      ctx.fillRect(cx - 6 * s, cy - 20.5 * s, 12 * s, 3 * s);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 7.5 * s, cy - 14 * s, 15 * s, 1.2 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 3.5 * s, cy - 19 * s, 7 * s, 4.5 * s);
      ctx.fillStyle = rosterInfo.hat;
      ctx.fillRect(cx - 2 * s, cy - 18 * s, 4 * s, 2.5 * s);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 5 * s, cy - 11.5 * s, 3 * s, 3.2 * s);
      ctx.fillRect(cx + 2 * s, cy - 11.5 * s, 3 * s, 3.2 * s);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cx - 4 * s, cy - 11 * s, 2 * s, 2.5 * s);
      ctx.fillRect(cx + 2 * s, cy - 11 * s, 2 * s, 2.5 * s);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(cx - 2 * s, cy - 9.5 * s, 4 * s, 3 * s);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx - 6 * s, cy - 6.8 * s, 12 * s, 2.5 * s);
      ctx.fillRect(cx - 4.5 * s, cy - 5.5 * s, 9 * s, 1.5 * s);
    } else if (id === 2) {
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(cx - 10 * s, cy - 4 * s, 3.5 * s, 4.5 * s);
      ctx.fillRect(cx + 6.5 * s, cy - 4 * s, 3.5 * s, 4.5 * s);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(cx - 2.5 * s, cy - 3 * s, 5 * s, 4 * s);
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(cx - 1.5 * s, cy - 2.2 * s, 3 * s, 2.5 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 8 * s, cy + 0.5 * s, 3.5 * s, 3 * s);
      ctx.fillRect(cx + 4.5 * s, cy + 0.5 * s, 3.5 * s, 3 * s);

      ctx.fillStyle = '#eab308';
      ctx.fillRect(cx - 11 * s, cy - 15 * s, 22 * s, 12 * s);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 9.5 * s, cy - 16 * s, 19 * s, 7 * s);
      ctx.fillRect(cx - 10.5 * s, cy - 11 * s, 4 * s, 10 * s);
      ctx.fillRect(cx + 6.5 * s, cy - 11 * s, 4 * s, 10 * s);

      ctx.fillStyle = rosterInfo.skin;
      ctx.fillRect(cx - 6.5 * s, cy - 13 * s, 13 * s, 9 * s);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cx - 8.5 * s, cy - 8.5 * s, 2.2 * s, 2.2 * s);
      ctx.fillRect(cx + 6.3 * s, cy - 8.5 * s, 2.2 * s, 2.2 * s);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(cx - 6 * s, cy - 20 * s, 12 * s, 4.5 * s);
      ctx.fillRect(cx - 6 * s, cy - 22 * s, 2.5 * s, 2.5 * s);
      ctx.fillRect(cx - 1.2 * s, cy - 23 * s, 2.5 * s, 3 * s);
      ctx.fillRect(cx + 3.5 * s, cy - 22 * s, 2.5 * s, 2.5 * s);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(cx - 1.2 * s, cy - 19 * s, 2.4 * s, 2.4 * s);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cx - 4.8 * s, cy - 18.8 * s, 2 * s, 2 * s);
      ctx.fillRect(cx + 2.8 * s, cy - 18.8 * s, 2 * s, 2 * s);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 4.5 * s, cy - 10.5 * s, 3 * s, 3 * s);
      ctx.fillRect(cx + 1.5 * s, cy - 10.5 * s, 3 * s, 3 * s);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cx - 3.5 * s, cy - 10 * s, 2 * s, 2.5 * s);
      ctx.fillRect(cx + 1.5 * s, cy - 10 * s, 2 * s, 2.5 * s);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(cx - 2 * s, cy - 6 * s, 4 * s, 1.5 * s);
    } else if (id === 3) {
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(cx - 8.5 * s, cy - 4 * s, 17 * s, 9 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 5 * s, cy - 3.5 * s, 10 * s, 8 * s);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 9.5 * s, cy - 2 * s, 3 * s, 5 * s);
      ctx.fillRect(cx + 6.5 * s, cy - 2 * s, 3 * s, 5 * s);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 2 * s, cy - 21 * s, 4 * s, 4 * s);
      ctx.fillRect(cx - 1.5 * s, cy - 17 * s, 3 * s, 3 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 6.5 * s, cy - 18 * s, 6 * s, 7 * s);
      ctx.fillRect(cx + 0.5 * s, cy - 18 * s, 6 * s, 7 * s);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 4 * s, cy - 16.5 * s, 2.5 * s, 4 * s);
      ctx.fillRect(cx + 1.5 * s, cy - 16.5 * s, 2.5 * s, 4 * s);
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(cx - 8.5 * s, cy - 11 * s, 3 * s, 3.5 * s);
      ctx.fillRect(cx + 5.5 * s, cy - 11 * s, 3 * s, 3.5 * s);
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(cx - 7.5 * s, cy - 12 * s, 15 * s, 8 * s);
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(cx - 5.5 * s, cy - 11 * s, 11 * s, 5 * s);
      ctx.fillStyle = '#365314';
      ctx.fillRect(cx - 3.5 * s, cy - 10 * s, 2 * s, 2 * s);
      ctx.fillRect(cx + 1.5 * s, cy - 10 * s, 2 * s, 2 * s);
    } else if (id === 4) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(cx - 11 * s, cy - 6.5 * s, 22 * s, 12 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 11.5 * s, cy - 5 * s, 23 * s, 1.5 * s);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 6 * s, cy - 4 * s, 12 * s, 9 * s);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(cx - 11 * s, cy - 1 * s, 4 * s, 3 * s);
      ctx.fillRect(cx + 7 * s, cy - 1 * s, 4 * s, 3 * s);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - 12 * s, cy - 0.5 * s, 2 * s, 2 * s);
      ctx.fillRect(cx + 10 * s, cy - 0.5 * s, 2 * s, 2 * s);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx - 10 * s, cy - 16 * s, 3.5 * s, 3 * s);
      ctx.fillRect(cx + 6.5 * s, cy - 16 * s, 3.5 * s, 3 * s);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - 12 * s, cy - 21 * s, 4 * s, 6 * s);
      ctx.fillRect(cx + 8 * s, cy - 21 * s, 4 * s, 6 * s);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 7 * s, cy - 20.5 * s, 14 * s, 6 * s);
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(cx - 8 * s, cy - 15 * s, 16 * s, 9 * s);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 7 * s, cy - 10 * s, 14 * s, 5 * s);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 6 * s, cy - 13 * s, 4 * s, 2.5 * s);
      ctx.fillRect(cx + 2 * s, cy - 13 * s, 4 * s, 2.5 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 5.5 * s, cy - 6.5 * s, 2.5 * s, 2.8 * s);
      ctx.fillRect(cx + 3 * s, cy - 6.5 * s, 2.5 * s, 2.8 * s);
    } else if (id === 5) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 5 * s, cy - 4 * s, 10 * s, 8 * s);
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(cx - 8 * s, cy - 4 * s, 4.5 * s, 8 * s);
      ctx.fillRect(cx + 3.5 * s, cy - 4 * s, 4.5 * s, 8 * s);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(cx - 4 * s, cy - 4 * s, 1.2 * s, 8 * s);
      ctx.fillRect(cx + 2.8 * s, cy - 4 * s, 1.2 * s, 8 * s);
      ctx.fillStyle = rosterInfo.skin;
      ctx.fillRect(cx - 6.5 * s, cy - 11.5 * s, 13 * s, 7.5 * s);
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(cx - 6 * s, cy - 7.5 * s, 2.5 * s, 2 * s);
      ctx.fillRect(cx + 3.5 * s, cy - 7.5 * s, 2.5 * s, 2 * s);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 4 * s, cy - 9.8 * s, 2.2 * s, 3.2 * s);
      ctx.fillRect(cx + 1.8 * s, cy - 9.8 * s, 2.2 * s, 3.2 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 3.6 * s, cy - 9.4 * s, 1 * s, 1.2 * s);
      ctx.fillRect(cx + 2.2 * s, cy - 9.4 * s, 1 * s, 1.2 * s);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(cx - 12 * s, cy - 19 * s, 24 * s, 8 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 11 * s, cy - 21.5 * s, 22 * s, 9.5 * s);
      ctx.fillRect(cx - 8 * s, cy - 23 * s, 16 * s, 3 * s);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 10.5 * s, cy - 19.5 * s, 5 * s, 6 * s);
      ctx.fillRect(cx + 5.5 * s, cy - 19.5 * s, 5 * s, 6 * s);
      ctx.fillRect(cx - 3.2 * s, cy - 21 * s, 6.4 * s, 6.5 * s);
      ctx.fillStyle = '#fecaca';
      ctx.fillRect(cx - 1.5 * s, cy - 19.8 * s, 2 * s, 2 * s);
    } else if (id === 6) {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(cx - 9 * s, cy - 4.5 * s, 18 * s, 9.5 * s);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - 6 * s, cy - 4 * s, 12 * s, 8.5 * s);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(cx - 6 * s, cy - 1 * s, 12 * s, 1 * s);
      ctx.fillRect(cx - 6 * s, cy + 2 * s, 12 * s, 1 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 6 * s, cy - 17 * s, 5.5 * s, 6.5 * s);
      ctx.fillRect(cx + 0.5 * s, cy - 17 * s, 5.5 * s, 6.5 * s);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 3.8 * s, cy - 15 * s, 2.2 * s, 3.5 * s);
      ctx.fillRect(cx + 1.6 * s, cy - 15 * s, 2.2 * s, 3.5 * s);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 7.5 * s, cy - 11.5 * s, 15 * s, 7 * s);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(cx - 5.5 * s, cy - 10.5 * s, 11 * s, 5 * s);
      ctx.fillStyle = '#713f12';
      ctx.fillRect(cx - 3.5 * s, cy - 6.8 * s, 7 * s, 1.2 * s);
    } else {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - 10.5 * s, cy - 4.5 * s, 21 * s, 9 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 7 * s, cy - 4.5 * s, 14 * s, 9 * s);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 1.5 * s, cy - 3 * s, 4 * s, 1.5 * s);
      ctx.fillRect(cx + 0.5 * s, cy - 3 * s, 1.8 * s, 5 * s);
      ctx.fillRect(cx - 2 * s, cy + 0.5 * s, 3 * s, 1.8 * s);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx - 10 * s, cy - 13 * s, 20 * s, 4.5 * s);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - 8 * s, cy - 18.5 * s, 16 * s, 12 * s);
      ctx.fillRect(cx - 3 * s, cy - 20.5 * s, 6 * s, 3 * s);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(cx - 6.5 * s, cy - 15 * s, 13 * s, 4.5 * s);
      ctx.fillRect(cx - 8 * s, cy - 10.5 * s, 16 * s, 6 * s);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 4.5 * s, cy - 14 * s, 2.5 * s, 2.8 * s);
      ctx.fillRect(cx + 2 * s, cy - 14 * s, 2.5 * s, 2.8 * s);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - 2.5 * s, cy - 9.5 * s, 1.8 * s, 1.8 * s);
      ctx.fillRect(cx + 0.7 * s, cy - 9.5 * s, 1.8 * s, 1.8 * s);
      ctx.fillRect(cx - 4.5 * s, cy - 6.5 * s, 9 * s, 1.4 * s);
    }
  }

  cacheMinimap(track) {
    const key = `${track.isArena ? 'A' : 'T'}_${track.def.id}`;
    if (this.cachedMapKey === key) return;
    this.cachedMapKey = key;

    const full = document.createElement('canvas');
    full.width = track.size;
    full.height = track.size;
    const fctx = full.getContext('2d');
    const id = fctx.createImageData(track.size, track.size);
    new Uint32Array(id.data.buffer).set(track.texPixels);
    fctx.putImageData(id, 0, 0);

    const mctx = this.minimapCanvas.getContext('2d');
    mctx.clearRect(0, 0, 148, 148);
    mctx.drawImage(full, 0, 0, 148, 148);
  }

  // Exact fast slab ray-vs-AABB column occlusion for 3D Battle Walls
  computeWallOcclusion(track, camX, camY, camH, cosA, sinA, rightX, rightY) {
    const cols = this.occCols;
    const wallZ = this.wallZ;
    const wallTopY = this.wallTopY;
    const wallHitShade = this.wallHitShade;
    wallZ.fill(9999);
    wallTopY.fill(PROJ.VP_H);
    wallHitShade.fill(1.0);

    if (!track.walls || track.walls.length === 0) return;

    const walls = track.walls;
    const numWalls = walls.length;
    const colWidth = PROJ.VP_W / cols; // 4px

    for (let c = 0; c < cols; c++) {
      const screenX = (c + 0.5) * colWidth - PROJ.VP_W * 0.5;
      const latFactor = screenX / PROJ.FOCAL;
      // Ray direction in world space (parameterized directly by forward camera depth cz!)
      // Point at depth cz is: (camX + cz * rdx, camY + cz * rdy)
      const rdx = cosA + rightX * latFactor;
      const rdy = sinA + rightY * latFactor;
      const invX = Math.abs(rdx) > 1e-6 ? 1 / rdx : 1e9;
      const invY = Math.abs(rdy) > 1e-6 ? 1 / rdy : 1e9;

      let bestCz = 9999;
      let bestH = 34;
      let bestShade = 1.0;

      for (let i = 0; i < numWalls; i++) {
        const w = walls[i];
        const t1 = (w.x - camX) * invX;
        const t2 = (w.x + w.w - camX) * invX;
        const tminX = t1 < t2 ? t1 : t2;
        const tmaxX = t1 < t2 ? t2 : t1;

        const t3 = (w.y - camY) * invY;
        const t4 = (w.y + w.h - camY) * invY;
        const tminY = t3 < t4 ? t3 : t4;
        const tmaxY = t3 < t4 ? t4 : t3;

        const tEnter = tminX > tminY ? tminX : tminY;
        const tExit = tmaxX < tmaxY ? tmaxX : tmaxY;

        if (tExit >= tEnter && tEnter > 2.5 && tEnter < bestCz) {
          bestCz = tEnter;
          bestH = w.height || 34;
          bestShade = tminX > tminY ? 0.76 : 0.96;
        }
      }

      if (bestCz < 9999) {
        wallZ[c] = bestCz;
        wallTopY[c] = PROJ.HORIZON_Y + (camH - bestH) * (PROJ.FOCAL / bestCz);
        wallHitShade[c] = bestShade;
      }
    }
  }

  renderFrame(world) {
    if (!world.track) return;
    this.cacheMinimap(world.track);

    // Update FPS tracker
    this._fpsFrames++;
    const now = performance.now();
    if (now - this._fpsLast >= 500) {
      this.fps = Math.round((this._fpsFrames * 1000) / (now - this._fpsLast));
      this._fpsFrames = 0;
      this._fpsLast = now;
    }

    const p1 = world.p1Kart || world.karts[0];
    const p2 = world.p2Kart || world.karts[1];

    // In Battle Mode, eliminated human players seamlessly spectate a live fighter!
    const cam1 = (world.gameMode === 'BATTLE' && p1.eliminated) ? world.getSpectateTarget(p1) : p1;
    const cam2 = (world.gameMode === 'BATTLE' && p2.eliminated) ? world.getSpectateTarget(p2) : p2;

    // 1. Hardware WebGL Full-HD Mode-7 Floor + True 3D Textured Battle Walls!
    const glDrawn = this.useWebGL && this.glRenderer.renderSplitScreen(world, cam1, cam2);

    // Clear 2D overlay canvas
    this.ctx.clearRect(0, 0, 1280, 720);

    // 2. Render Left (P1) & Right (P2) Viewports at Native 640x720 HD Resolution!
    this.renderViewport(world, p1, cam1, 0, 0, 640, 720, glDrawn);
    this.renderViewport(world, p2, cam2, 640, 0, 640, 720, glDrawn);

    // 3. Global Lightning Flash Effect
    if (world.lightningFlashTimer > 0) {
      this.ctx.fillStyle = `rgba(255, 250, 190, ${Math.min(0.75, world.lightningFlashTimer * 1.4)})`;
      this.ctx.fillRect(0, 0, 1280, 720);
    }

    // 4. Center Split-Screen Divider & Shared Minimap Radar
    this.ctx.fillStyle = '#090d16';
    this.ctx.fillRect(637, 0, 6, 720);
    this.ctx.fillStyle = '#ffe600';
    this.ctx.fillRect(639, 0, 2, 720);

    this.renderCenterMinimap(world, 640, 585);
    this.renderCountdownBanner(world);

    // Subtle FPS & Renderer pill at top center
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
    this.ctx.fillRect(574, 4, 132, 18);
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(574, 4, 132, 18);
    this.ctx.fillStyle = '#4ade80';
    this.ctx.font = 'bold 10px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.fps} FPS · ${glDrawn ? 'HD WebGL' : 'CPU MODE'}`, 640, 16);
    this.ctx.restore();

    // Global Event Banner (Eliminations / Lightning)
    if (world.eventBannerTimer > 0) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      this.ctx.fillRect(380, 92, 520, 36);
      this.ctx.strokeStyle = '#ffe600';
      this.ctx.lineWidth = 2.5;
      this.ctx.strokeRect(380, 92, 520, 36);
      this.ctx.fillStyle = '#ffe600';
      this.ctx.font = '900 15px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(world.eventBannerText, 640, 115);
      this.ctx.restore();
    }
  }

  renderViewport(world, hudKart, camKart, screenX, screenY, screenW, screenH, glDrawn) {
    const track = world.track;
    const cosA = Math.cos(camKart.angle);
    const sinA = Math.sin(camKart.angle);
    const camX = camKart.x - cosA * PROJ.CAM_DIST;
    const camY = camKart.y - sinA * PROJ.CAM_DIST;
    const camH = PROJ.BASE_CAM_H + camKart.z * 0.35;
    const rightX = -sinA;
    const rightY = cosA;

    // 1. Render Lush Multi-Layer Parallax Sky (into #sky-canvas behind WebGL so 3D walls rise cleanly over the horizon!)
    const skyTarget = (glDrawn && this.skyCtx) ? this.skyCtx : this.ctx;
    skyTarget.save();
    skyTarget.beginPath();
    skyTarget.rect(screenX, screenY, screenW, PROJ.HORIZON_Y + 18);
    skyTarget.clip();
    this.drawRichParallaxSky(skyTarget, camKart.angle, track.def, screenX, screenY, screenW, PROJ.HORIZON_Y, world.raceTime);
    skyTarget.restore();

    // 2. Compute 160-column 3D wall occlusion buffer (for hiding & corner-peeking!)
    this.computeWallOcclusion(track, camX, camY, camH, cosA, sinA, rightX, rightY);

    // 3. CPU Fallback Mode-7 Floor + 3D Wall Columns (only runs when WebGL is disabled)
    if (!glDrawn) {
      this.renderCPUFallbackFloorAndWalls(track, camX, camY, camH, cosA, sinA, rightX, rightY, screenX, screenY, screenW, screenH);
    }

    // 4. Collect & Depth-Sort All Full-HD 640x720 3D Sprites
    const sprites = [];
    const projectPoint = (wx, wy, wz = 0) => {
      const dx = wx - camX;
      const dy = wy - camY;
      const cz = dx * cosA + dy * sinA;
      if (cz < 6 || cz > 760) return null;
      const cx = dx * rightX + dy * rightY;
      const scale = PROJ.FOCAL / cz;
      const sx = screenX + (screenW * 0.5) + cx * scale;
      const sy = screenY + PROJ.HORIZON_Y + (camH - wz) * scale;
      return { sx, sy, cz, scale };
    };

    for (const sc of track.scenery) {
      const pr = projectPoint(sc.x, sc.y, 0);
      if (pr && pr.sx > screenX - 120 && pr.sx < screenX + screenW + 120) {
        sprites.push({ kind: 'SCENERY', data: sc, halfW: 24 * pr.scale, ...pr });
      }
    }

    for (const box of track.itemBoxes) {
      if (!box.active) continue;
      const bob = Math.sin(world.raceTime * 5 + box.x) * 2.5 + 5.5;
      const pr = projectPoint(box.x, box.y, bob);
      if (pr && pr.sx > screenX - 80 && pr.sx < screenX + screenW + 80) {
        sprites.push({ kind: 'ITEM_BOX', data: box, halfW: 11 * pr.scale, ...pr });
      }
    }

    for (const coin of track.coins) {
      if (!coin.active) continue;
      const pr = projectPoint(coin.x, coin.y, 2.5);
      if (pr && pr.sx > screenX - 60 && pr.sx < screenX + screenW + 60) {
        sprites.push({ kind: 'COIN', data: coin, halfW: 7 * pr.scale, ...pr });
      }
    }

    for (const proj of world.projectiles) {
      const pr = projectPoint(proj.x, proj.y, 2.5);
      if (pr && pr.sx > screenX - 80 && pr.sx < screenX + screenW + 80) {
        sprites.push({ kind: 'PROJECTILE', data: proj, halfW: 10 * pr.scale, ...pr });
      }
    }

    for (const pt of world.particles) {
      const pr = projectPoint(pt.x, pt.y, pt.z);
      if (pr && pr.sx > screenX - 40 && pr.sx < screenX + screenW + 40) {
        sprites.push({ kind: 'PARTICLE', data: pt, halfW: 5 * pr.scale, ...pr });
      }
    }

    for (const kart of world.karts) {
      if (kart.eliminated) continue; // Eliminated fighters completely disappear!
      const pr = projectPoint(kart.x, kart.y, kart.z);
      if (pr && pr.sx > screenX - 160 && pr.sx < screenX + screenW + 160) {
        sprites.push({ kind: 'KART', data: kart, halfW: 22 * pr.scale, ...pr });
      }
    }

    sprites.sort((a, b) => b.cz - a.cz);

    // 5. Draw Every Sprite at Native 640x720 HD Resolution with Exact 3D Wall Occlusion!
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.rect(screenX, screenY, screenW, screenH);
    ctx.clip();

    const hasWalls = track.walls && track.walls.length > 0;
    const colW = screenW / this.occCols;

    for (const sp of sprites) {
      if (hasWalls && sp.data !== camKart) {
        const leftCol = Math.max(0, Math.floor((sp.sx - sp.halfW - screenX) / colW));
        const rightCol = Math.min(this.occCols - 1, Math.ceil((sp.sx + sp.halfW - screenX) / colW));
        if (leftCol > rightCol) continue;

        let allClear = true;
        let anyVisible = false;
        const spriteTopY = sp.sy - (sp.kind === 'KART' ? 46 : 24) * Math.min(3.5, sp.scale * 0.55);

        for (let c = leftCol; c <= rightCol; c++) {
          if (sp.cz < this.wallZ[c] + 1.5) {
            anyVisible = true;
          } else {
            allClear = false;
            if (spriteTopY < this.wallTopY[c]) {
              anyVisible = true; // Peeking OVER a low wall!
            }
          }
        }

        if (!anyVisible) continue; // 100% hidden behind cover wall!

        if (!allClear) {
          // Partially peeking around corner or over low wall — clip precisely per column!
          ctx.save();
          ctx.beginPath();
          for (let c = leftCol; c <= rightCol; c++) {
            const cx0 = screenX + c * colW;
            if (sp.cz < this.wallZ[c] + 1.5) {
              ctx.rect(cx0, screenY, colW + 0.5, screenH);
            } else if (this.wallTopY[c] > screenY) {
              ctx.rect(cx0, screenY, colW + 0.5, Math.max(0, this.wallTopY[c] - screenY));
            }
          }
          ctx.clip();
          this.drawSpriteItem(ctx, sp, world, camKart);
          ctx.restore();
          continue;
        }
      }

      this.drawSpriteItem(ctx, sp, world, camKart);
    }

    // Dynamic Boost Speed Lines
    if (camKart.boostTimer > 0 || camKart.starTimer > 0) {
      ctx.strokeStyle = camKart.starTimer > 0 ? 'rgba(255, 230, 0, 0.55)' : 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) {
        const yLine = ((world.raceTime * 900 + i * 74) % (screenH - PROJ.HORIZON_Y)) + PROJ.HORIZON_Y;
        ctx.beginPath();
        ctx.moveTo(screenX, yLine);
        ctx.lineTo(screenX + 58, yLine - 14);
        ctx.moveTo(screenX + screenW, yLine);
        ctx.lineTo(screenX + screenW - 58, yLine - 14);
        ctx.stroke();
      }
    }

    ctx.restore();

    // 6. Render High-Contrast Player HUD (Race or Battle Mode)
    this.renderPlayerHUD(world, hudKart, camKart, screenX, screenY, screenW, screenH);
  }

  drawSpriteItem(ctx, sp, world, camKart) {
    if (sp.kind === 'SCENERY') {
      this.drawSceneryBillboard(ctx, sp);
    } else if (sp.kind === 'ITEM_BOX') {
      this.drawItemBoxBillboard(ctx, sp, world.raceTime);
    } else if (sp.kind === 'COIN') {
      this.drawCoinBillboard(ctx, sp, world.raceTime);
    } else if (sp.kind === 'PROJECTILE') {
      this.drawProjectileBillboard(ctx, sp, world.raceTime);
    } else if (sp.kind === 'PARTICLE') {
      this.drawParticleBillboard(ctx, sp);
    } else if (sp.kind === 'KART') {
      this.drawKartBillboard(ctx, sp, camKart, world.raceTime, world.gameMode === 'BATTLE');
    }
  }

  renderCPUFallbackFloorAndWalls(track, camX, camY, camH, cosA, sinA, rightX, rightY, screenX, screenY, screenW, screenH) {
    const tex = track.texPixels;
    const sizeMask = track.size - 1;
    const w = this.cpuW;
    const h = this.cpuH;
    const horizon = this.cpuHorizon;
    const focalCpu = PROJ.FOCAL * (w / screenW);
    const buf = this.cpuBuf32;

    const outCol = (255 << 24) | (35 << 16) | (60 << 8) | 25;

    for (let y = horizon; y < h; y++) {
      const dy = (y - horizon) + 1.0;
      const zDist = (camH * focalCpu * (h / screenH)) / dy;
      const centerX = camX + cosA * zDist;
      const centerY = camY + sinA * zDist;
      const latScale = zDist / focalCpu;
      let wx = centerX - rightX * (w * 0.5) * latScale;
      let wy = centerY - rightY * (w * 0.5) * latScale;
      const stepX = rightX * latScale;
      const stepY = rightY * latScale;
      let fx = (wx * 65536) | 0;
      let fy = (wy * 65536) | 0;
      const fsx = (stepX * 65536) | 0;
      const fsy = (stepY * 65536) | 0;
      const rowOff = y * w;
      for (let x = 0; x < w; x++) {
        const tx = fx >> 16;
        const ty = fy >> 16;
        buf[rowOff + x] = ((tx & ~sizeMask) === 0 && (ty & ~sizeMask) === 0)
          ? tex[(ty << 10) + tx]
          : outCol;
        fx = (fx + fsx) | 0;
        fy = (fy + fsy) | 0;
      }
    }

    this.cpuCtx.putImageData(this.cpuImgData, 0, 0);
    this.ctx.drawImage(
      this.cpuCanvas,
      0, horizon, w, h - horizon,
      screenX, screenY + PROJ.HORIZON_Y, screenW, screenH - PROJ.HORIZON_Y
    );

    // Draw simple shaded 3D battle wall columns in CPU fallback mode
    if (track.walls && track.walls.length > 0) {
      const colW = screenW / this.occCols;
      for (let c = 0; c < this.occCols; c++) {
        const cz = this.wallZ[c];
        if (cz >= 9999) continue;
        const topY = this.wallTopY[c];
        const botY = PROJ.HORIZON_Y + camH * (PROJ.FOCAL / cz);
        const shade = Math.max(0.25, this.wallHitShade[c] * (1 - Math.min(0.65, cz / 800)));
        const r = (180 * shade) | 0;
        const g = (120 * shade) | 0;
        const b = (75 * shade) | 0;
        this.ctx.fillStyle = `rgb(${r},${g},${b})`;
        this.ctx.fillRect(screenX + c * colW, topY, colW + 0.5, Math.max(1, botY - topY));
      }
    }
  }

  drawRichParallaxSky(ctx, angle, def, sx, sy, sw, horizon, time) {
    const theme = def.theme;
    // 1. Multi-stop Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, sy, 0, sy + horizon);
    skyGrad.addColorStop(0, def.skyTop);
    skyGrad.addColorStop(0.75, def.skyBottom);
    const fog = def.fogColor || [0.5, 0.7, 0.9];
    const fogCss = `rgb(${(fog[0] * 255) | 0},${(fog[1] * 255) | 0},${(fog[2] * 255) | 0})`;
    skyGrad.addColorStop(1, fogCss);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(sx, sy, sw, horizon + 18);

    const scrollFar = (((angle / (Math.PI * 2)) * 640) % 640 + 640) % 640;
    const scrollNear = (((angle / (Math.PI * 2)) * 1100) % 640 + 640) % 640;

    // 2. Twinkling Stars for night/space/cyber themes
    if (theme.includes('rainbow') || theme.includes('haunted') || theme.includes('cyber') || theme.includes('castle')) {
      for (let i = 0; i < 36; i++) {
        const starX = sx + (((i * 97 - scrollFar * 0.4) % sw + sw) % sw);
        const starY = sy + 8 + ((i * 43) % (horizon - 42));
        const twinkle = 0.45 + 0.55 * Math.sin(time * 3.5 + i * 1.7);
        ctx.fillStyle = i % 3 === 0 ? `rgba(125,211,252,${twinkle})` : `rgba(255,250,205,${twinkle})`;
        const sz = (i % 5 === 0) ? 3 : 2;
        ctx.fillRect(starX, starY, sz, sz);
      }
    }

    // 3. Radiant Sun / Moon / Synthwave Sun Halo
    const sunX = sx + (((260 - scrollFar * 0.65) % (sw + 180) + (sw + 180)) % (sw + 180)) - 90;
    const sunY = sy + (theme.includes('cyber') ? horizon - 46 : 62);
    const sunR = theme.includes('cyber') ? 44 : 26;

    const halo = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.8);
    halo.addColorStop(0, def.sunColor || '#fef08a');
    halo.addColorStop(0.35, 'rgba(255, 240, 170, 0.35)');
    halo.addColorStop(1, 'rgba(255, 240, 170, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = def.sunColor || '#fef08a';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Synthwave retro sun scanlines
    if (theme.includes('cyber')) {
      ctx.fillStyle = def.skyBottom;
      for (let ly = sunY + 4; ly < sunY + sunR; ly += 8) {
        ctx.fillRect(sunX - sunR, ly, sunR * 2, 3);
      }
    }

    // 4. Layered Fluffy Clouds (Day/Beach/Sky/Block/Meadow/Ice)
    if (!theme.includes('castle') && !theme.includes('rainbow') && !theme.includes('cyber')) {
      ctx.fillStyle = theme.includes('haunted') ? 'rgba(147, 51, 234, 0.28)' : 'rgba(255, 255, 255, 0.78)';
      for (let i = 0; i < 6; i++) {
        const cx = sx + (((i * 145 - scrollFar * 0.55 + time * 5) % (sw + 140) + (sw + 140)) % (sw + 140)) - 70;
        const cy = sy + 28 + (i % 3) * 26;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.arc(cx + 22, cy - 6, 22, 0, Math.PI * 2);
        ctx.arc(cx + 46, cy, 16, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 5. Far Parallax Mountain / Skyline Layer
    const farColor = theme.includes('castle') ? '#3b0a12'
      : (theme.includes('haunted') ? '#2e1065'
        : (theme.includes('cyber') ? '#3b0764'
          : (theme.includes('rainbow') ? '#1e1b4b'
            : (theme.includes('desert') ? '#9a3412'
              : (theme.includes('ice') ? '#0284c7' : '#1e40af')))));

    ctx.fillStyle = farColor;
    ctx.globalAlpha = 0.55;
    for (let rep = -1; rep <= 1; rep++) {
      const bx = sx + rep * 640 - scrollFar;
      ctx.beginPath();
      ctx.moveTo(bx, sy + horizon);
      ctx.lineTo(bx + 70, sy + horizon - 66);
      ctx.lineTo(bx + 150, sy + horizon - 26);
      ctx.lineTo(bx + 255, sy + horizon - 82);
      ctx.lineTo(bx + 365, sy + horizon - 32);
      ctx.lineTo(bx + 475, sy + horizon - 74);
      ctx.lineTo(bx + 565, sy + horizon - 28);
      ctx.lineTo(bx + 640, sy + horizon);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 6. Near Detailed Parallax Silhouette Layer (Hills / Fortress Towers / Cyber Skyline / Ice Peaks)
    const nearColor = (theme === 'grass' || theme === 'crossroads' || theme === 'arena_meadow' || theme === 'arena_block')
      ? '#15803d'
      : (theme.includes('beach') ? '#0369a1'
        : (theme.includes('castle') ? '#450a0a'
          : (theme.includes('haunted') ? '#1e1b4b'
            : (theme.includes('desert') ? '#c2410c'
              : (theme.includes('ice') ? '#38bdf8'
                : (theme.includes('cyber') ? '#581c87'
                  : (theme.includes('sky') ? '#93c5fd' : '#312e81')))))));

    ctx.fillStyle = nearColor;
    for (let rep = -1; rep <= 1; rep++) {
      const bx = sx + rep * 640 - scrollNear;
      if (theme.includes('cyber')) {
        // Neon city skyline silhouettes
        const bldgs = [[20, 48, 44], [80, 72, 38], [135, 36, 52], [210, 84, 42], [275, 52, 46], [350, 68, 40], [420, 42, 54], [495, 78, 44], [565, 54, 48]];
        for (const [ox, bh, bw] of bldgs) {
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(bx + ox, sy + horizon - bh, bw, bh);
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx + ox, sy + horizon - bh, bw, bh);
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(bx, sy + horizon);
        ctx.lineTo(bx + 60, sy + horizon - 46);
        ctx.lineTo(bx + 130, sy + horizon - 18);
        ctx.lineTo(bx + 215, sy + horizon - 58);
        ctx.lineTo(bx + 320, sy + horizon - 20);
        ctx.lineTo(bx + 425, sy + horizon - 52);
        ctx.lineTo(bx + 530, sy + horizon - 16);
        ctx.lineTo(bx + 640, sy + horizon);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 7. Soft Atmospheric Horizon Blend Band
    const haze = ctx.createLinearGradient(0, sy + horizon - 22, 0, sy + horizon + 6);
    haze.addColorStop(0, 'rgba(255,255,255,0)');
    haze.addColorStop(1, fogCss);
    ctx.fillStyle = haze;
    ctx.fillRect(sx, sy + horizon - 22, sw, 28);
  }

  drawSceneryBillboard(ctx, sp) {
    const type = sp.data.type;
    const s = Math.min(3.5, sp.scale * 0.55);
    const x = sp.sx;
    const y = sp.sy;

    // Ground contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + 1 * s, 14 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'pipe') {
      const pw = 18 * s;
      const ph = 26 * s;
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x - pw * 0.5, y - ph, pw, ph);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x - pw * 0.42, y - ph, pw * 0.58, ph);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(x - pw * 0.32, y - ph, pw * 0.18, ph);
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = Math.max(1, 1.2 * s);
      ctx.strokeRect(x - pw * 0.5, y - ph, pw, ph);

      ctx.fillStyle = '#16a34a';
      ctx.fillRect(x - pw * 0.6, y - ph - 6 * s, pw * 1.2, 7 * s);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(x - pw * 0.42, y - ph - 6 * s, pw * 0.24, 7 * s);
      ctx.strokeRect(x - pw * 0.6, y - ph - 6 * s, pw * 1.2, 7 * s);
    } else if (type === 'palm') {
      const tw = 5 * s;
      const th = 32 * s;
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x - tw * 0.5, y - th, tw, th);
      ctx.fillStyle = '#78350f';
      for (let i = 0; i < 4; i++) ctx.fillRect(x - tw * 0.5, y - th + i * 7 * s, tw, 2 * s);
      ctx.fillStyle = '#15803d';
      const r = 16 * s;
      ctx.beginPath();
      ctx.arc(x, y - th, r, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(x - 4 * s, y - th + 2 * s, r * 0.72, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(x - 3 * s, y - th + 2 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.arc(x + 3 * s, y - th + 2 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'boo_pillar') {
      const pw = 14 * s;
      const ph = 28 * s;
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - pw * 0.5, y - ph, pw, ph);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x - pw * 0.35, y - ph, pw * 0.45, ph);
      ctx.fillStyle = 'rgba(168,85,247,0.35)';
      ctx.beginPath();
      ctx.arc(x, y - ph - 5 * s, 11 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(x, y - ph - 5 * s, 6.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f3e8ff';
      ctx.beginPath();
      ctx.arc(x, y - ph - 5 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'star_pylon') {
      const pw = 11 * s;
      const ph = 30 * s;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x - pw * 0.5, y - ph, pw, ph);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(x - pw * 0.25, y - ph, pw * 0.35, ph);
      ctx.fillStyle = 'rgba(255,230,0,0.35)';
      ctx.beginPath();
      ctx.arc(x, y - ph - 5 * s, 12 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(x, y - ph - 5 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const pw = 15 * s;
      const ph = 32 * s;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - pw * 0.5, y - ph, pw, ph);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x - pw * 0.35, y - ph, pw * 0.35, ph);
      ctx.fillStyle = 'rgba(249,115,22,0.35)';
      ctx.beginPath();
      ctx.arc(x, y - ph - 4 * s, 11 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(x, y - ph - 4 * s, 6.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x, y - ph - 4 * s, 3.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawItemBoxBillboard(ctx, sp, time) {
    const s = Math.min(3.4, sp.scale * 0.55);
    const sz = 14 * s;
    const x = sp.sx - sz * 0.5;
    const y = sp.sy - sz;
    const isHot = !!sp.data.hotZone;
    const hue = Math.floor((time * 210 + sp.data.x * 0.8) % 360);

    // Floating ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(sp.sx, sp.sy + 4 * s, sz * 0.45, sz * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer radiant aura
    ctx.fillStyle = isHot ? 'rgba(255, 230, 0, 0.32)' : `hsla(${hue}, 95%, 65%, 0.25)`;
    ctx.beginPath();
    ctx.arc(sp.sx, y + sz * 0.5, sz * 0.78, 0, Math.PI * 2);
    ctx.fill();

    // Glossy 3D Translucent Crystal Cube
    const grad = ctx.createLinearGradient(x, y, x + sz, y + sz);
    grad.addColorStop(0, `hsla(${hue}, 95%, 68%, 0.92)`);
    grad.addColorStop(1, `hsla(${(hue + 75) % 360}, 90%, 48%, 0.92)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, sz, sz);

    // Diagonal crystal highlight facet
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + sz * 0.72, y);
    ctx.lineTo(x, y + sz * 0.72);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = isHot ? '#ffe600' : '#ffffff';
    ctx.lineWidth = Math.max(1.5, 1.8 * s);
    ctx.strokeRect(x, y, sz, sz);

    if (sz > 10) {
      ctx.font = `900 ${Math.floor(sz * 0.76)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillText('?', sp.sx + 1.5, y + sz * 0.79 + 1.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('?', sp.sx, y + sz * 0.79);
    }
  }

  drawCoinBillboard(ctx, sp, time) {
    const s = Math.min(3.2, sp.scale * 0.55);
    const spinWidth = Math.max(2, Math.abs(Math.cos(time * 6 + sp.data.x)) * 6 * s);
    const h = 7.5 * s;
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.ellipse(sp.sx, sp.sy - h, spinWidth + 1, h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe600';
    ctx.beginPath();
    ctx.ellipse(sp.sx, sp.sy - h, spinWidth, h * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef9c3';
    ctx.fillRect(sp.sx - spinWidth * 0.3, sp.sy - h * 1.4, spinWidth * 0.6, h * 0.8);
  }

  drawProjectileBillboard(ctx, sp, time) {
    const s = Math.min(3.4, sp.scale * 0.55);
    const r = 7.5 * s;
    const p = sp.data;

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(sp.sx, sp.sy + 1 * s, r * 0.9, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    if (p.type === 'BANANA') {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(sp.sx, sp.sy - r * 0.85, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sp.sx - r * 0.25, sp.sy - r * 1.1, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#713f12';
      ctx.fillRect(sp.sx - 1.5 * s, sp.sy - r * 2.1, 3 * s, r * 0.6);
    } else {
      const isRed = p.type === 'RED_SHELL';
      if (isRed) {
        // Subtle homing target glow
        ctx.fillStyle = 'rgba(239, 68, 68, 0.32)';
        ctx.beginPath();
        ctx.arc(sp.sx, sp.sy - r * 0.9, r * 1.45, 0, Math.PI * 2);
        ctx.fill();
      }
      // Shaded 3D Koopa Shell dome
      const grad = ctx.createRadialGradient(sp.sx - r * 0.3, sp.sy - r * 1.25, r * 0.15, sp.sx, sp.sy - r * 0.9, r);
      grad.addColorStop(0, isRed ? '#fca5a5' : '#86efac');
      grad.addColorStop(0.45, isRed ? '#ef4444' : '#22c55e');
      grad.addColorStop(1, isRed ? '#991b1b' : '#14532d');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sp.sx, sp.sy - r * 0.9, r, 0, Math.PI * 2);
      ctx.fill();

      // White shell rim + animated spinning ridge
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1.5, 1.8 * s);
      ctx.beginPath();
      ctx.moveTo(sp.sx - r * 0.95, sp.sy - r * 0.7);
      ctx.lineTo(sp.sx + r * 0.95, sp.sy - r * 0.7);
      ctx.stroke();

      const spinX = Math.sin(time * 22) * r * 0.55;
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath();
      ctx.arc(sp.sx + spinX, sp.sy - r * 1.15, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawParticleBillboard(ctx, sp) {
    const s = Math.min(3.0, sp.scale * 0.55);
    const sz = Math.max(2, sp.data.size * s);
    ctx.fillStyle = sp.data.color;
    ctx.fillRect(sp.sx - sz * 0.5, sp.sy - sz, sz, sz);
  }

  drawBattleBalloons(ctx, x, y, s, kart, time) {
    if (kart.lives <= 0) return;
    const colors = [
      ['#fca5a5', '#ef4444', '#991b1b'], // Balloon 1: Glossy Red
      ['#fef08a', '#facc15', '#a16207'], // Balloon 2: Glossy Gold
      ['#bae6fd', '#38bdf8', '#0369a1']  // Balloon 3: Glossy Cyan
    ];
    const offsets = kart.lives === 1
      ? [0]
      : (kart.lives === 2 ? [-9.5, 9.5] : [-12, 0, 12]);

    for (let i = 0; i < kart.lives; i++) {
      const bob = Math.sin(time * 6.5 + i * 2.1 + kart.id) * 2.5 * s;
      const bx = x + offsets[i] * s;
      const by = y - (34 + (i === 1 && kart.lives === 3 ? 4 : 0)) * s + bob;
      const br = 5.4 * s;

      // Tether string down to kart rear bumper
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = Math.max(1, 1.1 * s);
      ctx.beginPath();
      ctx.moveTo(x + offsets[i] * 0.35 * s, y - 10 * s);
      ctx.lineTo(bx, by + br * 0.9);
      ctx.stroke();

      // Glossy 3D balloon sphere
      const [light, mid, dark] = colors[i % 3];
      const grad = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.3, br * 0.1, bx, by, br);
      grad.addColorStop(0, light);
      grad.addColorStop(0.5, mid);
      grad.addColorStop(1, dark);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(bx, by, br * 0.92, br * 1.12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = Math.max(0.8, 0.9 * s);
      ctx.stroke();

      // Specular shine dot
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(bx - br * 0.28, by - br * 0.35, br * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawKartBillboard(ctx, sp, camKart, time, isBattle) {
    const kart = sp.data;

    // Blink briefly during post-hit invulnerability in Battle Mode
    if (isBattle && kart.invulnTimer > 0 && (Math.floor(time * 18) & 1)) {
      return;
    }

    let s = Math.min(3.6, sp.scale * 0.56);
    if (kart.shrinkTimer > 0) s *= 0.56;

    const x = sp.sx;
    const y = sp.sy;

    // Ground Contact Shadow (Dual layered soft ambient occlusion)
    const shadowW = 16.5 * s;
    const shadowH = 5.0 * s;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(x, y + 1.4 * s, shadowW, shadowH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
    ctx.beginPath();
    ctx.ellipse(x, y + 0.8 * s, shadowW * 0.68, shadowH * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();

    // Star rainbow aura glow behind kart
    if (kart.starTimer > 0) {
      const auraHue = Math.floor((time * 480) % 360);
      ctx.fillStyle = `hsla(${auraHue}, 95%, 60%, 0.32)`;
      ctx.beginPath();
      ctx.arc(x, y - 13 * s, 21 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    const relAngle = Math.sin(kart.visualAngle - camKart.angle);
    const cosRel = Math.cos(kart.visualAngle - camKart.angle);
    const steerShift = (kart === camKart ? kart.steerVisual * 2.8 : relAngle * 4.2) * s;
    const wheelSpin = (Math.floor(time * 18 + kart.x * 0.2) & 1);

    const bodyColor = kart.starTimer > 0
      ? `hsl(${Math.floor((time * 480) % 360)}, 95%, 55%)`
      : kart.info.color;

    // Front Steerable Tires
    const fTireW = 4.6 * s;
    const fTireH = 6.4 * s;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(x - 14.8 * s + steerShift * 0.45, y - fTireH - 3.5 * s, fTireW, fTireH);
    ctx.fillRect(x + 10.2 * s + steerShift * 0.45, y - fTireH - 3.5 * s, fTireW, fTireH);

    // Wide Rear Racing Slicks with Animated Tread & Alloy Rims
    const tireW = 6.5 * s;
    const tireH = 9.0 * s;
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x - 14.5 * s, y - tireH, tireW, tireH);
    ctx.fillRect(x + 8.0 * s, y - tireH, tireW, tireH);
    ctx.fillStyle = wheelSpin ? '#3f3f46' : '#27272a';
    ctx.fillRect(x - 14 * s, y - tireH + 1.5 * s, tireW - 1 * s, 2 * s);
    ctx.fillRect(x + 8.5 * s, y - tireH + 1.5 * s, tireW - 1 * s, 2 * s);
    ctx.fillStyle = wheelSpin ? '#27272a' : '#3f3f46';
    ctx.fillRect(x - 14 * s, y - tireH + 5 * s, tireW - 1 * s, 2 * s);
    ctx.fillRect(x + 8.5 * s, y - tireH + 5 * s, tireW - 1 * s, 2 * s);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x - 12.8 * s, y - tireH + 2.8 * s, 3 * s, 3.2 * s);
    ctx.fillRect(x + 9.8 * s, y - tireH + 2.8 * s, 3 * s, 3.2 * s);

    // Rear Axle, Engine Block & Dual Chrome Exhausts
    ctx.fillStyle = '#52525b';
    ctx.fillRect(x - 9 * s, y - 5 * s, 18 * s, 2.5 * s);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - 4.5 * s, y - 9.5 * s, 9 * s, 5 * s);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x - 7.5 * s, y - 11.5 * s, 2.8 * s, 6.5 * s);
    ctx.fillRect(x + 4.7 * s, y - 11.5 * s, 2.8 * s, 6.5 * s);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 7 * s, y - 11.5 * s, 1.8 * s, 1.5 * s);
    ctx.fillRect(x + 5.2 * s, y - 11.5 * s, 1.8 * s, 1.5 * s);

    // Boost Twin Afterburner Flames
    if (kart.boostTimer > 0) {
      const flicker = ((Math.floor(time * 30) & 1) ? 1.25 : 0.9) * s;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x - 8 * s, y - 6 * s, 4.5 * s, 6.8 * flicker);
      ctx.fillRect(x + 3.5 * s, y - 6 * s, 4.5 * s, 6.8 * flicker);
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(x - 7.2 * s, y - 5.5 * s, 3 * s, 4.8 * flicker);
      ctx.fillRect(x + 4.2 * s, y - 5.5 * s, 3 * s, 4.8 * flicker);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x - 6.5 * s, y - 5 * s, 1.6 * s, 2.6 * flicker);
      ctx.fillRect(x + 4.9 * s, y - 5 * s, 1.6 * s, 2.6 * flicker);
    }

    // Sculpted Kart Bodywork with Crisp Outline & Highlight
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x - 11.2 * s + steerShift * 0.25, y - 9.5 * s, 22.4 * s, 7.5 * s);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillRect(x - 10.5 * s + steerShift * 0.25, y - 9.5 * s, 21 * s, 1.8 * s);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = Math.max(1, 1.0 * s);
    ctx.strokeRect(x - 11.2 * s + steerShift * 0.25, y - 9.5 * s, 22.4 * s, 7.5 * s);

    ctx.fillStyle = '#18181b';
    ctx.fillRect(x - 10.5 * s + steerShift * 0.25, y - 8 * s, 2.5 * s, 3.5 * s);
    ctx.fillRect(x + 8 * s + steerShift * 0.25, y - 8 * s, 2.5 * s, 3.5 * s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 8 * s + steerShift * 0.25, y - 5.5 * s, 16 * s, 2.2 * s);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 7.5 * s + steerShift * 0.25, y - 5.5 * s, 2.5 * s, 2 * s);
    ctx.fillRect(x + 5 * s + steerShift * 0.25, y - 5.5 * s, 2.5 * s, 2 * s);

    // Bucket Seat & Steering Wheel
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 7.5 * s + steerShift * 0.45, y - 16 * s, 15 * s, 6.5 * s);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = Math.max(1, 1.3 * s);
    ctx.beginPath();
    ctx.arc(x + steerShift * 0.7, y - 15 * s, 5.5 * s, Math.PI, 0);
    ctx.stroke();

    // Double-Complexity Character Upper Body & Head
    const id = kart.info.id;
    const bodyX = x + steerShift * 0.55;
    const headX = x + steerShift * 0.85;

    ctx.fillStyle = kart.info.overalls;
    ctx.fillRect(bodyX - 7.2 * s, y - 17 * s, 14.4 * s, 8.5 * s);

    if (id === 0 || id === 1) {
      const shirt = id === 0 ? '#dc2626' : '#16a34a';
      ctx.fillStyle = shirt;
      ctx.fillRect(bodyX - 9.2 * s, y - 16.5 * s, 3.2 * s, 5.5 * s);
      ctx.fillRect(bodyX + 6 * s, y - 16.5 * s, 3.2 * s, 5.5 * s);
      ctx.fillStyle = kart.info.overalls;
      ctx.fillRect(bodyX - 5 * s, y - 17 * s, 2.6 * s, 8 * s);
      ctx.fillRect(bodyX + 2.4 * s, y - 17 * s, 2.6 * s, 8 * s);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(bodyX - 4.5 * s, y - 12.5 * s, 1.8 * s, 1.8 * s);
      ctx.fillRect(bodyX + 2.7 * s, y - 12.5 * s, 1.8 * s, 1.8 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bodyX - 10 * s + steerShift * 0.2, y - 14.5 * s, 3 * s, 3 * s);
      ctx.fillRect(bodyX + 7 * s + steerShift * 0.2, y - 14.5 * s, 3 * s, 3 * s);

      ctx.fillStyle = kart.info.skin;
      ctx.fillRect(headX - 7 * s, y - 22.5 * s, 14 * s, 5.5 * s);
      ctx.fillRect(headX - 5.8 * s, y - 23.5 * s, 11.6 * s, 7 * s);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(headX - 6.2 * s, y - 21 * s, 12.4 * s, 3.2 * s);
      ctx.fillRect(headX - 6.8 * s, y - 22.5 * s, 2 * s, 4 * s);
      ctx.fillRect(headX + 4.8 * s, y - 22.5 * s, 2 * s, 4 * s);

      ctx.fillStyle = kart.info.hat;
      ctx.fillRect(headX - 7.2 * s, y - 26.8 * s, 14.4 * s, 4.8 * s);
      ctx.fillRect(headX - 5.2 * s, y - 28.5 * s, 10.4 * s, 2.5 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX - 2.8 * s, y - 26.8 * s, 5.6 * s, 3.5 * s);
      ctx.fillStyle = kart.info.hat;
      ctx.fillRect(headX - 1.5 * s, y - 26 * s, 3 * s, 2 * s);
    } else if (id === 2) {
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(bodyX - 9.2 * s, y - 16.5 * s, 3.2 * s, 4.5 * s);
      ctx.fillRect(bodyX + 6 * s, y - 16.5 * s, 3.2 * s, 4.5 * s);
      ctx.fillStyle = '#db2777';
      ctx.fillRect(bodyX - 6 * s, y - 17 * s, 12 * s, 2 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bodyX - 10 * s + steerShift * 0.2, y - 14.5 * s, 2.8 * s, 3.5 * s);
      ctx.fillRect(bodyX + 7.2 * s + steerShift * 0.2, y - 14.5 * s, 2.8 * s, 3.5 * s);

      ctx.fillStyle = '#eab308';
      ctx.fillRect(headX - 8 * s, y - 24 * s, 16 * s, 10 * s);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(headX - 7 * s, y - 25 * s, 14 * s, 8.5 * s);
      ctx.fillRect(headX - 8.5 * s, y - 20 * s, 3 * s, 6.5 * s);
      ctx.fillRect(headX + 5.5 * s, y - 20 * s, 3 * s, 6.5 * s);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(headX - 8.2 * s, y - 21 * s, 2 * s, 2 * s);
      ctx.fillRect(headX + 6.2 * s, y - 21 * s, 2 * s, 2 * s);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(headX - 4.8 * s, y - 28.5 * s, 9.6 * s, 4 * s);
      ctx.fillRect(headX - 4.8 * s, y - 30.2 * s, 2 * s, 2 * s);
      ctx.fillRect(headX - 1 * s, y - 31 * s, 2 * s, 2.8 * s);
      ctx.fillRect(headX + 2.8 * s, y - 30.2 * s, 2 * s, 2 * s);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(headX - 1 * s, y - 27.8 * s, 2 * s, 2 * s);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(headX - 3.8 * s, y - 27.5 * s, 1.6 * s, 1.6 * s);
      ctx.fillRect(headX + 2.2 * s, y - 27.5 * s, 1.6 * s, 1.6 * s);
    } else if (id === 3) {
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(bodyX - 7 * s, y - 16.5 * s, 14 * s, 8 * s);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(bodyX - 5.5 * s, y - 14.5 * s, 11 * s, 5 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bodyX - 6 * s, y - 15 * s, 12 * s, 1.2 * s);
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(bodyX - 9.5 * s + steerShift * 0.2, y - 14.5 * s, 2.8 * s, 3 * s);
      ctx.fillRect(bodyX + 6.7 * s + steerShift * 0.2, y - 14.5 * s, 2.8 * s, 3 * s);
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(headX - 7 * s, y - 21.5 * s, 2.5 * s, 3 * s);
      ctx.fillRect(headX + 4.5 * s, y - 21.5 * s, 2.5 * s, 3 * s);
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(headX - 6 * s, y - 25 * s, 12 * s, 8.5 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX - 5 * s, y - 27 * s, 4.2 * s, 3.5 * s);
      ctx.fillRect(headX + 0.8 * s, y - 27 * s, 4.2 * s, 3.5 * s);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(headX - 1.8 * s, y - 28.5 * s, 3.6 * s, 3 * s);
      ctx.fillRect(headX - 1.6 * s, y - 24.5 * s, 3.2 * s, 3 * s);
      ctx.fillRect(headX - 1.4 * s, y - 20.5 * s, 2.8 * s, 2.8 * s);
    } else if (id === 4) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(bodyX - 9.5 * s, y - 19 * s, 19 * s, 11 * s);
      ctx.fillStyle = '#166534';
      ctx.fillRect(bodyX - 7.5 * s, y - 17.5 * s, 15 * s, 8 * s);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(bodyX - 10 * s, y - 18.5 * s, 20 * s, 1.5 * s);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(bodyX - 11.5 * s, y - 16 * s, 3.2 * s, 5 * s);
      ctx.fillRect(bodyX + 8.3 * s, y - 16 * s, 3.2 * s, 5 * s);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(bodyX - 12 * s, y - 14 * s, 3.5 * s, 2.2 * s);
      ctx.fillRect(bodyX + 8.5 * s, y - 14 * s, 3.5 * s, 2.2 * s);
      const spikeOffsets = [[-5.5, -17], [3, -17], [-6.5, -13.5], [4, -13.5], [-1.2, -15]];
      for (const [ox, oy] of spikeOffsets) {
        ctx.fillStyle = '#d97706';
        ctx.fillRect(bodyX + (ox - 0.4) * s, y + (oy + 0.5) * s, 3.2 * s, 2.2 * s);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bodyX + ox * s, y + oy * s, 2.4 * s, 2.6 * s);
      }
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(headX - 6.5 * s, y - 25 * s, 13 * s, 6.5 * s);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(headX - 5.5 * s, y - 27.5 * s, 11 * s, 5.5 * s);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(headX - 8 * s, y - 25.5 * s, 2.5 * s, 2.5 * s);
      ctx.fillRect(headX + 5.5 * s, y - 25.5 * s, 2.5 * s, 2.5 * s);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(headX - 9.5 * s, y - 28.5 * s, 3 * s, 4.5 * s);
      ctx.fillRect(headX + 6.5 * s, y - 28.5 * s, 3 * s, 4.5 * s);
    } else if (id === 5) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bodyX - 7.5 * s, y - 16 * s, 15 * s, 7 * s);
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(bodyX - 6.5 * s, y - 16.5 * s, 13 * s, 7.5 * s);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(bodyX - 6.5 * s, y - 16.5 * s, 13 * s, 1.2 * s);
      ctx.fillRect(bodyX - 1 * s, y - 16.5 * s, 2 * s, 7.5 * s);
      ctx.fillStyle = kart.info.skin;
      ctx.fillRect(headX - 5 * s, y - 21 * s, 10 * s, 4.5 * s);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(headX - 9.5 * s, y - 24 * s, 19 * s, 4 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX - 9 * s, y - 28.5 * s, 18 * s, 7.5 * s);
      ctx.fillRect(headX - 6.5 * s, y - 30 * s, 13 * s, 2.5 * s);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(headX - 8.2 * s, y - 27 * s, 4.2 * s, 4.5 * s);
      ctx.fillRect(headX + 4 * s, y - 27 * s, 4.2 * s, 4.5 * s);
      ctx.fillRect(headX - 2.2 * s, y - 28.5 * s, 4.4 * s, 5 * s);
      ctx.fillStyle = '#fecaca';
      ctx.fillRect(headX - 1.2 * s, y - 27.5 * s, 1.6 * s, 1.6 * s);
    } else if (id === 6) {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(bodyX - 7.5 * s, y - 17 * s, 15 * s, 8.5 * s);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(bodyX - 4.5 * s, y - 15.5 * s, 9 * s, 5.5 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bodyX - 8 * s, y - 17 * s, 16 * s, 1.2 * s);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(bodyX - 9.5 * s + steerShift * 0.2, y - 15 * s, 2.5 * s, 3.5 * s);
      ctx.fillRect(bodyX + 7 * s + steerShift * 0.2, y - 15 * s, 2.5 * s, 3.5 * s);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(headX - 6 * s, y - 23.5 * s, 12 * s, 6.5 * s);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(headX - 5 * s, y - 25.5 * s, 10 * s, 5 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX - 4.5 * s, y - 27 * s, 4 * s, 3 * s);
      ctx.fillRect(headX + 0.5 * s, y - 27 * s, 4 * s, 3 * s);
    } else {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(bodyX - 10 * s, y - 17 * s, 20 * s, 8.5 * s);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(bodyX - 11 * s, y - 15.5 * s, 3.5 * s, 5.5 * s);
      ctx.fillRect(bodyX + 7.5 * s, y - 15.5 * s, 3.5 * s, 5.5 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bodyX - 6.5 * s, y - 17 * s, 13 * s, 8 * s);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(bodyX - 6.5 * s, y - 17 * s, 13 * s, 1.2 * s);
      ctx.fillRect(bodyX - 1.5 * s, y - 14.5 * s, 3 * s, 4 * s);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(headX - 7.8 * s, y - 23 * s, 15.6 * s, 3.5 * s);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(headX - 6.2 * s, y - 26 * s, 12.4 * s, 8.5 * s);
      ctx.fillRect(headX - 2.5 * s, y - 28 * s, 5 * s, 2.5 * s);
    }

    // Front-facing facial expressions (at crossroads or Battle face-offs!)
    if (cosRel < -0.15 || kart.spinTimer > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX - 4.2 * s, y - 22 * s, 2.8 * s, 2.8 * s);
      ctx.fillRect(headX + 1.4 * s, y - 22 * s, 2.8 * s, 2.8 * s);
      ctx.fillStyle = id === 4 ? '#ef4444' : '#0f172a';
      ctx.fillRect(headX - 3.5 * s, y - 21.5 * s, 1.8 * s, 2 * s);
      ctx.fillRect(headX + 1.7 * s, y - 21.5 * s, 1.8 * s, 2 * s);
      if (id === 0 || id === 1) {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(headX - 4.5 * s, y - 19 * s, 9 * s, 1.8 * s);
      }
    }

    // Battle Mode: 3 Glossy Floating Balloons tethered behind every fighter!
    if (isBattle) {
      this.drawBattleBalloons(ctx, x, y, s, kart, time);
    }

    // Lakitu 3D Rescue Sprite
    if (kart.rescueState === 'RESCUING') {
      this.drawLakituSprite(ctx, x, y - 40 * s, s * 1.15, x, y - 20 * s);
    }

    // Crisp Overhead Name & Status Tag for Rivals
    if (kart !== camKart && sp.cz < 520 && s > 0.30) {
      const tagY = y - (isBattle ? 48 : 33) * s;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      const label = isBattle ? `${kart.info.short} ${'♥'.repeat(kart.lives)}` : `${kart.rank}.${kart.info.short}`;
      const pillW = isBattle ? 68 : 48;
      ctx.fillStyle = 'rgba(9, 13, 22, 0.82)';
      ctx.fillRect(x - pillW * 0.5, tagY - 11, pillW, 14);
      ctx.fillStyle = kart.isHuman ? '#ffe600' : '#38bdf8';
      ctx.fillText(label, x, tagY);
    }
  }

  drawLakituSprite(ctx, lx, ly, s, hookTargetX, hookTargetY) {
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = Math.max(1.5, 1.8 * s);
    ctx.beginPath();
    ctx.moveTo(lx + 10 * s, ly - 4 * s);
    ctx.lineTo(hookTargetX, hookTargetY);
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(lx, ly - 9 * s, 6 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(lx - 5 * s, ly - 15 * s, 10 * s, 3 * s);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = Math.max(1.2, 1.4 * s);
    ctx.strokeRect(lx - 5 * s, ly - 11 * s, 4 * s, 3 * s);
    ctx.strokeRect(lx + 1 * s, ly - 11 * s, 4 * s, 3 * s);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(lx - 6 * s, ly, 6 * s, 0, Math.PI * 2);
    ctx.arc(lx + 6 * s, ly, 6 * s, 0, Math.PI * 2);
    ctx.arc(lx, ly - 2 * s, 7.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  renderPlayerHUD(world, hudKart, camKart, sx, sy, sw, sh) {
    const ctx = this.ctx;
    const isBattle = world.gameMode === 'BATTLE';
    ctx.save();

    const pColor = hudKart.playerIndex === 0 ? '#ef4444' : '#22c55e';
    ctx.fillStyle = 'rgba(11, 15, 28, 0.86)';
    ctx.fillRect(sx + 16, sy + 14, 198, 72);
    ctx.strokeStyle = pColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 16, sy + 14, 198, 72);

    ctx.fillStyle = pColor;
    ctx.font = '900 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(hudKart.name, sx + 26, sy + 33);

    if (isBattle) {
      // Draw 3 Glossy Balloon Life Indicators
      for (let i = 0; i < 3; i++) {
        const bx = sx + 35 + i * 24;
        const by = sy + 52;
        if (i < hudKart.lives) {
          ctx.fillStyle = i === 0 ? '#ef4444' : (i === 1 ? '#facc15' : '#38bdf8');
          ctx.beginPath();
          ctx.ellipse(bx, by, 7, 8.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.beginPath();
          ctx.arc(bx - 2.5, by - 2.5, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(bx, by, 6.5, 8, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.fillStyle = '#ffe600';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`KOs:${hudKart.kosScored}  HITS:${hudKart.hitsScored}`, sx + 104, sy + 56);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 12px monospace';
      const kmh = Math.round(Math.abs(camKart.speed) * 0.95);
      ctx.fillText(hudKart.eliminated ? 'STATUS: ELIMINATED' : `SPEED: ${kmh} km/h`, sx + 26, sy + 77);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`LAP  ${hudKart.lap} / ${world.totalLaps}`, sx + 26, sy + 54);
      ctx.fillStyle = '#ffe600';
      ctx.font = 'bold 13px monospace';
      const kmh = Math.round(Math.abs(hudKart.speed) * 0.95);
      ctx.fillText(`🪙 ${hudKart.coins.toString().padStart(2, '0')}   ${kmh} km/h`, sx + 26, sy + 76);
    }

    // Item Roulette Box Top-Center
    const boxX = sx + sw * 0.5 - 34;
    const boxY = sy + 14;
    ctx.fillStyle = 'rgba(11, 15, 28, 0.88)';
    ctx.fillRect(boxX, boxY, 68, 68);
    ctx.strokeStyle = camKart.heldItem ? '#ffe600' : '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, 68, 68);

    ctx.textAlign = 'center';
    if (!hudKart.eliminated && hudKart.heldItem) {
      const icons = {
        MUSHROOM: { sym: '🍄', label: 'BOOST' },
        GREEN_SHELL: { sym: '🟢', label: 'SHELL' },
        RED_SHELL: { sym: '🔴', label: 'HOMING' },
        BANANA: { sym: '🍌', label: 'PEEL' },
        STAR: { sym: '⭐', label: 'STAR' },
        LIGHTNING: { sym: '⚡', label: 'BOLT' }
      };
      const info = icons[hudKart.heldItem] || { sym: '?', label: 'ITEM' };
      ctx.font = '26px sans-serif';
      ctx.fillText(info.sym, boxX + 34, boxY + 39);
      ctx.fillStyle = '#ffe600';
      ctx.font = '900 10px monospace';
      ctx.fillText(info.label, boxX + 34, boxY + 60);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(hudKart.eliminated ? 'OUT' : 'ITEM', boxX + 34, boxY + 39);
    }

    // Power-Up / Combat Toast under Item Box
    if (!hudKart.eliminated && hudKart.itemNotifyTimer > 0) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(sx + sw * 0.5 - 102, sy + 88, 204, 24);
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx + sw * 0.5 - 102, sy + 88, 204, 24);
      ctx.fillStyle = '#ffe600';
      ctx.font = '900 11.5px monospace';
      ctx.fillText(hudKart.itemNotifyText, sx + sw * 0.5, sy + 104);
    }

    // Top-Right Badge: Survivors in Battle Mode OR Rank in Race Mode
    const rx = sx + sw - 22;
    ctx.textAlign = 'right';
    if (isBattle) {
      const aliveCount = world.getAliveKarts().length;
      ctx.fillStyle = 'rgba(11, 15, 28, 0.86)';
      ctx.fillRect(sx + sw - 134, sy + 14, 118, 62);
      ctx.strokeStyle = aliveCount <= 2 ? '#ffe600' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + sw - 134, sy + 14, 118, 62);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '900 11px monospace';
      ctx.fillText('SURVIVORS', rx - 4, sy + 33);
      ctx.fillStyle = aliveCount <= 2 ? '#ffe600' : '#4ade80';
      ctx.font = '900 32px monospace';
      ctx.fillText(`${aliveCount}/8`, rx - 4, sy + 66);
    } else {
      const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th'];
      const rankColors = ['#ffe600', '#e2e8f0', '#f59e0b', '#38bdf8', '#94a3b8', '#94a3b8', '#94a3b8', '#ef4444'];
      ctx.fillStyle = rankColors[hudKart.rank - 1] || '#ffffff';
      ctx.font = '900 44px monospace';
      ctx.shadowColor = '#000';
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fillText(`${hudKart.rank}${suffixes[hudKart.rank - 1]}`, rx, sy + 56);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Hideout "Zero Advantage" reminder if camping in cover > 3.5s
    if (isBattle && !hudKart.eliminated && hudKart.inHideout && hudKart.inHideoutTimer > 3.5) {
      const bx = sx + sw * 0.5;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(bx - 165, sy + sh - 78, 330, 28);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx - 165, sy + sh - 78, 330, 28);
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.font = 'bold 11.5px monospace';
      ctx.fillText('🛡 COVER ZONE — NO POWER-UPS HERE! RUSH ARENA!', bx, sy + sh - 60);
    }

    // Eliminated Spectator Banner in Battle Mode
    if (isBattle && hudKart.eliminated && world.state !== 'FINISHED') {
      const bx = sx + sw * 0.5;
      const by = sy + 165;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.fillRect(bx - 180, by - 32, 360, 68);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(bx - 180, by - 32, 360, 68);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 18px monospace';
      ctx.fillText('💥 ELIMINATED — OUT OF LIVES!', bx, by - 6);
      ctx.fillStyle = '#ffe600';
      ctx.font = 'bold 12px monospace';
      const swKey = hudKart.playerIndex === 0 ? 'Q/E' : 'ENTER';
      ctx.fillText(`SPECTATING: ${camKart.info.name} (PRESS ${swKey} TO SWITCH)`, bx, by + 20);
    }

    // Lakitu 2.0-Second Rescue Banner
    if (!hudKart.eliminated && hudKart.rescueState === 'RESCUING') {
      const rem = Math.max(0, 2.0 - hudKart.rescueTimer).toFixed(1);
      const bx = sx + sw * 0.5;
      const by = sy + 175;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(bx - 145, by - 36, 290, 74);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(bx - 145, by - 36, 290, 74);

      this.drawLakituSprite(ctx, bx - 105, by - 4, 2.0, bx - 90, by + 30);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 16px monospace';
      ctx.fillText('LAKITU HAZARD RESCUE!', bx + 18, by - 8);
      ctx.fillStyle = '#ffe600';
      ctx.font = '900 15px monospace';
      ctx.fillText(`2s PENALTY: ${rem}s`, bx + 18, by + 18);
    }

    // Wrong-Way Warning Banner (Race Mode only)
    if (!isBattle && hudKart.wrongWay && hudKart.rescueState === 'NONE' && !hudKart.finished) {
      const flash = Math.floor(world.raceTime * 6) & 1;
      const bx = sx + sw * 0.5;
      const by = sy + 180;
      ctx.fillStyle = flash ? 'rgba(220, 38, 38, 0.92)' : 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(bx - 135, by - 32, 270, 64);
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 3;
      ctx.strokeRect(bx - 135, by - 32, 270, 64);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe600';
      ctx.font = '900 22px monospace';
      ctx.fillText('↩ WRONG WAY! ↩', bx, by - 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('TURN AROUND!', bx, by + 20);
    }

    // Drift Turbo Meter
    if (!hudKart.eliminated && hudKart.drifting) {
      const barW = 126;
      const barX = sx + sw * 0.5 - barW * 0.5;
      const barY = sy + sh - 34;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(barX, barY, barW, 12);
      const ratio = Math.min(1, hudKart.driftCharge / 1.40);
      ctx.fillStyle = hudKart.driftCharge >= 1.40 ? '#ffe600' : (hudKart.driftCharge >= 0.70 ? '#38bdf8' : '#94a3b8');
      ctx.fillRect(barX + 2, barY + 2, (barW - 4) * ratio, 8);
    }

    if (!isBattle && hudKart.finished && world.state !== 'FINISHED') {
      const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th'];
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(sx + sw * 0.5 - 130, sy + sh * 0.42, 260, 58);
      ctx.strokeStyle = '#ffe600';
      ctx.strokeRect(sx + sw * 0.5 - 130, sy + sh * 0.42, 260, 58);
      ctx.fillStyle = '#ffe600';
      ctx.textAlign = 'center';
      ctx.font = '900 24px monospace';
      ctx.fillText(`FINISHED ${hudKart.rank}${suffixes[hudKart.rank - 1]}!`, sx + sw * 0.5, sy + sh * 0.42 + 37);
    }

    ctx.restore();
  }

  renderCenterMinimap(world, centerX, centerY) {
    const ctx = this.ctx;
    const mapSize = 148;
    const x0 = centerX - mapSize * 0.5;
    const y0 = centerY - mapSize * 0.5;

    ctx.save();
    ctx.fillStyle = '#090d16';
    ctx.fillRect(x0 - 4, y0 - 4, mapSize + 8, mapSize + 8);
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 2;
    ctx.strokeRect(x0 - 4, y0 - 4, mapSize + 8, mapSize + 8);

    ctx.drawImage(this.minimapCanvas, x0, y0, mapSize, mapSize);

    const scale = mapSize / world.track.size;

    // In Battle Mode, show active open-arena Power-Up boxes as blinking gold gems on radar!
    if (world.gameMode === 'BATTLE') {
      const pulse = (Math.floor(world.raceTime * 5) & 1) ? '#ffe600' : '#f59e0b';
      ctx.fillStyle = pulse;
      for (const box of world.track.itemBoxes) {
        if (!box.active) continue;
        ctx.fillRect(x0 + box.x * scale - 1.5, y0 + box.y * scale - 1.5, 3, 3);
      }
    }

    // Draw ONLY active (non-eliminated) karts on radar
    for (let i = world.karts.length - 1; i >= 0; i--) {
      const k = world.karts[i];
      if (k.eliminated) continue;
      const kx = x0 + k.x * scale;
      const ky = y0 + k.y * scale;
      ctx.fillStyle = k.info.color;
      ctx.beginPath();
      ctx.arc(kx, ky, k.isHuman ? 4.8 : 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = k.isHuman ? '#ffffff' : '#000000';
      ctx.lineWidth = k.isHuman ? 1.6 : 1.0;
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
    ctx.fillRect(centerX - 104, y0 - 28, 208, 20);
    ctx.fillStyle = world.gameMode === 'BATTLE' ? '#f472b6' : '#38bdf8';
    ctx.font = 'bold 10.5px monospace';
    ctx.textAlign = 'center';
    const prefix = world.gameMode === 'BATTLE' ? '⚔ ' : '';
    ctx.fillText(`${prefix}${world.track.def.name.toUpperCase()}`, centerX, y0 - 14);

    ctx.restore();
  }

  renderCountdownBanner(world) {
    if (world.state !== 'COUNTDOWN' && world.raceTime > 1.0) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';

    const cx = 640;
    const cy = 220;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(cx - 105, cy - 55, 210, 95);
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 105, cy - 55, 210, 95);

    if (world.state === 'COUNTDOWN') {
      const sec = Math.ceil(world.countdown);
      for (let i = 0; i < 3; i++) {
        const active = (3 - i) === sec;
        ctx.fillStyle = active ? '#ef4444' : '#334155';
        ctx.beginPath();
        ctx.arc(cx - 50 + i * 50, cy - 18, 15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffe600';
      ctx.font = '900 22px monospace';
      ctx.fillText(world.gameMode === 'BATTLE' ? `BATTLE IN: ${Math.max(1, sec)}` : `GET READY: ${Math.max(1, sec)}`, cx, cy + 26);
    } else {
      ctx.fillStyle = '#22c55e';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(cx - 50 + i * 50, cy - 18, 15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 28px monospace';
      ctx.fillText(world.gameMode === 'BATTLE' ? 'FIGHT!!' : 'GO! GO! GO!', cx, cy + 28);
    }

    ctx.restore();
  }
}

window.Mode7Renderer = Mode7Renderer;
