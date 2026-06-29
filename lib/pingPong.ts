// 3D ping pong physics.
//
// Coordinate system (all in world units, matching the Three.js scene):
//   x  → side to side across the table width (paddles slide along this axis)
//   y  → up, the height of the ball above the table
//   z  → along the length of the table, between the two players
//
// Player 1 (near the camera) sits at the +z end, Player 2 at the -z end.
// The ball travels mostly along z and bounces off the side walls (x) and the
// table surface (y). A player scores when the ball gets past the other paddle.

export const TABLE_WIDTH = 12; // size along x
export const TABLE_LENGTH = 22; // size along z
export const WALL_X = TABLE_WIDTH / 2;
export const END_Z = TABLE_LENGTH / 2;

export const PADDLE_WIDTH = 3.4; // size along x
export const PADDLE_HALF = PADDLE_WIDTH / 2;
export const PADDLE_Z = END_Z - 0.5; // how far the paddles sit from center
export const PADDLE_LIMIT = WALL_X - PADDLE_HALF; // furthest a paddle can slide

export const BALL_RADIUS = 0.4;
export const BALL_SPEED_Z = 0.22; // forward/back speed per frame
export const BALL_MAX_DX = 0.26; // strongest side spin per frame
export const SPEED_UP = 1.04; // ball gets a little faster on each hit
export const MAX_SPEED_Z = 0.5;

export const GRAVITY = 0.012;
export const HOP_SPEED = 0.24; // upward bounce when the ball hits the table
export const START_HEIGHT = 2;

export const PADDLE_SPEED = 0.28;
export const WINNING_SCORE = 7;

export type PlayerSide = "p1" | "p2";

export type GameSnapshot = {
  ballX: number;
  ballY: number;
  ballZ: number;
  ballDx: number;
  ballDy: number;
  ballDz: number;
  p1X: number; // near paddle position along x
  p2X: number; // far paddle position along x
  p1Score: number;
  p2Score: number;
};

export function createInitialGame(): GameSnapshot {
  return {
    ballX: 0,
    ballY: START_HEIGHT,
    ballZ: 0,
    ballDx: 0,
    ballDy: 0,
    ballDz: 0,
    p1X: 0,
    p2X: 0,
    p1Score: 0,
    p2Score: 0,
  };
}

// Send the ball toward one of the players to start a rally.
export function serveBall(
  game: GameSnapshot,
  toward: PlayerSide,
): GameSnapshot {
  const direction = toward === "p1" ? 1 : -1; // p1 lives at +z
  const sideSpin = (Math.random() * 2 - 1) * BALL_MAX_DX * 0.6;

  return {
    ...game,
    ballX: 0,
    ballY: START_HEIGHT,
    ballZ: 0,
    ballDx: sideSpin,
    ballDy: HOP_SPEED,
    ballDz: BALL_SPEED_Z * direction,
  };
}

export function clampPaddle(x: number): number {
  return Math.max(-PADDLE_LIMIT, Math.min(PADDLE_LIMIT, x));
}

function reflectOffPaddle(
  game: GameSnapshot,
  paddleX: number,
  newDirection: number,
): void {
  const offset = (game.ballX - paddleX) / PADDLE_HALF; // -1 .. 1
  const speed = Math.min(Math.abs(game.ballDz) * SPEED_UP, MAX_SPEED_Z);
  game.ballDz = speed * newDirection;
  game.ballDx = offset * BALL_MAX_DX;
  game.ballDy = HOP_SPEED; // give it a fresh hop off the paddle
}

// Advance the simulation by one frame and return the next snapshot.
export function updateGame(game: GameSnapshot): GameSnapshot {
  const next: GameSnapshot = { ...game };

  // Move the ball.
  next.ballX += next.ballDx;
  next.ballZ += next.ballDz;
  next.ballDy -= GRAVITY;
  next.ballY += next.ballDy;

  // Bounce off the table surface so the ball keeps hopping.
  if (next.ballY <= BALL_RADIUS) {
    next.ballY = BALL_RADIUS;
    next.ballDy = HOP_SPEED;
  }

  // Bounce off the side walls.
  if (next.ballX <= -WALL_X + BALL_RADIUS) {
    next.ballX = -WALL_X + BALL_RADIUS;
    next.ballDx = Math.abs(next.ballDx);
  } else if (next.ballX >= WALL_X - BALL_RADIUS) {
    next.ballX = WALL_X - BALL_RADIUS;
    next.ballDx = -Math.abs(next.ballDx);
  }

  // Player 1 paddle (+z, moving toward -z).
  const hitsP1 =
    next.ballDz > 0 &&
    next.ballZ + BALL_RADIUS >= PADDLE_Z &&
    Math.abs(next.ballX - next.p1X) <= PADDLE_HALF + BALL_RADIUS;
  if (hitsP1) {
    next.ballZ = PADDLE_Z - BALL_RADIUS;
    reflectOffPaddle(next, next.p1X, -1);
  }

  // Player 2 paddle (-z, moving toward +z).
  const hitsP2 =
    next.ballDz < 0 &&
    next.ballZ - BALL_RADIUS <= -PADDLE_Z &&
    Math.abs(next.ballX - next.p2X) <= PADDLE_HALF + BALL_RADIUS;
  if (hitsP2) {
    next.ballZ = -PADDLE_Z + BALL_RADIUS;
    reflectOffPaddle(next, next.p2X, 1);
  }

  // Scoring: ball got past a paddle.
  if (next.ballZ > END_Z) {
    next.p2Score += 1;
    return serveBall(next, "p1");
  }
  if (next.ballZ < -END_Z) {
    next.p1Score += 1;
    return serveBall(next, "p2");
  }

  return next;
}

export function getWinner(game: GameSnapshot): PlayerSide | null {
  if (game.p1Score >= WINNING_SCORE) {
    return "p1";
  }
  if (game.p2Score >= WINNING_SCORE) {
    return "p2";
  }
  return null;
}
