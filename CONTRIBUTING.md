# Contributing to SMARTBIZ CALCULATOR

Thank you for your interest in contributing to **SMARTBIZ CALCULATOR**! This project is dedicated to empowering small businesses and shopkeepers with fast, modern, and reliable business management software.

---

## 📌 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Git Workflow & Branching Strategy](#git-workflow--branching-strategy)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Coding Conventions & Standards](#coding-conventions--standards)
- [Submitting a Pull Request (PR)](#submitting-a-pull-request-pr)
- [Pull Request Checklist](#pull-request-checklist)
- [Cross-Document Navigation](#cross-document-navigation)

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors. Please treat all members of the community with respect, constructive feedback, and professional courtesy.

---

## How Can I Contribute?

You can contribute in multiple ways:
1. **Reporting Bugs**: Submit a clear issue detailing reproduction steps, expected results, and browser/OS information.
2. **Suggesting Enhancements**: Propose new retail features (e.g., barcode batch scanning, localized tax calculations).
3. **Submitting Pull Requests**: Implement bug fixes, performance improvements, or new features.
4. **Documentation**: Improve developer documentation, setup guides, and operational manuals.

---

## Development Setup

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/smartbiz-calculator.git
   cd smartbiz-calculator
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [SETUP.md](SETUP.md).

---

## Git Workflow & Branching Strategy

1. Ensure your `main` branch is up to date:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create a feature or bugfix branch with a descriptive name:
   ```bash
   # For new features:
   git checkout -b feat/barcode-batch-scanner

   # For bug fixes:
   git checkout -b fix/markup-rounding-precision

   # For documentation:
   git checkout -b docs/update-deployment-guide
   ```

---

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary>

[optional body]
```

### Commit Types:
- `feat`: A new feature for users (e.g., `feat(pos): add multi-unit price converter`).
- `fix`: A bug fix (e.g., `fix(calculator): prevent decimal duplication in operand`).
- `docs`: Documentation changes only (e.g., `docs(setup): clarify node version requirements`).
- `style`: Formatting or whitespace changes that do not affect code execution.
- `refactor`: Code restructuring without introducing new features or fixing bugs.
- `perf`: Performance optimization (e.g., `perf(db): optimize subscriber notification loops`).
- `test`: Adding or updating test cases.
- `chore`: Maintenance tasks, dependencies, or configuration updates.

---

## Coding Conventions & Standards

Please review [DEVELOPMENT.md](DEVELOPMENT.md) for complete technical standards:

1. **Strict TypeScript**:
   - Zero `any` types. Define complete interfaces in `/src/types/index.ts`.
   - Never suppress compiler checks with `@ts-ignore` without team review.
2. **Styling & Layout**:
   - Use Tailwind CSS v4 utility classes exclusively.
   - Do not write inline `style={{ ... }}` attributes or separate CSS files.
3. **Component Modularity**:
   - Keep components focused and modular.
   - Extract reusable UI elements into standalone components.
4. **Permission Awareness**:
   - Always verify role authorization with `can()` before rendering sensitive financial figures or purchase costs.

---

## Submitting a Pull Request (PR)

1. Push your branch to your GitHub fork:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request against the upstream `main` branch.
3. Fill out the PR template with:
   - A clear description of the change.
   - The rationale or associated issue number.
   - Screenshots or video recordings for UI changes.

---

## Pull Request Checklist

Before submitting your PR for review, ensure you have completed the following steps:

- [ ] Ran `npm run lint` and resolved all TypeScript compiler errors.
- [ ] Ran `npm run build` and verified that the production build succeeds.
- [ ] Tested all touched workflows in both Desktop and Mobile viewports.
- [ ] Verified that sensitive cost prices remain masked under the `cashier` role.
- [ ] Updated associated documentation in `/` if data models or APIs were modified.

---

## Cross-Document Navigation

- [README.md](README.md) — Main system overview.
- [DEVELOPMENT.md](DEVELOPMENT.md) — Engineering workflows and coding guidelines.
- [TESTING.md](TESTING.md) — Testing strategy and QA checklists.
- [ROADMAP.md](ROADMAP.md) — Upcoming roadmap milestones.
- [CHANGELOG.md](CHANGELOG.md) — Release notes and version history.
