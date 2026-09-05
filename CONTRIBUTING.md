# 🤝 Contributing to JN Ceylon ERP

Thank you for your interest in contributing! This guide will help you get started.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Branch Naming](#-branch-naming)
- [Commit Messages](#-commit-messages)
- [Pull Request Process](#-pull-request-process)
- [Code Style](#-code-style)
- [Reporting Issues](#-reporting-issues)

---

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold these standards.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB 7+ (local or Atlas)
- Git

### Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/JN-CEYLON.git
cd JN-CEYLON

# 2. Install dependencies
npm install
npm install --prefix client

# 3. Configure environment
cp .env.example .env
# Edit .env with your local settings

# 4. Start development servers
npm run dev
```

### Verify Setup

```bash
# Run tests to confirm everything works
npm test

# Build client to verify production bundle
npm run build
```

---

## 🔄 Development Workflow

1. **Create an issue** describing the bug or feature (or pick an existing one)
2. **Fork** the repository (if you haven't already)
3. **Create a branch** from `main` with a descriptive name
4. **Make your changes** with clear, focused commits
5. **Test your changes** — all tests must pass
6. **Submit a pull request** against `main`

---

## 🌿 Branch Naming

Use the following naming convention:

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/short-description` | `feat/add-export-csv` |
| Bug fix | `fix/short-description` | `fix/invoice-total-calc` |
| Documentation | `docs/short-description` | `docs/update-api-reference` |
| Refactor | `refactor/short-description` | `refactor/auth-middleware` |
| Chore | `chore/short-description` | `chore/update-deps` |

---

## 💬 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code formatting (no logic change) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD configuration changes |

### Examples

```
feat(invoices): add CSV export for invoice list
fix(payments): correct balance calculation on partial payment
docs(api): add missing query parameters to quotation endpoints
chore(deps): update mongoose to 8.5.0
```

---

## 🔀 Pull Request Process

1. **Fill out the PR template** completely
2. **Ensure CI passes** — all GitHub Actions checks must be green
3. **Keep PRs focused** — one feature or fix per PR
4. **Update documentation** if your change affects user-facing behavior or APIs
5. **Test locally** before submitting:
   ```bash
   npm test
   npm run build
   ```

### PR Checklist

- [ ] Branch is up-to-date with `main`
- [ ] Tests pass (`npm test`)
- [ ] Client builds (`npm run build`)
- [ ] No new lint warnings
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow conventions

---

## 🎨 Code Style

### JavaScript / Node.js

- Use `const` and `let` — never `var`
- Use `async/await` over raw promises
- Use meaningful variable names
- Add error handling in route handlers with try-catch
- Keep route handlers focused — extract complex logic to services

### React / JSX

- Use functional components with hooks
- Destructure props at the function parameter level
- Keep components focused — extract sub-components when complexity grows
- Use React Context for shared state, not prop drilling

### CSS

- Use class-based selectors
- Follow BEM-like naming for complex components
- Keep print styles in `document.css`
- Keep dashboard/UI styles in `dashboard.css`

### File Organization

- **Models** → one file per Mongoose schema in `server/models/`
- **Routes** → one file per resource in `server/routes/`
- **Pages** → group by feature in `client/src/pages/`
- **Components** → reusable pieces in `client/src/components/`

---

## 🐛 Reporting Issues

### Bug Reports

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser and Node.js version
- Screenshots (if applicable)

### Feature Requests

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- Problem description
- Proposed solution
- Alternatives considered

---

## ❓ Questions?

If you have questions about contributing, open a [GitHub Discussion](https://github.com/perera99-msd/JN-CEYLON/discussions) or reach out to the maintainers.

---

Thank you for helping make JN Ceylon ERP better! 🌿
