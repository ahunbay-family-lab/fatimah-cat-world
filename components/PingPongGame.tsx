"use client";

import { PlayerBoyAvatar } from "@/components/PlayerBoyAvatar";
import { PlayerGirlAvatar } from "@/components/PlayerGirlAvatar";
import {
  BALL_RADIUS,
  clampPaddle,
  createInitialGame,
  END_Z,
  getWinner,
  PADDLE_SPEED,
  PADDLE_WIDTH,
  PADDLE_Z,
  serveBall,
  TABLE_LENGTH,
  TABLE_WIDTH,
  updateGame,
  WALL_X,
  WINNING_SCORE,
  type GameSnapshot,
  type PlayerSide,
} from "@/lib/pingPong";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const PADDLE_THICKNESS = 0.6;
const PADDLE_HEIGHT_3D = 2;
const WALL_HEIGHT = 1;

// Build every mesh once and hand back references the animation loop can move.
function buildScene(width: number, height: number) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0b1020");
  scene.fog = new THREE.Fog("#0b1020", 35, 70);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
  camera.position.set(0, 13, END_Z + 13);
  camera.lookAt(0, 0, -2);

  const ambient = new THREE.AmbientLight("#9fb4ff", 0.7);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight("#ffffff", 1.1);
  keyLight.position.set(6, 18, 12);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight("#f0abfc", 0.8, 80);
  rimLight.position.set(-8, 10, -10);
  scene.add(rimLight);

  // Table top.
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(TABLE_WIDTH, 0.6, TABLE_LENGTH),
    new THREE.MeshStandardMaterial({ color: "#15803d", roughness: 0.85 }),
  );
  table.position.y = -0.3;
  scene.add(table);

  // White border lines on the table.
  const lineMat = new THREE.MeshStandardMaterial({
    color: "#f8fafc",
    emissive: "#cbd5f5",
    emissiveIntensity: 0.2,
  });
  const centerLine = new THREE.Mesh(
    new THREE.BoxGeometry(TABLE_WIDTH, 0.02, 0.25),
    lineMat,
  );
  centerLine.position.y = 0.02;
  scene.add(centerLine);

  // The net across the middle.
  const net = new THREE.Mesh(
    new THREE.BoxGeometry(TABLE_WIDTH + 0.5, 1.1, 0.1),
    new THREE.MeshStandardMaterial({
      color: "#e2e8f0",
      transparent: true,
      opacity: 0.55,
    }),
  );
  net.position.set(0, 0.55, 0);
  scene.add(net);

  // Side walls so the ball visibly bounces.
  const wallMat = new THREE.MeshStandardMaterial({
    color: "#1e293b",
    roughness: 0.6,
  });
  const wallGeo = new THREE.BoxGeometry(0.4, WALL_HEIGHT, TABLE_LENGTH);
  const leftWall = new THREE.Mesh(wallGeo, wallMat);
  leftWall.position.set(-WALL_X - 0.2, WALL_HEIGHT / 2, 0);
  const rightWall = new THREE.Mesh(wallGeo, wallMat);
  rightWall.position.set(WALL_X + 0.2, WALL_HEIGHT / 2, 0);
  scene.add(leftWall, rightWall);

  // Paddles.
  const paddleGeo = new THREE.BoxGeometry(
    PADDLE_WIDTH,
    PADDLE_HEIGHT_3D,
    PADDLE_THICKNESS,
  );
  const paddle1 = new THREE.Mesh(
    paddleGeo,
    new THREE.MeshStandardMaterial({
      color: "#38bdf8",
      emissive: "#0ea5e9",
      emissiveIntensity: 0.3,
    }),
  );
  paddle1.position.set(0, PADDLE_HEIGHT_3D / 2, PADDLE_Z);
  const paddle2 = new THREE.Mesh(
    paddleGeo,
    new THREE.MeshStandardMaterial({
      color: "#f472b6",
      emissive: "#ec4899",
      emissiveIntensity: 0.3,
    }),
  );
  paddle2.position.set(0, PADDLE_HEIGHT_3D / 2, -PADDLE_Z);
  scene.add(paddle1, paddle2);

  // Ball.
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS, 24, 24),
    new THREE.MeshStandardMaterial({
      color: "#fde047",
      emissive: "#facc15",
      emissiveIntensity: 0.5,
    }),
  );
  scene.add(ball);

  const ballLight = new THREE.PointLight("#fde047", 0.7, 12);
  scene.add(ballLight);

  return { scene, camera, table, paddle1, paddle2, ball, ballLight };
}

export function PingPongGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameSnapshot>(createInitialGame());
  const keysRef = useRef<Set<string>>(new Set());
  const runningRef = useRef(false);
  const winnerRef = useRef<PlayerSide | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState<PlayerSide | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });

  // Keyboard input.
  useEffect(() => {
    const keys = keysRef.current;
    const moveKeys = ["a", "d", "A", "D", "ArrowLeft", "ArrowRight"];

    function handleKeyDown(event: KeyboardEvent) {
      keys.add(event.key);
      if (moveKeys.includes(event.key)) {
        event.preventDefault();
      }
    }
    function handleKeyUp(event: KeyboardEvent) {
      keys.delete(event.key);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      keys.clear();
    };
  }, []);

  // Three.js scene setup + animation loop. Runs once on mount.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const width = mount.clientWidth || 800;
    const height = Math.round(width * 0.62);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const { scene, camera, paddle1, paddle2, ball, ballLight } = buildScene(
      width,
      height,
    );

    function applyControls(game: GameSnapshot) {
      const keys = keysRef.current;
      if (keys.has("a") || keys.has("A")) {
        game.p1X = clampPaddle(game.p1X - PADDLE_SPEED);
      }
      if (keys.has("d") || keys.has("D")) {
        game.p1X = clampPaddle(game.p1X + PADDLE_SPEED);
      }
      if (keys.has("ArrowLeft")) {
        game.p2X = clampPaddle(game.p2X - PADDLE_SPEED);
      }
      if (keys.has("ArrowRight")) {
        game.p2X = clampPaddle(game.p2X + PADDLE_SPEED);
      }
    }

    let frameId = 0;
    let lastP1 = -1;
    let lastP2 = -1;

    function renderFrame() {
      const game = gameRef.current;

      if (runningRef.current && !winnerRef.current) {
        applyControls(game);
        const updated = updateGame(game);
        gameRef.current = updated;

        if (updated.p1Score !== lastP1 || updated.p2Score !== lastP2) {
          lastP1 = updated.p1Score;
          lastP2 = updated.p2Score;
          setScores({ p1: updated.p1Score, p2: updated.p2Score });
        }

        const champ = getWinner(updated);
        if (champ) {
          winnerRef.current = champ;
          runningRef.current = false;
          setWinner(champ);
          setIsPlaying(false);
        }
      }

      const current = gameRef.current;
      paddle1.position.x = current.p1X;
      paddle2.position.x = current.p2X;
      ball.position.set(current.ballX, current.ballY, current.ballZ);
      ballLight.position.set(current.ballX, current.ballY + 1, current.ballZ);

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderFrame);
    }

    frameId = window.requestAnimationFrame(renderFrame);

    function handleResize() {
      const el = mountRef.current;
      if (!el) {
        return;
      }
      const newWidth = el.clientWidth || width;
      const newHeight = Math.round(newWidth * 0.62);
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  function startGame() {
    const fresh = serveBall(
      createInitialGame(),
      Math.random() > 0.5 ? "p1" : "p2",
    );
    gameRef.current = fresh;
    winnerRef.current = null;
    runningRef.current = true;
    setScores({ p1: 0, p2: 0 });
    setWinner(null);
    setIsPlaying(true);
  }

  function resetGame() {
    gameRef.current = createInitialGame();
    winnerRef.current = null;
    runningRef.current = false;
    setScores({ p1: 0, p2: 0 });
    setWinner(null);
    setIsPlaying(false);
  }

  return (
    <section className="flex w-full max-w-4xl flex-col items-center gap-6">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-extrabold text-indigo-950 sm:text-5xl">
          3D Ping Pong 🏓
        </h1>
        <p className="text-lg text-indigo-800">
          Two players in 3D. First to {WINNING_SCORE} points wins!
        </p>
      </header>

      <div className="relative w-full overflow-hidden rounded-3xl border-4 border-indigo-900/20 bg-slate-950 shadow-2xl">
        <div
          ref={mountRef}
          className="w-full"
          aria-label="3D ping pong table"
        />

        <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-center gap-8 p-4 text-white">
          <span className="rounded-full bg-sky-500/80 px-5 py-1 text-2xl font-bold tabular-nums">
            {scores.p1}
          </span>
          <span className="text-lg font-semibold opacity-70">vs</span>
          <span className="rounded-full bg-pink-500/80 px-5 py-1 text-2xl font-bold tabular-nums">
            {scores.p2}
          </span>
        </div>

        {winner ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/70 text-center text-white">
            <p className="text-4xl font-extrabold">
              {winner === "p1" ? "Player 1" : "Player 2"} wins! 🎉
            </p>
            <button
              type="button"
              onClick={startGame}
              className="min-h-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 text-lg font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </div>
        ) : null}

        {!isPlaying && !winner ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
            <button
              type="button"
              onClick={startGame}
              className="min-h-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-10 py-4 text-xl font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {isPlaying && !winner ? (
          <button
            type="button"
            onClick={resetGame}
            className="min-h-12 rounded-full border-2 border-indigo-300 bg-white px-8 py-3 text-lg font-bold text-indigo-900 shadow-sm transition hover:bg-indigo-50"
          >
            Reset
          </button>
        ) : null}
      </div>

      <div className="grid w-full gap-4 rounded-2xl bg-white/80 p-6 text-left shadow-md sm:grid-cols-2">
        <div className="flex items-center gap-4">
          <PlayerBoyAvatar className="h-24 w-auto shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-sky-700">
              Player 1 (blue paddle)
            </h2>
            <p className="text-indigo-800">
              Boy with topi, white t-shirt, and black pants
            </p>
            <p className="text-indigo-700">
              Move with{" "}
              <kbd className="rounded bg-indigo-100 px-1 font-mono">A</kbd> and{" "}
              <kbd className="rounded bg-indigo-100 px-1 font-mono">D</kbd>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <PlayerGirlAvatar className="h-24 w-auto shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-pink-600">
              Player 2 (pink paddle)
            </h2>
            <p className="text-indigo-800">
              Girl with hijab, pink cat t-shirt, and jeans
            </p>
            <p className="text-indigo-700">
              Move with{" "}
              <kbd className="rounded bg-indigo-100 px-1 font-mono">←</kbd> and{" "}
              <kbd className="rounded bg-indigo-100 px-1 font-mono">→</kbd>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
