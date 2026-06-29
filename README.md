# Ping Pong

A **two-player ping pong game** built in the Ahunbay Family Lab.

Play on one keyboard with a friend. Move your paddle, bounce the ball, and be the first to score 7 points!

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

| Player | Side | Keys |
|--------|------|------|
| Player 1 | Left paddle | `W` (up), `S` (down) |
| Player 2 | Right paddle | `Arrow Up`, `Arrow Down` |

Click **Start Game** to begin. First player to **7 points** wins!

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
components/PingPongGame.tsx  # The game (canvas, controls, scoring)
lib/pingPong.ts           # Game constants and helpers
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
