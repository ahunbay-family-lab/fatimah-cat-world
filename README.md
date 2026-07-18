# Cat Runner

A **cat jump game** built in the Ahunbay Family Lab.

Help a striped tabby cat (wearing an East Turkistan flag hat) leap over barking brown dogs. The longer you survive, the faster it gets — and the dogs really bark!

---

## Play the Game

### What you need

- A computer (Mac, Windows, or Linux)
- [Node.js](https://nodejs.org/) installed (version 18 or newer)
- [Git](https://git-scm.com/) installed
- A code editor like [VS Code](https://code.visualstudio.com/) or [Cursor](https://cursor.com/)

### Run it locally

```bash
git clone https://github.com/ahunbay-family-lab/fatimah-cat-world.git
cd fatimah-cat-world
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Controls

| Action | Keys / Input |
|--------|--------------|
| Start / Jump | `Space`, `↑`, tap, or click |
| Restart after game over | `Space`, `Enter`, or the Play again button |

Your best score is saved in the browser.

---

## Useful Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start the app locally for development |
| `npm run build` | Build the app for production |
| `npm run start` | Run the production build locally |
| `npm run lint` | Check code for problems |
| `npm run format` | Auto-format code with Prettier |

---

## Deploying to Vercel

[Vercel](https://vercel.com) hosts your app on the internet so anyone can visit it.

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Import this repository
4. Click **Deploy**

Your game will be live in about a minute.

---

## Project Structure

```
app/page.tsx              # Home page with the game
components/CatGame.tsx    # Game loop, input, scoring
lib/catGame.ts            # Sizes, speed, collision helpers
lib/catDraw.ts            # Canvas drawing helpers (cat + dogs)
lib/sprites.ts            # Loads high-res animal images
lib/barkSound.ts          # Dog bark sound playback
lib/flagHat.ts            # East Turkistan flag hat drawn on the cat
public/sprites/           # Realistic cat (run cycle) and dog PNG sprites
public/sounds/            # Real recorded dog bark WAV files
lib/constants.ts          # Site name and description
styles/globals.css        # Global styles
```

---

## Built With

- [Next.js](https://nextjs.org/) — web framework
- [React](https://react.dev/) — UI
- [TypeScript](https://www.typescriptlang.org/) — typed JavaScript
- [Tailwind CSS](https://tailwindcss.com/) — styling

---

## Family Lab

Part of the [Ahunbay Family Lab](https://github.com/ahunbay-family-lab) — helping kids learn to build software.

For AI assistant instructions, see [AGENTS.md](./AGENTS.md).
