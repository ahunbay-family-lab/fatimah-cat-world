"use client";

import { PlayerBoyAvatar } from "@/components/PlayerBoyAvatar";
import { PlayerGirlAvatar } from "@/components/PlayerGirlAvatar";
import {
  drawBoyPlayer,
  drawGirlPlayer,
  getPlayerAvatarCenterY,
  PLAYER_AVATAR_OFFSET,
} from "@/lib/drawPlayers";
import {
  BALL_SIZE,
  BALL_SPEED,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  createInitialGame,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
  PADDLE_WIDTH,
  serveBall,
  type GameSnapshot,
  type PlayerSide,
  WINNING_SCORE,
} from "@/lib/pingPong";
import { useEffect, useRef, useState } from "react";

const keysPressed = new Set<string>();

function getWinner(game: GameSnapshot): PlayerSide | null {
  if (game.leftScore >= WINNING_SCORE) {
    return "left";
  }
  if (game.rightScore >= WINNING_SCORE) {
    return "right";
  }
  return null;
}

function updateGame(game: GameSnapshot): GameSnapshot {
  let next = { ...game };

  if (keysPressed.has("w")) {
    next.leftY = Math.max(0, next.leftY - PADDLE_SPEED);
  }
  if (keysPressed.has("s")) {
    next.leftY = Math.min(
      CANVAS_HEIGHT - PADDLE_HEIGHT,
      next.leftY + PADDLE_SPEED,
    );
  }
  if (keysPressed.has("ArrowUp")) {
    next.rightY = Math.max(0, next.rightY - PADDLE_SPEED);
  }
  if (keysPressed.has("ArrowDown")) {
    next.rightY = Math.min(
      CANVAS_HEIGHT - PADDLE_HEIGHT,
      next.rightY + PADDLE_SPEED,
    );
  }

  next = {
    ...next,
    ballX: next.ballX + next.ballDx,
    ballY: next.ballY + next.ballDy,
  };

  if (next.ballY <= 0 || next.ballY + BALL_SIZE >= CANVAS_HEIGHT) {
    next.ballDy *= -1;
    next.ballY = Math.max(0, Math.min(CANVAS_HEIGHT - BALL_SIZE, next.ballY));
  }

  const hitsLeftPaddle =
    next.ballDx < 0 &&
    next.ballX <= PADDLE_WIDTH &&
    next.ballY + BALL_SIZE >= next.leftY &&
    next.ballY <= next.leftY + PADDLE_HEIGHT;

  const hitsRightPaddle =
    next.ballDx > 0 &&
    next.ballX + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH &&
    next.ballY + BALL_SIZE >= next.rightY &&
    next.ballY <= next.rightY + PADDLE_HEIGHT;

  if (hitsLeftPaddle || hitsRightPaddle) {
    next.ballDx *= -1.05;
    const paddleCenter = hitsLeftPaddle
      ? next.leftY + PADDLE_HEIGHT / 2
      : next.rightY + PADDLE_HEIGHT / 2;
    const offset =
      (next.ballY + BALL_SIZE / 2 - paddleCenter) / (PADDLE_HEIGHT / 2);
    next.ballDy = offset * BALL_SPEED;
    next.ballX = hitsLeftPaddle
      ? PADDLE_WIDTH
      : CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE;
  }

  if (next.ballX < 0) {
    next.rightScore += 1;
    next = serveBall(next, "right");
  } else if (next.ballX > CANVAS_WIDTH) {
    next.leftScore += 1;
    next = serveBall(next, "left");
  }

  return next;
}

function drawGame(
  context: CanvasRenderingContext2D,
  game: GameSnapshot,
  winner: PlayerSide | null,
) {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const tableGradient = context.createLinearGradient(
    0,
    0,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  );
  tableGradient.addColorStop(0, "#1d4ed8");
  tableGradient.addColorStop(1, "#0e7490");
  context.fillStyle = tableGradient;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.setLineDash([12, 12]);
  context.strokeStyle = "rgba(255, 255, 255, 0.45)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(CANVAS_WIDTH / 2, 0);
  context.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = "#f8fafc";
  context.fillRect(0, game.leftY, PADDLE_WIDTH, PADDLE_HEIGHT);
  context.fillRect(
    CANVAS_WIDTH - PADDLE_WIDTH,
    game.rightY,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
  );

  drawBoyPlayer(
    context,
    PLAYER_AVATAR_OFFSET.leftX,
    getPlayerAvatarCenterY(game.leftY, PADDLE_HEIGHT),
  );
  drawGirlPlayer(
    context,
    PLAYER_AVATAR_OFFSET.rightX,
    getPlayerAvatarCenterY(game.rightY, PADDLE_HEIGHT),
  );

  context.beginPath();
  context.fillStyle = "#fde047";
  context.arc(
    game.ballX + BALL_SIZE / 2,
    game.ballY + BALL_SIZE / 2,
    BALL_SIZE / 2,
    0,
    Math.PI * 2,
  );
  context.fill();

  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  context.font = "bold 28px sans-serif";
  context.textAlign = "center";
  context.fillText(String(game.leftScore), CANVAS_WIDTH * 0.25, 48);
  context.fillText(String(game.rightScore), CANVAS_WIDTH * 0.75, 48);

  if (winner) {
    context.fillStyle = "rgba(15, 23, 42, 0.7)";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = "#ffffff";
    context.font = "bold 42px sans-serif";
    const winnerName = winner === "left" ? "Player 1" : "Player 2";
    context.fillText(
      `${winnerName} wins!`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
    );
  }
}

export function PingPongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameSnapshot>(createInitialGame());
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState<PlayerSide | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      keysPressed.add(event.key);
      if (["ArrowUp", "ArrowDown", " "].includes(event.key)) {
        event.preventDefault();
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      keysPressed.delete(event.key);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      keysPressed.clear();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || winner) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gameContext = canvas.getContext("2d");
    if (!gameContext) {
      return;
    }

    const renderContext: CanvasRenderingContext2D = gameContext;
    let animationId = 0;

    function tick() {
      const currentWinner = getWinner(gameRef.current);
      if (currentWinner) {
        setWinner(currentWinner);
        drawGame(renderContext, gameRef.current, currentWinner);
        return;
      }

      gameRef.current = updateGame(gameRef.current);
      drawGame(renderContext, gameRef.current, null);
      animationId = window.requestAnimationFrame(tick);
    }

    animationId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [isPlaying, winner]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) {
      return;
    }

    drawGame(context, gameRef.current, winner);
  }, [winner, isPlaying]);

  function startGame() {
    gameRef.current = serveBall(createInitialGame(), Math.random() > 0.5 ? "left" : "right");
    setWinner(null);
    setIsPlaying(true);
  }

  function resetGame() {
    gameRef.current = createInitialGame();
    setWinner(null);
    setIsPlaying(false);

    const context = canvasRef.current?.getContext("2d");
    if (context) {
      drawGame(context, gameRef.current, null);
    }
  }

  return (
    <section className="flex w-full max-w-4xl flex-col items-center gap-6">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-extrabold text-indigo-950 sm:text-5xl">
          Ping Pong
        </h1>
        <p className="text-lg text-indigo-800">
          Two players. First to {WINNING_SCORE} points wins!
        </p>
      </header>

      <div className="w-full overflow-hidden rounded-3xl border-4 border-indigo-900/20 bg-slate-900 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="h-auto w-full"
          aria-label="Ping pong game board"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {!isPlaying || winner ? (
          <button
            type="button"
            onClick={startGame}
            className="min-h-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 text-lg font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
          >
            {winner ? "Play Again" : "Start Game"}
          </button>
        ) : null}
        {isPlaying ? (
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
            <h2 className="text-lg font-bold text-indigo-900">Player 1 (left)</h2>
            <p className="text-indigo-800">Boy with topi, white t-shirt, and black pants</p>
            <p className="text-indigo-700">Move with W and S</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <PlayerGirlAvatar className="h-24 w-auto shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-indigo-900">Player 2 (right)</h2>
            <p className="text-indigo-800">
              Girl with hijab, pink cat t-shirt, and jeans
            </p>
            <p className="text-indigo-700">Move with Arrow Up and Arrow Down</p>
          </div>
        </div>
      </div>
    </section>
  );
}
