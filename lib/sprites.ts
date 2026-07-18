/** Preload the high-resolution animal sprites used by the game. */

export type GameSprites = {
  cat: HTMLImageElement;
  catRuns: HTMLImageElement[];
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
  const [cat, catRun1, catRun2, catRun3, catRun4, dog, dogBark] =
    await Promise.all([
      loadImage("/sprites/cat.png"),
      loadImage("/sprites/cat-run-1.png"),
      loadImage("/sprites/cat-run-2.png"),
      loadImage("/sprites/cat-run-3.png"),
      loadImage("/sprites/cat-run-4.png"),
      loadImage("/sprites/dog.png"),
      loadImage("/sprites/dog-bark.png"),
    ]);

  return {
    cat,
    catRuns: [catRun1, catRun2, catRun3, catRun4],
    dog,
    dogBark,
  };
}
