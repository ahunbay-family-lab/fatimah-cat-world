# Contributing Guide

Thanks for building with Family Lab! This guide shows you how to add something new to your app — step by step, with zero stress.

## The fun five-step loop

Every great app is built one small step at a time. Here is our loop:

```
Create → Test → Commit → Push → Celebrate 🎉
```

### 1. Create a feature

Pick one small thing to build. Good first features:

- Change the welcome message
- Add a new color or emoji
- Make the counter go up by 2 instead of 1
- Add a second button

Keep it small. Small changes are easier to understand and easier to fix.

### 2. Test your work

Before you commit, run these commands in your terminal:

```bash
npm run lint
npm run build
```

Also open your app in the browser (`npm run dev`) and click around. Does everything work? No scary red errors in the terminal? You're good!

### 3. Commit your changes

A **commit** is like saving a checkpoint in a video game. Give it a short, clear message:

```bash
git add .
git commit -m "Add rainbow button color"
```

Good commit messages describe **what** changed:

- `Add multiplication quiz`
- `Fix scoring bug`
- `Improve button styling`

### 4. Push to GitHub

Pushing sends your commits to GitHub so your work is saved online:

```bash
git push
```

GitHub Actions will automatically run lint and build checks. Green checkmark = success!

### 5. Celebrate

You shipped something real. That is awesome. Tell your family. Show a friend. Be proud.

---

## Tips for working with AI

AI coding assistants (Cursor, Claude, Codex, and others) are great teammates — but **you** are the builder.

- Ask AI to **explain** before it writes a lot of code
- Read the code it gives you — don't just copy-paste blindly
- Share the `AGENTS.md` file so your assistant follows Family Lab rules
- If something breaks, that's normal. Fix it together.

---

## Golden rules

1. **Never commit broken code.** If lint or build fails, fix it first.
2. **One feature at a time.** Small steps win.
3. **Ask for help.** No one builds alone.
4. **Have fun.** Serious learning can still be fun.

---

## Need more help?

- [README](./README.md) — project overview
- [AGENTS.md](./AGENTS.md) — rules for AI assistants
- [docs/getting-started.md](./docs/getting-started.md) — first-day walkthrough

Happy building! 🚀
