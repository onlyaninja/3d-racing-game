// Procedural High-Res Tileable Texture & 6-Track Generator (Including Crossing Traffic Circuits)

const SURFACE = {
  ROAD: 0,
  CURB: 1,
  OFFROAD: 2,
  HAZARD: 3,   // Deep water / Lava / Cursed Swamp / Space Void
  BOOST: 4,    // Speed zipper
  WALL: 5,
  START: 6
};

window.SURFACE = SURFACE;

const TRACK_DEFS = [
  {
    id: 0,
    name: 'Mushroom Circuit',
    theme: 'grass',
    skyTop: '#1d4ed8',
    skyBottom: '#93c5fd',
    fogColor: [0.58, 0.77, 0.99],
    sunColor: '#fef08a',
    roadWidth: 50,
    curbWidth: 5,
    sceneryType: 'pipe',
    controlPoints: [
      { x: 512, y: 830 },
      { x: 250, y: 820 },
      { x: 140, y: 670 },
      { x: 165, y: 420 },
      { x: 280, y: 200 },
      { x: 500, y: 150 },
      { x: 640, y: 290 },
      { x: 790, y: 185 },
      { x: 890, y: 360 },
      { x: 865, y: 660 },
      { x: 760, y: 825 }
    ],
    boostT: [0.35, 0.78],
    crossZones: [],
    hazardPools: [
      { x: 635, y: 165, r: 42 },
      { x: 470, y: 490, r: 65 }
    ]
  },
  {
    id: 1,
    name: 'Koopa Beach',
    theme: 'beach',
    skyTop: '#0284c7',
    skyBottom: '#fde047',
    fogColor: [0.88, 0.87, 0.56],
    sunColor: '#ffffff',
    roadWidth: 54,
    curbWidth: 5,
    sceneryType: 'palm',
    controlPoints: [
      { x: 512, y: 850 },
      { x: 230, y: 810 },
      { x: 145, y: 600 },
      { x: 220, y: 390 },
      { x: 165, y: 205 },
      { x: 410, y: 135 },
      { x: 685, y: 165 },
      { x: 870, y: 310 },
      { x: 780, y: 520 },
      { x: 875, y: 720 },
      { x: 750, y: 845 }
    ],
    boostT: [0.22, 0.55, 0.84],
    crossZones: [],
    hazardPools: [
      { x: 510, y: 480, r: 125 },
      { x: 320, y: 310, r: 52 }
    ]
  },
  {
    id: 2,
    name: "Bowser's Castle",
    theme: 'castle',
    skyTop: '#18060c',
    skyBottom: '#991b1b',
    fogColor: [0.52, 0.12, 0.12],
    sunColor: '#fb923c',
    roadWidth: 46,
    curbWidth: 5,
    sceneryType: 'pillar',
    controlPoints: [
      { x: 512, y: 855 },
      { x: 215, y: 840 },
      { x: 145, y: 690 },
      { x: 270, y: 535 },
      { x: 145, y: 360 },
      { x: 235, y: 165 },
      { x: 512, y: 145 },
      { x: 810, y: 165 },
      { x: 880, y: 380 },
      { x: 710, y: 535 },
      { x: 875, y: 695 },
      { x: 790, y: 845 }
    ],
    boostT: [0.18, 0.48, 0.68, 0.88],
    crossZones: [],
    hazardPools: [
      { x: 512, y: 490, r: 115 },
      { x: 420, y: 300, r: 55 },
      { x: 605, y: 300, r: 55 }
    ]
  },
  {
    id: 3,
    name: "Toad's Figure-8 Crossroads",
    theme: 'crossroads',
    skyTop: '#1e3a8a',
    skyBottom: '#fb923c',
    fogColor: [0.85, 0.56, 0.32],
    sunColor: '#fde047',
    roadWidth: 48,
    curbWidth: 5,
    sceneryType: 'pipe',
    // Classic Figure-8 with high-speed perpendicular intersection right at (512, 512)!
    controlPoints: [
      { x: 320, y: 850 },
      { x: 140, y: 740 },
      { x: 145, y: 420 },
      { x: 350, y: 360 },
      { x: 512, y: 512 }, // Crossing #1 (Diagonal SE)
      { x: 690, y: 690 },
      { x: 880, y: 640 },
      { x: 880, y: 300 },
      { x: 685, y: 165 },
      { x: 580, y: 340 },
      { x: 512, y: 512 }, // Crossing #2 (Diagonal SW)
      { x: 430, y: 710 }
    ],
    boostT: [0.28, 0.78],
    crossZones: [
      { x: 512, y: 512, r: 58 }
    ],
    hazardPools: [
      { x: 512, y: 195, r: 48 },
      { x: 512, y: 830, r: 48 }
    ]
  },
  {
    id: 4,
    name: "Boo's Haunted Clover",
    theme: 'haunted',
    skyTop: '#0f0720',
    skyBottom: '#581c87',
    fogColor: [0.30, 0.12, 0.48],
    sunColor: '#fef9c3',
    roadWidth: 46,
    curbWidth: 5,
    sceneryType: 'boo_pillar',
    // Twisted Double-Cross Cloverleaf with two live traffic intersections!
    controlPoints: [
      { x: 512, y: 875 },
      { x: 210, y: 835 },
      { x: 155, y: 610 },
      { x: 380, y: 540 },
      { x: 640, y: 470 }, // Crosses East-West
      { x: 865, y: 380 },
      { x: 840, y: 165 },
      { x: 575, y: 150 },
      { x: 512, y: 380 }, // Crosses North-South
      { x: 445, y: 150 },
      { x: 185, y: 165 },
      { x: 160, y: 380 },
      { x: 385, y: 470 },
      { x: 645, y: 540 },
      { x: 865, y: 615 },
      { x: 815, y: 835 }
    ],
    boostT: [0.18, 0.45, 0.72],
    crossZones: [
      { x: 512, y: 505, r: 56 },
      { x: 512, y: 380, r: 52 }
    ],
    hazardPools: [
      { x: 280, y: 710, r: 46 },
      { x: 745, y: 710, r: 46 }
    ]
  },
  {
    id: 5,
    name: 'Rainbow Star Nexus',
    theme: 'rainbow',
    skyTop: '#03030a',
    skyBottom: '#1e1b4b',
    fogColor: [0.10, 0.09, 0.28],
    sunColor: '#fde047',
    roadWidth: 46,
    curbWidth: 5,
    sceneryType: 'star_pylon',
    // Complex 3-Lobe Pretzel Track where karts cross 3 central star junctions!
    controlPoints: [
      { x: 512, y: 880 },
      { x: 205, y: 820 },
      { x: 140, y: 530 },
      { x: 350, y: 460 },
      { x: 670, y: 460 }, // Junction 1
      { x: 880, y: 370 },
      { x: 780, y: 145 },
      { x: 540, y: 240 },
      { x: 370, y: 560 }, // Junction 2
      { x: 245, y: 240 },
      { x: 460, y: 140 },
      { x: 650, y: 560 }, // Junction 3
      { x: 875, y: 640 },
      { x: 790, y: 850 }
    ],
    boostT: [0.14, 0.36, 0.62, 0.85],
    crossZones: [
      { x: 512, y: 460, r: 55 },
      { x: 440, y: 420, r: 50 },
      { x: 585, y: 420, r: 50 }
    ],
    hazardPools: []
  }
];

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * (
      (2 * p1.x) +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
    ),
    y: 0.5 * (
      (2 * p1.y) +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
    )
  };
}

function buildSplineSamples(controlPoints, samplesPerSegment = 52) {
  const n = controlPoints.length;
  const raw = [];
  for (let i = 0; i < n; i++) {
    const p0 = controlPoints[(i - 1 + n) % n];
    const p1 = controlPoints[i];
    const p2 = controlPoints[(i + 1) % n];
    const p3 = controlPoints[(i + 2) % n];
    for (let s = 0; s < samplesPerSegment; s++) {
      const pt = catmullRom(p0, p1, p2, p3, s / samplesPerSegment);
      raw.push(pt);
    }
  }

  let totalLen = 0;
  for (let i = 0; i < raw.length; i++) {
    const next = raw[(i + 1) % raw.length];
    const prev = raw[(i - 1 + raw.length) % raw.length];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    raw[i].tx = dx / len;
    raw[i].ty = dy / len;
    raw[i].nx = -raw[i].ty;
    raw[i].ny = raw[i].tx;
    if (i > 0) {
      totalLen += Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y);
    }
    raw[i].s = totalLen;
    raw[i].t = i / raw.length;
  }
  return raw;
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

class TrackBuilder {
  static generate(trackIndex) {
    const def = TRACK_DEFS[trackIndex];
    const size = 1024;
    const spline = buildSplineSamples(def.controlPoints, 52);

    const texPixels = new Uint32Array(size * size);
    const surfaceGrid = new Uint8Array(size * size);

    const packRGB = (r, g, b) => (255 << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff);

    // 1. Fill Base Off-Road / Hazard Terrain
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = y * size + x;
        const checker = ((x >> 4) + (y >> 4)) & 1;
        const fine = ((x * 17 + y * 31) & 15) - 7;

        // Outer border walls
        if (x < 28 || x >= size - 28 || y < 28 || y >= size - 28) {
          surfaceGrid[idx] = SURFACE.WALL;
          const block = ((x >> 3) + (y >> 3)) & 1;
          texPixels[idx] = block ? packRGB(220, 38, 38) : packRGB(248, 250, 252);
          continue;
        }

        if (def.theme === 'grass' || def.theme === 'crossroads') {
          surfaceGrid[idx] = SURFACE.OFFROAD;
          const isAutumn = def.theme === 'crossroads';
          const r = (checker ? (isAutumn ? 64 : 34) : (isAutumn ? 52 : 28)) + fine;
          const g = (checker ? (isAutumn ? 142 : 158) : (isAutumn ? 124 : 138)) + fine;
          const b = (checker ? 52 : 44) + fine;
          texPixels[idx] = packRGB(r, g, b);
        } else if (def.theme === 'beach') {
          const distCenter = Math.hypot(x - 512, y - 512);
          if (distCenter > 455) {
            surfaceGrid[idx] = SURFACE.HAZARD;
            const wave = (((x + y) >> 3) & 1) ? 14 : 0;
            texPixels[idx] = packRGB(12, 118 + wave, 210 + wave);
          } else {
            surfaceGrid[idx] = SURFACE.OFFROAD;
            texPixels[idx] = packRGB((checker ? 238 : 224) + fine, (checker ? 204 : 189) + fine, (checker ? 125 : 112) + fine);
          }
        } else if (def.theme === 'castle') {
          surfaceGrid[idx] = SURFACE.OFFROAD;
          const lavaCell = ((x >> 3) ^ (y >> 3)) & 3;
          texPixels[idx] = lavaCell === 0
            ? packRGB(185 + fine, 45, 18)
            : packRGB(62 + fine, 26, 26);
        } else if (def.theme === 'haunted') {
          surfaceGrid[idx] = SURFACE.OFFROAD;
          const bog = ((x >> 4) ^ (y >> 4)) & 1;
          texPixels[idx] = bog
            ? packRGB(38 + fine, 24 + fine, 58 + fine)
            : packRGB(24 + fine, 42 + fine, 46 + fine);
        } else if (def.theme === 'rainbow') {
          // Starry space void! Going off-road triggers Lakitu quickly
          surfaceGrid[idx] = SURFACE.HAZARD;
          const starHash = (x * 374761393 + y * 668265263) & 1023;
          if (starHash === 1) {
            texPixels[idx] = packRGB(255, 255, 255);
          } else if (starHash === 2) {
            texPixels[idx] = packRGB(125, 211, 252);
          } else {
            texPixels[idx] = packRGB(8, 10, 24);
          }
        }
      }
    }

    // 2. Paint Hazard Pools
    for (const pool of def.hazardPools) {
      const r2 = pool.r * pool.r;
      const minX = Math.max(30, Math.floor(pool.x - pool.r));
      const maxX = Math.min(size - 30, Math.ceil(pool.x + pool.r));
      const minY = Math.max(30, Math.floor(pool.y - pool.r));
      const maxY = Math.min(size - 30, Math.ceil(pool.y + pool.r));
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const d2 = (x - pool.x) ** 2 + (y - pool.y) ** 2;
          if (d2 <= r2) {
            const idx = y * size + x;
            surfaceGrid[idx] = SURFACE.HAZARD;
            const ripple = ((Math.floor(Math.sqrt(d2)) >> 2) & 1) * 20;
            if (def.theme === 'grass' || def.theme === 'crossroads') {
              texPixels[idx] = packRGB(115 + ripple, 72 + ripple / 2, 34);
            } else if (def.theme === 'beach') {
              texPixels[idx] = packRGB(14, 135 + ripple, 230);
            } else if (def.theme === 'haunted') {
              texPixels[idx] = packRGB(88, 28 + ripple, 135 + ripple);
            } else {
              texPixels[idx] = packRGB(245, 95 + ripple * 2, 12);
            }
          }
        }
      }
    }

    // 3. Paint Road Curbs first, then Road Surface (so intersections merge cleanly without curb walls blocking cross traffic!)
    const totalHalf = def.roadWidth + def.curbWidth;
    const roadHalf = def.roadWidth;

    // Pass A: Curbs
    const curbR2 = totalHalf * totalHalf;
    for (let i = 0; i < spline.length; i++) {
      const pt = spline[i];
      const stripe = Math.floor(i / 5) & 1;
      const minX = Math.max(28, Math.floor(pt.x - totalHalf - 2));
      const maxX = Math.min(size - 29, Math.ceil(pt.x + totalHalf + 2));
      const minY = Math.max(28, Math.floor(pt.y - totalHalf - 2));
      const maxY = Math.min(size - 29, Math.ceil(pt.y + totalHalf + 2));

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const dx = x - pt.x;
          const dy = y - pt.y;
          if (dx * dx + dy * dy <= curbR2) {
            const idx = y * size + x;
            if (surfaceGrid[idx] !== SURFACE.ROAD) {
              surfaceGrid[idx] = SURFACE.CURB;
              if (def.theme === 'grass' || def.theme === 'crossroads') {
                texPixels[idx] = stripe ? packRGB(239, 68, 68) : packRGB(248, 250, 252);
              } else if (def.theme === 'beach') {
                texPixels[idx] = stripe ? packRGB(56, 189, 248) : packRGB(254, 240, 138);
              } else if (def.theme === 'haunted') {
                texPixels[idx] = stripe ? packRGB(168, 85, 247) : packRGB(71, 85, 105);
              } else if (def.theme === 'rainbow') {
                texPixels[idx] = packRGB(254, 240, 138);
              } else {
                texPixels[idx] = stripe ? packRGB(245, 158, 11) : packRGB(55, 65, 81);
              }
            }
          }
        }
      }
    }

    // Pass B: Road Surface
    const roadR2 = roadHalf * roadHalf;
    for (let i = 0; i < spline.length; i++) {
      const pt = spline[i];
      const minX = Math.max(28, Math.floor(pt.x - roadHalf - 1));
      const maxX = Math.min(size - 29, Math.ceil(pt.x + roadHalf + 1));
      const minY = Math.max(28, Math.floor(pt.y - roadHalf - 1));
      const maxY = Math.min(size - 29, Math.ceil(pt.y + roadHalf + 1));

      let isBoost = false;
      for (const bt of def.boostT) {
        if (Math.abs(pt.t - bt) < 0.011) {
          isBoost = true;
          break;
        }
      }

      const [rainR, rainG, rainB] = def.theme === 'rainbow'
        ? hslToRgb((pt.t * 720) % 360, 0.85, 0.52)
        : [0, 0, 0];

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const dx = x - pt.x;
          const dy = y - pt.y;
          const d2 = dx * dx + dy * dy;
          if (d2 <= roadR2) {
            const idx = y * size + x;
            const grain = ((x * 13 ^ y * 29) & 7) - 3;

            if (isBoost && d2 < (roadHalf * 0.55) ** 2) {
              surfaceGrid[idx] = SURFACE.BOOST;
              const chev = ((x + y) >> 2) & 1;
              texPixels[idx] = chev ? packRGB(255, 230, 0) : packRGB(249, 115, 22);
              continue;
            }

            if (surfaceGrid[idx] === SURFACE.BOOST) continue;
            surfaceGrid[idx] = SURFACE.ROAD;

            if (def.theme === 'grass' || def.theme === 'crossroads') {
              const base = 74 + grain;
              texPixels[idx] = packRGB(base, base + 2, base + 8);
            } else if (def.theme === 'beach') {
              texPixels[idx] = packRGB(212 + grain, 168 + grain, 96 + grain);
            } else if (def.theme === 'haunted') {
              const plank = ((x + y) >> 3) & 1 ? 5 : -4;
              texPixels[idx] = packRGB(52 + plank + grain, 44 + plank, 66 + plank);
            } else if (def.theme === 'rainbow') {
              const tile = (((x >> 3) + (y >> 3)) & 1) ? 14 : -10;
              texPixels[idx] = packRGB(
                Math.min(255, Math.max(0, rainR + tile)),
                Math.min(255, Math.max(0, rainG + tile)),
                Math.min(255, Math.max(0, rainB + tile))
              );
            } else {
              const brick = (((x >> 3) + ((y >> 3) & 1)) & 1) ? 4 : -4;
              const b = 60 + grain + brick;
              texPixels[idx] = packRGB(b + 4, b, b + 8);
            }
          }
        }
      }
    }

    // Pass C: Paint Yellow/Black Hazard Box Markings on Crossroads Intersections!
    for (const cz of def.crossZones) {
      const r2 = cz.r * cz.r;
      for (let y = Math.floor(cz.y - cz.r); y <= Math.ceil(cz.y + cz.r); y++) {
        for (let x = Math.floor(cz.x - cz.r); x <= Math.ceil(cz.x + cz.r); x++) {
          const d2 = (x - cz.x) ** 2 + (y - cz.y) ** 2;
          if (d2 <= r2) {
            const idx = y * size + x;
            if (surfaceGrid[idx] === SURFACE.ROAD) {
              // Outer caution ring or diagonal crosshatch lines
              const isRing = d2 > (cz.r - 7) ** 2;
              const diag = ((x + y) >> 3) & 1;
              const gridLine = ((x & 15) === 0) || ((y & 15) === 0);
              if (isRing) {
                texPixels[idx] = diag ? packRGB(250, 204, 21) : packRGB(30, 41, 59);
              } else if (gridLine && diag) {
                texPixels[idx] = packRGB(250, 204, 21);
              }
            }
          }
        }
      }
    }

    // Pass D: Center dashed guideline
    for (let i = 0; i < spline.length; i += 2) {
      if ((Math.floor(i / 8) & 1) === 0) continue;
      const pt = spline[i];
      for (let oy = -2; oy <= 2; oy++) {
        for (let ox = -2; ox <= 2; ox++) {
          const x = Math.round(pt.x + ox);
          const y = Math.round(pt.y + oy);
          const idx = y * size + x;
          if (surfaceGrid[idx] === SURFACE.ROAD) {
            texPixels[idx] = def.theme === 'beach'
              ? packRGB(245, 225, 165)
              : packRGB(135, 145, 165);
          }
        }
      }
    }

    // 4. Paint Start / Finish Checkerboard Banner at spline[0]
    const startPt = spline[0];
    for (let w = -roadHalf; w <= roadHalf; w += 0.5) {
      for (let l = -7; l <= 7; l += 0.5) {
        const px = Math.round(startPt.x + startPt.nx * w + startPt.tx * l);
        const py = Math.round(startPt.y + startPt.ny * w + startPt.ty * l);
        if (px >= 0 && px < size && py >= 0 && py < size) {
          const idx = py * size + px;
          surfaceGrid[idx] = SURFACE.START;
          const check = (Math.floor((w + roadHalf) / 6) + Math.floor((l + 8) / 4)) & 1;
          texPixels[idx] = check ? packRGB(250, 250, 250) : packRGB(20, 20, 25);
        }
      }
    }

    // 5. Place Item Boxes, Coins, and Roadside 3D Scenery Billboards
    const itemBoxes = [];
    const itemFractions = [0.15, 0.38, 0.62, 0.86];
    for (const frac of itemFractions) {
      const sp = spline[Math.floor(frac * spline.length)];
      for (const offset of [-22, -7, 8, 23]) {
        itemBoxes.push({
          x: sp.x + sp.nx * offset,
          y: sp.y + sp.ny * offset,
          active: true,
          respawnTimer: 0
        });
      }
    }

    const coins = [];
    for (let i = 18; i < spline.length; i += 24) {
      const sp = spline[i];
      const lane = ((Math.floor(i / 24)) % 3 - 1) * 16;
      coins.push({
        x: sp.x + sp.nx * lane,
        y: sp.y + sp.ny * lane,
        active: true,
        respawnTimer: 0
      });
    }

    const scenery = [];
    for (let i = 8; i < spline.length; i += 18) {
      const sp = spline[i];
      const side = (i % 36 === 8) ? 1 : -1;
      const dist = totalHalf + 20 + ((i * 7) % 16);
      const sx = sp.x + sp.nx * side * dist;
      const sy = sp.y + sp.ny * side * dist;
      if (sx > 40 && sx < size - 40 && sy > 40 && sy < size - 40) {
        const sIdx = Math.floor(sy) * size + Math.floor(sx);
        // Never place a scenery obstacle on a crossing road!
        if (surfaceGrid[sIdx] === SURFACE.OFFROAD || (def.theme === 'rainbow' && surfaceGrid[sIdx] === SURFACE.HAZARD)) {
          scenery.push({
            x: sx,
            y: sy,
            type: def.sceneryType,
            radius: 10
          });
        }
      }
    }

    return {
      isArena: false,
      def,
      size,
      spline,
      texPixels,
      surfaceGrid,
      walls: [],
      hideZones: [],
      itemBoxes,
      coins,
      scenery
    };
  }

  static renderPreview(trackIndex, canvas) {
    const def = TRACK_DEFS[trackIndex];
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const sx = w / 1024;
    const sy = h / 1024;

    // Fast vector preview (<0.2ms per track) so page loads instantaneously!
    const bgMap = {
      grass: '#1e8c36',
      crossroads: '#367e36',
      beach: '#e4c478',
      castle: '#421a1a',
      haunted: '#231938',
      rainbow: '#080a18'
    };
    ctx.fillStyle = bgMap[def.theme] || '#1e293b';
    ctx.fillRect(0, 0, w, h);

    // Hazards
    ctx.fillStyle = def.theme === 'beach' ? '#0ea5e9' : (def.theme === 'castle' ? '#f97316' : (def.theme === 'haunted' ? '#6b21a8' : '#7c4d25'));
    for (const pool of def.hazardPools) {
      ctx.beginPath();
      ctx.ellipse(pool.x * sx, pool.y * sy, pool.r * sx, pool.r * sy, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const spline = buildSplineSamples(def.controlPoints, 16);
    const trace = () => {
      ctx.beginPath();
      spline.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x * sx, pt.y * sy);
        else ctx.lineTo(pt.x * sx, pt.y * sy);
      });
      ctx.closePath();
    };

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    // Curb outline
    trace();
    ctx.strokeStyle = def.theme === 'rainbow' ? '#fde047' : (def.theme === 'haunted' ? '#a855f7' : '#ef4444');
    ctx.lineWidth = (def.roadWidth + def.curbWidth) * 2 * Math.min(sx, sy);
    ctx.stroke();

    // Road fill
    trace();
    ctx.strokeStyle = def.theme === 'beach' ? '#d4a860' : (def.theme === 'rainbow' ? '#38bdf8' : '#4b5563');
    ctx.lineWidth = def.roadWidth * 2 * Math.min(sx, sy);
    ctx.stroke();

    // Crossroad caution markers
    for (const cz of def.crossZones) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cz.x * sx, cz.y * sy, cz.r * sx, cz.r * sy, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Start line marker
    const sp0 = spline[0];
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sp0.x * sx - 3, sp0.y * sy - 5, 6, 10);
  }
}

window.TRACK_DEFS = TRACK_DEFS;
window.TrackBuilder = TrackBuilder;
