# Antigravity Rules: chess-notation-builder

## 1. Remote & Repository Binding
- Target Repository: `https://github.com/007mew/chess-notation-builder`
- Primary Branch: `main` (fallback to `master` only if explicitly initialized that way)
- Git Remote Name: `origin`

---

## 2. Pre-Push Validation Protocol
Before executing any `git push` or committing code destined for remote, you MUST run and verify the following locally:

1. **Build & Type Check:**
   - Execute project build (`npm run build`, `pnpm build`, or `yarn build`) to ensure zero TypeScript errors or bundling failures.
2. **Lint & Format:**
   - Run linter (`npm run lint` or equivalent) and fix any outstanding warnings/errors.
3. **Core Logic Verification:**
   - Verify that chess notation parsing, coordinate mappings (a1–h8), and game-state updates execute without runtime exceptions.
4. **Clean Status:**
   - Check `git status` to ensure no accidental build artifacts (`dist/`, `.next/`, `node_modules/`, `.env*`) are untracked or staged.

---

## 3. Git Commit & Push Guidelines

- **Atomic Commits:** Do not bundle unrelated changes (e.g., UI restyling + notation parser logic) into a single commit.
- **Commit Message Format (Conventional Commits):**
  - `feat: <description>` for new notation features, drills, or UI components.
  - `fix: <description>` for coordinate mapping, move validation, or UI bug fixes.
  - `refactor: <description>` for state management or board rendering optimizations.
  - `docs: <description>` for updating documentation or README.
- **Push Commands:**
  - Standard push:
    ```bash
    git add .
    git commit -m "<type>: <concise description>"
    git push origin <current-branch>
    ```
  - **Constraint:** Never force push (`--force` or `-f`) directly to `main` without explicit user confirmation.

---

## 4. Domain-Specific Chess Logic Constraints
- **Coordinate Consistency:** Keep file coordinates strictly lowercase (`a` through `h`) and rank coordinates integers (`1` through `8`).
- **Standard Notation:** Strictly follow FIDE algebraic notation rules (SAN/LAN) for piece designations, capture symbols (`x`), checks (`+`), checkmates (`#`), and castling (`O-O`, `O-O-O`).
- **Board Perspective:** Ensure coordinates flip accurately when viewing from Black's perspective without breaking the internal board state mapping.