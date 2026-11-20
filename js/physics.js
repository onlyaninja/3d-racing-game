// Kart Physics, Character Trade-offs, Race Mode (Lakitu & Wrong-Way) + Battle Mode (3 Lives, 3D Cover Walls, Smart Battle AI)

const DRIVER_ROSTER = [
  {
    id: 0, name: 'MARIO', short: 'MAR', weightClass: 'All-Rounder',
    color: '#ef4444', hat: '#dc2626', overalls: '#2563eb', skin: '#fca5a5', emblem: 'M',
    statSpeed: 7, statAccel: 7, statHandling: 7,
    topSpeed: 1.00, accel: 1.00, handling: 1.00, mass: 1.0
  },
  {
    id: 1, name: 'LUIGI', short: 'LUI', weightClass: 'Balanced+',
    color: '#22c55e', hat: '#16a34a', overalls: '#1d4ed8', skin: '#fca5a5', emblem: 'L',
    statSpeed: 7, statAccel: 8, statHandling: 8,
    topSpeed: 0.99, accel: 1.05, handling: 1.05, mass: 1.0
  },
  {
    id: 2, name: 'PEACH', short: 'PEA', weightClass: 'Acceleration',
    color: '#f472b6', hat: '#facc15', overalls: '#ec4899', skin: '#fde68a', emblem: '♛',
    statSpeed: 6, statAccel: 10, statHandling: 8,
    topSpeed: 0.96, accel: 1.24, handling: 1.12, mass: 0.85
  },
  {
    id: 3, name: 'YOSHI', short: 'YOS', weightClass: 'Turbo Accel',
    color: '#84cc16', hat: '#65a30d', overalls: '#ffffff', skin: '#bef264', emblem: 'Y',
    statSpeed: 6, statAccel: 10, statHandling: 9,
    topSpeed: 0.97, accel: 1.26, handling: 1.14, mass: 0.88
  },
  {
    id: 4, name: 'BOWSER', short: 'BOW', weightClass: 'Heavy Speed',
    color: '#f97316', hat: '#dc2626', overalls: '#15803d', skin: '#facc15', emblem: '★',
    statSpeed: 10, statAccel: 4, statHandling: 4,
    topSpeed: 1.09, accel: 0.78, handling: 0.82, mass: 1.38
  },
  {
    id: 5, name: 'TOAD', short: 'TOA', weightClass: 'Ultra Grip',
    color: '#38bdf8', hat: '#f8fafc', overalls: '#2563eb', skin: '#fed7aa', emblem: 'T',
    statSpeed: 5, statAccel: 9, statHandling: 10,
    topSpeed: 0.95, accel: 1.20, handling: 1.28, mass: 0.78
  },
  {
    id: 6, name: 'KOOPA', short: 'KOO', weightClass: 'Corner Master',
    color: '#eab308', hat: '#ca8a04', overalls: '#22c55e', skin: '#fef08a', emblem: 'K',
    statSpeed: 6, statAccel: 8, statHandling: 10,
    topSpeed: 0.97, accel: 1.14, handling: 1.25, mass: 0.82
  },
  {
    id: 7, name: 'DK JR', short: 'DKJ', weightClass: 'Power Cruiser',
    color: '#a16207', hat: '#f8fafc', overalls: '#dc2626', skin: '#d97706', emblem: 'D',
    statSpeed: 9, statAccel: 5, statHandling: 5,
    topSpeed: 1.07, accel: 0.84, handling: 0.86, mass: 1.28
  }
];

const ITEMS = {
  NONE: null,
  MUSHROOM: 'MUSHROOM',
  GREEN_SHELL: 'GREEN_SHELL',
  RED_SHELL: 'RED_SHELL',
  BANANA: 'BANANA',
  STAR: 'STAR',
  LIGHTNING: 'LIGHTNING'
};

window.DRIVER_ROSTER = DRIVER_ROSTER;
window.ITEMS = ITEMS;

function normalizeAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function segmentIntersectsRect(x1, y1, x2, y2, rect) {
  let t0 = 0;
  let t1 = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;

  const checks = [
    [-dx, x1 - rect.x],
    [dx, rect.x + rect.w - x1],
    [-dy, y1 - rect.y],
    [dy, rect.y + rect.h - y1]
  ];

  for (const [p, q] of checks) {
    if (Math.abs(p) < 1e-6) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return t0 <= t1;
}

class Kart {
  constructor(rosterInfo, isHuman, playerIndex, gridRank) {
    this.setCharacter(rosterInfo, isHuman, playerIndex);
    this.cupPoints = 0;
    this.resetForTrack(null, gridRank);
  }

  setCharacter(rosterInfo, isHuman, playerIndex) {
    this.info = rosterInfo;
    this.id = rosterInfo.id;
    this.isHuman = isHuman;
    this.playerIndex = playerIndex; // 0 for P1, 1 for P2, -1 for AI
    this.name = isHuman ? `${rosterInfo.name} (P${playerIndex + 1})` : rosterInfo.name;
  }

  resetCommon(gridRank) {
    this.vx = 0;
    this.vy = 0;
    this.speed = 0;
    this.z = 0;
    this.vz = 0;

    this.drifting = false;
    this.driftDir = 0;
    this.driftCharge = 0;

    this.boostTimer = 0;
    this.starTimer = 0;
    this.shrinkTimer = 0;
    this.spinTimer = 0;

    // Lakitu 2.0-second Off-Track / Hazard Rescue state
    this.offTrackTime = 0;
    this.rescueState = 'NONE';
    this.rescueTimer = 0;
    this.rescueStartX = 0;
    this.rescueStartY = 0;
    this.rescueTargetX = 0;
    this.rescueTargetY = 0;
    this.rescueTargetAngle = 0;

    // Wrong-way detection (Race Mode)
    this.wrongWay = false;
    this.wrongWayTime = 0;
    this._lastWrongBeep = 0;

    // Battle Mode stats
    this.lives = 3;
    this.eliminated = false;
    this.eliminatedOrder = 0;
    this.invulnTimer = 0;
    this.hitsScored = 0;
    this.kosScored = 0;
    this.inHideout = false;
    this.inHideoutTimer = 0;
    this.spectateIndex = 0;

    // AI Battle timers
    this.aiItemDelay = 0;
    this.aiStuckTimer = 0;
    this.aiUnstickTimer = 0;
    this.aiUnstickDir = 1;
    this.aiWanderAngle = (gridRank * 1.1) % (Math.PI * 2);
    this.aiRetargetTimer = 0;

    this.coins = 0;
    this.heldItem = ITEMS.NONE;
    this.itemNotifyText = '';
    this.itemNotifyTimer = 0;

    this.lap = 1;
    this.maxWaypointSeen = 0;
    this.nearestWaypoint = 0;
    this.totalProgress = 0;
    this.rank = gridRank + 1;
    this.finished = false;
    this.finishTime = 0;
    this.steerVisual = 0;
    this.aiLaneOffset = ((gridRank % 5) - 2) * 7.5;
  }

  resetForTrack(track, gridRank = 0) {
    this.resetCommon(gridRank);
    this.x = 512;
    this.y = 830;
    this.angle = Math.PI;
    this.visualAngle = Math.PI;

    if (track && track.spline) {
      const sp = track.spline;
      const startIdx = (sp.length - 6 - gridRank * 3 + sp.length) % sp.length;
      const pt = sp[startIdx];
      const lateral = (gridRank % 2 === 0 ? -1 : 1) * 13;
      this.x = pt.x + pt.nx * lateral;
      this.y = pt.y + pt.ny * lateral;
      this.angle = Math.atan2(pt.ty, pt.tx);
      this.visualAngle = this.angle;
      this.nearestWaypoint = startIdx;
    }
  }

  resetForArena(arena, spawnIdx = 0) {
    this.resetCommon(spawnIdx);
    const sp = arena.spawnPoints[spawnIdx % arena.spawnPoints.length];
    this.x = sp.x;
    this.y = sp.y;
    this.angle = sp.angle;
    this.visualAngle = sp.angle;
    this.rank = 1;
  }
}

class RaceWorld {
  constructor() {
    this.karts = DRIVER_ROSTER.map((r, idx) => new Kart(r, idx < 2, idx < 2 ? idx : -1, idx));
    this.p1Kart = this.karts[0];
    this.p2Kart = this.karts[1];
    this.gameMode = 'RACE'; // 'RACE' | 'BATTLE'
    this.track = null;
    this.projectiles = [];
    this.particles = [];
    this.totalLaps = 3;
    this.raceTime = 0;
    this.countdown = 3.4;
    this.lightningFlashTimer = 0;
    this.eventBannerText = '';
    this.eventBannerTimer = 0;
    this.eliminationCounter = 0;
    this.battleEndTimer = 0;
    this.state = 'COUNTDOWN';
  }

  configureDrivers(p1RosterId, p2RosterId, resetCup = true) {
    const p1Char = DRIVER_ROSTER[p1RosterId] || DRIVER_ROSTER[0];
    let p2Char = DRIVER_ROSTER[p2RosterId] || DRIVER_ROSTER[1];
    if (p2Char.id === p1Char.id) {
      p2Char = DRIVER_ROSTER[(p1Char.id + 1) % DRIVER_ROSTER.length];
    }

    const aiChars = DRIVER_ROSTER.filter(r => r.id !== p1Char.id && r.id !== p2Char.id);

    const orderedSetup = [
      ...aiChars.map(c => ({ char: c, isHuman: false, pIdx: -1 })),
      { char: p1Char, isHuman: true, pIdx: 0 },
      { char: p2Char, isHuman: true, pIdx: 1 }
    ];

    orderedSetup.forEach((cfg, idx) => {
      const k = this.karts[idx];
      const prevPoints = resetCup ? 0 : k.cupPoints;
      k.setCharacter(cfg.char, cfg.isHuman, cfg.pIdx);
      k.cupPoints = prevPoints;
      if (cfg.pIdx === 0) this.p1Kart = k;
      if (cfg.pIdx === 1) this.p2Kart = k;
    });
  }

  loadTrack(trackIndex) {
    this.gameMode = 'RACE';
    this.track = TrackBuilder.generate(trackIndex);
    this.projectiles = [];
    this.particles = [];
    this.raceTime = 0;
    this.countdown = 3.4;
    this.lightningFlashTimer = 0;
    this.eventBannerText = '';
    this.eventBannerTimer = 0;
    this.eliminationCounter = 0;
    this.battleEndTimer = 0;
    this.state = 'COUNTDOWN';
    this._lastBeepSec = 4;

    const aiKarts = this.karts.filter(k => !k.isHuman);
    const humanKarts = this.karts.filter(k => k.isHuman);
    const gridList = [...aiKarts, ...humanKarts];
    gridList.forEach((k, gridIdx) => {
      k.resetForTrack(this.track, gridIdx);
    });
  }

  loadArena(arenaIndex) {
    this.gameMode = 'BATTLE';
    this.track = ArenaBuilder.generate(arenaIndex);
    this.projectiles = [];
    this.particles = [];
    this.raceTime = 0;
    this.countdown = 3.1;
    this.lightningFlashTimer = 0;
    this.eventBannerText = '';
    this.eventBannerTimer = 0;
    this.eliminationCounter = 0;
    this.battleEndTimer = 0;
    this.state = 'COUNTDOWN';
    this._lastBeepSec = 4;

    // Interleave P1 and P2 on opposite sides of the 8-fighter circle for instant fair combat!
    const aiKarts = this.karts.filter(k => !k.isHuman);
    const slotOrder = [
      this.p1Kart,
      aiKarts[0],
      aiKarts[1],
      aiKarts[2],
      this.p2Kart,
      aiKarts[3],
      aiKarts[4],
      aiKarts[5]
    ];
    slotOrder.forEach((k, idx) => {
      k.resetForArena(this.track, idx);
    });
  }

  getKartById(id) {
    return this.karts.find(k => k.id === id) || null;
  }

  getAliveKarts() {
    return this.karts.filter(k => !k.eliminated);
  }

  getSpectateTarget(humanKart) {
    const alive = this.getAliveKarts();
    if (alive.length === 0) return humanKart;
    const idx = ((humanKart.spectateIndex % alive.length) + alive.length) % alive.length;
    return alive[idx];
  }

  hasLineOfSight(x1, y1, x2, y2) {
    if (!this.track || !this.track.walls || this.track.walls.length === 0) return true;
    for (const w of this.track.walls) {
      if (w.isBorder) continue;
      if (segmentIntersectsRect(x1, y1, x2, y2, w)) return false;
    }
    return true;
  }

  spawnParticle(x, y, z, color, vx, vy, vz, life = 0.45, size = 3) {
    if (this.particles.length > 260) return;
    this.particles.push({ x, y, z, color, vx, vy, vz, life, maxLife: life, size });
  }

  spawnExplosion(x, y, count = 18, palette = ['#ef4444', '#ffe600', '#38bdf8', '#ffffff']) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 28 + Math.random() * 95;
      this.spawnParticle(
        x, y, 8 + Math.random() * 10,
        palette[i % palette.length],
        Math.cos(a) * spd,
        Math.sin(a) * spd,
        35 + Math.random() * 65,
        0.5 + Math.random() * 0.45,
        3.5 + Math.random() * 2.5
      );
    }
  }

  rollRandomItem(rank, isHotZone = false) {
    const r = Math.random();
    if (this.gameMode === 'BATTLE') {
      // Action-packed Battle Mode power-up distribution (with Lightning kept ultra-rare at 1%)
      if (isHotZone) {
        if (r < 0.36) return ITEMS.RED_SHELL;
        if (r < 0.62) return ITEMS.GREEN_SHELL;
        if (r < 0.80) return ITEMS.STAR;
        if (r < 0.93) return ITEMS.MUSHROOM;
        if (r < 0.99) return ITEMS.BANANA;
        return ITEMS.LIGHTNING;
      }
      if (r < 0.30) return ITEMS.RED_SHELL;
      if (r < 0.58) return ITEMS.GREEN_SHELL;
      if (r < 0.77) return ITEMS.MUSHROOM;
      if (r < 0.90) return ITEMS.BANANA;
      if (r < 0.99) return ITEMS.STAR;
      return ITEMS.LIGHTNING;
    }

    // Race Mode item probabilities (Lightning reduced 10x)
    if (rank <= 2) {
      if (r < 0.38) return ITEMS.BANANA;
      if (r < 0.75) return ITEMS.GREEN_SHELL;
      if (r < 0.94) return ITEMS.MUSHROOM;
      return ITEMS.RED_SHELL;
    } else if (rank <= 5) {
      if (r < 0.31) return ITEMS.MUSHROOM;
      if (r < 0.62) return ITEMS.RED_SHELL;
      if (r < 0.84) return ITEMS.GREEN_SHELL;
      if (r < 0.99) return ITEMS.STAR;
      return ITEMS.LIGHTNING;
    } else {
      if (r < 0.36) return ITEMS.MUSHROOM;
      if (r < 0.72) return ITEMS.RED_SHELL;
      if (r < 0.982) return ITEMS.STAR;
      return ITEMS.LIGHTNING;
    }
  }

  grantItem(kart, itemType) {
    if (kart.eliminated) return;
    kart.heldItem = itemType;
    kart.itemNotifyText = `GOT ${itemType.replace('_', ' ')}!`;
    kart.itemNotifyTimer = 1.6;
    if (kart.isHuman) window.sound.playItemPickup();
  }

  damageBattleKart(victim, attacker, reasonText = 'HIT') {
    if (this.gameMode !== 'BATTLE') return;
    if (!victim || victim.eliminated || victim.invulnTimer > 0 || victim.starTimer > 0 || victim.rescueState === 'RESCUING') {
      return;
    }

    victim.lives = Math.max(0, victim.lives - 1);
    victim.invulnTimer = 2.0;
    victim.spinTimer = 0.85;
    victim.speed *= 0.28;
    victim.drifting = false;

    if (attacker && attacker.id !== victim.id) {
      attacker.hitsScored++;
    }

    // Balloon pop burst
    this.spawnExplosion(victim.x, victim.y, 20, ['#ef4444', '#ffe600', '#38bdf8', '#f472b6', '#ffffff']);

    if (victim.lives <= 0) {
      // 3rd life lost — ELIMINATED! Kart disappears from the arena!
      victim.eliminated = true;
      victim.heldItem = ITEMS.NONE;
      victim.speed = 0;
      victim.vx = 0;
      victim.vy = 0;
      this.eliminationCounter++;
      victim.eliminatedOrder = this.eliminationCounter;
      victim.finishTime = this.raceTime;

      if (attacker && attacker.id !== victim.id) {
        attacker.kosScored++;
      }

      this.spawnExplosion(victim.x, victim.y, 34, ['#f97316', '#ffe600', '#ef4444', '#ffffff']);
      window.sound.playElimination();

      const aliveCount = this.getAliveKarts().length;
      if (attacker && attacker.id !== victim.id) {
        this.eventBannerText = `💥 ${victim.info.name} KO'D BY ${attacker.info.name}! (${aliveCount} LEFT)`;
      } else {
        this.eventBannerText = `💥 ${victim.info.name} ELIMINATED! (${aliveCount} LEFT)`;
      }
      this.eventBannerTimer = 2.8;
    } else {
      window.sound.playBalloonPop();
      victim.itemNotifyText = `🎈 ${reasonText}! ${victim.lives} ${victim.lives === 1 ? 'LIFE' : 'LIVES'} LEFT`;
      victim.itemNotifyTimer = 1.8;
      if (attacker && attacker.id !== victim.id && attacker.isHuman) {
        attacker.itemNotifyText = `🎯 HIT ${victim.info.name}!`;
        attacker.itemNotifyTimer = 1.4;
      }
    }
  }

  useItem(kart) {
    if (kart.eliminated || !kart.heldItem || kart.spinTimer > 0 || kart.rescueState === 'RESCUING') return;
    const item = kart.heldItem;
    kart.heldItem = ITEMS.NONE;

    if (item === ITEMS.MUSHROOM) {
      kart.boostTimer = Math.max(kart.boostTimer, 1.65);
      kart.speed = Math.max(kart.speed, 210);
      kart.itemNotifyText = '🍄 TURBO BOOST!';
      kart.itemNotifyTimer = 1.4;
      if (kart.isHuman) window.sound.playBoost();
      for (let i = 0; i < 12; i++) {
        this.spawnParticle(
          kart.x, kart.y, 4,
          '#ffe600',
          (Math.random() - 0.5) * 65,
          (Math.random() - 0.5) * 65,
          20 + Math.random() * 35,
          0.45, 4
        );
      }
    } else if (item === ITEMS.STAR) {
      kart.starTimer = 7.0;
      kart.boostTimer = Math.max(kart.boostTimer, 7.0);
      kart.speed = Math.max(kart.speed, 198);
      kart.itemNotifyText = '⭐ STAR INVINCIBILITY!';
      kart.itemNotifyTimer = 2.0;
      if (kart.isHuman) window.sound.playBoost();
    } else if (item === ITEMS.BANANA) {
      const bx = kart.x - Math.cos(kart.angle) * 16;
      const by = kart.y - Math.sin(kart.angle) * 16;
      this.projectiles.push({
        type: 'BANANA',
        ownerId: kart.id,
        x: bx,
        y: by,
        vx: 0,
        vy: 0,
        life: 45,
        maxLife: 45,
        bounces: 0
      });
      kart.itemNotifyText = '🍌 DROPPED BANANA!';
      kart.itemNotifyTimer = 1.1;
      if (kart.isHuman) window.sound.playShoot();
    } else if (item === ITEMS.GREEN_SHELL || item === ITEMS.RED_SHELL) {
      const sx = kart.x + Math.cos(kart.angle) * 16;
      const sy = kart.y + Math.sin(kart.angle) * 16;
      const shellSpeed = this.gameMode === 'BATTLE' ? 275 : 255;
      let targetKart = null;

      if (item === ITEMS.RED_SHELL) {
        if (this.gameMode === 'BATTLE') {
          // Lock onto best alive enemy (strongly prefers targets in front & visible!)
          let bestScore = Infinity;
          const fx = Math.cos(kart.angle);
          const fy = Math.sin(kart.angle);
          for (const other of this.karts) {
            if (other.id === kart.id || other.eliminated) continue;
            const dx = other.x - kart.x;
            const dy = other.y - kart.y;
            const dist = Math.hypot(dx, dy);
            const dot = (dx * fx + dy * fy) / (dist || 1);
            const losBonus = this.hasLineOfSight(kart.x, kart.y, other.x, other.y) ? 0 : 180;
            const score = dist + (1 - dot) * 160 + losBonus;
            if (score < bestScore) {
              bestScore = score;
              targetKart = other;
            }
          }
        } else {
          const desiredRank = kart.rank > 1 ? kart.rank - 1 : 2;
          targetKart = this.karts.find(k => k.rank === desiredRank && k.id !== kart.id) || null;
          if (!targetKart) {
            targetKart = this.karts.find(k => k.id !== kart.id) || null;
          }
        }
      }

      this.projectiles.push({
        type: item,
        ownerId: kart.id,
        x: sx,
        y: sy,
        vx: Math.cos(kart.angle) * shellSpeed,
        vy: Math.sin(kart.angle) * shellSpeed,
        speed: shellSpeed,
        target: targetKart,
        waypointIdx: kart.nearestWaypoint,
        life: 8.5,
        maxLife: 8.5,
        bounces: this.gameMode === 'BATTLE' ? 6 : 5
      });
      kart.itemNotifyText = item === ITEMS.RED_SHELL ? '🔴 HOMING RED SHELL!' : '🟢 FIRED GREEN SHELL!';
      kart.itemNotifyTimer = 1.2;
      if (kart.isHuman) window.sound.playShoot();
    } else if (item === ITEMS.LIGHTNING) {
      window.sound.playLightning();
      this.lightningFlashTimer = 0.55;
      this.eventBannerText = `⚡ ${kart.info.name} USED LIGHTNING BOLT! ⚡`;
      this.eventBannerTimer = 2.4;
      for (const other of this.karts) {
        if (other.id !== kart.id && !other.eliminated && other.starTimer <= 0) {
          other.shrinkTimer = 7.0;
          other.spinTimer = 0.85;
          other.speed *= 0.4;
        }
      }
    }
  }

  triggerLakituRescue(kart) {
    kart.rescueState = 'RESCUING';
    kart.rescueTimer = 0;
    kart.offTrackTime = 0;
    kart.speed = 0;
    kart.vx = 0;
    kart.vy = 0;
    kart.drifting = false;
    kart.spinTimer = 0;

    kart.rescueStartX = kart.x;
    kart.rescueStartY = kart.y;

    if (this.gameMode === 'BATTLE') {
      // Rescue back toward center open floor safely away from hazards & walls
      const dx = 512 - kart.x;
      const dy = 512 - kart.y;
      const len = Math.hypot(dx, dy) || 1;
      kart.rescueTargetX = kart.x + (dx / len) * 95;
      kart.rescueTargetY = kart.y + (dy / len) * 95;
      kart.rescueTargetAngle = Math.atan2(dy, dx);
    } else {
      const sp = this.track.spline;
      const pt = sp[kart.nearestWaypoint];
      kart.rescueTargetX = pt.x;
      kart.rescueTargetY = pt.y;
      kart.rescueTargetAngle = Math.atan2(pt.ty, pt.tx);
      kart.coins = Math.max(0, kart.coins - 2);
    }

    if (kart.isHuman) {
      window.sound.playRescue();
    }
  }

  update(dt, p1Input, p2Input) {
    if (!this.track) return;

    if (this.lightningFlashTimer > 0) this.lightningFlashTimer -= dt;
    if (this.eventBannerTimer > 0) this.eventBannerTimer -= dt;

    if (this.state === 'COUNTDOWN') {
      this.countdown -= dt;
      const sec = Math.ceil(this.countdown);
      if (sec < this._lastBeepSec && sec >= 1 && sec <= 3) {
        this._lastBeepSec = sec;
        window.sound.playCountdown(false);
      }
      if (this.countdown <= 0) {
        this.state = 'RACING';
        window.sound.playCountdown(true);
      }
      return;
    }

    this.raceTime += dt;

    // Respawn Item Boxes & Coins
    for (const box of this.track.itemBoxes) {
      if (!box.active) {
        box.respawnTimer -= dt;
        if (box.respawnTimer <= 0) box.active = true;
      }
    }
    for (const coin of this.track.coins) {
      if (!coin.active) {
        coin.respawnTimer -= dt;
        if (coin.respawnTimer <= 0) coin.active = true;
      }
    }

    // Allow eliminated human players to switch spectator camera with their Item key!
    if (this.gameMode === 'BATTLE') {
      if (this.p1Kart.eliminated && p1Input.itemPressed) {
        this.p1Kart.spectateIndex++;
      }
      if (this.p2Kart.eliminated && p2Input.itemPressed) {
        this.p2Kart.spectateIndex++;
      }
    }

    // Update all active Karts
    for (const kart of this.karts) {
      if (kart.eliminated) continue;
      let input;
      if (kart.isHuman && !kart.finished) {
        input = kart.playerIndex === 0 ? p1Input : p2Input;
      } else if (this.gameMode === 'BATTLE') {
        input = this.computeBattleAIInput(kart, dt);
      } else {
        input = this.computeAIInput(kart, dt);
      }
      this.updateKartPhysics(kart, input, dt);
    }

    // Kart-to-Kart collisions
    this.resolveKartCollisions();

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z = Math.max(0, p.z + p.vz * dt);
      p.vz -= 95 * dt;
    }

    if (this.gameMode === 'BATTLE') {
      this.updateBattleStandings(dt);
    } else {
      this.updateStandings(dt);
      const humans = this.karts.filter(k => k.isHuman);
      if (humans.every(h => h.finished) && this.state === 'RACING') {
        this.state = 'FINISHED';
        this.finalizeResults();
      }
    }
  }

  computeAIInput(kart, dt) {
    if (this.gameMode === 'BATTLE') {
      return this.computeBattleAIInput(kart, dt);
    }
    const sp = this.track.spline;
    const lookAhead = 15;
    const targetIdx = (kart.nearestWaypoint + lookAhead) % sp.length;
    const pt = sp[targetIdx];

    const tx = pt.x + pt.nx * kart.aiLaneOffset;
    const ty = pt.y + pt.ny * kart.aiLaneOffset;

    const desiredAngle = Math.atan2(ty - kart.y, tx - kart.x);
    const diff = normalizeAngle(desiredAngle - kart.angle);

    let steer = 0;
    if (Math.abs(diff) > 0.04) {
      steer = Math.max(-1, Math.min(1, diff * 2.7));
    }

    let useItem = false;
    if (kart.heldItem) {
      kart.aiItemDelay += dt;
      if (kart.aiItemDelay > 1.2) {
        useItem = true;
        kart.aiItemDelay = 0;
      }
    }

    return {
      accel: true,
      brake: Math.abs(diff) > 1.2,
      steer,
      drift: Math.abs(diff) > 0.45 && kart.speed > 110,
      hopPressed: false,
      itemPressed: useItem
    };
  }

  computeBattleAIInput(kart, dt) {
    // Anti-stuck check if pressed into a wall corner
    if (kart.aiUnstickTimer > 0) {
      kart.aiUnstickTimer -= dt;
      return {
        accel: false,
        brake: true,
        steer: kart.aiUnstickDir,
        drift: false,
        hopPressed: false,
        itemPressed: false
      };
    }

    if (Math.abs(kart.speed) < 18 && kart.spinTimer <= 0 && kart.rescueState === 'NONE') {
      kart.aiStuckTimer += dt;
      if (kart.aiStuckTimer > 0.75) {
        kart.aiStuckTimer = 0;
        kart.aiUnstickTimer = 0.55;
        kart.aiUnstickDir = Math.random() < 0.5 ? -1 : 1;
      }
    } else {
      kart.aiStuckTimer = Math.max(0, kart.aiStuckTimer - dt * 2);
    }

    // Find nearest alive opponent & check for nearby Star threat
    let nearestEnemy = null;
    let nearestEnemyDist = Infinity;
    let starThreat = null;
    for (const other of this.karts) {
      if (other.id === kart.id || other.eliminated) continue;
      const d = Math.hypot(other.x - kart.x, other.y - kart.y);
      if (d < nearestEnemyDist) {
        nearestEnemyDist = d;
        nearestEnemy = other;
      }
      if (other.starTimer > 0 && d < 170) {
        starThreat = other;
      }
    }

    let targetX = 512;
    let targetY = 512;
    let fireItem = false;

    // 1. Tactical evasion if low on lives & Star enemy is close
    if (starThreat && kart.starTimer <= 0) {
      const awayX = kart.x - starThreat.x;
      const awayY = kart.y - starThreat.y;
      const len = Math.hypot(awayX, awayY) || 1;
      targetX = Math.max(80, Math.min(944, kart.x + (awayX / len) * 200));
      targetY = Math.max(80, Math.min(944, kart.y + (awayY / len) * 200));
      if (kart.heldItem === ITEMS.MUSHROOM) fireItem = true;
    } else if (!kart.heldItem) {
      // 2. No Power-Up -> Zoom aggressively into the open arena for the closest active Item Box!
      let bestBox = null;
      let bestBoxScore = Infinity;
      for (const box of this.track.itemBoxes) {
        if (!box.active) continue;
        const d = Math.hypot(box.x - kart.x, box.y - kart.y);
        const bonus = box.hotZone ? -45 : 0;
        if (d + bonus < bestBoxScore) {
          bestBoxScore = d + bonus;
          bestBox = box;
        }
      }
      if (bestBox) {
        targetX = bestBox.x;
        targetY = bestBox.y;
      } else {
        kart.aiRetargetTimer -= dt;
        if (kart.aiRetargetTimer <= 0) {
          kart.aiRetargetTimer = 2.0;
          kart.aiWanderAngle = Math.random() * Math.PI * 2;
        }
        targetX = 512 + Math.cos(kart.aiWanderAngle) * 220;
        targetY = 512 + Math.sin(kart.aiWanderAngle) * 220;
      }
    } else if (nearestEnemy) {
      // 3. Armed & Ready -> Hunt rival and shoot!
      targetX = nearestEnemy.x;
      targetY = nearestEnemy.y;

      const angleToEnemy = Math.atan2(nearestEnemy.y - kart.y, nearestEnemy.x - kart.x);
      const aimErr = Math.abs(normalizeAngle(angleToEnemy - kart.angle));
      const hasLOS = this.hasLineOfSight(kart.x, kart.y, nearestEnemy.x, nearestEnemy.y);

      kart.aiItemDelay += dt;
      if (kart.heldItem === ITEMS.MUSHROOM && kart.aiItemDelay > 0.6 && aimErr < 0.45) {
        fireItem = true;
      } else if (kart.heldItem === ITEMS.STAR && (nearestEnemyDist < 240 || kart.aiItemDelay > 2.2)) {
        fireItem = true;
      } else if (kart.heldItem === ITEMS.LIGHTNING && kart.aiItemDelay > 1.2) {
        fireItem = true;
      } else if (kart.heldItem === ITEMS.RED_SHELL && kart.aiItemDelay > 0.7 && nearestEnemyDist < 380 && aimErr < 0.75) {
        fireItem = true;
      } else if (kart.heldItem === ITEMS.GREEN_SHELL && kart.aiItemDelay > 0.5 && hasLOS && nearestEnemyDist < 310 && aimErr < 0.22) {
        fireItem = true;
      } else if (kart.heldItem === ITEMS.BANANA && (nearestEnemyDist < 105 || kart.aiItemDelay > 3.0)) {
        fireItem = true;
      }
      if (fireItem) kart.aiItemDelay = 0;
    }

    const desiredAngle = Math.atan2(targetY - kart.y, targetX - kart.x);
    let diff = normalizeAngle(desiredAngle - kart.angle);

    // 3-Feeler Wall Avoidance so AI weaves smoothly around 3D arena walls
    const feelerDist = 52;
    const probeBlocked = (ang) => {
      const px = kart.x + Math.cos(ang) * feelerDist;
      const py = kart.y + Math.sin(ang) * feelerDist;
      if (px < 46 || px > 978 || py < 46 || py > 978) return true;
      const gx = Math.max(0, Math.min(1023, Math.floor(px)));
      const gy = Math.max(0, Math.min(1023, Math.floor(py)));
      const surf = this.track.surfaceGrid[gy * 1024 + gx];
      return surf === SURFACE.WALL || surf === SURFACE.HAZARD;
    };

    if (probeBlocked(kart.angle)) {
      const leftClear = !probeBlocked(kart.angle - 0.68);
      const rightClear = !probeBlocked(kart.angle + 0.68);
      if (leftClear && !rightClear) diff = -1.2;
      else if (rightClear && !leftClear) diff = 1.2;
      else diff = diff >= 0 ? 1.3 : -1.3;
    } else if (probeBlocked(kart.angle - 0.45)) {
      diff = Math.max(diff, 0.55);
    } else if (probeBlocked(kart.angle + 0.45)) {
      diff = Math.min(diff, -0.55);
    }

    const steer = Math.abs(diff) > 0.05 ? Math.max(-1, Math.min(1, diff * 2.5)) : 0;

    return {
      accel: true,
      brake: Math.abs(diff) > 1.75 && kart.speed > 90,
      steer,
      drift: Math.abs(diff) > 0.65 && kart.speed > 105,
      hopPressed: false,
      itemPressed: fireItem
    };
  }

  resolveWallCollisionsForKart(kart) {
    if (!this.track.walls || this.track.walls.length === 0) return;
    const radius = 8.0;

    for (const w of this.track.walls) {
      const closestX = Math.max(w.x, Math.min(kart.x, w.x + w.w));
      const closestY = Math.max(w.y, Math.min(kart.y, w.y + w.h));
      const dx = kart.x - closestX;
      const dy = kart.y - closestY;
      const dist2 = dx * dx + dy * dy;

      if (dist2 < radius * radius) {
        const dist = Math.sqrt(dist2);
        let nx = 0;
        let ny = 0;
        if (dist > 0.0001) {
          nx = dx / dist;
          ny = dy / dist;
          kart.x = closestX + nx * radius;
          kart.y = closestY + ny * radius;
        } else {
          // Inside box edge fallback — push to nearest face
          const dL = Math.abs(kart.x - w.x);
          const dR = Math.abs(w.x + w.w - kart.x);
          const dT = Math.abs(kart.y - w.y);
          const dB = Math.abs(w.y + w.h - kart.y);
          const m = Math.min(dL, dR, dT, dB);
          if (m === dL) { nx = -1; kart.x = w.x - radius; }
          else if (m === dR) { nx = 1; kart.x = w.x + w.w + radius; }
          else if (m === dT) { ny = -1; kart.y = w.y - radius; }
          else { ny = 1; kart.y = w.y + w.h + radius; }
        }

        // Slide smoothly along wall instead of dead-stopping
        const vn = kart.vx * nx + kart.vy * ny;
        if (vn < 0) {
          kart.vx -= 1.35 * vn * nx;
          kart.vy -= 1.35 * vn * ny;
          kart.speed *= 0.80;
        }
      }
    }
  }

  updateKartPhysics(kart, input, dt) {
    if (kart.itemNotifyTimer > 0) kart.itemNotifyTimer -= dt;
    if (kart.boostTimer > 0) kart.boostTimer -= dt;
    if (kart.starTimer > 0) kart.starTimer -= dt;
    if (kart.shrinkTimer > 0) kart.shrinkTimer -= dt;
    if (kart.invulnTimer > 0) kart.invulnTimer -= dt;

    // Lakitu 2.0-Second Rescue Sequence
    if (kart.rescueState === 'RESCUING') {
      kart.rescueTimer += dt;
      const progress = Math.min(1.0, kart.rescueTimer / 2.0);
      const smooth = progress * progress * (3 - 2 * progress);
      kart.x = kart.rescueStartX + (kart.rescueTargetX - kart.rescueStartX) * smooth;
      kart.y = kart.rescueStartY + (kart.rescueTargetY - kart.rescueStartY) * smooth;
      kart.z = Math.sin(progress * Math.PI) * 34;

      const angleDiff = normalizeAngle(kart.rescueTargetAngle - kart.angle);
      kart.angle = normalizeAngle(kart.angle + angleDiff * Math.min(1, dt * 5));
      kart.visualAngle = kart.angle;

      if (kart.rescueTimer >= 2.0) {
        kart.rescueState = 'NONE';
        kart.rescueTimer = 0;
        kart.z = 0;
        kart.vz = 0;
        kart.angle = kart.rescueTargetAngle;
        kart.visualAngle = kart.angle;
        kart.wrongWay = false;
        kart.wrongWayTime = 0;
        if (kart.isHuman) window.sound.playCountdown(true);
      }
      return;
    }

    if (kart.spinTimer > 0) {
      kart.spinTimer -= dt;
      kart.visualAngle += 16 * dt;
      kart.speed *= Math.pow(0.25, dt);
      kart.x += Math.cos(kart.angle) * kart.speed * dt;
      kart.y += Math.sin(kart.angle) * kart.speed * dt;
      this.resolveWallCollisionsForKart(kart);
      return;
    }

    // Item activation
    if (input.itemPressed && kart.heldItem) {
      this.useItem(kart);
    }

    // Hop & Drift initiation
    if (input.hopPressed && kart.z === 0) {
      kart.vz = 68;
      if (kart.isHuman) window.sound.playHop();
      if (Math.abs(input.steer) > 0.15 && kart.speed > 75) {
        kart.drifting = true;
        kart.driftDir = Math.sign(input.steer);
        kart.driftCharge = 0;
      }
    }

    // Vertical hop gravity
    if (kart.z > 0 || kart.vz > 0) {
      kart.z += kart.vz * dt;
      kart.vz -= 280 * dt;
      if (kart.z <= 0) {
        kart.z = 0;
        kart.vz = 0;
      }
    }

    // Drift state maintenance & Mini-Turbo release
    if (kart.drifting) {
      if (!input.drift || kart.speed < 60) {
        if (kart.driftCharge >= 0.70) {
          kart.boostTimer = Math.max(kart.boostTimer, kart.driftCharge >= 1.40 ? 1.4 : 0.8);
          kart.speed = Math.max(kart.speed, 195);
          if (kart.isHuman) window.sound.playBoost();
        }
        kart.drifting = false;
        kart.driftDir = 0;
        kart.driftCharge = 0;
      } else {
        kart.driftCharge += dt;
        if (Math.random() < 0.65) {
          const sparkColor = kart.driftCharge >= 1.40 ? '#ffe600' : (kart.driftCharge >= 0.70 ? '#38bdf8' : '#e2e8f0');
          this.spawnParticle(
            kart.x - Math.cos(kart.angle) * 6,
            kart.y - Math.sin(kart.angle) * 6,
            2,
            sparkColor,
            (Math.random() - 0.5) * 35,
            (Math.random() - 0.5) * 35,
            15 + Math.random() * 20,
            0.25,
            3
          );
        }
      }
    }

    // Sample surface under kart
    const gx = Math.max(0, Math.min(this.track.size - 1, Math.floor(kart.x)));
    const gy = Math.max(0, Math.min(this.track.size - 1, Math.floor(kart.y)));
    const surface = this.track.surfaceGrid[gy * this.track.size + gx];

    // Off-track / Hazard check
    if (this.gameMode === 'RACE') {
      const spPt = this.track.spline[kart.nearestWaypoint];
      const distFromCenterline = Math.hypot(kart.x - spPt.x, kart.y - spPt.y);
      const maxRoadDist = this.track.def.roadWidth + this.track.def.curbWidth + 8;

      if (surface === SURFACE.HAZARD) {
        kart.offTrackTime += dt * (this.track.def.theme === 'rainbow' ? 2.6 : 1.7);
      } else if ((surface === SURFACE.OFFROAD || distFromCenterline > maxRoadDist) && kart.boostTimer <= 0 && kart.starTimer <= 0) {
        kart.offTrackTime += dt;
      } else {
        kart.offTrackTime = Math.max(0, kart.offTrackTime - dt * 2.5);
      }

      if (kart.offTrackTime >= 0.85) {
        this.triggerLakituRescue(kart);
        return;
      }
    } else {
      // Battle Mode: only lava/deep-water hazard pools trigger Lakitu rescue
      if (surface === SURFACE.HAZARD) {
        kart.offTrackTime += dt * 1.9;
        if (kart.offTrackTime >= 0.7) {
          this.triggerLakituRescue(kart);
          return;
        }
      } else {
        kart.offTrackTime = Math.max(0, kart.offTrackTime - dt * 3);
      }

      // Check whether kart is currently parked in a Hideout Cover Zone (Zero Advantage!)
      let insideHide = false;
      for (const hz of this.track.hideZones) {
        if (kart.x >= hz.x && kart.x <= hz.x + hz.w && kart.y >= hz.y && kart.y <= hz.y + hz.h) {
          insideHide = true;
          break;
        }
      }
      kart.inHideout = insideHide;
      if (insideHide) {
        kart.inHideoutTimer += dt;
      } else {
        kart.inHideoutTimer = 0;
      }
    }

    // Trigger boost zipper pad
    if (surface === SURFACE.BOOST) {
      if (kart.boostTimer < 0.4 && kart.isHuman) window.sound.playBoost();
      kart.boostTimer = Math.max(kart.boostTimer, 1.05);
    }

    // Determine Top Speed & Acceleration
    let maxSpeed = (this.gameMode === 'BATTLE' ? 156 : 148) * kart.info.topSpeed + Math.min(10, kart.coins) * 1.4;

    if (!kart.isHuman && this.gameMode === 'RACE') {
      const humans = this.karts.filter(k => k.isHuman);
      const avgHumanProg = humans.reduce((acc, h) => acc + h.totalProgress, 0) / humans.length;
      const diffProg = avgHumanProg - kart.totalProgress;
      if (diffProg > 0.12) maxSpeed *= 1.12;
      else if (diffProg < -0.18) maxSpeed *= 0.90;
    }

    if (kart.shrinkTimer > 0) maxSpeed *= 0.70;
    if (kart.starTimer > 0) maxSpeed *= 1.25;
    if (kart.boostTimer > 0) maxSpeed *= 1.32;

    if (kart.boostTimer <= 0 && kart.starTimer <= 0) {
      if (surface === SURFACE.OFFROAD && this.gameMode === 'RACE') {
        maxSpeed *= 0.62;
        if (Math.abs(kart.speed) > 35 && Math.random() < 0.4) {
          this.spawnParticle(kart.x, kart.y, 1, '#a3e635', (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25, 18, 0.3, 3);
        }
      } else if (surface === SURFACE.HAZARD) {
        maxSpeed *= 0.38;
        if (Math.abs(kart.speed) > 15 && Math.random() < 0.55) {
          const splash = (this.track.def.theme.includes('castle')) ? '#f97316' : '#38bdf8';
          this.spawnParticle(kart.x, kart.y, 2, splash, (Math.random() - 0.5) * 35, (Math.random() - 0.5) * 35, 25, 0.35, 3);
        }
      }
    }

    // Steering (extra snappy in Battle Mode for tight arena dogfights!)
    const baseTurn = this.gameMode === 'BATTLE' ? 2.55 : 2.35;
    const turnRate = baseTurn * kart.info.handling;
    kart.steerVisual = input.steer;

    if (kart.drifting) {
      const driftTurn = (kart.driftDir * 0.85 + input.steer * 0.55) * turnRate;
      kart.angle = normalizeAngle(kart.angle + driftTurn * dt);
      kart.visualAngle = normalizeAngle(kart.angle + kart.driftDir * 0.28);
    } else {
      const speedFactor = Math.min(1, Math.abs(kart.speed) / 36 + 0.42);
      kart.angle = normalizeAngle(kart.angle + input.steer * turnRate * speedFactor * dt);
      kart.visualAngle = kart.angle;
    }

    // Throttle / Brake / Reverse
    const accelRate = 142 * kart.info.accel * (kart.boostTimer > 0 || kart.starTimer > 0 ? 1.85 : 1.0);
    if (input.accel) {
      kart.speed += accelRate * dt;
    } else if (input.brake) {
      kart.speed -= 160 * dt;
    } else {
      kart.speed *= Math.pow(0.30, dt);
    }

    if (kart.speed > maxSpeed) {
      kart.speed -= (kart.speed - maxSpeed) * Math.min(1, 5.5 * dt);
    }
    if (kart.speed < -65) kart.speed = -65;

    // Velocity vector with arena surface friction (e.g. Crystal Glacier ice!)
    const surfFriction = this.track.def.friction || 1.0;
    const forwardX = Math.cos(kart.angle) * kart.speed;
    const forwardY = Math.sin(kart.angle) * kart.speed;
    const grip = (kart.drifting ? 5.2 : 11.0) * kart.info.handling * surfFriction;
    kart.vx += (forwardX - kart.vx) * Math.min(1, grip * dt);
    kart.vy += (forwardY - kart.vy) * Math.min(1, grip * dt);

    const nextX = kart.x + kart.vx * dt;
    const nextY = kart.y + kart.vy * dt;

    const margin = 34;
    if (nextX < margin || nextX > this.track.size - margin) {
      kart.vx *= -0.6;
      kart.speed *= 0.65;
      kart.x = Math.max(margin, Math.min(this.track.size - margin, nextX));
    } else {
      kart.x = nextX;
    }

    if (nextY < margin || nextY > this.track.size - margin) {
      kart.vy *= -0.6;
      kart.speed *= 0.65;
      kart.y = Math.max(margin, Math.min(this.track.size - margin, nextY));
    } else {
      kart.y = nextY;
    }

    // 3D Arena Wall Collisions
    this.resolveWallCollisionsForKart(kart);

    // Collide with Scenery Props (Race Mode)
    for (const prop of this.track.scenery) {
      const dx = kart.x - prop.x;
      const dy = kart.y - prop.y;
      const dist = Math.hypot(dx, dy);
      const minDist = prop.radius + 6;
      if (dist < minDist && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        kart.x = prop.x + nx * minDist;
        kart.y = prop.y + ny * minDist;
        kart.speed *= 0.55;
        if (kart.isHuman) window.sound.playHit();
      }
    }

    // Pick up Item Boxes
    for (const box of this.track.itemBoxes) {
      if (box.active && Math.hypot(kart.x - box.x, kart.y - box.y) < 14.5) {
        box.active = false;
        box.respawnTimer = box.respawnDelay || 4.0;
        if (!kart.heldItem) {
          this.grantItem(kart, this.rollRandomItem(kart.rank, !!box.hotZone));
        }
      }
    }

    // Pick up Coins
    for (const coin of this.track.coins) {
      if (coin.active && Math.hypot(kart.x - coin.x, kart.y - coin.y) < 12.5) {
        coin.active = false;
        coin.respawnTimer = 7.5;
        kart.coins = Math.min(10, kart.coins + 1);
        if (kart.isHuman) window.sound.playCoin();
      }
    }
  }

  resolveKartCollisions() {
    const n = this.karts.length;
    const minDist = 12.5;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = this.karts[i];
        const b = this.karts[j];
        if (a.eliminated || b.eliminated) continue;
        if (a.rescueState === 'RESCUING' || b.rescueState === 'RESCUING') continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist < minDist && dist > 0.01) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = (minDist - dist) * 0.5;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;

          // Star or shrunken stomp check
          if ((a.starTimer > 0 && b.starTimer <= 0) || (a.shrinkTimer <= 0 && b.shrinkTimer > 0)) {
            if (this.gameMode === 'BATTLE') {
              this.damageBattleKart(b, a, a.starTimer > 0 ? 'STAR RAM' : 'SQUASHED');
            } else {
              b.spinTimer = 0.85;
              b.speed *= 0.3;
              if (a.isHuman || b.isHuman) window.sound.playHit();
            }
          } else if ((b.starTimer > 0 && a.starTimer <= 0) || (b.shrinkTimer <= 0 && a.shrinkTimer > 0)) {
            if (this.gameMode === 'BATTLE') {
              this.damageBattleKart(a, b, b.starTimer > 0 ? 'STAR RAM' : 'SQUASHED');
            } else {
              a.spinTimer = 0.85;
              a.speed *= 0.3;
              if (a.isHuman || b.isHuman) window.sound.playHit();
            }
          } else {
            const massA = a.info.mass || 1.0;
            const massB = b.info.mass || 1.0;
            const push = 32;
            a.vx -= nx * push * (massB / massA);
            a.vy -= ny * push * (massB / massA);
            b.vx += nx * push * (massA / massB);
            b.vy += ny * push * (massA / massB);
          }
        }
      }
    }
  }

  updateProjectiles(dt) {
    const margin = 32;
    const sp = this.track.spline;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Red Shell Homing
      if (p.type === ITEMS.RED_SHELL) {
        let aimX = null;
        let aimY = null;

        if (this.gameMode === 'BATTLE') {
          // Re-acquire closest alive opponent if current target was eliminated or missing
          if (!p.target || p.target.eliminated) {
            let bestD = Infinity;
            for (const k of this.karts) {
              if (k.id === p.ownerId || k.eliminated) continue;
              const d = Math.hypot(k.x - p.x, k.y - p.y);
              if (d < bestD) { bestD = d; p.target = k; }
            }
          }
          if (p.target && !p.target.eliminated && p.target.rescueState !== 'RESCUING') {
            aimX = p.target.x;
            aimY = p.target.y;
          }
        } else {
          if (p.target && !p.target.finished && p.target.rescueState !== 'RESCUING') {
            const distToTarget = Math.hypot(p.target.x - p.x, p.target.y - p.y);
            if (distToTarget < 150) {
              aimX = p.target.x;
              aimY = p.target.y;
            }
          }
          if (aimX === null && sp) {
            p.waypointIdx = ((p.waypointIdx || 0) + 1) % sp.length;
            const wp = sp[(p.waypointIdx + 8) % sp.length];
            aimX = wp.x;
            aimY = wp.y;
          }
        }

        if (aimX !== null) {
          const desired = Math.atan2(aimY - p.y, aimX - p.x);
          const cur = Math.atan2(p.vy, p.vx);
          const diff = normalizeAngle(desired - cur);
          const turnCap = this.gameMode === 'BATTLE' ? 6.2 : 7.5;
          const nextAngle = cur + Math.max(-turnCap * dt, Math.min(turnCap * dt, diff));
          p.vx = Math.cos(nextAngle) * p.speed;
          p.vy = Math.sin(nextAngle) * p.speed;
        }
      }

      const prevX = p.x;
      const prevY = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Outer border wall bounce
      let bounced = false;
      if (p.x < margin || p.x > this.track.size - margin) {
        p.vx *= -1;
        p.x = Math.max(margin, Math.min(this.track.size - margin, p.x));
        p.bounces--;
        bounced = true;
      }
      if (p.y < margin || p.y > this.track.size - margin) {
        p.vy *= -1;
        p.y = Math.max(margin, Math.min(this.track.size - margin, p.y));
        p.bounces--;
        bounced = true;
      }

      // 3D Arena Interior Wall Bounce! (Hiding behind walls blocks incoming shells!)
      if (p.type !== 'BANANA' && this.track.walls && this.track.walls.length > 0) {
        const pr = 5.5;
        for (const w of this.track.walls) {
          if (w.isBorder) continue;
          const cx = Math.max(w.x, Math.min(p.x, w.x + w.w));
          const cy = Math.max(w.y, Math.min(p.y, w.y + w.h));
          const dx = p.x - cx;
          const dy = p.y - cy;
          if (dx * dx + dy * dy < pr * pr) {
            // Determine reflection axis from previous position
            const wasOutsideX = prevX < w.x || prevX > w.x + w.w;
            const wasOutsideY = prevY < w.y || prevY > w.y + w.h;
            if (wasOutsideX && !wasOutsideY) {
              p.vx *= -1;
              p.x = prevX;
            } else if (wasOutsideY && !wasOutsideX) {
              p.vy *= -1;
              p.y = prevY;
            } else {
              p.vx *= -1;
              p.vy *= -1;
              p.x = prevX;
              p.y = prevY;
            }
            p.bounces--;
            bounced = true;
            break;
          }
        }
      }

      if (bounced && p.type !== 'BANANA') {
        this.spawnParticle(p.x, p.y, 4, '#ffe600', (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, 20, 0.25, 3);
        window.sound.playBounce();
      }

      if (p.type !== 'BANANA' && p.bounces < 0) {
        this.spawnExplosion(p.x, p.y, 6, [p.type === ITEMS.RED_SHELL ? '#ef4444' : '#22c55e', '#ffffff']);
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with active Karts
      for (const kart of this.karts) {
        if (kart.eliminated || kart.rescueState === 'RESCUING') continue;
        // Brief owner launch grace period
        if (kart.id === p.ownerId && (p.maxLife - p.life) < 0.45) continue;
        if (Math.hypot(kart.x - p.x, kart.y - p.y) < 12.5) {
          if (this.gameMode === 'BATTLE') {
            const attacker = this.getKartById(p.ownerId);
            const hitLabel = p.type === 'BANANA' ? 'BANANA SLIP' : (p.type === ITEMS.RED_SHELL ? 'RED SHELL' : 'GREEN SHELL');
            this.damageBattleKart(kart, attacker, hitLabel);
          } else if (kart.starTimer <= 0) {
            kart.spinTimer = 0.9;
            kart.speed *= 0.25;
            kart.coins = Math.max(0, kart.coins - 1);
            window.sound.playHit();
          }
          this.projectiles.splice(i, 1);
          break;
        }
      }
    }
  }

  updateBattleStandings(dt) {
    const alive = this.getAliveKarts();
    const aliveHumans = alive.filter(k => k.isHuman);

    // Rank dynamically: alive first (by lives, then KOs, then hits), eliminated last (reverse order)
    const sorted = [...this.karts].sort((a, b) => {
      if (!a.eliminated && b.eliminated) return -1;
      if (a.eliminated && !b.eliminated) return 1;
      if (!a.eliminated && !b.eliminated) {
        if (b.lives !== a.lives) return b.lives - a.lives;
        if (b.kosScored !== a.kosScored) return b.kosScored - a.kosScored;
        return b.hitsScored - a.hitsScored;
      }
      return b.eliminatedOrder - a.eliminatedOrder;
    });
    sorted.forEach((k, idx) => { k.rank = idx + 1; });

    // Check match end: 1 Last Kart Standing OR both humans eliminated!
    if (this.state === 'RACING') {
      if (alive.length <= 1 || aliveHumans.length === 0) {
        this.battleEndTimer += dt;
        if (this.battleEndTimer >= 1.35) {
          this.state = 'FINISHED';
          window.sound.playFinish();
          // Award battle bonus points
          const pts = [10, 7, 5, 3, 2, 1, 0, 0];
          sorted.forEach((k, idx) => {
            k.cupPoints += pts[idx] || 0;
          });
        }
      }
    }
  }

  updateStandings(dt) {
    const sp = this.track.spline;
    const totalPts = sp.length;

    for (const kart of this.karts) {
      let bestIdx = kart.nearestWaypoint;
      let bestDist2 = Infinity;
      const searchWindow = 28;
      for (let offset = -searchWindow; offset <= searchWindow; offset++) {
        const idx = (kart.nearestWaypoint + offset + totalPts) % totalPts;
        const d2 = (kart.x - sp[idx].x) ** 2 + (kart.y - sp[idx].y) ** 2;
        if (d2 < bestDist2) {
          bestDist2 = d2;
          bestIdx = idx;
        }
      }

      const prevIdx = kart.nearestWaypoint;
      kart.nearestWaypoint = bestIdx;

      const wp = sp[bestIdx];
      const headingDot = Math.cos(kart.angle) * wp.tx + Math.sin(kart.angle) * wp.ty;
      if (headingDot < -0.30 && kart.rescueState === 'NONE' && !kart.finished) {
        kart.wrongWayTime += dt;
        if (kart.wrongWayTime > 0.25) {
          kart.wrongWay = true;
          if (kart.isHuman && this.raceTime - kart._lastWrongBeep > 0.65) {
            kart._lastWrongBeep = this.raceTime;
            window.sound.playWrongWay();
          }
        }
      } else {
        kart.wrongWayTime = Math.max(0, kart.wrongWayTime - dt * 3);
        if (kart.wrongWayTime <= 0.1) kart.wrongWay = false;
      }

      if (bestIdx > totalPts * 0.25 && bestIdx < totalPts * 0.85) {
        kart.maxWaypointSeen = Math.max(kart.maxWaypointSeen, bestIdx);
      }

      if (prevIdx > totalPts * 0.82 && bestIdx < totalPts * 0.18 && kart.maxWaypointSeen > totalPts * 0.65) {
        kart.maxWaypointSeen = 0;
        if (!kart.finished) {
          kart.lap++;
          if (kart.lap > this.totalLaps) {
            kart.lap = this.totalLaps;
            kart.finished = true;
            kart.finishTime = this.raceTime;
            if (kart.isHuman) window.sound.playFinish();
          } else if (kart.isHuman) {
            window.sound.playLap();
          }
        }
      }

      kart.totalProgress = (kart.lap - 1) + (bestIdx / totalPts);
    }

    const sorted = [...this.karts].sort((a, b) => {
      if (a.finished && b.finished) return a.finishTime - b.finishTime;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.totalProgress - a.totalProgress;
    });

    sorted.forEach((k, idx) => {
      k.rank = idx + 1;
    });
  }

  finalizeResults() {
    const ptsTable = [9, 6, 3, 1, 0, 0, 0, 0];
    const sorted = [...this.karts].sort((a, b) => a.rank - b.rank);
    sorted.forEach((k, idx) => {
      if (!k.finished) {
        k.finished = true;
        k.finishTime = this.raceTime + (idx + 1) * 1.45;
      }
      k.cupPoints += ptsTable[idx] || 0;
    });
  }
}

window.RaceWorld = RaceWorld;
