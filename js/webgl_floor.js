// Hardware-Accelerated WebGL 1.0 Full-HD Mode-7 Floor + True 3D Textured Battle Walls Renderer
// Built for silky-smooth 60 FPS on Intel HD 4600 / integrated GPUs with automatic CPU fallback!

const PROJ = {
  VP_W: 640,
  VP_H: 720,
  HORIZON_Y: 196,
  FOCAL: 360,
  CAM_DIST: 26,
  BASE_CAM_H: 23
};

window.PROJ = PROJ;

class WebGLSceneRenderer {
  constructor(glCanvas) {
    this.canvas = glCanvas;
    this.available = false;
    this.enabled = true;
    this.gl = null;

    if (!glCanvas) return;
    const opts = { alpha: true, antialias: true, depth: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' };
    const gl = glCanvas.getContext('webgl', opts) || glCanvas.getContext('experimental-webgl', opts);
    if (!gl) return;

    this.gl = gl;
    try {
      this.initFloorProgram();
      this.initWallProgram();
      this.groundTex = this.createTexture(gl.LINEAR, gl.CLAMP_TO_EDGE);
      this.wallTex = this.createTexture(gl.LINEAR, gl.REPEAT);
      this.uploadedKey = '';
      this.wallVertCount = 0;
      this.wallBuffer = gl.createBuffer();
      this.available = true;
    } catch (err) {
      console.warn('WebGL init fallback to CPU:', err);
      this.available = false;
    }
  }

  compileShader(type, src) {
    const gl = this.gl;
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
  }

  createProgram(vsSrc, fsSrc) {
    const gl = this.gl;
    const p = gl.createProgram();
    gl.attachShader(p, this.compileShader(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, this.compileShader(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p));
    }
    return p;
  }

  createTexture(filter, wrap) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    return tex;
  }

  initFloorProgram() {
    const gl = this.gl;
    const vs = `
      attribute vec2 aPos;
      varying vec2 vUv;
      void main() {
        vUv = aPos * 0.5 + 0.5;
        gl_Position = vec4(aPos, 0.999, 1.0);
      }
    `;
    const fs = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uGroundTex;
      uniform vec3 uCam;        // camX, camY, camHeight
      uniform vec2 uDir;        // cosA, sinA
      uniform vec3 uFogColor;
      uniform vec3 uOutColor;
      uniform float uTime;
      uniform float uThemeShimmer;

      void main() {
        // Convert viewport UV (0..1 bottom-to-top) to pixel coords (0..640, 0..720 top-to-bottom)
        float px = vUv.x * 640.0;
        float py = (1.0 - vUv.y) * 720.0;

        if (py <= 196.0) {
          discard;
        }

        float dy = (py - 196.0) + 0.5;
        float cz = (uCam.z * 360.0) / dy;
        float cx = (px - 320.0) * (cz / 360.0);

        float cosA = uDir.x;
        float sinA = uDir.y;
        float wx = uCam.x + cosA * cz - sinA * cx;
        float wy = uCam.y + sinA * cz + cosA * cx;

        vec3 col;
        if (wx >= 0.0 && wx <= 1024.0 && wy >= 0.0 && wy <= 1024.0) {
          vec2 uv = vec2(wx / 1024.0, wy / 1024.0);
          col = texture2D(uGroundTex, uv).rgb;

          // Subtle micro-detail & crisp surface texture boost close to camera
          float nearFactor = clamp(1.0 - cz / 240.0, 0.0, 1.0);
          float micro = (sin(wx * 0.9) * cos(wy * 0.9)) * 0.022 * nearFactor;
          col += micro;

          // Animated boost pad & neon/water/lava glow pulse
          if (col.r > 0.92 && col.g > 0.80 && col.b < 0.25) {
            float pulse = 0.14 * sin(uTime * 11.0 - (wx + wy) * 0.12);
            col += vec3(pulse, pulse * 0.8, 0.0);
          } else if (uThemeShimmer > 0.5) {
            float wave = 0.04 * sin(uTime * 3.5 + wx * 0.06 + wy * 0.05);
            col += vec3(wave * 0.4, wave * 0.7, wave);
          }
        } else {
          // Distant out-of-bounds checkerboard fade
          float chk = mod(floor(wx / 32.0) + floor(wy / 32.0), 2.0);
          col = uOutColor * (0.92 + 0.08 * chk);
        }

        // Smooth exponential atmospheric horizon fog (eliminates aliasing & adds lush 3D depth!)
        float fog = 1.0 - exp(-pow(cz / 560.0, 1.75));
        fog = clamp(fog, 0.0, 0.92);
        col = mix(col, uFogColor, fog);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    this.floorProg = this.createProgram(vs, fs);
    this.floorQuad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.floorQuad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    this.fLoc = {
      aPos: gl.getAttribLocation(this.floorProg, 'aPos'),
      uGroundTex: gl.getUniformLocation(this.floorProg, 'uGroundTex'),
      uCam: gl.getUniformLocation(this.floorProg, 'uCam'),
      uDir: gl.getUniformLocation(this.floorProg, 'uDir'),
      uFogColor: gl.getUniformLocation(this.floorProg, 'uFogColor'),
      uOutColor: gl.getUniformLocation(this.floorProg, 'uOutColor'),
      uTime: gl.getUniformLocation(this.floorProg, 'uTime'),
      uThemeShimmer: gl.getUniformLocation(this.floorProg, 'uThemeShimmer')
    };
  }

  initWallProgram() {
    const vs = `
      attribute vec3 aPos;    // wx, wy, wz
      attribute vec2 aUv;     // u, v
      attribute float aShade; // directional face light * bottom AO
      attribute float aRoof;  // 1.0 if roof cap, 0.0 if vertical wall

      uniform vec3 uCam;      // camX, camY, camHeight
      uniform vec2 uDir;      // cosA, sinA

      varying vec2 vUv;
      varying float vShade;
      varying float vDepth;
      varying float vRoof;

      void main() {
        float dx = aPos.x - uCam.x;
        float dy = aPos.y - uCam.y;
        float cosA = uDir.x;
        float sinA = uDir.y;

        float cz = dx * cosA + dy * sinA;
        float cx = dx * (-sinA) + dy * cosA;

        // Exact matching projection with Mode-7 floor & 2D sprites (VP_W=640, VP_H=720, HORIZON=196, FOCAL=360)
        float clipX = cx * (360.0 / 320.0);
        float clipY = cz * (328.0 / 720.0) - (uCam.z - aPos.z);

        // Perspective depth mapping near=2.0, far=1400.0
        float A = (1400.0 + 2.0) / (1400.0 - 2.0);
        float B = (-2.0 * 1400.0 * 2.0) / (1400.0 - 2.0);
        float clipZ = A * cz + B;

        gl_Position = vec4(clipX, clipY, clipZ, cz);
        vUv = aUv;
        vShade = aShade;
        vDepth = cz;
        vRoof = aRoof;
      }
    `;
    const fs = `
      precision highp float;
      varying vec2 vUv;
      varying float vShade;
      varying float vDepth;
      varying float vRoof;

      uniform sampler2D uWallTex;
      uniform vec3 uFogColor;
      uniform vec3 uRoofTint;

      void main() {
        vec3 texCol = texture2D(uWallTex, vUv).rgb;
        vec3 baseCol = mix(texCol, texCol * 0.55 + uRoofTint * 0.45, vRoof);
        vec3 col = baseCol * vShade;

        float fog = 1.0 - exp(-pow(max(0.0, vDepth) / 620.0, 1.75));
        fog = clamp(fog, 0.0, 0.90);
        col = mix(col, uFogColor, fog);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    this.wallProg = this.createProgram(vs, fs);
    this.wLoc = {
      aPos: gl.getAttribLocation(this.wallProg, 'aPos'),
      aUv: gl.getAttribLocation(this.wallProg, 'aUv'),
      aShade: gl.getAttribLocation(this.wallProg, 'aShade'),
      aRoof: gl.getAttribLocation(this.wallProg, 'aRoof'),
      uCam: gl.getUniformLocation(this.wallProg, 'uCam'),
      uDir: gl.getUniformLocation(this.wallProg, 'uDir'),
      uWallTex: gl.getUniformLocation(this.wallProg, 'uWallTex'),
      uFogColor: gl.getUniformLocation(this.wallProg, 'uFogColor'),
      uRoofTint: gl.getUniformLocation(this.wallProg, 'uRoofTint')
    };
  }

  generateWallTextureCanvas(style) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');

    if (style === 'brick_fort') {
      // Classic Block Fort vibrant terracotta/gold stone blocks with bevels
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 0, 128, 128);
      for (let row = 0; row < 4; row++) {
        const y = row * 32;
        const off = (row & 1) ? 32 : 0;
        for (let col = -1; col < 3; col++) {
          const x = col * 64 + off;
          ctx.fillStyle = row === 0 ? '#f59e0b' : ((row + col) & 1 ? '#d97706' : '#c2410c');
          ctx.fillRect(x + 2, y + 2, 60, 28);
          ctx.fillStyle = 'rgba(255,255,255,0.22)';
          ctx.fillRect(x + 2, y + 2, 60, 4);
          ctx.fillRect(x + 2, y + 2, 4, 28);
          ctx.fillStyle = 'rgba(0,0,0,0.28)';
          ctx.fillRect(x + 2, y + 26, 60, 4);
        }
      }
    } else if (style === 'stone_moss') {
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, 128, 128);
      for (let row = 0; row < 4; row++) {
        const y = row * 32;
        const off = (row & 1) ? 24 : 0;
        for (let col = -1; col < 4; col++) {
          const x = col * 48 + off;
          ctx.fillStyle = ((row + col) & 1) ? '#94a3b8' : '#64748b';
          ctx.fillRect(x + 2, y + 2, 44, 28);
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(x + 2, y + 2, 44, 4);
        }
      }
      // Moss vine trim along top edge
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, 0, 128, 14);
      ctx.fillStyle = '#15803d';
      for (let i = 0; i < 128; i += 16) ctx.fillRect(i + 4, 12, 8, 10 + (i % 9));
    } else if (style === 'beach_wood') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, 128, 128);
      for (let x = 0; x < 128; x += 16) {
        ctx.fillStyle = (x & 16) ? '#b45309' : '#92400e';
        ctx.fillRect(x + 1, 0, 14, 128);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 2, 0, 3, 128);
      }
      ctx.fillStyle = '#facc15';
      ctx.fillRect(0, 18, 128, 8);
      ctx.fillRect(0, 98, 128, 8);
    } else if (style === 'castle_obsidian') {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, 128, 128);
      for (let row = 0; row < 4; row++) {
        const y = row * 32;
        const off = (row & 1) ? 32 : 0;
        for (let col = -1; col < 3; col++) {
          const x = col * 64 + off;
          ctx.fillStyle = ((row + col) & 1) ? '#3f3f46' : '#27272a';
          ctx.fillRect(x + 2, y + 2, 60, 28);
          ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
          ctx.fillRect(x + 2, y + 27, 60, 3);
        }
      }
      ctx.fillStyle = '#f97316';
      ctx.fillRect(0, 0, 128, 6);
    } else if (style === 'ice_crystal') {
      const grad = ctx.createLinearGradient(0, 0, 128, 128);
      grad.addColorStop(0, '#bae6fd');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, 120, 120);
      ctx.beginPath();
      ctx.moveTo(0, 64); ctx.lineTo(64, 0);
      ctx.moveTo(64, 128); ctx.lineTo(128, 64);
      ctx.moveTo(0, 128); ctx.lineTo(128, 0);
      ctx.stroke();
    } else if (style === 'hedge_maze') {
      ctx.fillStyle = '#14532d';
      ctx.fillRect(0, 0, 128, 128);
      for (let y = 0; y < 128; y += 12) {
        for (let x = 0; x < 128; x += 12) {
          const hash = (x * 13 + y * 29) & 3;
          ctx.fillStyle = hash === 0 ? '#22c55e' : (hash === 1 ? '#166534' : '#15803d');
          ctx.fillRect(x + 1, y + 1, 10, 10);
        }
      }
      // Spooky glowing purple berries
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(24, 30, 5, 5);
      ctx.fillRect(88, 74, 5, 5);
      ctx.fillRect(52, 98, 5, 5);
    } else if (style === 'sandstone') {
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(0, 0, 128, 128);
      const bands = ['#c2410c', '#ea580c', '#d97706', '#b45309', '#9a3412', '#ea580c'];
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = bands[i];
        ctx.fillRect(0, i * 22, 128, 20);
      }
      ctx.fillStyle = 'rgba(255,240,180,0.22)';
      ctx.fillRect(0, 0, 128, 10);
    } else if (style === 'neon_cyber') {
      ctx.fillStyle = '#0f0728';
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 120, 120);
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 88, 88);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, 62, 128, 4);
      ctx.fillRect(62, 0, 4, 128);
    } else if (style === 'marble_gold') {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 128, 128);
      for (let x = 0; x < 128; x += 32) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x + 4, 16, 24, 96);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x + 24, 16, 4, 96);
      }
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, 0, 128, 14);
      ctx.fillRect(0, 114, 128, 14);
    } else {
      // rainbow_prism
      const grad = ctx.createLinearGradient(0, 0, 128, 128);
      grad.addColorStop(0, '#ec4899');
      grad.addColorStop(0.25, '#f59e0b');
      grad.addColorStop(0.5, '#22c55e');
      grad.addColorStop(0.75, '#38bdf8');
      grad.addColorStop(1, '#a855f7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 120, 120);
      ctx.strokeRect(32, 32, 64, 64);
    }
    return c;
  }

  getRoofTint(style) {
    const map = {
      brick_fort: [0.95, 0.72, 0.25],
      stone_moss: [0.30, 0.76, 0.36],
      beach_wood: [0.85, 0.62, 0.25],
      castle_obsidian: [0.32, 0.14, 0.14],
      ice_crystal: [0.85, 0.96, 1.0],
      hedge_maze: [0.16, 0.62, 0.28],
      sandstone: [0.92, 0.56, 0.28],
      neon_cyber: [0.18, 0.85, 0.96],
      marble_gold: [0.98, 0.94, 0.72],
      rainbow_prism: [0.95, 0.88, 1.0]
    };
    return map[style] || [0.8, 0.8, 0.85];
  }

  uploadTrack(track) {
    if (!this.available) return;
    const key = `${track.isArena ? 'A' : 'T'}_${track.def.id}`;
    if (this.uploadedKey === key) return;
    this.uploadedKey = key;

    const gl = this.gl;
    // 1. Upload 1024x1024 Ground Texture
    gl.bindTexture(gl.TEXTURE_2D, this.groundTex);
    const bytes = new Uint8Array(track.texPixels.buffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, track.size, track.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);

    // 2. Upload 3D Wall Texture & Build Static 3D Wall Geometry Mesh
    const style = track.def.wallStyle || 'brick_fort';
    const wallCanvas = this.generateWallTextureCanvas(style);
    gl.bindTexture(gl.TEXTURE_2D, this.wallTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wallCanvas);

    const verts = []; // stride 7 floats: wx, wy, wz, u, v, shade, isRoof
    const pushQuad = (p0, p1, p2, p3, uMax, vMax, light, aoBottom, isRoof) => {
      const topShade = light;
      const botShade = isRoof ? light : light * aoBottom;
      // Triangle 1: p0(bot-left), p1(bot-right), p2(top-right)
      verts.push(
        p0[0], p0[1], p0[2], 0, vMax, botShade, isRoof,
        p1[0], p1[1], p1[2], uMax, vMax, botShade, isRoof,
        p2[0], p2[1], p2[2], uMax, 0, topShade, isRoof,
        // Triangle 2: p0(bot-left), p2(top-right), p3(top-left)
        p0[0], p0[1], p0[2], 0, vMax, botShade, isRoof,
        p2[0], p2[1], p2[2], uMax, 0, topShade, isRoof,
        p3[0], p3[1], p3[2], 0, 0, topShade, isRoof
      );
    };

    if (track.walls && track.walls.length > 0) {
      for (const w of track.walls) {
        const x0 = w.x;
        const x1 = w.x + w.w;
        const y0 = w.y;
        const y1 = w.y + w.h;
        const h = w.height || 34;
        const uW = Math.max(1, w.w / 42);
        const uH = Math.max(1, w.h / 42);
        const vH = Math.max(1, h / 32);

        // North face (y = y0)
        pushQuad([x0, y0, 0], [x1, y0, 0], [x1, y0, h], [x0, y0, h], uW, vH, 1.0, 0.56, 0.0);
        // South face (y = y1)
        pushQuad([x1, y1, 0], [x0, y1, 0], [x0, y1, h], [x1, y1, h], uW, vH, 0.88, 0.56, 0.0);
        // West face (x = x0)
        pushQuad([x0, y1, 0], [x0, y0, 0], [x0, y0, h], [x0, y1, h], uH, vH, 0.72, 0.56, 0.0);
        // East face (x = x1)
        pushQuad([x1, y0, 0], [x1, y1, 0], [x1, y1, h], [x1, y0, h], uH, vH, 0.80, 0.56, 0.0);
        // Top Roof Cap (z = h)
        pushQuad([x0, y0, h], [x1, y0, h], [x1, y1, h], [x0, y1, h], uW, uH, 1.12, 1.0, 1.0);
      }
    }

    this.wallVertCount = verts.length / 7;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.wallBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  }

  getOutColor(theme) {
    if (theme === 'grass' || theme === 'crossroads' || theme === 'arena_meadow') return [0.09, 0.47, 0.16];
    if (theme === 'beach' || theme === 'arena_beach') return [0.05, 0.41, 0.78];
    if (theme === 'arena_ice') return [0.45, 0.75, 0.92];
    if (theme === 'arena_desert') return [0.68, 0.40, 0.20];
    if (theme === 'arena_sky') return [0.78, 0.88, 0.98];
    return [0.08, 0.06, 0.14];
  }

  renderSplitScreen(world, camKart1, camKart2) {
    if (!this.available || !this.enabled || !world.track) return false;
    this.uploadTrack(world.track);

    const gl = this.gl;
    gl.enable(gl.SCISSOR_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.scissor(0, 0, 1280, 720);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.renderSingleViewport(world, camKart1, 0, 0, 640, 720);
    this.renderSingleViewport(world, camKart2, 640, 0, 640, 720);

    gl.disable(gl.SCISSOR_TEST);
    return true;
  }

  renderSingleViewport(world, camKart, vx, vy, vw, vh) {
    const gl = this.gl;
    const track = world.track;
    const cosA = Math.cos(camKart.angle);
    const sinA = Math.sin(camKart.angle);
    const camX = camKart.x - cosA * PROJ.CAM_DIST;
    const camY = camKart.y - sinA * PROJ.CAM_DIST;
    const camH = PROJ.BASE_CAM_H + camKart.z * 0.35;
    const fog = track.def.fogColor || [0.5, 0.7, 0.9];
    const outCol = this.getOutColor(track.def.theme);
    const shimmer = (track.def.theme.includes('beach') || track.def.theme.includes('ice') || track.def.theme.includes('cyber') || track.def.theme.includes('rainbow')) ? 1.0 : 0.0;

    gl.viewport(vx, vy, vw, vh);
    gl.scissor(vx, vy, vw, vh);

    // Pass 1: Mode-7 Perspective Floor
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.floorProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.floorQuad);
    gl.enableVertexAttribArray(this.fLoc.aPos);
    gl.vertexAttribPointer(this.fLoc.aPos, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.groundTex);
    gl.uniform1i(this.fLoc.uGroundTex, 0);
    gl.uniform3f(this.fLoc.uCam, camX, camY, camH);
    gl.uniform2f(this.fLoc.uDir, cosA, sinA);
    gl.uniform3f(this.fLoc.uFogColor, fog[0], fog[1], fog[2]);
    gl.uniform3f(this.fLoc.uOutColor, outCol[0], outCol[1], outCol[2]);
    gl.uniform1f(this.fLoc.uTime, world.raceTime);
    gl.uniform1f(this.fLoc.uThemeShimmer, shimmer);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Pass 2: True 3D Textured Battle Arena Walls & Roofs (Hardware Z-Buffered!)
    if (this.wallVertCount > 0) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.DEPTH_BUFFER_BIT);

      gl.useProgram(this.wallProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.wallBuffer);
      const stride = 7 * 4;
      gl.enableVertexAttribArray(this.wLoc.aPos);
      gl.vertexAttribPointer(this.wLoc.aPos, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(this.wLoc.aUv);
      gl.vertexAttribPointer(this.wLoc.aUv, 2, gl.FLOAT, false, stride, 3 * 4);
      gl.enableVertexAttribArray(this.wLoc.aShade);
      gl.vertexAttribPointer(this.wLoc.aShade, 1, gl.FLOAT, false, stride, 5 * 4);
      gl.enableVertexAttribArray(this.wLoc.aRoof);
      gl.vertexAttribPointer(this.wLoc.aRoof, 1, gl.FLOAT, false, stride, 6 * 4);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.wallTex);
      gl.uniform1i(this.wLoc.uWallTex, 0);
      gl.uniform3f(this.wLoc.uCam, camX, camY, camH);
      gl.uniform2f(this.wLoc.uDir, cosA, sinA);
      gl.uniform3f(this.wLoc.uFogColor, fog[0], fog[1], fog[2]);
      const roofTint = this.getRoofTint(track.def.wallStyle);
      gl.uniform3f(this.wLoc.uRoofTint, roofTint[0], roofTint[1], roofTint[2]);

      gl.drawArrays(gl.TRIANGLES, 0, this.wallVertCount);
      gl.disableVertexAttribArray(this.wLoc.aUv);
      gl.disableVertexAttribArray(this.wLoc.aShade);
      gl.disableVertexAttribArray(this.wLoc.aRoof);
    }
  }
}

window.WebGLSceneRenderer = WebGLSceneRenderer;
