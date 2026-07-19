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
  CELEBRATION_FRAMES,
  CELEBRATION_SCORE_INTERVAL,
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
  spawnCloudGroup,
  type CloudPlatform,
  type Mouse,
  type Obstacle,
} from "@/lib/catGame";
import { loadBarkSounds, playDogBark, unlockAudio } from "@/lib/barkSound";
import { drawCloud } from "@/lib/cloudDraw";
import { loadMeowSounds, playMeow } from "@/lib/meowSound";
import {
  loadNasheed,
  restoreNasheedAfterCelebration,
  setNasheedEnabled,
  softenNasheedForCelebration,
  startNasheed,
  unlockNasheedAudio,
} from "@/lib/nasheedSound";
import { drawMouse } from "@/lib/mouseDraw";
import { loadGameSprites, type GameSprites } from "@/lib/sprites";

type GameStatus = "ready" | "playing" | "celebrating" | "gameover";

const HIGH_SCORE_KEY = "cat-runner-high-score";
const NASHEED_KEY = "cat-runner-nasheed";

function readNasheedEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem(NASHEED_KEY);
  if (saved === null) return true;
  return saved === "true";
}

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
  const [nasheedOn, setNasheedOn] = useState(() => readNasheedEnabled());
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
  const cloudsRef = useRef<CloudPlatform[]>([]);
  const onCloudRef = useRef(false);
  const speedRef = useRef(BASE_SPEED);
  const frameRef = useRef(0);
  const groundOffsetRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const touchFramesRef = useRef(0);
  const miceComboRef = useRef(0);
  const celebrationFramesRef = useRef(0);
  const celebratedMilestoneRef = useRef(0);
  const spritesRef = useRef<GameSprites | null>(null);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    setNasheedEnabled(nasheedOn);
    unlockNasheedAudio();
    void loadNasheed().then(() => {
      if (nasheedOn) void startNasheed();
    });
    // Only initialize background audio once on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleNasheed() {
    unlockNasheedAudio();
    const next = !nasheedOn;
    setNasheedOn(next);
    localStorage.setItem(NASHEED_KEY, String(next));
    setNasheedEnabled(next);
    if (next) {
      void startNasheed();
    }
  }

  function resetRun() {
    catYRef.current = GROUND_Y - CAT_HEIGHT;
    velocityRef.current = 0;
    obstaclesRef.current = [];
    miceRef.current = [];
    cloudsRef.current = [];
    onCloudRef.current = false;
    speedRef.current = BASE_SPEED;
    frameRef.current = 0;
    groundOffsetRef.current = 0;
    spawnTimerRef.current = 90;
    touchFramesRef.current = 0;
    miceComboRef.current = 0;
    celebrationFramesRef.current = 0;
    celebratedMilestoneRef.current = 0;
    scoreRef.current = 0;
    goldRef.current = 0;
    setScore(0);
    setGold(0);
  }

  function startGame() {
    unlockAudio();
    unlockNasheedAudio();
    if (nasheedOn) {
      void startNasheed();
    }
    resetRun();
    setStatus("playing");
    statusRef.current = "playing";
  }

  function jump() {
    unlockAudio();
    unlockNasheedAudio();
    if (nasheedOn) {
      void startNasheed();
    }
    if (statusRef.current === "ready" || statusRef.current === "gameover") {
      startGame();
      return;
    }
    if (statusRef.current === "celebrating") return;

    const onGround = catYRef.current >= GROUND_Y - CAT_HEIGHT - 0.5;
    if (onGround || onCloudRef.current) {
      velocityRef.current = JUMP_VELOCITY;
      onCloudRef.current = false;
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

    void loadMeowSounds().catch((error: unknown) => {
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

    function startCelebration() {
      celebrationFramesRef.current = CELEBRATION_FRAMES;
      statusRef.current = "celebrating";
      setStatus("celebrating");
      softenNasheedForCelebration();
      playMeow();
    }

    function allMice(): Mouse[] {
      return [
        ...miceRef.current,
        ...cloudsRef.current.flatMap((cloud) => cloud.mice),
      ];
    }

    function handleMice() {
      let touchingMouse = false;
      let goldChanged = false;

      for (const mouse of allMice()) {
        const hit = boxesOverlap(
          CAT_X,
          catYRef.current,
          CAT_WIDTH,
          CAT_HEIGHT,
          mouse.x,
          mouse.y,
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

    function landOnSurfaces() {
      const prevBottom = catYRef.current + CAT_HEIGHT - velocityRef.current;
      const catBottom = catYRef.current + CAT_HEIGHT;
      let landed = false;

      if (velocityRef.current > 0) {
        for (const cloud of cloudsRef.current) {
          const overlapsX =
            CAT_X + CAT_WIDTH > cloud.x + 8 &&
            CAT_X < cloud.x + cloud.width - 8;
          if (
            overlapsX &&
            catBottom >= cloud.y - 2 &&
            prevBottom <= cloud.y + 12
          ) {
            catYRef.current = cloud.y - CAT_HEIGHT;
            velocityRef.current = 0;
            onCloudRef.current = true;
            landed = true;
            break;
          }
        }
      }

      if (!landed) {
        onCloudRef.current = false;
        if (catYRef.current >= GROUND_Y - CAT_HEIGHT) {
          catYRef.current = GROUND_Y - CAT_HEIGHT;
          velocityRef.current = 0;
        }
      }
    }

    function moveWorld() {
      miceRef.current = miceRef.current
        .map((mouse) => ({ ...mouse, x: mouse.x - speedRef.current }))
        .filter((mouse) => mouse.x + mouse.width > -10);

      cloudsRef.current = cloudsRef.current
        .map((cloud) => ({
          ...cloud,
          x: cloud.x - speedRef.current,
          mice: cloud.mice.map((mouse) => ({
            ...mouse,
            x: mouse.x - speedRef.current,
          })),
        }))
        .filter((cloud) => cloud.x + cloud.width > -20);

      obstaclesRef.current = obstaclesRef.current
        .map((obstacle) => ({ ...obstacle, x: obstacle.x - speedRef.current }))
        .filter((obstacle) => obstacle.x + obstacle.width > -10);
    }

    function checkCelebration() {
      const milestone =
        Math.floor(scoreRef.current / CELEBRATION_SCORE_INTERVAL) *
        CELEBRATION_SCORE_INTERVAL;
      if (milestone > 0 && milestone > celebratedMilestoneRef.current) {
        celebratedMilestoneRef.current = milestone;
        startCelebration();
      }
    }

    function update() {
      if (statusRef.current === "celebrating") {
        frameRef.current += 1;
        celebrationFramesRef.current -= 1;
        if (celebrationFramesRef.current <= 0) {
          statusRef.current = "playing";
          setStatus("playing");
          restoreNasheedAfterCelebration();
        }
        return;
      }

      if (statusRef.current !== "playing") return;

      frameRef.current += 1;
      speedRef.current = Math.min(
        MAX_SPEED,
        BASE_SPEED + scoreRef.current * SPEED_GROWTH,
      );
      groundOffsetRef.current += speedRef.current;

      velocityRef.current += GRAVITY;
      catYRef.current += velocityRef.current;
      landOnSurfaces();

      spawnTimerRef.current -= 1;
      if (spawnTimerRef.current <= 0) {
        const dogX = GAME_WIDTH + 20;
        const miceStartX = dogX - mouseRowWidth() - MOUSE_DOG_GAP;
        miceRef.current.push(...createMouseRow(miceStartX));
        obstaclesRef.current.push(createObstacle(dogX));
        cloudsRef.current.push(...spawnCloudGroup(GAME_WIDTH + 40));
        spawnTimerRef.current = 85 + Math.floor(Math.random() * 85);
      }

      moveWorld();
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

      checkCelebration();

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
      for (const cloud of cloudsRef.current) {
        drawCloud(context, cloud, frameRef.current);
      }
      drawGround(context, groundOffsetRef.current);

      for (const mouse of miceRef.current) {
        drawMouse(context, mouse, frameRef.current);
      }
      for (const cloud of cloudsRef.current) {
        for (const mouse of cloud.mice) {
          drawMouse(context, mouse, frameRef.current);
        }
      }

      const sprites = spritesRef.current;
      for (const obstacle of obstaclesRef.current) {
        drawDog(context, sprites, obstacle, frameRef.current);
      }

      const onGround = catYRef.current >= GROUND_Y - CAT_HEIGHT - 0.5;
      const onSurface = onGround || onCloudRef.current;
      const isCelebrating = statusRef.current === "celebrating";
      const celebrationFrame = isCelebrating
        ? CELEBRATION_FRAMES - celebrationFramesRef.current
        : 0;
      drawCat(
        context,
        sprites,
        catYRef.current,
        frameRef.current,
        statusRef.current === "playing" || isCelebrating,
        onSurface,
        isCelebrating,
        celebrationFrame,
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
    <section className="flex w-full max-w-6xl flex-col items-center gap-5">
      <header className="text-center">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[#1f3d2a] sm:text-5xl">
          Cat Runner
        </h1>
        <p className="mt-2 text-base text-[#3f5c48] sm:text-lg">
          Jump on cloud mice, dodge dogs, robot dance every 200 points!
        </p>
      </header>

      <div className="relative w-full overflow-hidden border-2 border-[#3d5a40] bg-[#d9e8c8] shadow-[0_8px_0_#2f4632]">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="h-auto w-full touch-none"
          role="img"
          aria-label="Cat runner game canvas"
          onPointerDown={jump}
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleNasheed();
          }}
          className="absolute bottom-3 right-3 min-h-10 border-2 border-[#3d5a40] bg-[#f5f0e1]/95 px-3 py-1.5 text-sm font-semibold text-[#1f3d2a] shadow-[0_3px_0_#2f4632] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d5a40]"
          aria-label={nasheedOn ? "Turn nasheed off" : "Turn nasheed on"}
          aria-pressed={nasheedOn}
        >
          {nasheedOn ? "Nasheed: On" : "Nasheed: Off"}
        </button>
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
          Mouse {formatGold(gold)} · Score {formatScore(score)} · Best{" "}
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
