// Battle Mode: 10 Open-Plan Arenas Balancing Sheltered Hideouts (Zero Advantage) & High-Opportunity Power-Up Plazas

const ARENA_DEFS = [
  {
    id: 0,
    name: 'Block Fort Classic',
    desc: '4 fortified corner cover blocks · Wide X-plaza loaded with boosts & items',
    theme: 'arena_block',
    wallStyle: 'brick_fort',
    skyTop: '#1d4ed8',
    skyBottom: '#93c5fd',
    fogColor: [0.58, 0.77, 0.99],
    sunColor: '#fef08a',
    friction: 1.0,
    walls: [
      // 4 L-shaped fortified corner cover bays (safe pockets behind them, zero items inside)
      { x: 145, y: 145, w: 150, h: 30, height: 34 },
      { x: 145, y: 175, w: 30, h: 120, height: 34 },

      { x: 729, y: 145, w: 150, h: 30, height: 34 },
      { x: 849, y: 175, w: 30, h: 120, height: 34 },

      { x: 145, y: 849, w: 150, h: 30, height: 34 },
      { x: 145, y: 729, w: 30, h: 120, height: 34 },

      { x: 729, y: 849, w: 150, h: 30, height: 34 },
      { x: 849, y: 729, w: 30, h: 120, height: 34 },

      // 4 Mid-court low tactical cover pillars (can peek over them!)
      { x: 345, y: 345, w: 46, h: 46, height: 22 },
      { x: 633, y: 345, w: 46, h: 46, height: 22 },
      { x: 345, y: 633, w: 46, h: 46, height: 22 },
      { x: 633, y: 633, w: 46, h: 46, height: 22 }
    ],
    hideZones: [
      { x: 42, y: 42, w: 145, h: 145 },
      { x: 837, y: 42, w: 145, h: 145 },
      { x: 42, y: 837, w: 145, h: 145 },
      { x: 837, y: 837, w: 145, h: 145 }
    ],
    boostPads: [
      { x: 472, y: 240, w: 80, h: 44 },
      { x: 472, y: 740, w: 80, h: 44 },
      { x: 240, y: 472, w: 44, h: 80 },
      { x: 740, y: 472, w: 44, h: 80 }
    ],
    hazards: [],
    itemRing: { r1: 95, c1: 6, r2: 245, c2: 12 }
  },
  {
    id: 1,
    name: 'Mushroom Plaza',
    desc: 'Sunny cobblestone courtyard · Tucked stone hideout alcoves · Huge central loot ring',
    theme: 'arena_meadow',
    wallStyle: 'stone_moss',
    skyTop: '#0284c7',
    skyBottom: '#bae6fd',
    fogColor: [0.72, 0.90, 0.99],
    sunColor: '#fde047',
    friction: 1.0,
    walls: [
      // 4 Perimeter U-shaped hideout alcoves (N, S, E, W)
      { x: 412, y: 120, w: 200, h: 28, height: 34 },
      { x: 412, y: 74, w: 28, h: 46, height: 34 },
      { x: 584, y: 74, w: 28, h: 46, height: 34 },

      { x: 412, y: 876, w: 200, h: 28, height: 34 },
      { x: 412, y: 904, w: 28, h: 46, height: 34 },
      { x: 584, y: 904, w: 28, h: 46, height: 34 },

      { x: 120, y: 412, w: 28, h: 200, height: 34 },
      { x: 74, y: 412, w: 46, h: 28, height: 34 },
      { x: 74, y: 584, w: 46, h: 28, height: 34 },

      { x: 876, y: 412, w: 28, h: 200, height: 34 },
      { x: 904, y: 412, w: 46, h: 28, height: 34 },
      { x: 904, y: 584, w: 46, h: 28, height: 34 }
    ],
    hideZones: [
      { x: 432, y: 40, w: 160, h: 80 },
      { x: 432, y: 904, w: 160, h: 80 },
      { x: 40, y: 432, w: 80, h: 160 },
      { x: 904, y: 432, w: 80, h: 160 }
    ],
    boostPads: [
      { x: 310, y: 310, w: 56, h: 56 },
      { x: 658, y: 310, w: 56, h: 56 },
      { x: 310, y: 658, w: 56, h: 56 },
      { x: 658, y: 658, w: 56, h: 56 }
    ],
    hazards: [],
    itemRing: { r1: 85, c1: 6, r2: 260, c2: 14 }
  },
  {
    id: 2,
    name: 'Koopa Atoll',
    desc: 'Tropical island lagoon · Beach-hut cover coves · Wet-sand turbo lanes',
    theme: 'arena_beach',
    wallStyle: 'beach_wood',
    skyTop: '#0369a1',
    skyBottom: '#fde047',
    fogColor: [0.85, 0.88, 0.65],
    sunColor: '#ffffff',
    friction: 1.0,
    walls: [
      // 4 angled driftwood beach-hut shelters around the island
      { x: 195, y: 215, w: 115, h: 28, height: 32 },
      { x: 195, y: 243, w: 28, h: 85, height: 32 },

      { x: 714, y: 215, w: 115, h: 28, height: 32 },
      { x: 801, y: 243, w: 28, h: 85, height: 32 },

      { x: 195, y: 781, w: 115, h: 28, height: 32 },
      { x: 195, y: 696, w: 28, h: 85, height: 32 },

      { x: 714, y: 781, w: 115, h: 28, height: 32 },
      { x: 801, y: 696, w: 28, h: 85, height: 32 }
    ],
    hideZones: [
      { x: 110, y: 130, w: 130, h: 130 },
      { x: 784, y: 130, w: 130, h: 130 },
      { x: 110, y: 764, w: 130, h: 130 },
      { x: 784, y: 764, w: 130, h: 130 }
    ],
    boostPads: [
      { x: 472, y: 472, w: 80, h: 80 },
      { x: 472, y: 170, w: 80, h: 42 },
      { x: 472, y: 812, w: 80, h: 42 },
      { x: 170, y: 472, w: 42, h: 80 },
      { x: 812, y: 472, w: 42, h: 80 }
    ],
    hazards: [
      { x: 96, y: 96, r: 58 },
      { x: 928, y: 96, r: 58 },
      { x: 96, y: 928, r: 58 },
      { x: 928, y: 928, r: 58 }
    ],
    itemRing: { r1: 115, c1: 8, r2: 270, c2: 12 }
  },
  {
    id: 3,
    name: "Bowser's War Room",
    desc: 'Obsidian fortress bunkers · Corner lava pools · Blazing central weapon forge',
    theme: 'arena_castle',
    wallStyle: 'castle_obsidian',
    skyTop: '#16050a',
    skyBottom: '#991b1b',
    fogColor: [0.46, 0.12, 0.12],
    sunColor: '#fb923c',
    friction: 1.0,
    walls: [
      // Heavy fortress battlement walls framing central forge
      { x: 240, y: 370, w: 32, h: 284, height: 36 },
      { x: 752, y: 370, w: 32, h: 284, height: 36 },
      { x: 370, y: 240, w: 284, h: 32, height: 36 },
      { x: 370, y: 752, w: 284, h: 32, height: 36 },

      // Corner bastion shields
      { x: 120, y: 120, w: 84, h: 32, height: 30 },
      { x: 820, y: 120, w: 84, h: 32, height: 30 },
      { x: 120, y: 872, w: 84, h: 32, height: 30 },
      { x: 820, y: 872, w: 84, h: 32, height: 30 }
    ],
    hideZones: [
      { x: 44, y: 370, w: 196, h: 284 },
      { x: 784, y: 370, w: 196, h: 284 },
      { x: 370, y: 44, w: 284, h: 196 },
      { x: 370, y: 784, w: 284, h: 196 }
    ],
    boostPads: [
      { x: 335, y: 486, w: 50, h: 52 },
      { x: 639, y: 486, w: 50, h: 52 },
      { x: 486, y: 335, w: 52, h: 50 },
      { x: 486, y: 639, w: 52, h: 50 }
    ],
    hazards: [
      { x: 120, y: 245, r: 42 },
      { x: 904, y: 245, r: 42 },
      { x: 120, y: 779, r: 42 },
      { x: 904, y: 779, r: 42 }
    ],
    itemRing: { r1: 80, c1: 6, r2: 180, c2: 12 }
  },
  {
    id: 4,
    name: 'Crystal Glacier',
    desc: 'Slick ice skating rink · Frosted bunker alcoves · High-speed drift chaos',
    theme: 'arena_ice',
    wallStyle: 'ice_crystal',
    skyTop: '#0f172a',
    skyBottom: '#7dd3fc',
    fogColor: [0.60, 0.85, 0.98],
    sunColor: '#e0f2fe',
    friction: 0.72, // Slightly slipperier fun ice drift!
    walls: [
      // 4 Ice Crystal Wing Shelters
      { x: 140, y: 280, w: 140, h: 30, height: 34 },
      { x: 140, y: 714, w: 140, h: 30, height: 34 },
      { x: 744, y: 280, w: 140, h: 30, height: 34 },
      { x: 744, y: 714, w: 140, h: 30, height: 34 },

      // Center diamond ice shards (low barriers you can peek over)
      { x: 488, y: 310, w: 48, h: 48, height: 22 },
      { x: 488, y: 666, w: 48, h: 48, height: 22 },
      { x: 310, y: 488, w: 48, h: 48, height: 22 },
      { x: 666, y: 488, w: 48, h: 48, height: 22 }
    ],
    hideZones: [
      { x: 44, y: 120, w: 220, h: 160 },
      { x: 760, y: 120, w: 220, h: 160 },
      { x: 44, y: 744, w: 220, h: 160 },
      { x: 760, y: 744, w: 220, h: 160 }
    ],
    boostPads: [
      { x: 472, y: 180, w: 80, h: 44 },
      { x: 472, y: 800, w: 80, h: 44 },
      { x: 180, y: 472, w: 44, h: 80 },
      { x: 800, y: 472, w: 44, h: 80 }
    ],
    hazards: [],
    itemRing: { r1: 90, c1: 6, r2: 245, c2: 14 }
  },
  {
    id: 5,
    name: "Boo's Hedge Maze",
    desc: 'Tall spooky hedge hideouts · Zero loot in shadows · Moonlit weapon courtyard',
    theme: 'arena_haunted',
    wallStyle: 'hedge_maze',
    skyTop: '#0b051a',
    skyBottom: '#4c1d95',
    fogColor: [0.24, 0.11, 0.44],
    sunColor: '#fef9c3',
    friction: 1.0,
    walls: [
      // Dense Hedge Maze Rim with tucked hiding alcoves
      { x: 140, y: 140, w: 220, h: 32, height: 38 },
      { x: 140, y: 172, w: 32, h: 190, height: 38 },
      { x: 664, y: 140, w: 220, h: 32, height: 38 },
      { x: 852, y: 172, w: 32, h: 190, height: 38 },
      { x: 140, y: 852, w: 220, h: 32, height: 38 },
      { x: 140, y: 662, w: 32, h: 190, height: 38 },
      { x: 664, y: 852, w: 220, h: 32, height: 38 },
      { x: 852, y: 662, w: 32, h: 190, height: 38 },

      // Inner hedge blinders
      { x: 290, y: 430, w: 32, h: 164, height: 34 },
      { x: 702, y: 430, w: 32, h: 164, height: 34 }
    ],
    hideZones: [
      { x: 42, y: 42, w: 180, h: 180 },
      { x: 802, y: 42, w: 180, h: 180 },
      { x: 42, y: 802, w: 180, h: 180 },
      { x: 802, y: 802, w: 180, h: 180 }
    ],
    boostPads: [
      { x: 472, y: 220, w: 80, h: 44 },
      { x: 472, y: 760, w: 80, h: 44 },
      { x: 472, y: 472, w: 80, h: 80 }
    ],
    hazards: [],
    itemRing: { r1: 110, c1: 8, r2: 235, c2: 10 }
  },
  {
    id: 6,
    name: 'Dry Bones Canyon',
    desc: 'Red sandstone mesa cover · Dusty high-speed central bowl · Ricochet alleys',
    theme: 'arena_desert',
    wallStyle: 'sandstone',
    skyTop: '#7c2d12',
    skyBottom: '#fdba74',
    fogColor: [0.89, 0.65, 0.42],
    sunColor: '#fef08a',
    friction: 0.95,
    walls: [
      // Sandstone Mesa Blocks (Asymmetrical canyon feel)
      { x: 160, y: 180, w: 110, h: 90, height: 38 },
      { x: 754, y: 180, w: 110, h: 90, height: 38 },
      { x: 160, y: 754, w: 110, h: 90, height: 38 },
      { x: 754, y: 754, w: 110, h: 90, height: 38 },

      // Low canyon ridge walls
      { x: 432, y: 200, w: 160, h: 28, height: 24 },
      { x: 432, y: 796, w: 160, h: 28, height: 24 },
      { x: 200, y: 432, w: 28, h: 160, height: 24 },
      { x: 796, y: 432, w: 28, h: 160, height: 24 }
    ],
    hideZones: [
      { x: 42, y: 150, w: 118, h: 140 },
      { x: 864, y: 150, w: 118, h: 140 },
      { x: 42, y: 734, w: 118, h: 140 },
      { x: 864, y: 734, w: 118, h: 140 }
    ],
    boostPads: [
      { x: 350, y: 350, w: 56, h: 56 },
      { x: 618, y: 350, w: 56, h: 56 },
      { x: 350, y: 618, w: 56, h: 56 },
      { x: 618, y: 618, w: 56, h: 56 }
    ],
    hazards: [],
    itemRing: { r1: 88, c1: 6, r2: 240, c2: 14 }
  },
  {
    id: 7,
    name: 'Neon Cyber Grid',
    desc: 'Synthwave holo-bunkers · Blinding central overdrive strip · High-velocity combat',
    theme: 'arena_cyber',
    wallStyle: 'neon_cyber',
    skyTop: '#050214',
    skyBottom: '#701a75',
    fogColor: [0.22, 0.06, 0.32],
    sunColor: '#f472b6',
    friction: 1.05,
    walls: [
      // Sleek cyber-bunker dividers
      { x: 160, y: 350, w: 150, h: 26, height: 34 },
      { x: 160, y: 648, w: 150, h: 26, height: 34 },
      { x: 714, y: 350, w: 150, h: 26, height: 34 },
      { x: 714, y: 648, w: 150, h: 26, height: 34 },

      { x: 350, y: 140, w: 26, h: 150, height: 34 },
      { x: 648, y: 140, w: 26, h: 150, height: 34 },
      { x: 350, y: 734, w: 26, h: 150, height: 34 },
      { x: 648, y: 734, w: 26, h: 150, height: 34 }
    ],
    hideZones: [
      { x: 42, y: 376, w: 180, h: 272 },
      { x: 802, y: 376, w: 180, h: 272 },
      { x: 376, y: 42, w: 272, h: 180 },
      { x: 376, y: 802, w: 272, h: 180 }
    ],
    boostPads: [
      { x: 472, y: 310, w: 80, h: 48 },
      { x: 472, y: 666, w: 80, h: 48 },
      { x: 310, y: 472, w: 48, h: 80 },
      { x: 666, y: 472, w: 48, h: 80 },
      { x: 472, y: 472, w: 80, h: 80 }
    ],
    hazards: [],
    itemRing: { r1: 110, c1: 8, r2: 265, c2: 14 }
  },
  {
    id: 8,
    name: 'Sky Garden Colosseum',
    desc: 'Floating marble temple · Tall colonnade cover bays · Golden sun-mosaic center',
    theme: 'arena_sky',
    wallStyle: 'marble_gold',
    skyTop: '#2563eb',
    skyBottom: '#f8fafc',
    fogColor: [0.84, 0.91, 0.99],
    sunColor: '#fef08a',
    friction: 1.0,
    walls: [
      // Classical temple colonnade pillars & corner sanctuaries
      { x: 180, y: 180, w: 68, h: 68, height: 38 },
      { x: 776, y: 180, w: 68, h: 68, height: 38 },
      { x: 180, y: 776, w: 68, h: 68, height: 38 },
      { x: 776, y: 776, w: 68, h: 68, height: 38 },

      { x: 442, y: 150, w: 140, h: 30, height: 34 },
      { x: 442, y: 844, w: 140, h: 30, height: 34 },
      { x: 150, y: 442, w: 30, h: 140, height: 34 },
      { x: 844, y: 442, w: 30, h: 140, height: 34 },

      // Inner marble obelisks
      { x: 365, y: 365, w: 38, h: 38, height: 30 },
      { x: 621, y: 365, w: 38, h: 38, height: 30 },
      { x: 365, y: 621, w: 38, h: 38, height: 30 },
      { x: 621, y: 621, w: 38, h: 38, height: 30 }
    ],
    hideZones: [
      { x: 42, y: 42, w: 165, h: 165 },
      { x: 817, y: 42, w: 165, h: 165 },
      { x: 42, y: 817, w: 165, h: 165 },
      { x: 817, y: 817, w: 165, h: 165 }
    ],
    boostPads: [
      { x: 472, y: 265, w: 80, h: 42 },
      { x: 472, y: 717, w: 80, h: 42 },
      { x: 265, y: 472, w: 42, h: 80 },
      { x: 717, y: 472, w: 42, h: 80 }
    ],
    hazards: [],
    itemRing: { r1: 88, c1: 6, r2: 245, c2: 14 }
  },
  {
    id: 9,
    name: 'Rainbow Star Dome',
    desc: 'Cosmic rainbow colosseum · Glowing prism bunkers · Hyper-boost star nexus',
    theme: 'arena_rainbow',
    wallStyle: 'rainbow_prism',
    skyTop: '#03030a',
    skyBottom: '#1e1b4b',
    fogColor: [0.10, 0.09, 0.28],
    sunColor: '#fde047',
    friction: 1.02,
    walls: [
      // 8 Radial Prism Bunkers forming an open-plan cosmic star dome
      { x: 160, y: 160, w: 120, h: 28, height: 34 },
      { x: 744, y: 160, w: 120, h: 28, height: 34 },
      { x: 160, y: 836, w: 120, h: 28, height: 34 },
      { x: 744, y: 836, w: 120, h: 28, height: 34 },

      { x: 160, y: 440, w: 28, h: 144, height: 34 },
      { x: 836, y: 440, w: 28, h: 144, height: 34 },
      { x: 440, y: 160, w: 144, h: 28, height: 34 },
      { x: 440, y: 836, w: 144, h: 28, height: 34 }
    ],
    hideZones: [
      { x: 42, y: 42, w: 150, h: 150 },
      { x: 832, y: 42, w: 150, h: 150 },
      { x: 42, y: 832, w: 150, h: 150 },
      { x: 832, y: 832, w: 150, h: 150 }
    ],
    boostPads: [
      { x: 472, y: 472, w: 80, h: 80 },
      { x: 285, y: 285, w: 54, h: 54 },
      { x: 685, y: 285, w: 54, h: 54 },
      { x: 285, y: 685, w: 54, h: 54 },
      { x: 685, y: 685, w: 54, h: 54 }
    ],
    hazards: [],
    itemRing: { r1: 115, c1: 8, r2: 260, c2: 14 }
  }
];

function pointInRect(px, py, rect, pad = 0) {
  return (
    px >= rect.x - pad &&
    px <= rect.x + rect.w + pad &&
    py >= rect.y - pad &&
    py <= rect.y + rect.h + pad
  );
}

class ArenaBuilder {
  static generate(arenaIndex) {
    const def = ARENA_DEFS[arenaIndex] || ARENA_DEFS[0];
    const size = 1024;
    const texPixels = new Uint32Array(size * size);
    const surfaceGrid = new Uint8Array(size * size);

    const packRGB = (r, g, b) =>
      (255 << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff);

    // Outer perimeter enclosure walls (3D rendered & physically solid!)
    const perimeterThickness = 32;
    const allWalls = [
      { x: 0, y: 0, w: size, h: perimeterThickness, height: 34, isBorder: true },
      { x: 0, y: size - perimeterThickness, w: size, h: perimeterThickness, height: 34, isBorder: true },
      { x: 0, y: perimeterThickness, w: perimeterThickness, h: size - perimeterThickness * 2, height: 34, isBorder: true },
      { x: size - perimeterThickness, y: perimeterThickness, w: perimeterThickness, h: size - perimeterThickness * 2, height: 34, isBorder: true },
      ...def.walls.map(w => ({ ...w, isBorder: false }))
    ];

    // 1. Paint Rich 1024x1024 Arena Floor Texture
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = y * size + x;
        const dx = x - 512;
        const dy = y - 512;
        const distC = Math.hypot(dx, dy);
        const tile32 = ((x >> 5) + (y >> 5)) & 1;
        const tile16 = ((x >> 4) + (y >> 4)) & 1;
        const fine = ((x * 19 + y * 37) & 15) - 7;
        const seam = (x & 31) === 0 || (y & 31) === 0;

        surfaceGrid[idx] = SURFACE.ROAD;

        if (def.theme === 'arena_block') {
          // Bright Mario Kart Block Fort colorful stone courtyard
          const inCenter = distC < 140;
          if (inCenter) {
            const ring = Math.abs(distC - 134) < 5;
            texPixels[idx] = ring
              ? packRGB(250, 204, 21)
              : (tile16 ? packRGB(206 + fine, 188 + fine, 148 + fine) : packRGB(190 + fine, 172 + fine, 134 + fine));
          } else {
            const base = tile32 ? 124 : 112;
            const d = seam ? -18 : fine * 0.6;
            texPixels[idx] = packRGB(base + d, base + 8 + d, base + 18 + d);
          }
        } else if (def.theme === 'arena_meadow') {
          if (distC < 305) {
            // Sunlit plaza cobblestone
            const ring = Math.abs(distC - 300) < 5 || Math.abs(distC - 105) < 4;
            const c = (tile16 ? 198 : 182) + fine * 0.6 - (seam ? 16 : 0);
            texPixels[idx] = ring ? packRGB(245, 198, 66) : packRGB(c + 10, c + 4, c - 8);
          } else {
            // Lush trimmed lawn border
            texPixels[idx] = tile32
              ? packRGB(52 + fine, 168 + fine, 72 + fine)
              : packRGB(42 + fine, 150 + fine, 62 + fine);
          }
        } else if (def.theme === 'arena_beach') {
          const isCross = Math.abs(dx) < 88 || Math.abs(dy) < 88 || distC < 160;
          if (isCross) {
            const c = (tile16 ? 228 : 216) + fine * 0.6;
            texPixels[idx] = packRGB(c, c - 36, c - 98);
          } else {
            texPixels[idx] = tile32
              ? packRGB(242 + fine * 0.6, 214 + fine * 0.6, 140 + fine * 0.6)
              : packRGB(230 + fine * 0.6, 202 + fine * 0.6, 128 + fine * 0.6);
          }
        } else if (def.theme === 'arena_castle') {
          const inForge = distC < 235;
          const b = (tile32 ? 72 : 62) + fine * 0.6 - (seam ? 14 : 0);
          if (inForge && Math.abs(distC - 230) < 5) {
            texPixels[idx] = packRGB(249, 115, 22);
          } else {
            texPixels[idx] = packRGB(b + (inForge ? 18 : 6), b, b + 8);
          }
        } else if (def.theme === 'arena_ice') {
          const shimmer = ((x + y) & 63) < 4 ? 18 : 0;
          const r = (tile32 ? 174 : 162) + shimmer;
          const g = (tile32 ? 226 : 216) + shimmer;
          const b = 250;
          texPixels[idx] = Math.abs(distC - 130) < 4
            ? packRGB(56, 189, 248)
            : packRGB(Math.min(255, r), Math.min(255, g), b);
        } else if (def.theme === 'arena_haunted') {
          const inCourt = distC < 280;
          const c = (tile32 ? 64 : 54) + fine * 0.5 - (seam ? 12 : 0);
          texPixels[idx] = inCourt
            ? packRGB(c + 18, c + 12, c + 36)
            : packRGB(c, c + 10, c + 14);
        } else if (def.theme === 'arena_desert') {
          const ring = Math.abs(distC - 260) < 5;
          texPixels[idx] = ring
            ? packRGB(217, 119, 6)
            : (tile32
              ? packRGB(216 + fine * 0.7, 154 + fine * 0.7, 94 + fine * 0.7)
              : packRGB(204 + fine * 0.7, 142 + fine * 0.7, 84 + fine * 0.7));
        } else if (def.theme === 'arena_cyber') {
          const gridLine = (x & 31) < 2 || (y & 31) < 2;
          if (gridLine) {
            const cyan = distC < 290;
            texPixels[idx] = cyan ? packRGB(34, 211, 238) : packRGB(217, 70, 239);
          } else {
            texPixels[idx] = tile32 ? packRGB(18, 16, 42) : packRGB(13, 12, 32);
          }
        } else if (def.theme === 'arena_sky') {
          const goldTrim = Math.abs(distC - 140) < 5 || Math.abs(distC - 275) < 5;
          if (goldTrim) {
            texPixels[idx] = packRGB(250, 204, 21);
          } else {
            const m = (tile32 ? 236 : 222) + fine * 0.4 - (seam ? 12 : 0);
            texPixels[idx] = packRGB(m, m, Math.min(255, m + 6));
          }
        } else {
          // Rainbow Star Dome
          const angleHue = ((Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2)) * 360;
          const radHue = (angleHue + distC * 0.4) % 360;
          const [rr, gg, bb] = hslToRgb(radHue, 0.78, tile32 ? 0.42 : 0.34);
          const star = Math.abs(distC - 150) < 4;
          texPixels[idx] = star ? packRGB(255, 245, 160) : packRGB(rr, gg, bb);
        }
      }
    }

    // 2. Shade Hideout Cover Zones subtly darker with diagonal "SAFE / NO LOOT" floor stripes
    for (const hz of def.hideZones) {
      const minX = Math.max(perimeterThickness, Math.floor(hz.x));
      const maxX = Math.min(size - perimeterThickness - 1, Math.ceil(hz.x + hz.w));
      const minY = Math.max(perimeterThickness, Math.floor(hz.y));
      const maxY = Math.min(size - perimeterThickness - 1, Math.ceil(hz.y + hz.h));
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const idx = y * size + x;
          const c = texPixels[idx];
          let r = c & 0xff;
          let g = (c >> 8) & 0xff;
          let b = (c >> 16) & 0xff;
          const stripe = ((x + y) >> 3) & 1;
          const mult = stripe ? 0.62 : 0.72;
          texPixels[idx] = packRGB((r * mult) | 0, (g * mult) | 0, (b * mult) | 0);
        }
      }
    }

    // 3. Paint Hazard Pools (lava/water pits)
    for (const pool of def.hazards) {
      const r2 = pool.r * pool.r;
      for (let y = Math.max(32, Math.floor(pool.y - pool.r)); y <= Math.min(size - 33, Math.ceil(pool.y + pool.r)); y++) {
        for (let x = Math.max(32, Math.floor(pool.x - pool.r)); x <= Math.min(size - 33, Math.ceil(pool.x + pool.r)); x++) {
          const d2 = (x - pool.x) ** 2 + (y - pool.y) ** 2;
          if (d2 <= r2) {
            const idx = y * size + x;
            surfaceGrid[idx] = SURFACE.HAZARD;
            const rip = ((Math.floor(Math.sqrt(d2)) >> 2) & 1) * 22;
            if (def.theme === 'arena_beach') {
              texPixels[idx] = packRGB(12, 132 + rip, 232);
            } else {
              texPixels[idx] = packRGB(248, 92 + rip * 2, 14);
            }
          }
        }
      }
    }

    // 4. Paint High-Speed Boost Pads (Always in open arena lanes!)
    for (const bp of def.boostPads) {
      const minX = Math.max(32, Math.floor(bp.x));
      const maxX = Math.min(size - 33, Math.ceil(bp.x + bp.w));
      const minY = Math.max(32, Math.floor(bp.y));
      const maxY = Math.min(size - 33, Math.ceil(bp.y + bp.h));
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const idx = y * size + x;
          surfaceGrid[idx] = SURFACE.BOOST;
          const chev = ((x + y) >> 3) & 1;
          texPixels[idx] = chev ? packRGB(255, 235, 20) : packRGB(249, 115, 22);
        }
      }
    }

    // 5. Mark Wall Footprints on surfaceGrid & paint crisp top-down map footprint for Minimap/Preview
    for (const w of allWalls) {
      const minX = Math.max(0, Math.floor(w.x));
      const maxX = Math.min(size - 1, Math.ceil(w.x + w.w) - 1);
      const minY = Math.max(0, Math.floor(w.y));
      const maxY = Math.min(size - 1, Math.ceil(w.y + w.h) - 1);
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const idx = y * size + x;
          surfaceGrid[idx] = SURFACE.WALL;
          const edge = x === minX || x === maxX || y === minY || y === maxY;
          if (w.isBorder) {
            const blk = ((x >> 4) + (y >> 4)) & 1;
            texPixels[idx] = blk ? packRGB(220, 38, 38) : packRGB(241, 245, 249);
          } else if (def.wallStyle === 'neon_cyber') {
            texPixels[idx] = edge ? packRGB(56, 189, 248) : packRGB(45, 18, 72);
          } else if (def.wallStyle === 'ice_crystal') {
            texPixels[idx] = edge ? packRGB(240, 249, 255) : packRGB(56, 189, 248);
          } else if (def.wallStyle === 'hedge_maze') {
            texPixels[idx] = edge ? packRGB(74, 222, 128) : packRGB(20, 83, 45);
          } else if (def.wallStyle === 'castle_obsidian') {
            texPixels[idx] = edge ? packRGB(249, 115, 22) : packRGB(30, 30, 40);
          } else if (def.wallStyle === 'rainbow_prism') {
            texPixels[idx] = edge ? packRGB(255, 255, 255) : packRGB(129, 140, 248);
          } else {
            texPixels[idx] = edge ? packRGB(250, 204, 21) : packRGB(120, 82, 54);
          }
        }
      }
    }

    // Helper to confirm a world point is strictly in open arena space (NOT inside a wall, hazard, or hideout!)
    const isOpenLootSpot = (px, py, pad = 22) => {
      if (px < 65 || px > size - 65 || py < 65 || py > size - 65) return false;
      for (const w of allWalls) {
        if (pointInRect(px, py, w, pad)) return false;
      }
      for (const hz of def.hideZones) {
        if (pointInRect(px, py, hz, 6)) return false;
      }
      for (const pool of def.hazards) {
        if (Math.hypot(px - pool.x, py - pool.y) < pool.r + 18) return false;
      }
      return true;
    };

    // 6. Populate Abundant Open-Arena Power-Up Item Boxes (NEVER in hideouts!)
    const itemBoxes = [];
    const { r1, c1, r2, c2 } = def.itemRing;

    // Inner high-value rapid-respawn hot-zone ring
    for (let i = 0; i < c1; i++) {
      const a = (i / c1) * Math.PI * 2 + 0.25;
      const ix = 512 + Math.cos(a) * r1;
      const iy = 512 + Math.sin(a) * r1;
      if (isOpenLootSpot(ix, iy, 18)) {
        itemBoxes.push({ x: ix, y: iy, active: true, respawnTimer: 0, respawnDelay: 2.4, hotZone: true });
      }
    }
    // Outer open-lane power-up ring
    for (let i = 0; i < c2; i++) {
      const a = (i / c2) * Math.PI * 2;
      const ix = 512 + Math.cos(a) * r2;
      const iy = 512 + Math.sin(a) * r2;
      if (isOpenLootSpot(ix, iy, 18)) {
        itemBoxes.push({ x: ix, y: iy, active: true, respawnTimer: 0, respawnDelay: 3.4, hotZone: false });
      }
    }
    // Center crown item box if clear
    if (isOpenLootSpot(512, 512, 16)) {
      itemBoxes.push({ x: 512, y: 512, active: true, respawnTimer: 0, respawnDelay: 2.2, hotZone: true });
    }

    // 7. Compute 8 Clean Symmetrical Spawn Points facing into the arena
    const spawnPoints = [];
    const spawnRadius = 355;
    for (let i = 0; i < 8; i++) {
      const baseAngle = (i / 8) * Math.PI * 2 + Math.PI * 0.125;
      let sx = 512 + Math.cos(baseAngle) * spawnRadius;
      let sy = 512 + Math.sin(baseAngle) * spawnRadius;
      // Nudge inward if overlapping a wall or hazard
      let rTry = spawnRadius;
      for (let step = 0; step < 10; step++) {
        let blocked = false;
        for (const w of allWalls) {
          if (pointInRect(sx, sy, w, 24)) { blocked = true; break; }
        }
        for (const pool of def.hazards) {
          if (Math.hypot(sx - pool.x, sy - pool.y) < pool.r + 22) { blocked = true; break; }
        }
        if (!blocked) break;
        rTry -= 26;
        sx = 512 + Math.cos(baseAngle) * rTry;
        sy = 512 + Math.sin(baseAngle) * rTry;
      }
      spawnPoints.push({
        x: sx,
        y: sy,
        angle: Math.atan2(512 - sy, 512 - sx)
      });
    }

    return {
      isArena: true,
      def,
      size,
      spline: null,
      texPixels,
      surfaceGrid,
      walls: allWalls,
      hideZones: def.hideZones,
      boostPads: def.boostPads,
      spawnPoints,
      itemBoxes,
      coins: [],
      scenery: []
    };
  }

  static renderPreview(arenaIndex, canvas) {
    const def = ARENA_DEFS[arenaIndex] || ARENA_DEFS[0];
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const sx = w / 1024;
    const sy = h / 1024;

    // Fast vector preview (<0.2ms per arena) so all 10 thumbnails render instantaneously!
    const bgMap = {
      arena_block: '#788496',
      arena_meadow: '#34a848',
      arena_beach: '#e6ca80',
      arena_castle: '#3f343b',
      arena_ice: '#a5e1fa',
      arena_haunted: '#2c2246',
      arena_desert: '#cc9258',
      arena_cyber: '#12102a',
      arena_sky: '#dfe6f2',
      arena_rainbow: '#312e81'
    };
    ctx.fillStyle = bgMap[def.theme] || '#334155';
    ctx.fillRect(0, 0, w, h);

    // Subtle open central arena plaza circle
    ctx.fillStyle = def.theme === 'arena_cyber' ? 'rgba(34,211,238,0.18)' : 'rgba(255,255,255,0.14)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.5, 250 * sx, 250 * sy, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hideout shaded cover bays
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    for (const hz of def.hideZones) {
      ctx.fillRect(hz.x * sx, hz.y * sy, hz.w * sx, hz.h * sy);
    }

    // Hazards
    ctx.fillStyle = def.theme === 'arena_beach' ? '#0ea5e9' : '#f97316';
    for (const pool of def.hazards) {
      ctx.beginPath();
      ctx.ellipse(pool.x * sx, pool.y * sy, pool.r * sx, pool.r * sy, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Boost pads
    ctx.fillStyle = '#f97316';
    for (const bp of def.boostPads) {
      ctx.fillRect(bp.x * sx, bp.y * sy, bp.w * sx, bp.h * sy);
    }

    // 3D Cover Walls
    const wallCol = def.wallStyle === 'neon_cyber' ? '#22d3ee'
      : (def.wallStyle === 'ice_crystal' ? '#e0f2fe'
        : (def.wallStyle === 'hedge_maze' ? '#15803d'
          : (def.wallStyle === 'castle_obsidian' ? '#18181b'
            : (def.wallStyle === 'rainbow_prism' ? '#f472b6' : '#b45309'))));
    ctx.fillStyle = wallCol;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    for (const wl of def.walls) {
      ctx.fillRect(wl.x * sx, wl.y * sy, Math.max(2, wl.w * sx), Math.max(2, wl.h * sy));
      ctx.strokeRect(wl.x * sx, wl.y * sy, Math.max(2, wl.w * sx), Math.max(2, wl.h * sy));
    }

    // Outer perimeter border
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    // Golden open-arena power-up dots
    ctx.fillStyle = '#ffe600';
    const { r1, c1, r2, c2 } = def.itemRing;
    for (let i = 0; i < c1; i++) {
      const a = (i / c1) * Math.PI * 2 + 0.25;
      ctx.fillRect((512 + Math.cos(a) * r1) * sx - 1.5, (512 + Math.sin(a) * r1) * sy - 1.5, 3, 3);
    }
    for (let i = 0; i < c2; i++) {
      const a = (i / c2) * Math.PI * 2;
      ctx.fillRect((512 + Math.cos(a) * r2) * sx - 1.5, (512 + Math.sin(a) * r2) * sy - 1.5, 3, 3);
    }
  }
}

window.ARENA_DEFS = ARENA_DEFS;
window.ArenaBuilder = ArenaBuilder;
