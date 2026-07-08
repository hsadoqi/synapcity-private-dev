# Synapcity

> **A modular productivity platform built around composable workspaces, structured knowledge, and customizable interfaces.**

Synapcity is not a note-taking app.

It is an operating system for personal knowledge, projects, planning, dashboards, and workflows where every feature is implemented as a reusable module rather than a one-off application.

The project explores large-scale frontend architecture, extensible systems, and developer experience while maintaining a polished product comparable to modern tools like Linear, Notion, Arc, and Vercel.

---

# Philosophy

Everything in Synapcity follows a few core principles.

## 1. Composition over specialization

Instead of building isolated apps (Todo App, Journal App, Notes App...)

Build reusable systems that can power all of them.

Examples:

* Widget framework
* Theme engine
* Modal framework
* Navigation framework
* Lexical editor
* Search engine
* Data layer
* Command palette

---

## 2. Data-first architecture

UI never owns business data.

Instead

```
Database
        ↓
Repositories
        ↓
Services
        ↓
Stores
        ↓
Hooks
        ↓
UI
```

The UI should be replaceable without affecting the domain.

---

## 3. Plugins over conditionals

Avoid

```
if (widget.type === ...)
```

Prefer

```
Widget Registry

↓

Widget Loader

↓

Dynamic Component
```

Everything should register itself.

---

## 4. Extensibility

New features should require adding files—not editing existing ones.

Ideal workflow

```
Create widget

↓

Register widget

↓

Done
```

---

# Major Systems

## Core

* Authentication
* Authorization
* User Preferences
* Organizations
* Workspaces

---

## Knowledge

* Libraries
* Notebooks
* Notes
* Rich Text Editor
* Markdown
* Attachments
* Tags
* Search
* Backlinks

---

## Productivity

* Tasks
* Journal
* Calendar
* Goals
* Habits
* Countdown
* Events

---

## Dashboards

* Responsive Grid
* Widget Registry
* Widget Factory
* Dashboard Layouts
* Persistence
* Drag & Drop

---

## UI Infrastructure

* Theme System
* Design Tokens
* Component Library
* Modal System
* Toast System
* Command Palette
* Navigation
* Context Menus

---

## Developer Infrastructure

* Storybook
* Jest
* Cypress
* Playwright
* Chromatic
* ESLint
* Prettier
* Husky

---

# Tech Stack

Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Zustand
* Lexical
* React Grid Layout

Backend

* Supabase
* PostgreSQL
* Prisma

Developer Experience

* Storybook
* Chromatic
* Jest
* Cypress
* Playwright

---

# Folder Philosophy

```
app/
```

Routing only.

---

```
features/
```

Business features.

Examples

```
notes
journal
tasks
calendar
dashboards
```

---

```
packages/
```

Reusable application systems.

Examples

```
editor
theme
modal
widgets
navigation
search
```

---

```
components/
```

Reusable UI.

Following Atomic Design.

```
atoms
molecules
organisms
templates
```

---

```
lib/
```

Utilities.

---

```
stores/
```

Global state.

---

```
services/
```

Business logic.

---

```
repositories/
```

Database access.

---

# Architectural Goals

* Feature-based architecture
* Domain-driven organization
* Plugin architecture
* Registry pattern
* Factory pattern
* Dependency inversion
* Strong typing
* Testability
* Story-driven development

---

# Current Long-Term Goals

* Modular widget ecosystem
* Extensible editor
* AI-powered workflows
* Knowledge graph
* Workspace customization
* Multi-dashboard support
* Offline support
* Realtime collaboration

---

# Project Status

Synapcity is under active architectural development.

The current focus is building reusable infrastructure before expanding feature count.

---

# Engineering Principles

Every new feature should satisfy:

✅ Type-safe

✅ Testable

✅ Storybook support

✅ Accessible

✅ Theme-aware

✅ Responsive

✅ Composable

✅ Documented

---

# Inspiration

* Linear
* Vercel
* Notion
* Arc
* Obsidian
* Raycast
* shadcn/ui

---

# Why this project exists

Synapcity is both

* a production-ready application

and

* a research project into scalable frontend architecture.

Its purpose is to explore how large React applications can remain modular, maintainable, and enjoyable to extend over years of development.

---

# 🚀 Rebuild Checklist

This is the checklist I wish we'd had before some of your earlier restarts. Following it should keep the architecture coherent and reduce the temptation to rebuild from scratch.

## Phase 0 — Foundation

* [ ] Initialize Next.js 15 (App Router)
* [ ] Configure TypeScript (`strict`)
* [ ] Configure Tailwind CSS
* [ ] Configure ESLint + Prettier
* [ ] Configure Husky + lint-staged
* [ ] Add Storybook
* [ ] Add Jest + React Testing Library
* [ ] Add Cypress
* [ ] Add Playwright
* [ ] Configure absolute imports (`@/`)
* [ ] Set up environment validation

---

## Phase 1 — Design System

* [ ] Install shadcn/ui
* [ ] Build Atomic Design structure
* [ ] Add design tokens
* [ ] Build ThemeProvider
* [ ] CSS variables
* [ ] Light/Dark mode
* [ ] Accent colors
* [ ] Typography system
* [ ] Icon system
* [ ] Motion utilities

---

## Phase 2 — Core Infrastructure

* [ ] Authentication
* [ ] Supabase
* [ ] Prisma
* [ ] Repository layer
* [ ] Service layer
* [ ] Error handling
* [ ] API client
* [ ] Logging
* [ ] Analytics abstraction

---

## Phase 3 — Shared Systems

* [ ] Modal system
* [ ] Toast system
* [ ] Dialog wrappers
* [ ] Command Palette
* [ ] Search infrastructure
* [ ] Navigation
* [ ] Keyboard shortcuts
* [ ] Permissions
* [ ] Settings framework

---

## Phase 4 — Widget Platform

* [ ] Widget registry
* [ ] Widget loader
* [ ] Widget metadata
* [ ] Widget factory
* [ ] Widget lifecycle
* [ ] Dashboard registry
* [ ] Layout persistence
* [ ] Widget configuration
* [ ] Resize handling
* [ ] Drag-and-drop
* [ ] Widget versioning

---

## Phase 5 — Editor Platform

* [ ] Lexical setup
* [ ] Node registry
* [ ] Plugin loader
* [ ] Markdown support
* [ ] Tables
* [ ] Lists
* [ ] Code blocks
* [ ] Slash commands
* [ ] Floating toolbar
* [ ] Drag handles
* [ ] Serialization
* [ ] Import/export

---

## Phase 6 — Domain Models

* [ ] Libraries
* [ ] Notebooks
* [ ] Notes
* [ ] Tags
* [ ] Tasks
* [ ] Projects
* [ ] Journal
* [ ] Calendar
* [ ] Goals
* [ ] Habits
* [ ] Attachments

---

## Phase 7 — Feature Development

For **every** new feature:

* [ ] Prisma model
* [ ] Validation schema
* [ ] Repository
* [ ] Service
* [ ] Zustand store (only if shared state is needed)
* [ ] Hooks
* [ ] UI components
* [ ] Storybook stories
* [ ] Unit tests
* [ ] E2E tests
* [ ] Documentation

---

## Phase 8 — Performance

* [ ] Dynamic imports
* [ ] Route-level code splitting
* [ ] Memoization review
* [ ] Bundle analysis
* [ ] Image optimization
* [ ] Virtualization where needed
* [ ] Lazy loading
* [ ] Suspense boundaries

---

## Phase 9 — Quality Gates

Before merging any significant feature:

* [ ] `npm run lint`
* [ ] `npm run typecheck`
* [ ] `npm run test`
* [ ] `npm run test:e2e`
* [ ] `npm run storybook`
* [ ] Accessibility review
* [ ] Responsive review
* [ ] Dark mode review
* [ ] Keyboard navigation review
* [ ] Performance review

---