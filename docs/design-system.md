# Synapcity Design System

This document is the source of truth for the current theme and token system.

## Design Direction

Synapcity uses an industrial editorial interface: neutral surfaces, technical OKLCH color scales, restrained borders, and deliberate type contrast. The memorable anchor is the scoped theme model: documents, dashboards, and widgets can carry their own palette, radius, and type scale without breaking inheritance.

DFII: 12

- Aesthetic impact: 4
- Context fit: 5
- Implementation feasibility: 5
- Performance safety: 5
- Consistency risk: 2

## Token Layers

The system uses three token layers.

Primitive tokens are raw values:

- `--neutral-50` through `--neutral-950`
- `--primary-50` through `--primary-950`
- `--accent-50` through `--accent-950`

Semantic tokens assign purpose:

- `--background`, `--foreground`
- `--surface`, `--surface-muted`, `--surface-strong`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`
- `--border`, `--input`, `--ring`, `--focus-ring`
- `--chart-1` through `--chart-5`
- `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`

Tailwind-facing tokens are declared inside `@theme inline`:

- `--color-*` aliases expose semantic colors to utilities like `bg-background`, `text-foreground`, and `border-border`.
- `--radius-*` aliases expose radius utilities like `rounded-md`, `rounded-lg`, and `rounded-xl`.
- `--text-*` aliases expose type scale changes to utilities like `text-sm`, `text-base`, and `text-3xl`.
- `--font-sans` and `--font-heading` expose font-family utilities.

## Light And Dark Mode

Light mode values live in `:root`.

Dark mode values live in `.dark`.

Dark mode is controlled only by `next-themes` using `attribute="class"`. It may add or remove the `.dark` class, but it must not write `data-theme-id` or palette variables.

The scoped theme system controls theme identity and runtime CSS variables. It writes:

- `data-theme-scope`
- `data-theme-scope-id`
- `data-theme-id`
- `data-theme-resolution`

`data-theme-id` must always mean the persisted `ThemeRecord.id`.

## Runtime Theme Records

`ThemeRecord` is the persisted design object.

```ts
type ThemeRecord = {
  id: string
  name: string
  version: 1
  seeds: {
    primary: string
    accent: string
  }
  mode?: "light" | "dark" | "system"
  radius?: {
    base?: number
  }
  typography?: {
    scale?: number
  }
}
```

Theme records store numeric design intent. CSS conversion happens in `buildThemeVars`.

## Radius

`radius.base` is a number measured in rem units.

Example:

- Record value: `0.75`
- Runtime CSS variable: `--radius: 0.75rem`

The record should not store `"0.75rem"` because that mixes CSS serialization into domain data. Runtime and Tailwind conversion happen through:

- `--radius`
- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-xl`
- `--radius-2xl`
- `--radius-3xl`
- `--radius-4xl`

The current editor accepts `0` through `2`.

## Type Scale

`typography.scale` is a number.

Example:

- Record value: `1`
- Runtime CSS variable: `--type-scale: 1`

Tailwind text utilities are scaled through `@theme inline`:

- `--text-xs`
- `--text-sm`
- `--text-base`
- `--text-lg`
- `--text-xl`
- `--text-2xl`
- `--text-3xl`
- `--text-4xl`
- `--text-5xl`
- `--text-6xl`

Line-height tokens use the matching `--text-*--line-height` variables where Tailwind supports them.

The current editor accepts `0.85` through `1.25`. Keep this range narrow unless the layout system is tested at larger extremes.

## Scoped Theme Inheritance

Root theme:

- Resolved as `global/root`.
- Applied to `document.documentElement`.
- Always writes runtime CSS variables and root metadata.

Scoped theme:

- Applied by `ThemeScopeProvider`.
- If explicitly assigned, it writes inline CSS variables and `data-theme-id`.
- If unassigned, it writes no inline variables and inherits from the CSS cascade.

Unassigned scopes must not generate their own palette variables.

## Font Strategy

The safest dynamic-font model is not to let user content import arbitrary Google Fonts at runtime.

Use a curated font registry:

- Load a small set of approved fonts in the Next root layout with `next/font/google` or `next/font/local`.
- Assign each font a stable ID, for example `inter`, `space-grotesk`, or `geist-mono`.
- Store only those IDs in a future theme record, not raw URLs or font-family strings.
- Map selected IDs to CSS variables such as `--font-sans` and `--font-heading`.

Implemented registry:

- `inter`
- `space-grotesk`
- `system`

The root layout loads Inter and Space Grotesk into internal variables:

- `--font-family-inter`
- `--font-family-space-grotesk`

Theme records select the public role variables:

- `fonts.body` controls `--font-sans`
- `fonts.heading` controls `--font-heading`

Recommended future record shape:

```ts
type ThemeFonts = {
  body?: "inter" | "system" | "plex-sans"
  heading?: "space-grotesk" | "inter" | "system"
}
```

Why not arbitrary user-entered Google Fonts:

- It can cause layout shift when fonts load late.
- It increases network variability.
- It is hard to typecheck and preview safely.
- It complicates CSP and caching.

For custom user fonts later, prefer uploaded/self-hosted font assets with validation and an explicit approval/import step.

## File Ownership

Token bridge:

- `packages/ui/src/styles/globals.css`

Theme model and defaults:

- `apps/web/modules/theme/types.ts`
- `apps/web/modules/theme/constants.ts`

Runtime variable generation:

- `apps/web/modules/theme/engine/build-theme-vars.ts`

Root application:

- `apps/web/modules/theme/providers/theme-root-provider.tsx`

Scoped application:

- `apps/web/modules/theme/providers/theme-scope-provider.tsx`

Persistence:

- `apps/web/modules/theme/storage/theme-storage.ts`
- `apps/web/modules/theme/store/theme-store.ts`

Theme editing:

- `apps/web/modules/theme/components/theme-editor.tsx`

## Acceptance Rules

- Do not reintroduce `--workspace-*` tokens.
- Do not use `data-theme-id` for anything except the persisted theme record ID.
- Keep light-mode semantic values in `:root`.
- Keep dark-mode semantic overrides in `.dark`.
- Keep dark mode as a class-only mode system.
- Keep scoped assignments explicit.
- Let unassigned scopes inherit.
- Keep record values unitless where they represent system scale.
- Convert record values to CSS units only in `buildThemeVars`.
- Run TypeScript, targeted ESLint, `next build`, and a CSS token-reference check after token changes.
