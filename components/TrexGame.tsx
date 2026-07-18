"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  drawCactus,
  drawDino,
  drawGround,
  drawHud,
  drawSky,
} from "@/lib/trexDraw";
import {
  BASE_SPEED,
  DINO_HEIGHT,
  DINO_WIDTH,
  DINO_X,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
  GROUND_Y,
  JUMP_VELOCITY,
  MAX_SPEED,
  SPEED_GROWTH,
  boxesOverlap,
  createObstacle,
  formatScore,
  type Obstacle,
} from "@/lib/trexGame";

type GameStatus = "ready" | "playing" | "gameover";

const HIGH_SCORE_KEY = "trex-high-score";

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

export function TrexGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [score, setScore] = useState(0);
  const highScore = useSyncExternalStore(
    subscribeHighScore,
    readHighScore,
    () => 0,
  );

  const statusRef = useRef<GameStatus>("ready");
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const dinoYRef = useRef(GROUND_Y - DINO_HEIGHT);
  const velocityRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const speedRef = useRef(BASE_SPEED);
  const frameRef = useRef(0);
  const groundOffsetRef = useRef(0);
  const spawnTimerRef = useRef(0);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  function resetRun() {
    dinoYRef.current = GROUND_Y - DINO_HEIGHT;
    velocityRef.current = 0;
    obstaclesRef.current = [];
    speedRef.current = BASE_SPEED;
    frameRef.current = 0;
    groundOffsetRef.current = 0;
    spawnTimerRef.current = 90;
    scoreRef.current = 0;
    setScore(0);
  }

  function startGame() {
    resetRun();
    setStatus("playing");
    statusRef.current = "playing";
  }

  function jump() {
    if (statusRef.current === "ready" || statusRef.current === "gameover") {
      startGame();
      return;
    }

    const onGround = dinoYRef.current >= GROUND_Y - DINO_HEIGHT - 0.5;
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
    // Intentionally bind once; jump/start read latest values from refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    let animationId = 0;

    function endGame() {
      statusRef.current = "gameover";
      setStatus("gameover");
      const finalScore = Math.floor(scoreRef.current);
      if (finalScore > highScoreRef.current) {
        highScoreRef.current = finalScore;
        writeHighScore(finalScore);
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
      dinoYRef.current += velocityRef.current;
      if (dinoYRef.current >= GROUND_Y - DINO_HEIGHT) {
        dinoYRef.current = GROUND_Y - DINO_HEIGHT;
        velocityRef.current = 0;
      }

      spawnTimerRef.current -= 1;
      if (spawnTimerRef.current <= 0) {
        obstaclesRef.current.push(createObstacle(GAME_WIDTH + 20));
        spawnTimerRef.current = 70 + Math.floor(Math.random() * 70);
      }

      obstaclesRef.current = obstaclesRef.current
        .map((obstacle) => ({ ...obstacle, x: obstacle.x - speedRef.current }))
        .filter((obstacle) => obstacle.x + obstacle.width > -10);

      for (const obstacle of obstaclesRef.current) {
        const hit = boxesOverlap(
          DINO_X,
          dinoYRef.current,
          DINO_WIDTH,
          DINO_HEIGHT,
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
      }
    }

    function render() {
      drawSky(context);
      drawGround(context, groundOffsetRef.current);

      for (const obstacle of obstaclesRef.current) {
        drawCactus(context, obstacle);
      }

      drawDino(
        context,
        dinoYRef.current,
        frameRef.current,
        statusRef.current === "playing",
      );
      drawHud(
        context,
        statusRef.current,
        scoreRef.current,
        highScoreRef.current,
      );
    }

    function loop() {
      update();
      render();
      animationId = requestAnimationFrame(loop);
    }

    render();
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="flex w-full max-w-4xl flex-col items-center gap-5">
      <header className="text-center">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[#1f3d2a] sm:text-5xl">
          T-Rex Runner
        </h1>
        <p className="mt-2 text-base text-[#3f5c48] sm:text-lg">
          Jump the cacti. Survive as long as you can.
        </p>
      </header>

      <div className="w-full overflow-hidden border-2 border-[#3d5a40] bg-[#d9e8c8] shadow-[0_8px_0_#2f4632]">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="h-auto w-full touch-none"
          role="img"
          aria-label="T-Rex runner game canvas"
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
          Score {formatScore(score)} · Best {formatScore(highScore)}
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
