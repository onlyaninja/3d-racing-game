// Main Game Controller: Grand Prix Race (6 Tracks) + Battle Arena (10 Arenas) + Character Select + 102-Key Input

class InputManager {
  constructor() {
    this.down = new Set();
    this.justPressed = new Set();

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        if (document.getElementById('menu-overlay').classList.contains('hidden')) {
          e.preventDefault();
        }
      }
      if (!this.down.has(e.code)) {
        this.justPressed.add(e.code);
      }
      this.down.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.down.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.down.clear();
      this.justPressed.clear();
    });
  }

  isDown(codes) {
    for (const c of codes) {
      if (this.down.has(c)) return true;
    }
    return false;
  }

  wasPressed(codes) {
    for (const c of codes) {
      if (this.justPressed.has(c)) return true;
    }
    return false;
  }

  getPlayer1Input() {
    const left = this.isDown(['KeyA']);
    const right = this.isDown(['KeyD']);
    return {
      accel: this.isDown(['KeyW']),
      brake: this.isDown(['KeyS']),
      steer: (right ? 1 : 0) - (left ? 1 : 0),
      drift: this.isDown(['ShiftLeft', 'Space', 'KeyC']),
      hopPressed: this.wasPressed(['ShiftLeft', 'Space', 'KeyC']),
      itemPressed: this.wasPressed(['KeyQ', 'KeyE', 'KeyF'])
    };
  }

  getPlayer2Input() {
    const left = this.isDown(['ArrowLeft', 'KeyJ']);
    const right = this.isDown(['ArrowRight', 'KeyL']);
    return {
      accel: this.isDown(['ArrowUp', 'KeyI']),
      brake: this.isDown(['ArrowDown', 'KeyK']),
      steer: (right ? 1 : 0) - (left ? 1 : 0),
      drift: this.isDown(['ShiftRight', 'ControlRight', 'KeyM', 'Period']),
      hopPressed: this.wasPressed(['ShiftRight', 'ControlRight', 'KeyM', 'Period']),
      itemPressed: this.wasPressed(['Enter', 'NumpadEnter', 'Slash', 'Numpad0', 'KeyN'])
    };
  }

  endFrame() {
    this.justPressed.clear();
  }
}

class GameApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.skyCanvas = document.getElementById('sky-canvas');
    this.glCanvas = document.getElementById('gl-canvas');

    this.renderer = new Mode7Renderer(this.canvas, this.skyCanvas, this.glCanvas);
    this.world = new RaceWorld();
    this.input = new InputManager();

    this.p1CharId = 0; // Mario default
    this.p2CharId = 1; // Luigi default
    this.nextClickPlayer = 0;

    this.selectedMode = 'RACE'; // 'RACE' | 'BATTLE'
    this.selectedTrack = 0;
    this.selectedArena = 0;
    this.cupMode = false;
    this.mode = 'MENU'; // 'MENU' | 'PLAYING' | 'RESULTS'
    this.resultsShown = false;

    this.menuOverlay = document.getElementById('menu-overlay');
    this.resultsOverlay = document.getElementById('results-overlay');

    this.initCharacterSelectUI();
    this.initArenaCardsUI();
    this.initTrackAndMenuUI();

    this.world.configureDrivers(this.p1CharId, this.p2CharId, true);
    this.world.loadTrack(0);

    // Reflect actual WebGL status on GFX button
    const gfxBtn = document.getElementById('gfx-btn');
    gfxBtn.textContent = this.renderer.useWebGL ? '✨ GFX: HD WebGL' : '🕹️ GFX: CPU MODE';

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  initCharacterSelectUI() {
    const grid = document.getElementById('roster-grid');
    grid.innerHTML = '';

    DRIVER_ROSTER.forEach((driver) => {
      const card = document.createElement('div');
      card.className = 'roster-card';
      card.dataset.id = driver.id;

      const badges = document.createElement('div');
      badges.className = 'sel-badges';
      card.appendChild(badges);

      const cvs = document.createElement('canvas');
      cvs.width = 44;
      cvs.height = 44;
      Mode7Renderer.drawCharacterPortrait(cvs.getContext('2d'), driver, 44, 44);
      card.appendChild(cvs);

      const nameEl = document.createElement('div');
      nameEl.className = 'roster-card-name';
      nameEl.textContent = driver.name;
      card.appendChild(nameEl);

      const tagEl = document.createElement('div');
      tagEl.className = 'roster-card-tag';
      tagEl.textContent = driver.weightClass;
      card.appendChild(tagEl);

      card.addEventListener('click', (e) => {
        window.sound.init();
        window.sound.playCoin();
        if (e.shiftKey || this.nextClickPlayer === 1) {
          this.selectCharacter(1, driver.id);
          this.nextClickPlayer = 0;
        } else {
          this.selectCharacter(0, driver.id);
          this.nextClickPlayer = 1;
        }
      });

      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        window.sound.init();
        window.sound.playCoin();
        this.selectCharacter(1, driver.id);
      });

      grid.appendChild(card);
    });

    this.refreshCharacterUI();
  }

  initArenaCardsUI() {
    const container = document.getElementById('arena-cards');
    container.innerHTML = '';

    ARENA_DEFS.forEach((arena, idx) => {
      const btn = document.createElement('button');
      btn.className = `arena-card${idx === 0 ? ' selected' : ''}`;
      btn.dataset.arena = idx;

      const cvs = document.createElement('canvas');
      cvs.className = 'arena-preview-canvas';
      cvs.width = 148;
      cvs.height = 74;
      ArenaBuilder.renderPreview(idx, cvs);
      btn.appendChild(cvs);

      const nameEl = document.createElement('div');
      nameEl.className = 'track-name';
      nameEl.textContent = `${idx + 1}. ${arena.name}`;
      btn.appendChild(nameEl);

      const descEl = document.createElement('div');
      descEl.className = 'track-desc';
      descEl.textContent = arena.desc;
      btn.appendChild(descEl);

      btn.addEventListener('click', () => {
        container.querySelectorAll('.arena-card').forEach(c => c.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedArena = idx;
        if (this.selectedMode === 'BATTLE') {
          this.world.loadArena(this.selectedArena);
        }
      });

      container.appendChild(btn);
    });
  }

  selectCharacter(playerIdx, charId) {
    const count = DRIVER_ROSTER.length;
    const wrapped = (charId + count) % count;
    if (playerIdx === 0) {
      this.p1CharId = wrapped;
      if (this.p2CharId === this.p1CharId) {
        this.p2CharId = (this.p1CharId + 1) % count;
      }
    } else {
      this.p2CharId = wrapped;
      if (this.p1CharId === this.p2CharId) {
        this.p1CharId = (this.p2CharId + 1) % count;
      }
    }
    this.world.configureDrivers(this.p1CharId, this.p2CharId, true);
    if (this.selectedMode === 'BATTLE') {
      this.world.loadArena(this.selectedArena);
    } else {
      this.world.loadTrack(this.selectedTrack);
    }
    this.refreshCharacterUI();
  }

  refreshCharacterUI() {
    const p1 = DRIVER_ROSTER[this.p1CharId];
    const p2 = DRIVER_ROSTER[this.p2CharId];

    document.getElementById('p1-char-name').textContent = p1.name;
    document.getElementById('p1-char-class').textContent = p1.weightClass;
    document.getElementById('p1-stat-spd').style.width = `${p1.statSpeed * 10}%`;
    document.getElementById('p1-stat-acc').style.width = `${p1.statAccel * 10}%`;
    document.getElementById('p1-stat-hnd').style.width = `${p1.statHandling * 10}%`;
    const p1Canvas = document.getElementById('p1-portrait');
    Mode7Renderer.drawCharacterPortrait(p1Canvas.getContext('2d'), p1, p1Canvas.width, p1Canvas.height);

    document.getElementById('p2-char-name').textContent = p2.name;
    document.getElementById('p2-char-class').textContent = p2.weightClass;
    document.getElementById('p2-stat-spd').style.width = `${p2.statSpeed * 10}%`;
    document.getElementById('p2-stat-acc').style.width = `${p2.statAccel * 10}%`;
    document.getElementById('p2-stat-hnd').style.width = `${p2.statHandling * 10}%`;
    const p2Canvas = document.getElementById('p2-portrait');
    Mode7Renderer.drawCharacterPortrait(p2Canvas.getContext('2d'), p2, p2Canvas.width, p2Canvas.height);

    const cards = document.querySelectorAll('.roster-card');
    cards.forEach((c) => {
      const id = parseInt(c.dataset.id, 10);
      c.classList.toggle('p1-selected', id === this.p1CharId);
      c.classList.toggle('p2-selected', id === this.p2CharId);
      const badgeContainer = c.querySelector('.sel-badges');
      badgeContainer.innerHTML = '';
      if (id === this.p1CharId) badgeContainer.innerHTML += '<span class="mini-tag mini-p1">P1</span>';
      if (id === this.p2CharId) badgeContainer.innerHTML += '<span class="mini-tag mini-p2">P2</span>';
    });
  }

  switchMenuTab(mode) {
    this.selectedMode = mode;
    const isBattle = mode === 'BATTLE';

    const tabRace = document.getElementById('tab-race');
    const tabBattle = document.getElementById('tab-battle');
    const panelRace = document.getElementById('panel-race');
    const panelBattle = document.getElementById('panel-battle');
    const startBtn = document.getElementById('start-primary-btn');
    const secBtn = document.getElementById('secondary-action-btn');

    tabRace.classList.toggle('active', !isBattle);
    tabRace.setAttribute('aria-selected', String(!isBattle));
    tabBattle.classList.toggle('active', isBattle);
    tabBattle.setAttribute('aria-selected', String(isBattle));

    panelRace.classList.toggle('hidden', isBattle);
    panelBattle.classList.toggle('hidden', !isBattle);

    if (isBattle) {
      startBtn.textContent = '⚔ START BATTLE';
      startBtn.classList.add('battle-btn');
      secBtn.textContent = '🎲 RANDOM ARENA';
      this.world.loadArena(this.selectedArena);
    } else {
      startBtn.textContent = '▶ START RACE';
      startBtn.classList.remove('battle-btn');
      secBtn.textContent = '🏆 6-TRACK CUP';
      this.world.loadTrack(this.selectedTrack);
    }
  }

  initTrackAndMenuUI() {
    for (let i = 0; i < TRACK_DEFS.length; i++) {
      const prevCanvas = document.getElementById(`preview-${i}`);
      if (prevCanvas) {
        TrackBuilder.renderPreview(i, prevCanvas);
      }
    }

    document.getElementById('tab-race').addEventListener('click', () => this.switchMenuTab('RACE'));
    document.getElementById('tab-battle').addEventListener('click', () => this.switchMenuTab('BATTLE'));

    const cards = document.querySelectorAll('.track-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedTrack = parseInt(card.dataset.track, 10);
        if (this.selectedMode === 'RACE') {
          this.world.loadTrack(this.selectedTrack);
        }
      });
    });

    document.getElementById('start-primary-btn').addEventListener('click', () => {
      if (this.selectedMode === 'BATTLE') {
        this.startBattle(this.selectedArena, true);
      } else {
        this.cupMode = false;
        this.startRace(this.selectedTrack, true);
      }
    });

    document.getElementById('secondary-action-btn').addEventListener('click', () => {
      if (this.selectedMode === 'BATTLE') {
        const rnd = Math.floor(Math.random() * ARENA_DEFS.length);
        this.selectedArena = rnd;
        const arenaBtns = document.querySelectorAll('.arena-card');
        arenaBtns.forEach(b => b.classList.toggle('selected', parseInt(b.dataset.arena, 10) === rnd));
        this.startBattle(rnd, true);
      } else {
        this.cupMode = true;
        this.selectedTrack = 0;
        this.startRace(0, true);
      }
    });

    const gfxBtn = document.getElementById('gfx-btn');
    gfxBtn.addEventListener('click', () => {
      const next = !this.renderer.useWebGL;
      const actual = this.renderer.setGraphicsMode(next);
      gfxBtn.textContent = actual ? '✨ GFX: HD WebGL' : '🕹️ GFX: CPU MODE';
    });

    const muteBtn = document.getElementById('mute-btn');
    muteBtn.addEventListener('click', () => {
      const on = window.sound.toggleMute();
      muteBtn.textContent = on ? '🔊 SOUND: ON' : '🔇 SOUND: OFF';
    });

    document.getElementById('next-track-btn').addEventListener('click', () => {
      if (this.selectedMode === 'BATTLE') {
        this.selectedArena = (this.selectedArena + 1) % ARENA_DEFS.length;
        this.startBattle(this.selectedArena, false);
      } else {
        this.selectedTrack = (this.selectedTrack + 1) % TRACK_DEFS.length;
        this.startRace(this.selectedTrack, false);
      }
    });

    document.getElementById('retry-race-btn').addEventListener('click', () => {
      if (this.selectedMode === 'BATTLE') {
        this.startBattle(this.selectedArena, false);
      } else {
        this.startRace(this.selectedTrack, false);
      }
    });

    document.getElementById('back-menu-btn').addEventListener('click', () => {
      this.showMainMenu();
    });

    window.addEventListener('keydown', (e) => {
      if (this.mode === 'MENU') {
        if (e.code === 'KeyA') {
          window.sound.init();
          window.sound.playCoin();
          this.selectCharacter(0, this.p1CharId - 1);
        } else if (e.code === 'KeyD') {
          window.sound.init();
          window.sound.playCoin();
          this.selectCharacter(0, this.p1CharId + 1);
        } else if (e.code === 'ArrowLeft') {
          window.sound.init();
          window.sound.playCoin();
          this.selectCharacter(1, this.p2CharId - 1);
        } else if (e.code === 'ArrowRight') {
          window.sound.init();
          window.sound.playCoin();
          this.selectCharacter(1, this.p2CharId + 1);
        }
      } else if (this.mode === 'PLAYING') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          this.showMainMenu();
        }
        const testMap = {
          Digit1: ITEMS.MUSHROOM,
          Digit2: ITEMS.GREEN_SHELL,
          Digit3: ITEMS.RED_SHELL,
          Digit4: ITEMS.BANANA,
          Digit5: ITEMS.STAR,
          Digit6: ITEMS.LIGHTNING
        };
        if (testMap[e.code]) {
          this.world.grantItem(this.world.p1Kart, testMap[e.code]);
          this.world.grantItem(this.world.p2Kart, testMap[e.code]);
        }
      } else if (this.mode === 'RESULTS') {
        if (e.code === 'Enter') {
          if (this.selectedMode === 'BATTLE') {
            this.selectedArena = (this.selectedArena + 1) % ARENA_DEFS.length;
            this.startBattle(this.selectedArena, false);
          } else {
            this.selectedTrack = (this.selectedTrack + 1) % TRACK_DEFS.length;
            this.startRace(this.selectedTrack, false);
          }
        } else if (e.code === 'KeyR') {
          if (this.selectedMode === 'BATTLE') {
            this.startBattle(this.selectedArena, false);
          } else {
            this.startRace(this.selectedTrack, false);
          }
        } else if (e.code === 'KeyM' || e.code === 'Escape') {
          this.showMainMenu();
        }
      }
    });
  }

  startRace(trackIdx, resetCup) {
    window.sound.init();
    this.selectedMode = 'RACE';
    this.world.configureDrivers(this.p1CharId, this.p2CharId, resetCup);
    this.selectedTrack = trackIdx;
    this.world.loadTrack(trackIdx);
    this.mode = 'PLAYING';
    this.resultsShown = false;
    this.menuOverlay.classList.add('hidden');
    this.resultsOverlay.classList.add('hidden');
  }

  startBattle(arenaIdx, resetCup) {
    window.sound.init();
    this.selectedMode = 'BATTLE';
    this.world.configureDrivers(this.p1CharId, this.p2CharId, resetCup);
    this.selectedArena = arenaIdx;
    this.world.loadArena(arenaIdx);
    this.mode = 'PLAYING';
    this.resultsShown = false;
    this.menuOverlay.classList.add('hidden');
    this.resultsOverlay.classList.add('hidden');
  }

  showMainMenu() {
    this.mode = 'MENU';
    window.sound.updateEngines(0, 0, false);
    this.menuOverlay.classList.remove('hidden');
    this.resultsOverlay.classList.add('hidden');
  }

  showResultsScreen() {
    this.mode = 'RESULTS';
    this.resultsShown = true;
    window.sound.updateEngines(0, 0, false);

    const isBattle = this.world.gameMode === 'BATTLE';
    const titleEl = document.getElementById('results-title');
    const subEl = document.getElementById('results-subtitle');
    const thead = document.getElementById('standings-head');
    const tbody = document.getElementById('standings-body');
    const nextBtn = document.getElementById('next-track-btn');

    tbody.innerHTML = '';
    const sorted = [...this.world.karts].sort((a, b) => a.rank - b.rank);
    const suffixes = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

    if (isBattle) {
      const winner = sorted[0];
      titleEl.textContent = `⚔ ${this.world.track.def.name.toUpperCase()} — BATTLE OVER!`;
      subEl.textContent = winner && !winner.eliminated
        ? `🏆 CHAMPION: ${winner.name} (${winner.lives} ${winner.lives === 1 ? 'Life' : 'Lives'} Left!)`
        : 'All Human Fighters Eliminated — Final Survival Standings';
      nextBtn.textContent = 'NEXT ARENA (ENTER)';

      thead.innerHTML = `
        <tr>
          <th>RANK</th>
          <th>FIGHTER</th>
          <th>STATUS / LIVES</th>
          <th>KOs / HITS</th>
          <th>BATTLE PTS</th>
        </tr>
      `;

      sorted.forEach((k, idx) => {
        const tr = document.createElement('tr');
        if (k.isHuman) tr.classList.add('human-row');
        const statusText = !k.eliminated
          ? `🎈 ${'♥'.repeat(k.lives)} SURVIVED`
          : `💀 KO'd @ ${k.finishTime.toFixed(1)}s`;
        tr.innerHTML = `
          <td>${suffixes[idx]}</td>
          <td style="color:${k.info.color}">${k.name}</td>
          <td>${statusText}</td>
          <td>${k.kosScored} KO · ${k.hitsScored} Hits</td>
          <td><strong>${k.cupPoints} pts</strong></td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      titleEl.textContent = `${this.world.track.def.name.toUpperCase()} — RESULTS`;
      subEl.textContent = this.cupMode
        ? `Grand Prix Track ${this.selectedTrack + 1} of ${TRACK_DEFS.length} Standings`
        : 'Single Race Standings & Cup Points';
      nextBtn.textContent = 'NEXT TRACK (ENTER)';

      thead.innerHTML = `
        <tr>
          <th>POS</th>
          <th>DRIVER</th>
          <th>TYPE</th>
          <th>RACE TIME</th>
          <th>CUP PTS</th>
        </tr>
      `;

      sorted.forEach((k, idx) => {
        const tr = document.createElement('tr');
        if (k.isHuman) tr.classList.add('human-row');
        const mins = Math.floor(k.finishTime / 60);
        const secs = (k.finishTime % 60).toFixed(2).padStart(5, '0');
        tr.innerHTML = `
          <td>${suffixes[idx]}</td>
          <td style="color:${k.info.color}">${k.name}</td>
          <td>${k.isHuman ? 'HUMAN' : 'CPU AI'}</td>
          <td>${mins}:${secs}</td>
          <td><strong>${k.cupPoints} pts</strong></td>
        `;
        tbody.appendChild(tr);
      });
    }

    this.resultsOverlay.classList.remove('hidden');
  }

  loop(now) {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    if (this.mode === 'PLAYING') {
      const p1In = this.input.getPlayer1Input();
      const p2In = this.input.getPlayer2Input();
      this.world.update(dt, p1In, p2In);
      this.renderer.renderFrame(this.world);

      const p1 = this.world.p1Kart;
      const p2 = this.world.p2Kart;
      window.sound.updateEngines(
        p1.eliminated ? -1 : p1.speed / 150,
        p2.eliminated ? -1 : p2.speed / 150,
        this.world.state === 'RACING'
      );

      if (this.world.state === 'FINISHED' && !this.resultsShown) {
        setTimeout(() => {
          if (this.world.state === 'FINISHED') this.showResultsScreen();
        }, 900);
        this.resultsShown = true;
      }
    } else if (this.mode === 'MENU') {
      const aiIn1 = this.world.computeAIInput(this.world.p1Kart, dt);
      const aiIn2 = this.world.computeAIInput(this.world.p2Kart, dt);
      if (this.world.state === 'COUNTDOWN') this.world.state = 'RACING';
      this.world.update(dt, aiIn1, aiIn2);
      // Keep attract demo looping endlessly if a battle finishes behind the menu
      if (this.world.state === 'FINISHED') {
        if (this.selectedMode === 'BATTLE') this.world.loadArena(this.selectedArena);
        else this.world.loadTrack(this.selectedTrack);
      }
      this.renderer.renderFrame(this.world);
    }

    this.input.endFrame();
    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
