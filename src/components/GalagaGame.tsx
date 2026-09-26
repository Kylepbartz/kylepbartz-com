"use client";

import { useEffect, useRef, useState } from "react";
import {
  LEADERBOARD_MAX_ENTRIES,
  INITIALS_LENGTH,
  fetchLeaderboard,
  type LeaderboardEntry,
} from "@/lib/leaderboard";

const SHOOT_SRC = "/audio/galaga/player-shoot.wav";
const EXPLOSION_SRC = "/audio/galaga/explosion.wav";
const HIT_SRC = "/audio/galaga/player-hit.wav";
const MUSIC_SRC = "/audio/galaga/background-music.wav";
const TITLE_MUSIC_SRC = "/audio/galaga/title-music.wav";
// How far ahead of the audio clock each next loop iteration is queued.
// Scheduling against ctx.currentTime (not JS timers) is what keeps the loop
// gapless -- see HumToggle.tsx for the same technique.
const MUSIC_SCHEDULE_AHEAD_SEC = 0.25;

type SfxName = "shoot" | "explosion" | "hit";
type MusicTrack = "title" | "background";

let sfxCtx: AudioContext | null = null;
let sfxBuffers: Partial<Record<SfxName, AudioBuffer>> = {};
let backgroundMusicBuffer: AudioBuffer | null = null;
let titleMusicBuffer: AudioBuffer | null = null;
let sfxLoadPromise: Promise<void> | null = null;

function getSfxContext(): AudioContext {
  if (!sfxCtx) sfxCtx = new AudioContext();
  if (sfxCtx.state === "suspended") sfxCtx.resume();
  return sfxCtx;
}

/** Call on a user gesture (e.g. the konami sequence completing) to unlock
 * audio and start decoding. */
function primeGalagaSfx(): Promise<void> {
  if (sfxLoadPromise) return sfxLoadPromise;
  const ctx = getSfxContext();
  const load = (src: string) =>
    fetch(src)
      .then((res) => res.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data));
  sfxLoadPromise = Promise.all([
    load(SHOOT_SRC),
    load(EXPLOSION_SRC),
    load(HIT_SRC),
    load(MUSIC_SRC),
    load(TITLE_MUSIC_SRC),
  ]).then(([shoot, explosion, hit, music, titleMusic]) => {
    sfxBuffers = { shoot, explosion, hit };
    backgroundMusicBuffer = music;
    titleMusicBuffer = titleMusic;
  });
  return sfxLoadPromise;
}

function musicBufferForTrack(track: MusicTrack): AudioBuffer | null {
  return track === "title" ? titleMusicBuffer : backgroundMusicBuffer;
}

function playSfx(name: SfxName, volume: number) {
  const buffer = sfxBuffers[name];
  if (!buffer) return;
  const ctx = getSfxContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  source.connect(gain).connect(ctx.destination);
  source.start(0);
}

let shipImage: HTMLImageElement | null = null;
let enemyImage: HTMLImageElement | null = null;
// Pre-tinted red version of the enemy sprite, built once the image loads --
// composited on its own transparent canvas so the tint only lands on the
// sprite's own pixels, not the (already-opaque) game canvas behind it.
let enemyDivingCanvas: HTMLCanvasElement | null = null;

function loadImage(src: string, onLoad?: (img: HTMLImageElement) => void) {
  const img = new Image();
  if (onLoad) img.onload = () => onLoad(img);
  img.src = src;
  return img;
}

function buildTintedCanvas(img: HTMLImageElement, tint: string) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const tctx = canvas.getContext("2d");
  if (!tctx) return canvas;
  tctx.drawImage(img, 0, 0);
  tctx.globalCompositeOperation = "source-atop";
  tctx.fillStyle = tint;
  tctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Kicks off loading the player and enemy sprites; safe to call repeatedly. */
function loadSprites() {
  if (!shipImage) shipImage = loadImage(SHIP_SRC);
  if (!enemyImage) {
    enemyImage = loadImage(ENEMY_SRC, (img) => {
      enemyDivingCanvas = buildTintedCanvas(img, "rgba(255, 59, 107, 0.55)");
    });
  }
}

function isImageReady(img: HTMLImageElement | null): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0;
}

async function postScore(
  initials: string,
  score: number,
  wave: number
): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initials, score, wave }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.entries) ? data.entries : [];
  } catch {
    return [];
  }
}

type Sfx = {
  onShoot: () => void;
  onExplosion: () => void;
  onHit: () => void;
};

const CANVAS_W = 480;
const CANVAS_H = 640;
const ROWS = 4;
const COLS = 6;
const ENEMY_W = 28;
const ENEMY_H = 20;
const ENEMY_GAP_X = 14;
const ENEMY_GAP_Y = 16;
const FORMATION_TOP = 60;
const ENEMY_SRC = "/images/galaga/enemy-ship.png";
// The sprite's natural aspect ratio is ~1.16:1 (46x40px source), sized to
// fit inside the enemy hitbox and then rendered 50% larger than that for
// visibility -- the hitbox itself (ENEMY_W x ENEMY_H) stays unchanged, so
// the sprite overhangs it a bit rather than the collision area growing.
const ENEMY_DRAW_W = 23.2 * 1.5;
const ENEMY_DRAW_H = 20 * 1.5;
const PLAYER_W = 28;
const PLAYER_H = 20;
const PLAYER_Y = CANVAS_H - 50;
// The player can move vertically within the bottom quarter of the screen.
const PLAYER_Y_MIN = CANVAS_H * 0.75;
const PLAYER_Y_MAX = PLAYER_Y;
const SHIP_SRC = "/images/galaga/player-ship.png";
// The sprite's natural aspect ratio is ~1.18:1 (47x40px source), sized to
// fit inside the player hitbox and then rendered 50% larger than that for
// visibility -- the hitbox itself (PLAYER_W x PLAYER_H) stays unchanged, so
// the sprite overhangs it a bit rather than the collision area growing.
const SHIP_DRAW_W = 23.5 * 1.5;
const SHIP_DRAW_H = 20 * 1.5;
const PLAYER_SPEED = 260; // px/sec
const BULLET_SPEED = 420;
const ENEMY_BULLET_SPEED = 300;
const SHOT_COOLDOWN_MS = 260;
const INVULN_MS = 1000;
const WAVE_CLEAR_MS = 1400;
const DIVE_DURATION_MS = 1900;
const MAX_CONCURRENT_DIVERS = 3;
// After a dive reaches the bottom of the screen, the enemy loops back up
// past the top (RETURN_LOOP_MS) before descending into its formation slot
// (RETURN_DESCEND_MS) -- invulnerable and harmless the whole way.
const RETURN_LOOP_MS = 900;
const RETURN_DESCEND_MS = 1000;
const RETURN_TOTAL_MS = RETURN_LOOP_MS + RETURN_DESCEND_MS;
const RETURN_LOOP_FRACTION = RETURN_LOOP_MS / RETURN_TOTAL_MS;
const RETURN_ABOVE_Y = -40;
// Starting wave 4, the (non-diving) formation also bobs vertically in a
// "box" pattern -- purely cosmetic, kept clear of the top third of the
// screen. Diving enemies are untouched by this.
const BOX_MOVE_START_WAVE = 4;
const BOX_Y_LIMIT = CANVAS_H / 3;
const BOX_AMPLITUDE = 30;
const BOX_SPEED = 1.4;
// Starting wave 7, the formation cycles through a rotation of distinct
// movement shapes instead of the plain box bob. Each still respects
// BOX_Y_LIMIT -- diving enemies are untouched by any of this.
const PATTERN_START_WAVE = 7;
const MOVE_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  " ",
  "Enter",
  "Escape",
]);

type Enemy = {
  col: number;
  row: number;
  x: number;
  y: number;
  alive: boolean;
  diving: boolean;
  diveT: number;
  diveStartX: number;
  diveStartY: number;
  diveTargetX: number;
  shotFired: boolean;
  shotFired2: boolean;
  // A dive that reaches the bottom of the screen doesn't just teleport back
  // -- it loops up past the top of the screen (invulnerable and harmless
  // the whole way, flipped and doubled in size) before descending into its
  // formation slot like a fresh reinforcement.
  returning: boolean;
  returnT: number;
  returnStartX: number;
};

type Bullet = { x: number; y: number };
type Status = "title" | "playing" | "wave-clear" | "gameover";
type Star = { x: number; y: number; size: number; speed: number };

const GAME_TITLE = "ANDROMEDA";
const STAR_COUNT = 70;

type GameState = {
  playerX: number;
  playerY: number;
  lives: number;
  score: number;
  wave: number;
  bullets: Bullet[];
  enemyBullets: Bullet[];
  enemies: Enemy[];
  stars: Star[];
  status: Status;
  statusAt: number;
  invulnUntil: number;
  lastShotAt: number;
  swayPhase: number;
  boxPhase: number;
  paused: boolean;
};

function formationX(col: number) {
  const totalWidth = COLS * ENEMY_W + (COLS - 1) * ENEMY_GAP_X;
  const left = (CANVAS_W - totalWidth) / 2;
  return left + col * (ENEMY_W + ENEMY_GAP_X);
}

function formationY(row: number) {
  return FORMATION_TOP + row * (ENEMY_H + ENEMY_GAP_Y);
}

type FormationOffset = { dx: number; dy: number };

/** A gentle side-to-side sway with an independent vertical box-bob --
 * the original wave 4-6 pattern. */
function boxPattern(phase: number, col: number): FormationOffset {
  return {
    dx: Math.sin(phase * BOX_SPEED) * 40,
    dy: Math.sin(phase * BOX_SPEED + col * 0.5) * BOX_AMPLITUDE,
  };
}

/** Each column orbits in an ellipse, phase-offset so the formation ripples. */
function circlePattern(phase: number, col: number): FormationOffset {
  const t = phase * 1.1 + col * 0.15;
  return { dx: Math.cos(t) * 44, dy: Math.sin(t) * BOX_AMPLITUDE };
}

/** Traces a rotated-square (diamond) path using triangle waves. */
function diamondPattern(phase: number, col: number): FormationOffset {
  const triangle = (t: number) => {
    const cycle = ((t % 1) + 1) % 1;
    return Math.abs(cycle * 4 - 2) - 1; // -1..1, sharp corners
  };
  const t = (phase * 0.9 + col * 0.2) / (Math.PI * 2);
  return { dx: triangle(t) * 44, dy: triangle(t + 0.25) * BOX_AMPLITUDE };
}

/** A classic Lissajous figure-eight (Y oscillates twice per X cycle). */
function figureEightPattern(phase: number, col: number): FormationOffset {
  const t = phase * 1.2 + col * 0.1;
  return { dx: Math.sin(t) * 50, dy: Math.sin(t * 2) * BOX_AMPLITUDE };
}

const FORMATION_PATTERNS = [
  boxPattern,
  circlePattern,
  diamondPattern,
  figureEightPattern,
];

function makeEnemies(): Enemy[] {
  const enemies: Enemy[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      enemies.push({
        col,
        row,
        x: formationX(col),
        y: formationY(row),
        alive: true,
        diving: false,
        diveT: 0,
        diveStartX: 0,
        diveStartY: 0,
        diveTargetX: 0,
        shotFired: false,
        shotFired2: false,
        returning: false,
        returnT: 0,
        returnStartX: 0,
      });
    }
  }
  return enemies;
}

function makeStars(): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const size = 1 + Math.random() * 2;
    stars.push({
      x: Math.random() * CANVAS_W,
      y: Math.random() * CANVAS_H,
      size,
      // Bigger stars drift faster, for a cheap sense of parallax depth.
      speed: 20 + size * 60 + Math.random() * 30,
    });
  }
  return stars;
}

function makeInitialState(wave = 1, status: Status = "title"): GameState {
  return {
    playerX: CANVAS_W / 2,
    playerY: PLAYER_Y,
    lives: 3,
    score: 0,
    wave,
    bullets: [],
    enemyBullets: [],
    enemies: makeEnemies(),
    stars: makeStars(),
    status,
    statusAt: 0,
    invulnUntil: 0,
    lastShotAt: 0,
    swayPhase: 0,
    boxPhase: 0,
    paused: false,
  };
}

function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function hitPlayer(s: GameState, now: number, sfx: Sfx) {
  s.lives -= 1;
  s.invulnUntil = now + INVULN_MS;
  sfx.onHit();
  if (s.lives <= 0) s.status = "gameover";
}

function update(
  s: GameState,
  keys: Set<string>,
  now: number,
  dt: number,
  sfx: Sfx
) {
  // Keeps drifting on every screen -- title, gameplay, and game over alike.
  for (const star of s.stars) {
    star.y += star.speed * dt;
    if (star.y > CANVAS_H) {
      star.y = 0;
      star.x = Math.random() * CANVAS_W;
    }
  }

  // Stars keep drifting for ambience, but everything else -- enemies,
  // bullets, timers, dives -- freezes completely while paused.
  if (s.paused) return;

  if (s.status === "gameover") return;

  if (s.status === "title") {
    if (keys.has(" ") || keys.has("Enter")) s.status = "playing";
    return;
  }

  if (s.status === "wave-clear") {
    if (now >= s.statusAt) {
      s.wave += 1;
      s.enemies = makeEnemies();
      s.bullets = [];
      s.enemyBullets = [];
      s.status = "playing";
    }
    return;
  }

  let dx = 0;
  if (keys.has("ArrowLeft")) dx -= 1;
  if (keys.has("ArrowRight")) dx += 1;
  s.playerX = Math.min(
    CANVAS_W - PLAYER_W / 2,
    Math.max(PLAYER_W / 2, s.playerX + dx * PLAYER_SPEED * dt)
  );

  let dy = 0;
  if (keys.has("ArrowUp")) dy -= 1;
  if (keys.has("ArrowDown")) dy += 1;
  s.playerY = Math.min(
    PLAYER_Y_MAX,
    Math.max(PLAYER_Y_MIN, s.playerY + dy * PLAYER_SPEED * dt)
  );

  if (keys.has(" ") && now - s.lastShotAt > SHOT_COOLDOWN_MS) {
    s.bullets.push({ x: s.playerX, y: s.playerY });
    s.lastShotAt = now;
    sfx.onShoot();
  }

  s.swayPhase += dt;
  const swaySpeed = 1.6 + s.wave * 0.22;
  const sway = Math.sin(s.swayPhase * swaySpeed) * 40;
  s.boxPhase += dt;

  for (const b of s.bullets) b.y -= BULLET_SPEED * dt;
  s.bullets = s.bullets.filter((b) => b.y > -20);

  for (const b of s.enemyBullets) b.y += ENEMY_BULLET_SPEED * dt;

  const divingCount = s.enemies.filter((e) => e.alive && e.diving).length;
  const diveChance = (0.35 + s.wave * 0.06) * dt;
  if (divingCount < MAX_CONCURRENT_DIVERS && Math.random() < diveChance) {
    const candidates = s.enemies.filter(
      (e) => e.alive && !e.diving && !e.returning
    );
    if (candidates.length > 0) {
      const enemy =
        candidates[Math.floor(Math.random() * candidates.length)];
      enemy.diving = true;
      enemy.diveT = 0;
      enemy.diveStartX = enemy.x;
      enemy.diveStartY = enemy.y;
      enemy.diveTargetX = s.playerX - ENEMY_W / 2;
      enemy.shotFired = false;
      enemy.shotFired2 = false;
    }
  }

  for (const e of s.enemies) {
    if (!e.alive) continue;
    if (e.diving) {
      e.diveT += dt / (DIVE_DURATION_MS / 1000);
      const t = Math.min(1, e.diveT);
      e.x =
        e.diveStartX +
        (e.diveTargetX - e.diveStartX) * t +
        Math.sin(t * Math.PI * 2) * 24;
      e.y = e.diveStartY + t * (CANVAS_H + 40 - e.diveStartY);
      if (!e.shotFired && t > 0.3) {
        s.enemyBullets.push({ x: e.x + ENEMY_W / 2, y: e.y + ENEMY_H });
        e.shotFired = true;
      }
      if (!e.shotFired2 && t > 0.65) {
        s.enemyBullets.push({ x: e.x + ENEMY_W / 2, y: e.y + ENEMY_H });
        e.shotFired2 = true;
      }
      if (t >= 1) {
        e.diving = false;
        e.diveT = 0;
        e.returning = true;
        e.returnT = 0;
        e.returnStartX = e.x;
      }
    } else if (e.returning) {
      e.returnT += dt / (RETURN_TOTAL_MS / 1000);
      const t = Math.min(1, e.returnT);
      const targetX = formationX(e.col);
      if (t < RETURN_LOOP_FRACTION) {
        // Loop back up past the top of the screen, off to the side of the
        // formation, before lining up over its slot.
        const lt = t / RETURN_LOOP_FRACTION;
        e.x = e.returnStartX + (targetX - e.returnStartX) * lt;
        e.y = CANVAS_H + 40 + (RETURN_ABOVE_Y - (CANVAS_H + 40)) * lt;
      } else {
        // Descend from just above the canvas into the formation slot.
        const dt2 = (t - RETURN_LOOP_FRACTION) / (1 - RETURN_LOOP_FRACTION);
        e.x = targetX;
        e.y = RETURN_ABOVE_Y + (formationY(e.row) - RETURN_ABOVE_Y) * dt2;
      }
      if (t >= 1) {
        e.returning = false;
        e.returnT = 0;
        e.x = targetX;
        e.y = formationY(e.row);
      }
    } else if (s.wave >= PATTERN_START_WAVE) {
      const patternIndex =
        (s.wave - PATTERN_START_WAVE) % FORMATION_PATTERNS.length;
      const { dx, dy } = FORMATION_PATTERNS[patternIndex](s.boxPhase, e.col);
      e.x = formationX(e.col) + dx;
      e.y = Math.min(BOX_Y_LIMIT, formationY(e.row) + dy);
    } else {
      e.x = formationX(e.col) + sway;
      let y = formationY(e.row);
      if (s.wave >= BOX_MOVE_START_WAVE) {
        const boxOffset =
          Math.sin(s.boxPhase * BOX_SPEED + e.col * 0.5) * BOX_AMPLITUDE;
        y = Math.min(BOX_Y_LIMIT, y + boxOffset);
      }
      e.y = y;
    }
  }

  for (const b of s.bullets) {
    for (const e of s.enemies) {
      if (!e.alive || e.returning) continue;
      if (
        rectsOverlap(b.x - 2, b.y - 6, 4, 10, e.x, e.y, ENEMY_W, ENEMY_H)
      ) {
        e.alive = false;
        b.y = -9999;
        s.score += e.diving ? 30 : 10;
        sfx.onExplosion();
      }
    }
  }
  s.bullets = s.bullets.filter((b) => b.y > -100);

  const playerRect = { x: s.playerX - PLAYER_W / 2, y: s.playerY, w: PLAYER_W, h: PLAYER_H };
  if (now > s.invulnUntil) {
    for (const b of s.enemyBullets) {
      if (
        rectsOverlap(
          b.x - 2,
          b.y - 2,
          4,
          8,
          playerRect.x,
          playerRect.y,
          playerRect.w,
          playerRect.h
        )
      ) {
        b.y = CANVAS_H + 999;
        hitPlayer(s, now, sfx);
        break;
      }
    }
    for (const e of s.enemies) {
      if (
        e.alive &&
        e.diving &&
        rectsOverlap(
          e.x,
          e.y,
          ENEMY_W,
          ENEMY_H,
          playerRect.x,
          playerRect.y,
          playerRect.w,
          playerRect.h
        )
      ) {
        e.alive = false;
        hitPlayer(s, now, sfx);
      }
    }
  }
  s.enemyBullets = s.enemyBullets.filter((b) => b.y < CANVAS_H + 20);

  if (s.status === "playing" && s.enemies.every((e) => !e.alive)) {
    s.status = "wave-clear";
    s.statusAt = now + WAVE_CLEAR_MS;
  }
}

function centeredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  size = 16
) {
  ctx.font = `${size}px monospace`;
  ctx.fillStyle = "#39ff88";
  const width = ctx.measureText(text).width;
  ctx.fillText(text, (CANVAS_W - width) / 2, y);
}

function draw(ctx: CanvasRenderingContext2D, s: GameState, now: number) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  for (const star of s.stars) {
    const brightness = 0.15 + star.size / 6;
    ctx.fillStyle = `rgba(150, 160, 180, ${brightness})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }

  ctx.textBaseline = "top";

  if (s.status === "title") {
    centeredText(ctx, GAME_TITLE, CANVAS_H / 2 - 70, 42);
    centeredText(ctx, "A KYLEPBARTZ.OS ARCADE CABINET", CANVAS_H / 2 - 20, 12);
    if (Math.floor(now / 500) % 2 === 0) {
      centeredText(ctx, "PRESS SPACE TO START", CANVAS_H / 2 + 40, 14);
    }
    centeredText(
      ctx,
      "ARROWS move  ·  SPACE fire  ·  ESC exit",
      CANVAS_H / 2 + 90,
      11
    );
    return;
  }

  ctx.font = "14px monospace";
  ctx.fillStyle = "#39ff88";
  ctx.fillText(`SCORE ${s.score}`, 12, 12);
  ctx.fillText(`WAVE ${s.wave}`, CANVAS_W / 2 - 24, 12);
  ctx.fillText(`LIVES ${s.lives}`, CANVAS_W - 90, 12);

  const enemyDrawX = (x: number) => x + (ENEMY_W - ENEMY_DRAW_W) / 2;
  const enemyDrawY = (y: number) => y + (ENEMY_H - ENEMY_DRAW_H) / 2;

  for (const e of s.enemies) {
    if (!e.alive) continue;
    if (e.returning && e.returnT < RETURN_LOOP_FRACTION) {
      // Invulnerable and harmless while looping back to the formation --
      // rendered flipped and doubled in size to read as clearly distinct.
      // Only during the loop-up leg: it's back to normal well before the
      // descent, so it doesn't pop to full size right as it rejoins.
      const w = ENEMY_DRAW_W * 2;
      const h = ENEMY_DRAW_H * 2;
      const cx = e.x + ENEMY_W / 2;
      const cy = e.y + ENEMY_H / 2;
      if (isImageReady(enemyImage)) {
        ctx.imageSmoothingEnabled = false;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI);
        ctx.drawImage(enemyImage, -w / 2, -h / 2, w, h);
        ctx.restore();
      } else {
        ctx.fillStyle = "#82aaff";
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
      }
      continue;
    }
    if (isImageReady(enemyImage)) {
      ctx.imageSmoothingEnabled = false;
      const dx = enemyDrawX(e.x);
      const dy = enemyDrawY(e.y);
      const sprite = e.diving && enemyDivingCanvas ? enemyDivingCanvas : enemyImage;
      ctx.drawImage(sprite, dx, dy, ENEMY_DRAW_W, ENEMY_DRAW_H);
    } else {
      ctx.fillStyle = e.diving ? "#ff3b6b" : "#82aaff";
      ctx.fillRect(e.x, e.y, ENEMY_W, ENEMY_H);
      ctx.fillStyle = "#000";
      ctx.fillRect(e.x + 6, e.y + 6, 4, 4);
      ctx.fillRect(e.x + ENEMY_W - 10, e.y + 6, 4, 4);
    }
  }

  ctx.fillStyle = "#39ff88";
  for (const b of s.bullets) ctx.fillRect(b.x - 2, b.y - 6, 4, 10);

  for (const b of s.enemyBullets) {
    // A faint tail trailing behind the bullet's direction of travel (up,
    // since enemy bullets move down).
    const tail = ctx.createLinearGradient(0, b.y - 10, 0, b.y - 2);
    tail.addColorStop(0, "rgba(255, 59, 107, 0)");
    tail.addColorStop(1, "rgba(255, 59, 107, 0.35)");
    ctx.fillStyle = tail;
    ctx.fillRect(b.x - 1.5, b.y - 10, 3, 8);

    ctx.fillStyle = "#ff3b6b";
    ctx.fillRect(b.x - 2, b.y - 2, 4, 8);
  }

  const blink = now < s.invulnUntil && Math.floor(now / 100) % 2 === 0;
  if (!blink) {
    if (isImageReady(shipImage)) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        shipImage,
        s.playerX - SHIP_DRAW_W / 2,
        s.playerY + (PLAYER_H - SHIP_DRAW_H) / 2,
        SHIP_DRAW_W,
        SHIP_DRAW_H
      );
    } else {
      ctx.fillStyle = "#39ff88";
      ctx.beginPath();
      ctx.moveTo(s.playerX, s.playerY);
      ctx.lineTo(s.playerX - PLAYER_W / 2, s.playerY + PLAYER_H);
      ctx.lineTo(s.playerX + PLAYER_W / 2, s.playerY + PLAYER_H);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (s.status === "wave-clear") {
    centeredText(ctx, `WAVE ${s.wave} CLEARED`, CANVAS_H / 2);
  }

  if (s.paused) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    centeredText(ctx, "PAUSED", CANVAS_H / 2 - 10, 28);
    centeredText(ctx, "P to resume", CANVAS_H / 2 + 24, 12);
  }

  if (s.status === "gameover") {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    centeredText(ctx, "GAME OVER", CANVAS_H / 2 - 30, 24);
    centeredText(ctx, `SCORE ${s.score}  WAVE ${s.wave}`, CANVAS_H / 2 + 4, 14);
    centeredText(ctx, "ENTER to retry - ESC to exit", CANVAS_H / 2 + 30, 12);
  }
}

export default function GalagaGame() {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(makeInitialState());
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const musicGainRef = useRef<GainNode | null>(null);
  const musicSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const musicSchedulerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const musicNextStartRef = useRef(0);
  const musicPlayingRef = useRef(false);
  const currentTrackRef = useRef<MusicTrack | null>(null);
  const activeMusicBufferRef = useRef<AudioBuffer | null>(null);
  const lastStatusRef = useRef<Status | null>(null);

  // Leaderboard / high-score entry. Interactive bits are read from refs
  // inside onKeyDown (a stable closure that doesn't re-run per keystroke),
  // mirrored into state purely to drive the overlay's re-renders.
  const [isGameOver, setIsGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(
    null
  );
  const [enteringInitials, setEnteringInitials] = useState(false);
  const enteringInitialsRef = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const submittedRef = useRef(false);
  const [initialsState, setInitialsState] = useState({
    letters: Array(INITIALS_LENGTH).fill("A") as string[],
    slot: 0,
  });
  const [paused, setPaused] = useState(false);
  const [canPause, setCanPause] = useState(false);

  function scheduleMusic() {
    const ctx = getSfxContext();
    const gain = musicGainRef.current;
    const buffer = activeMusicBufferRef.current;
    if (!buffer || !gain || !musicPlayingRef.current) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.start(musicNextStartRef.current);
    musicSourcesRef.current.push(source);
    source.onended = () => {
      musicSourcesRef.current = musicSourcesRef.current.filter(
        (s) => s !== source
      );
    };

    musicNextStartRef.current += buffer.duration;
    const delayMs = Math.max(
      0,
      (musicNextStartRef.current - ctx.currentTime - MUSIC_SCHEDULE_AHEAD_SEC) *
        1000
    );
    musicSchedulerRef.current = setTimeout(scheduleMusic, delayMs);
  }

  function stopMusic() {
    musicPlayingRef.current = false;
    currentTrackRef.current = null;
    if (musicSchedulerRef.current !== null) {
      clearTimeout(musicSchedulerRef.current);
      musicSchedulerRef.current = null;
    }
    for (const source of musicSourcesRef.current) {
      source.onended = null;
      source.stop();
    }
    musicSourcesRef.current = [];
  }

  function startMusic(track: MusicTrack) {
    const buffer = musicBufferForTrack(track);
    if (!buffer) return;
    if (currentTrackRef.current === track && musicPlayingRef.current) return;

    stopMusic();
    const ctx = getSfxContext();
    if (!musicGainRef.current) {
      const gain = ctx.createGain();
      gain.gain.value = 0.1;
      gain.connect(ctx.destination);
      musicGainRef.current = gain;
    }
    musicPlayingRef.current = true;
    currentTrackRef.current = track;
    activeMusicBufferRef.current = buffer;
    musicNextStartRef.current = ctx.currentTime + 0.05;
    scheduleMusic();
  }

  /** Plays whichever loop matches the given game status, switching tracks
   * only when the status actually calls for a different one. */
  function playTrackForStatus(status: Status) {
    if (status === "playing" || status === "wave-clear") {
      startMusic("background");
    } else if (status === "title" || status === "gameover") {
      startMusic("title");
    }
  }

  function togglePause() {
    const s = stateRef.current;
    if (s.status !== "playing" && s.status !== "wave-clear") return;
    s.paused = !s.paused;
    setPaused(s.paused);
    // The music scheduler runs on its own setTimeout chain independent of
    // the game loop, so it has to be explicitly stopped/restarted -- it
    // won't freeze just because update() does.
    if (s.paused) {
      stopMusic();
    } else {
      playTrackForStatus(s.status);
    }
  }

  function resetLeaderboardUi() {
    enteringInitialsRef.current = false;
    setEnteringInitials(false);
    submittedRef.current = false;
    setSubmitted(false);
    setSaving(false);
    setInitialsState({
      letters: Array(INITIALS_LENGTH).fill("A"),
      slot: 0,
    });
  }

  async function handleGameOver(score: number) {
    setLeaderboard(null);
    const entries = await fetchLeaderboard();
    setLeaderboard(entries);
    const qualifies =
      score > 0 &&
      (entries.length < LEADERBOARD_MAX_ENTRIES ||
        score > entries[entries.length - 1].score);
    if (qualifies) {
      enteringInitialsRef.current = true;
      setEnteringInitials(true);
    }
  }

  function submitInitials(letters: string) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSaving(true);
    postScore(letters, stateRef.current.score, stateRef.current.wave).then(
      (entries) => {
        if (entries.length > 0) setLeaderboard(entries);
        setSaving(false);
        setSubmitted(true);
        enteringInitialsRef.current = false;
        setEnteringInitials(false);
      }
    );
  }

  useEffect(() => {
    function onKonami() {
      stateRef.current = makeInitialState();
      setOpen(true);
      setIsGameOver(false);
      setLeaderboard(null);
      setPaused(false);
      setCanPause(false);
      resetLeaderboardUi();
      // The konami sequence's last keystroke is a genuine user gesture, so
      // this is guaranteed to be allowed to play once decoding finishes.
      primeGalagaSfx().catch(() => {});
      loadSprites();
    }
    window.addEventListener("konami-code", onKonami);
    return () => window.removeEventListener("konami-code", onKonami);
  }, []);

  useEffect(() => {
    if (!open) return;

    lastStatusRef.current = stateRef.current.status;
    primeGalagaSfx()
      .then(() => playTrackForStatus(stateRef.current.status))
      .catch(() => {});

    function onKeyDown(e: KeyboardEvent) {
      if (MOVE_KEYS.has(e.key)) e.preventDefault();
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key.toLowerCase() === "p") {
        togglePause();
        return;
      }

      if (enteringInitialsRef.current && !submittedRef.current) {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          const dir = e.key === "ArrowUp" ? 1 : -1;
          setInitialsState((prev) => {
            const letters = [...prev.letters];
            const code = letters[prev.slot].charCodeAt(0) - 65;
            letters[prev.slot] = String.fromCharCode(
              ((code + dir + 26) % 26) + 65
            );
            return { ...prev, letters };
          });
        } else if (e.key === "ArrowLeft") {
          setInitialsState((prev) => ({
            ...prev,
            slot: Math.max(0, prev.slot - 1),
          }));
        } else if (e.key === "ArrowRight") {
          setInitialsState((prev) => ({
            ...prev,
            slot: Math.min(INITIALS_LENGTH - 1, prev.slot + 1),
          }));
        } else if (e.key === "Enter") {
          setInitialsState((prev) => {
            submitInitials(prev.letters.join(""));
            return prev;
          });
        }
        return;
      }

      if (e.key === "Enter" && stateRef.current.status === "gameover") {
        stateRef.current = makeInitialState(1, "playing");
        resetLeaderboardUi();
        setIsGameOver(false);
        return;
      }
      keysRef.current.add(e.key);
    }
    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    lastFrameRef.current = performance.now();

    const sfx: Sfx = {
      onShoot: () => playSfx("shoot", 0.25),
      onExplosion: () => playSfx("explosion", 0.35),
      onHit: () => playSfx("hit", 0.3),
    };

    function frame(now: number) {
      const dt = Math.min(0.05, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;
      update(stateRef.current, keysRef.current, now, dt, sfx);
      if (stateRef.current.status !== lastStatusRef.current) {
        lastStatusRef.current = stateRef.current.status;
        playTrackForStatus(stateRef.current.status);
        setCanPause(
          stateRef.current.status === "playing" ||
            stateRef.current.status === "wave-clear"
        );
        if (stateRef.current.status === "gameover") {
          setIsGameOver(true);
          handleGameOver(stateRef.current.score).catch(() => {});
        }
      }
      draw(ctx!, stateRef.current, now);
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    const keys = keysRef.current;
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      keys.clear();
      stopMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startMusic/stopMusic read refs, not state
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[105] flex flex-col items-center justify-center gap-3 bg-black/95 px-4">
      <div className="relative max-h-[80vh]">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="max-h-[80vh] w-auto border border-[#39ff88]/40 [image-rendering:pixelated]"
        />
        {isGameOver && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
            <div className="pointer-events-auto w-full max-w-[260px] border border-[#39ff88]/60 bg-black/90 p-3 font-mono text-[11px] text-[#39ff88]">
              {enteringInitials && !saving && !submitted && (
                <>
                  <p className="mb-2 text-center tracking-widest">
                    NEW HIGH SCORE!
                  </p>
                  <div className="mb-2 flex justify-center gap-3 text-lg tracking-[6px]">
                    {initialsState.letters.map((letter, i) => (
                      <span
                        key={i}
                        className={
                          i === initialsState.slot
                            ? "bg-[#39ff88] text-black"
                            : ""
                        }
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                  <p className="text-center text-white/40">
                    &larr;&rarr; select &middot; &uarr;&darr; change &middot;
                    ENTER confirm
                  </p>
                </>
              )}
              {saving && (
                <p className="mb-2 text-center tracking-widest">
                  SAVING...
                </p>
              )}
              {submitted && (
                <p className="mb-2 text-center tracking-widest">
                  SCORE SAVED!
                </p>
              )}
              {leaderboard === null && (
                <p className="text-center text-white/40">
                  loading leaderboard...
                </p>
              )}
              {leaderboard !== null && leaderboard.length > 0 && (
                <div
                  className={
                    enteringInitials || submitted
                      ? "mt-2 border-t border-[#39ff88]/30 pt-2"
                      : ""
                  }
                >
                  <p className="mb-1 text-center text-white/40">
                    LEADERBOARD
                  </p>
                  {leaderboard.map((entry, i) => (
                    <div
                      key={entry.ts}
                      className="flex justify-between gap-4"
                    >
                      <span>
                        {i + 1}. {entry.initials}
                      </span>
                      <span>{entry.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {canPause && (
          <button
            type="button"
            onClick={togglePause}
            className="border border-[#39ff88]/60 bg-black/80 px-2 py-1 font-mono text-[10px] tracking-widest text-[#39ff88] transition hover:bg-[#39ff88] hover:text-black"
          >
            {paused ? "RESUME" : "PAUSE"}
          </button>
        )}
        <p className="text-xs tracking-widest text-white/40">
          ARROWS move &middot; SPACE fire &middot; P pause &middot; ESC exit
        </p>
      </div>
    </div>
  );
}
