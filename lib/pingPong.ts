export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;
export const PADDLE_WIDTH = 14;
export const PADDLE_HEIGHT = 100;
export const BALL_SIZE = 16;
export const PADDLE_SPEED = 7;
export const BALL_SPEED = 5;
export const WINNING_SCORE = 7;

export type PlayerSide = "left" | "right";

export type GameSnapshot = {
  ballX: number;
  ballY: number;
  ballDx: number;
  ballDy: number;
  leftY: number;
  rightY: number;
  leftScore: number;
  rightScore: number;
};

export function createInitialGame(): GameSnapshot {
  return {
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballDx: BALL_SPEED,
    ballDy: BALL_SPEED * 0.6,
    leftY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    rightY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    leftScore: 0,
    rightScore: 0,
  };
}

export function serveBall(game: GameSnapshot, toward: PlayerSide): GameSnapshot {
  const direction = toward === "left" ? -1 : 1;
  const angle = (Math.random() * 0.8 - 0.4) * BALL_SPEED;

  return {
    ...game,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballDx: BALL_SPEED * direction,
    ballDy: angle,
  };
}
