# Contributing to Peepify 🖊️

First off, **thank you** for considering contributing to Peepify! Every contribution helps make this project better — whether it's fixing a bug, improving the design, adding a feature, or updating documentation.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Pull Request Process](#-pull-request-process)
- [Style Guide](#-style-guide)
- [Reporting Bugs](#-reporting-bugs)
- [Suggesting Features](#-suggesting-features)

---

## 📜 Code of Conduct

This project adheres to a simple code of conduct: **be kind, be respectful, be constructive.**

- Treat everyone with respect and empathy
- Welcome newcomers and help them get started
- Focus on what is best for the community and the project
- Accept constructive criticism gracefully
- No harassment, discrimination, or toxic behavior of any kind

---

## 🤔 How Can I Contribute?

### 🐛 Fix Bugs
Check the [Issues](https://github.com/dhyanivj/Peepify/issues) page for bugs labeled `bug`. These are a great place to start!

### ✨ Add Features
Have an idea? Check existing issues first, or open a new one to discuss your proposal before building.

### 🎨 Improve Design
Peepify has a unique hand-drawn sketch aesthetic. Design contributions should maintain this signature style — think marker fonts, sketchy borders, and tactile interactions.

### 📝 Improve Documentation
Spot a typo? Think the docs could be clearer? Documentation PRs are always welcome.

### 🧪 Add Tests
The project currently doesn't have automated tests — contributions to set up a testing framework and write tests would be incredibly valuable.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+
- A **Google Cloud** account with Vertex AI API enabled
- **gcloud CLI** installed and configured

### Local Development Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Peepify.git
   cd Peepify
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up Google Cloud credentials**:
   ```bash
   gcloud auth application-default login
   ```

5. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your GCP project details (see [README](README.md#3-set-environment-variables) for details).

6. **Create a Cloud Storage bucket** (if you don't have one):
   ```bash
   gsutil mb -l us-east4 gs://YOUR_PROJECT_ID-source-bucket
   ```

7. **Start the development server**:
   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) to verify everything works.

---

## 🔄 Development Workflow

### Branching Strategy

We use a simple branching model:

- `main` — production-ready code, always deployable
- `feature/*` — new features (`feature/gallery-filters`)
- `fix/*` — bug fixes (`fix/mobile-scroll-offset`)
- `docs/*` — documentation updates (`docs/update-readme`)

### Steps

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with clear, focused commits

3. **Test locally** to ensure nothing is broken:
   ```bash
   npm run build   # Verify production build succeeds
   npm run lint    # Check for lint errors
   ```

4. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** against `main`

---

## 🔀 Pull Request Process

1. **Fill out the PR template** with a clear description of your changes
2. **Link related issues** (e.g., "Closes #42")
3. **Include screenshots** for any UI changes
4. **Ensure the build passes** — run `npm run build` before submitting
5. **Keep PRs focused** — one feature or fix per PR
6. **Be responsive** to review feedback

### PR Title Convention

Use clear, descriptive titles:

```
feat: add gallery image filtering by date
fix: resolve mobile scroll offset on avatar generation
docs: update deployment guide for Cloud Run
style: improve dark mode contrast on gallery cards
refactor: extract gallery API into shared utility
```

---

## 🎨 Style Guide

### Code Style

- **Framework**: Next.js 16 with React 19 (App Router)
- **CSS**: Vanilla CSS only — no Tailwind, no CSS-in-JS
- **Components**: Client components use `"use client"` directive
- **Formatting**: Use consistent 2-space indentation
- **Naming**: camelCase for variables/functions, PascalCase for components

### Design Principles

Peepify has a distinctive **hand-drawn sketch aesthetic**. When contributing UI changes, please maintain:

1. **Sketchy Imperfection**: Use irregular `border-radius` values, not perfect circles/rectangles
2. **Marker Typography**: Stick to `Architects Daughter` (headers) and `Patrick Hand` (body text) fonts
3. **Tactile Feedback**: Bold solid `box-shadow` that press-down on `:active`, wiggle on `:hover`
4. **Theme Awareness**: All colors should use CSS custom properties (`var(--color-ink)`, etc.) to support both light and dark themes
5. **No External UI Libraries**: The design system is custom-built — avoid importing component libraries like Material UI, Chakra, or shadcn

### CSS Custom Properties

Use the existing design tokens defined in `globals.css`:

```css
var(--color-paper)        /* Background */
var(--color-ink)          /* Primary text */
var(--color-ink-variant)  /* Secondary text */
var(--color-accent)       /* Accent color */
var(--border-ink)         /* Standard border */
var(--font-header)        /* Architects Daughter */
var(--font-body)          /* Patrick Hand */
```

### API Routes

- All API routes go in `app/api/`
- Use `NextResponse.json()` for responses
- Include proper error handling with descriptive messages
- Validate all input parameters — use strict regex for IDs
- Admin endpoints require passcode verification

---

## 🐛 Reporting Bugs

Found a bug? Please [open an issue](https://github.com/dhyanivj/Peepify/issues/new) with:

1. **Clear title** describing the bug
2. **Steps to reproduce** — be specific
3. **Expected behavior** vs **actual behavior**
4. **Screenshots** if it's a visual bug
5. **Environment info**:
   - Browser and version
   - OS
   - Device (mobile/desktop)
   - Node.js version

### Example Bug Report

```
Title: Gallery modal doesn't close on mobile Safari

Steps:
1. Open Peepify on iPhone Safari
2. Scroll to gallery section
3. Tap on a gallery avatar
4. Try to close the modal by tapping outside

Expected: Modal closes
Actual: Modal stays open, background scrolls instead

Environment: iOS 18, Safari, iPhone 15 Pro
```

---

## 💡 Suggesting Features

Have an idea? [Open a feature request](https://github.com/dhyanivj/Peepify/issues/new) with:

1. **Clear title** describing the feature
2. **Problem statement** — what problem does this solve?
3. **Proposed solution** — how should it work?
4. **Alternatives considered** — other approaches you thought of
5. **Mockups/screenshots** if it's a UI change (optional but helpful)

> **💡 Tip**: Check [existing issues](https://github.com/dhyanivj/Peepify/issues) first to avoid duplicates. If a similar request exists, add a 👍 reaction and comment with additional context.

---

## ⚠️ Important Notes

### API Costs

Peepify uses Google Cloud Vertex AI APIs that have associated costs:
- **Gemini 2.5 Flash**: Pay-per-token for image analysis
- **Imagen 3**: Pay-per-image for generation
- **Cloud Storage**: Pay-per-GB for stored images

When developing features that trigger generation, be mindful of API costs. Use the existing test images when possible.

### Security

- **Never commit `.env.local`** or any file containing secrets
- **Never commit ADC credentials** or service account keys
- All user-facing input must be sanitized before use
- Admin endpoints must verify the passcode before processing

### Files You Should NOT Edit

- `.env.local` (contains secrets, gitignored)
- `package-lock.json` (auto-generated, commit if deps change)

---

## 🎉 Recognition

All contributors will be recognized in the project! Significant contributions may be highlighted in the README.

---

<p align="center">
  Thank you for helping make Peepify better! ✏️❤️
</p>
