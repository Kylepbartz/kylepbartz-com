"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_W = 480;
const CANVAS_H = 640;
const ROWS = 4;
const COLS = 6;
const ENEMY_W = 28;
const ENEMY_H = 20;
const ENEMY_GAP_X = 14;
const ENEMY_GAP_Y = 16;
const FORMATION_TOP = 60;
const PLAYER_W = 28;
const PLAYER_H = 20;
const PLAYER_Y = CANVAS_H - 50;
const PLAYER_SPEED = 260; // px/sec
const BULLET_SPEED = 420;
const ENEMY_BULLET_SPEED = 220;
const SHOT_COOLDOWN_MS = 260;
const INVULN_MS = 1400;
const WAVE_CLEAR_MS = 1400;
const DIVE_DURATION_MS = 2400;
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
};

type Bullet = { x: number; y: number };
type Status = "playing" | "wave-clear" | "gameover";

type GameState = {
  playerX: number;
  lives: number;
  score: number;
  wave: number;
  bullets: Bullet[];
  enemyBullets: Bullet[];
  enemies: Enemy[];
  status: Status;
  statusAt: number;
  invulnUntil: number;
  lastShotAt: number;
  swayPhase: number;
};

function formationX(col: number) {
  const totalWidth = COLS * ENEMY_W + (COLS - 1) * ENEMY_GAP_X;
  const left = (CANVAS_W - totalWidth) / 2;
  return left + col * (ENEMY_W + ENEMY_GAP_X);
}

function formationY(row: number) {
  return FORMATION_TOP + row * (ENEMY_H + ENEMY_GAP_Y);
}

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
      });
    }
  }
  return enemies;
}

function makeInitialState(wave = 1): GameState {
  return {
    playerX: CANVAS_W / 2,
    lives: 3,
    score: 0,
    wave,
    bullets: [],
    enemyBullets: [],
    enemies: makeEnemies(),
    status: "playing",
    statusAt: 0,
    invulnUntil: 0,
    lastShotAt: 0,
    swayPhase: 0,
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

function hitPlayer(s: GameState, now: number) {
  s.lives -= 1;
  s.invulnUntil = now + INVULN_MS;
  if (s.lives <= 0) s.status = "gameover";
}

function update(s: GameState, keys: Set<string>, now: number, dt: number) {
  if (s.status === "gameover") return;

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

  if (keys.has(" ") && now - s.lastShotAt > SHOT_COOLDOWN_MS) {
    s.bullets.push({ x: s.playerX, y: PLAYER_Y });
    s.lastShotAt = now;
  }

  s.swayPhase += dt;
  const swaySpeed = 1.2 + s.wave * 0.15;
  const sway = Math.sin(s.swayPhase * swaySpeed) * 40;

  for (const b of s.bullets) b.y -= BULLET_SPEED * dt;
  s.bullets = s.bullets.filter((b) => b.y > -20);

  for (const b of s.enemyBullets) b.y += ENEMY_BULLET_SPEED * dt;

  const divingCount = s.enemies.filter((e) => e.alive && e.diving).length;
  const diveChance = (0.15 + s.wave * 0.03) * dt;
  if (divingCount < 2 && Math.random() < diveChance) {
    const candidates = s.enemies.filter((e) => e.alive && !e.diving);
    if (candidates.length > 0) {
      const enemy =
        candidates[Math.floor(Math.random() * candidates.length)];
      enemy.diving = true;
      enemy.diveT = 0;
      enemy.diveStartX = enemy.x;
      enemy.diveStartY = enemy.y;
      enemy.diveTargetX = s.playerX - ENEMY_W / 2;
      enemy.shotFired = false;
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
      if (!e.shotFired && t > 0.35) {
        s.enemyBullets.push({ x: e.x + ENEMY_W / 2, y: e.y + ENEMY_H });
        e.shotFired = true;
      }
      if (t >= 1) {
        e.diving = false;
        e.diveT = 0;
        e.x = formationX(e.col);
        e.y = formationY(e.row);
      }
    } else {
      e.x = formationX(e.col) + sway;
      e.y = formationY(e.row);
    }
  }

  for (const b of s.bullets) {
    for (const e of s.enemies) {
      if (!e.alive) continue;
      if (
        rectsOverlap(b.x - 2, b.y - 6, 4, 10, e.x, e.y, ENEMY_W, ENEMY_H)
      ) {
        e.alive = false;
        b.y = -9999;
        s.score += e.diving ? 30 : 10;
      }
    }
  }
  s.bullets = s.bullets.filter((b) => b.y > -100);

  const playerRect = { x: s.playerX - PLAYER_W / 2, y: PLAYER_Y, w: PLAYER_W, h: PLAYER_H };
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
        hitPlayer(s, now);
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
        hitPlayer(s, now);
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

  ctx.textBaseline = "top";
  ctx.font = "14px monospace";
  ctx.fillStyle = "#39ff88";
  ctx.fillText(`SCORE ${s.score}`, 12, 12);
  ctx.fillText(`WAVE ${s.wave}`, CANVAS_W / 2 - 24, 12);
  ctx.fillText(`LIVES ${s.lives}`, CANVAS_W - 90, 12);

  for (const e of s.enemies) {
    if (!e.alive) continue;
    ctx.fillStyle = e.diving ? "#ff3b6b" : "#82aaff";
    ctx.fillRect(e.x, e.y, ENEMY_W, ENEMY_H);
    ctx.fillStyle = "#000";
    ctx.fillRect(e.x + 6, e.y + 6, 4, 4);
    ctx.fillRect(e.x + ENEMY_W - 10, e.y + 6, 4, 4);
  }

  ctx.fillStyle = "#39ff88";
  for (const b of s.bullets) ctx.fillRect(b.x - 2, b.y - 6, 4, 10);

  ctx.fillStyle = "#ff3b6b";
  for (const b of s.enemyBullets) ctx.fillRect(b.x - 2, b.y - 2, 4, 8);

  const blink = now < s.invulnUntil && Math.floor(now / 100) % 2 === 0;
  if (!blink) {
    ctx.fillStyle = "#39ff88";
    ctx.beginPath();
    ctx.moveTo(s.playerX, PLAYER_Y);
    ctx.lineTo(s.playerX - PLAYER_W / 2, PLAYER_Y + PLAYER_H);
    ctx.lineTo(s.playerX + PLAYER_W / 2, PLAYER_Y + PLAYER_H);
    ctx.closePath();
    ctx.fill();
  }

  if (s.status === "wave-clear") {
    centeredText(ctx, `WAVE ${s.wave} CLEARED`, CANVAS_H / 2);
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

  useEffect(() => {
    function onKonami() {
      stateRef.current = makeInitialState();
      setOpen(true);
    }
    window.addEventListener("konami-code", onKonami);
    return () => window.removeEventListener("konami-code", onKonami);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (MOVE_KEYS.has(e.key)) e.preventDefault();
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Enter" && stateRef.current.status === "gameover") {
        stateRef.current = makeInitialState();
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

    function frame(now: number) {
      const dt = Math.min(0.05, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;
      update(stateRef.current, keysRef.current, now, dt);
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
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[105] flex flex-col items-center justify-center gap-3 bg-black/95 px-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="max-h-[80vh] w-auto border border-[#39ff88]/40"
      />
      <p className="text-xs tracking-widest text-white/40">
        ARROWS move &middot; SPACE fire &middot; ESC exit
      </p>
    </div>
  );
}
