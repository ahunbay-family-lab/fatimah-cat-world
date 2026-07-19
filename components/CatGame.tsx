"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  drawCat,
  drawDog,
  drawGround,
  drawHud,
  drawSky,
} from "@/lib/catDraw";
import {
  BASE_SPEED,
  CAT_HEIGHT,
  CAT_WIDTH,
  CAT_X,
  GAME_HEIGHT,
  GAME_WIDTH,
  GOLD_PER_MOUSE,
  GRAVITY,
  GROUND_Y,
  JUMP_VELOCITY,
  MAX_SPEED,
  MOUSE_DOG_GAP,
  SPEED_GROWTH,
  boxesOverlap,
  createMouseRow,
  createObstacle,
  formatGold,
  formatScore,
  mouseRowWidth,
  type Mouse,
  type Obstacle,
} from "@/lib/catGame";
import { loadBarkSounds, playDogBark, unlockAudio } from "@/lib/barkSound";
import { drawMouse } from "@/lib/mouseDraw";
import { loadGameSprites, type GameSprites } from "@/lib/sprites";

type GameStatus = "ready" | "playing" | "gameover";

const HIGH_SCORE_KEY = "cat-runner-high-score";

const highScoreListeners = new Set<() => void>();

function subscribeHighScore(onStoreChange: () => void) {
  highScoreListeners.add(onStoreChange);
  return () => {
    highScoreListeners.delete(onStoreChange);
  };
}

function readHighScore(): number {
  const saved = Number(localStorage.getItem(HIGH_SCORE_KEY) || "0");
  return Number.isNaN(saved) ? 0 : saved;
}

function writeHighScore(value: number) {
  localStorage.setItem(HIGH_SCORE_KEY, String(value));
  for (const listener of highScoreListeners) {
    listener();
  }
}

function setupHiDpiCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(GAME_WIDTH * ratio);
  canvas.height = Math.floor(GAME_HEIGHT * ratio);
  canvas.style.width = `${GAME_WIDTH}px`;
  canvas.style.height = `${GAME_HEIGHT}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
}

export function CatGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [score, setScore] = useState(0);
  const [gold, setGold] = useState(0);
  const highScore = useSyncExternalStore(
    subscribeHighScore,
    readHighScore,
    () => 0,
  );

  const statusRef = useRef<GameStatus>("ready");
  const scoreRef = useRef(0);
  const goldRef = useRef(0);
  const highScoreRef = useRef(0);
  const catYRef = useRef(GROUND_Y - CAT_HEIGHT);
  const velocityRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const miceRef = useRef<Mouse[]>([]);
  const speedRef = useRef(BASE_SPEED);
  const frameRef = useRef(0);
  const groundOffsetRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const touchFramesRef = useRef(0);
  const miceComboRef = useRef(0);
  const spritesRef = useRef<GameSprites | null>(null);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  function resetRun() {
    catYRef.current = GROUND_Y - CAT_HEIGHT;
    velocityRef.current = 0;
    obstaclesRef.current = [];
    miceRef.current = [];
    speedRef.current = BASE_SPEED;
    frameRef.current = 0;
    groundOffsetRef.current = 0;
    spawnTimerRef.current = 90;
    touchFramesRef.current = 0;
    miceComboRef.current = 0;
    scoreRef.current = 0;
    goldRef.current = 0;
    setScore(0);
    setGold(0);
  }

  function startGame() {
    unlockAudio();
    resetRun();
    setStatus("playing");
    statusRef.current = "playing";
  }

  function jump() {
    unlockAudio();
    if (statusRef.current === "ready" || statusRef.current === "gameover") {
      startGame();
      return;
    }

    const onGround = catYRef.current >= GROUND_Y - CAT_HEIGHT - 0.5;
    if (onGround) {
      velocityRef.current = JUMP_VELOCITY;
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
      }
      if (event.code === "Enter" && statusRef.current === "gameover") {
        startGame();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;
    setupHiDpiCanvas(canvas, context);

    let animationId = 0;
    let cancelled = false;

    loadGameSprites()
      .then((sprites) => {
        if (!cancelled) {
          spritesRef.current = sprites;
        }
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    void loadBarkSounds().catch((error: unknown) => {
      console.error(error);
    });

    function endGame() {
      statusRef.current = "gameover";
      setStatus("gameover");
      const finalScore = Math.floor(scoreRef.current);
      if (finalScore > highScoreRef.current) {
        highScoreRef.current = finalScore;
        writeHighScore(finalScore);
      }
    }

    function handleMice() {
      let touchingMouse = false;
      let goldChanged = false;

      for (const mouse of miceRef.current) {
        const mouseY = GROUND_Y - mouse.height;
        const hit = boxesOverlap(
          CAT_X,
          catYRef.current,
          CAT_WIDTH,
          CAT_HEIGHT,
          mouse.x,
          mouseY,
          mouse.width,
          mouse.height,
          4,
        );

        if (hit) {
          touchingMouse = true;
          if (!mouse.collected) {
            mouse.collected = true;
            goldRef.current += GOLD_PER_MOUSE;
            miceComboRef.current += 1;
            goldChanged = true;
          }
        }
      }

      if (touchingMouse) {
        touchFramesRef.current += 1;
        if (touchFramesRef.current % 10 === 0) {
          const bonus = 1 + Math.floor(miceComboRef.current / 2);
          goldRef.current += bonus;
          goldChanged = true;
        }
      } else {
        touchFramesRef.current = 0;
      }

      if (goldChanged && frameRef.current % 2 === 0) {
        setGold(Math.floor(goldRef.current));
      }
    }

    function update() {
      if (statusRef.current !== "playing") return;

      frameRef.current += 1;
      speedRef.current = Math.min(
        MAX_SPEED,
        BASE_SPEED + scoreRef.current * SPEED_GROWTH,
      );
      groundOffsetRef.current += speedRef.current;

      velocityRef.current += GRAVITY;
      catYRef.current += velocityRef.current;
      if (catYRef.current >= GROUND_Y - CAT_HEIGHT) {
        catYRef.current = GROUND_Y - CAT_HEIGHT;
        velocityRef.current = 0;
      }

      spawnTimerRef.current -= 1;
      if (spawnTimerRef.current <= 0) {
        const dogX = GAME_WIDTH + 20;
        const miceStartX = dogX - mouseRowWidth() - MOUSE_DOG_GAP;
        miceRef.current.push(...createMouseRow(miceStartX));
        obstaclesRef.current.push(createObstacle(dogX));
        spawnTimerRef.current = 70 + Math.floor(Math.random() * 70);
      }

      miceRef.current = miceRef.current
        .map((mouse) => ({ ...mouse, x: mouse.x - speedRef.current }))
        .filter((mouse) => mouse.x + mouse.width > -10);

      obstaclesRef.current = obstaclesRef.current
        .map((obstacle) => ({ ...obstacle, x: obstacle.x - speedRef.current }))
        .filter((obstacle) => obstacle.x + obstacle.width > -10);

      handleMice();

      for (const obstacle of obstaclesRef.current) {
        const hit = boxesOverlap(
          CAT_X,
          catYRef.current,
          CAT_WIDTH,
          CAT_HEIGHT,
          obstacle.x,
          GROUND_Y - obstacle.height,
          obstacle.width,
          obstacle.height,
        );
        if (hit) {
          endGame();
          break;
        }
      }

      scoreRef.current += 0.15;
      if (frameRef.current % 4 === 0) {
        setScore(Math.floor(scoreRef.current));
        setGold(Math.floor(goldRef.current));
      }

      const dogIsBarking = Math.floor(frameRef.current / 8) % 2 === 0;
      const dogOnScreen = obstaclesRef.current.some(
        (obstacle) =>
          obstacle.x < GAME_WIDTH - 20 && obstacle.x + obstacle.width > 0,
      );
      if (dogIsBarking && dogOnScreen && frameRef.current % 8 === 0) {
        playDogBark();
      }
    }

    function render() {
      drawSky(context);
      drawGround(context, groundOffsetRef.current);

      const sprites = spritesRef.current;
      for (const mouse of miceRef.current) {
        drawMouse(context, mouse, frameRef.current);
      }

      for (const obstacle of obstaclesRef.current) {
        drawDog(context, sprites, obstacle, frameRef.current);
      }

      const onGround = catYRef.current >= GROUND_Y - CAT_HEIGHT - 0.5;
      drawCat(
        context,
        sprites,
        catYRef.current,
        frameRef.current,
        statusRef.current === "playing",
        onGround,
      );
      drawHud(
        context,
        statusRef.current,
        scoreRef.current,
        highScoreRef.current,
        goldRef.current,
      );
    }

    function loop() {
      update();
      render();
      animationId = requestAnimationFrame(loop);
    }

    render();
    animationId = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="flex w-full max-w-5xl flex-col items-center gap-5">
      <header className="text-center">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[#1f3d2a] sm:text-5xl">
          Cat Runner
        </h1>
        <p className="mt-2 text-base text-[#3f5c48] sm:text-lg">
          Jump over dogs, run through mice rows to earn gold!
        </p>
      </header>

      <div className="w-full overflow-hidden border-2 border-[#3d5a40] bg-[#d9e8c8] shadow-[0_8px_0_#2f4632]">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="h-auto w-full touch-none"
          role="img"
          aria-label="Cat runner game canvas"
          onPointerDown={jump}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={jump}
          className="min-h-11 bg-[#3d5a40] px-6 py-2.5 text-base font-semibold text-[#f5f0e1] transition hover:bg-[#2f4632] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d5a40]"
          aria-label={status === "playing" ? "Jump" : "Start game"}
        >
          {status === "playing"
            ? "Jump"
            : status === "gameover"
              ? "Play again"
              : "Start"}
        </button>
        <p className="text-sm text-[#3f5c48]">
          Gold {formatGold(gold)} · Score {formatScore(score)} · Best{" "}
          {formatScore(highScore)}
        </p>
      </div>

      <p className="text-center text-sm text-[#4d6a55]">
        Controls:{" "}
        <kbd className="bg-[#d9e8c8] px-1.5 py-0.5">Space</kbd> or{" "}
        <kbd className="bg-[#d9e8c8] px-1.5 py-0.5">↑</kbd> or tap / click
      </p>
    </section>
  );
}
