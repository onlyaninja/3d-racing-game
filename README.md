# 🏎️ Super Pixel Kart 3D

> **▶ [Play Online in Your Browser (GitHub Pages)](https://onlyaninja.github.io/3d-racing-game/)**

An SNES *Super Mario Kart*–inspired **3D Split-Screen Kart Racing & Battle Arena** game built with hardware-accelerated WebGL + native 640×720 Canvas 2D rendering, zero external dependencies, and 102-key anti-ghosting 2-player keyboard support.

Runs smoothly at **60 FPS** even on low-spec hardware (including Intel Haswell / HD 4600 integrated graphics) directly in a web browser or via Python.

---

## 🎮 Game Modes

### 🏁 Grand Prix Race (6 Tracks)
Race 2 Humans vs. 6 AI competitors across 6 tracks—including multi-intersection circuits with crossing traffic flows:
1. **Mushroom Circuit** — Sunny asphalt, chicanes, mud shortcuts, warp pipes
2. **Koopa Beach** — Tropical sand, shallow water hazards, boost pads, palm trees
3. **Bowser's Castle** — Obsidian stone fortress, lava pools, hairpins, flame pillars
4. **Toad's Figure-8 Crossroads** — Center 90° T-bone intersection
5. **Boo's Haunted Clover** — Double perpendicular intersection & cursed swamp
6. **Rainbow Star Nexus** — 3-lobe cosmic pretzel with 3 star junctions over a space void

Includes **Lakitu 2.0-second Off-Track Rescue** and flashing **Wrong-Way** warnings.

### 🎈 Battle Arena (10 Open-Plan Arenas · 3 Lives · 8 Fighters)
All 8 drivers start together with **3 floating balloons (lives)**. Lose all 3 lives and you disappear from the arena!
- **Risk vs. Opportunity**: Sheltered 3D walled hideouts physically block shells and hide you from view—but contain **zero power-ups and zero boost pads**. Rush out into the open plazas to grab weapons, hit boost strips, bank shells off 3D walls, and eliminate rivals!
- **10 Unique Arenas**: *Block Fort Classic, Mushroom Plaza, Koopa Atoll, Bowser's War Room, Crystal Glacier, Boo's Hedge Maze, Dry Bones Canyon, Neon Cyber Grid, Sky Garden Colosseum, Rainbow Star Dome*.

### 👤 8 Playable Characters
Choose from **Mario, Luigi, Peach, Yoshi, Bowser, Toad, Koopa, and DK Jr.** with classic Speed, Acceleration, and Handling trade-offs.

---

## ⌨️ Controls (Standard 102-Key Keyboard)

| Action | Player 1 (Left Side) | Player 2 (Right Side) |
| :--- | :--- | :--- |
| **Accelerate / Brake** | `W` / `S` | `↑` / `↓` (or `I` / `K`) |
| **Steer Left / Right** | `A` / `D` | `←` / `→` (or `J` / `L`) |
| **Hop & Drift** *(hold in turns for Mini-Turbo)* | `Left Shift`, `Space`, or `C` | `Right Shift`, `Right Ctrl`, `M`, or `.` |
| **Use Power-Up / Switch Spectator Cam** | `Q`, `E`, or `F` | `Enter`, `/`, `Numpad 0`, or `N` |
| **Test Power-Ups (1–6)** | `1` Mushroom · `2` Green Shell · `3` Red Shell · `4` Banana · `5` Star · `6` Lightning | Same |
| **Pause / Main Menu** | `Esc` or `P` | `Esc` or `P` |

---

## 🚀 How to Run

### Option 1: Python Launcher
```bash
python3 play.py
```
Starts a local server at `http://127.0.0.1:8080/index.html` and opens the game in your browser.

### Option 2: Open Directly in Browser
Double-click `index.html` (no build step or dependencies required).
