/** Preload the high-resolution animal sprites used by the game. */

export type GameSprites = {
  cat: HTMLImageElement;
  dog: HTMLImageElement;
  dogBark: HTMLImageElement;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });
}

export async function loadGameSprites(): Promise<GameSprites> {
  const [cat, dog, dogBark] = await Promise.all([
    loadImage("/sprites/cat.png"),
    loadImage("/sprites/dog.png"),
    loadImage("/sprites/dog-bark.png"),
  ]);
  return { cat, dog, dogBark };
}
