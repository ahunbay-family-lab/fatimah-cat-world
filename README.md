# Family Lab App Template

Welcome to the **Ahunbay Family Lab** starter template! This is where every new app begins.

Use this project when you want to build a website or web app with help from AI coding tools like Cursor, Claude, Codex, or ChatGPT.

---

## What is this?

This is a **starter kit** — a ready-made foundation for building web apps. It comes with:

- A working website you can see in your browser
- All the tools professional developers use
- Instructions for you **and** for AI assistants
- Automatic quality checks when you push code

Think of it like a LEGO baseplate. You add your own creations on top.

---

## Getting Started

### What you need

- A computer (Mac, Windows, or Linux)
- [Node.js](https://nodejs.org/) installed (version 18 or newer)
- [Git](https://git-scm.com/) installed
- A code editor like [VS Code](https://code.visualstudio.com/) or [Cursor](https://cursor.com/)

### Create your app from this template

1. Go to [github.com/ahunbay-family-lab/kids-app-template](https://github.com/ahunbay-family-lab/kids-app-template)
2. Click the green **"Use this template"** button
3. Choose a name for your new app (example: `my-quiz-game`)
4. Create the repository under the `ahunbay-family-lab` organization
5. Clone it to your computer:

```bash
git clone https://github.com/ahunbay-family-lab/YOUR-APP-NAME.git
cd YOUR-APP-NAME
npm install
```

For a detailed walkthrough, see [docs/getting-started.md](./docs/getting-started.md).

---

## Local Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

When you save a file, the page updates automatically. Magic! (It's called "hot reload.")

### Useful commands

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

### One-click deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"**
4. Select your repository
5. Click **Deploy**

That's it! Vercel detects Next.js automatically — no extra configuration needed.

Every time you push to GitHub, Vercel rebuilds and updates your live site.

---

## Folder Structure

```
/
├── app/              # Your pages (each folder = a URL route)
│   ├── layout.tsx    # Wraps every page (fonts, metadata)
│   └── page.tsx      # The home page (/)
├── components/       # Reusable UI pieces (buttons, cards, etc.)
├── public/           # Images and static files
├── lib/              # Helper functions and constants
├── styles/           # Global CSS and animations
├── docs/             # Extra guides
├── .github/workflows/# Automatic checks on GitHub
├── README.md         # You are here!
├── AGENTS.md         # Instructions for AI assistants
└── CONTRIBUTING.md   # How to build features step by step
```

### Key files to know

| File | Purpose |
|------|---------|
| `app/page.tsx` | Home page — start editing here |
| `components/Counter.tsx` | The click counter (uses React state) |
| `styles/globals.css` | Colors, fonts, animations |
| `lib/constants.ts` | App name and shared settings |
| `AGENTS.md` | Share this with AI tools so they follow Family Lab rules |

---

## AI Workflow

AI assistants are powerful teammates. Use them wisely!

### Before you start coding

1. Open `AGENTS.md` and share it with your AI tool (many tools read it automatically)
2. Describe **what** you want to build, not just "make it work"
3. Ask the AI to **explain** its plan before writing code

### Good prompts

- "Help me add a score counter to my quiz. Explain each step."
- "The button doesn't work when I click it. Here's the error: ..."
- "How do I add a new page called `/about`? Show me the smallest change."

### Prompts to avoid

- "Build me a complete game" (too big — break it into steps)
- "Fix everything" (be specific about what's broken)
- "Make it perfect" (start with working, then improve)

### Recommended AI tools

- [Cursor](https://cursor.com) — AI-powered code editor
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — terminal AI assistant
- [GitHub Copilot](https://github.com/features/copilot) — AI in VS Code
- OpenAI Codex / ChatGPT — general coding help

All of them work better when they can read `AGENTS.md`.

---

## Git Workflow

Git tracks every change you make. It's like a time machine for your code.

### The basic loop

```bash
# 1. Make changes in your code editor

# 2. See what changed
git status

# 3. Save your changes
git add .
git commit -m "Add rainbow background"

# 4. Send to GitHub
git push
```

### Commit message tips

Write short messages that describe what you did:

- `Add multiplication quiz`
- `Fix scoring bug`
- `Improve button styling`

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full fun five-step guide.

---

## How to Ask AI for Help

1. **Be specific.** "My counter shows NaN" is better than "it's broken."
2. **Share context.** Tell the AI which file you're editing.
3. **Ask why.** "Why did you use `useState` here?" builds your understanding.
4. **Go step by step.** One feature at a time.
5. **Run checks.** After AI makes changes, run `npm run lint` and `npm run build`.
6. **It's okay to undo.** `git checkout .` reverts all uncommitted changes if things go wrong.

---

## What's in the Starter App?

The home page includes:

- A colorful gradient background
- **"Welcome to Family Lab!"** heading with a wiggle animation
- Floating emoji decorations (stars, rockets, paint)
- A **click counter** with a big "Click Me!" button

The whole starter app is small enough to understand in about 15 minutes. Open these files and read through them:

1. `app/page.tsx` — the page layout
2. `components/Counter.tsx` — button and counter logic
3. `components/WelcomeAnimation.tsx` — floating emojis
4. `styles/globals.css` — colors and animations

---

## Future Ideas

Not sure what to build next? Here are some starter ideas:

- **Quiz game** — questions, multiple choice, score tracking
- **Drawing board** — click to place colored dots or shapes
- **Daily journal** — write and save entries (start with local storage)
- **Pet simulator** — feed, play, and watch happiness go up
- **Flashcard app** — learn spelling words or math facts
- **Family dashboard** — chore tracker, meal planner, or event calendar
- **Story generator** — pick characters and settings, get a silly story

Pick one idea. Make the smallest version that works. Then add more.

---

## Automatic Quality Checks

Every time you push code, GitHub Actions automatically:

1. Installs dependencies
2. Runs lint
3. Runs build

If you see a green checkmark on GitHub, your code is healthy. Red X? Read the error message and fix it — or ask AI for help.

Deployment is handled separately by Vercel (not GitHub Actions).

---

## License

This project is licensed under the [MIT License](./LICENSE). You can use, change, and share it freely.

---

## Need Help?

- [Getting Started Guide](./docs/getting-started.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [AI Agent Instructions](./AGENTS.md)
- Ask a parent, sibling, or your AI assistant

**Happy building!** 🚀
