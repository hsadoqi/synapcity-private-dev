# Theme module

Owns the theme record and assignment types plus the scoped theme provider used to apply runtime palette variables.

Routes:
- /settings/theme

Notes:
- Semantic mappings remain in globals.css; runtime code only generates the palette variables.

## Future Work

### Type Scale

```
:root {
  /* Future scoped typography scale */
  --type-scale: 1;

  --type-xs: calc(0.75rem * var(--type-scale));
  --type-sm: calc(0.875rem * var(--type-scale));
  --type-base: calc(1rem * var(--type-scale));
  --type-lg: calc(1.125rem * var(--type-scale));
  --type-xl: calc(1.25rem * var(--type-scale));
  --type-2xl: calc(1.5rem * var(--type-scale));
  --type-3xl: calc(1.875rem * var(--type-scale));
  --type-4xl: calc(2.25rem * var(--type-scale));

  --line-tight: 1.2;
  --line-snug: 1.375;
  --line-normal: 1.5;
  --line-relaxed: 1.65;
}

@theme inline {
  --text-xs: var(--type-xs);
  --text-sm: var(--type-sm);
  --text-base: var(--type-base);
  --text-lg: var(--type-lg);
  --text-xl: var(--type-xl);
  --text-2xl: var(--type-2xl);
  --text-3xl: var(--type-3xl);
  --text-4xl: var(--type-4xl);

  --leading-tight: var(--line-tight);
  --leading-snug: var(--line-snug);
  --leading-normal: var(--line-normal);
  --leading-relaxed: var(--line-relaxed);
}
```

### Border Radius

```
:root {
  /* Future scoped radius scale */
  --radius-base: 0.625rem;

  --radius-xs-token: calc(var(--radius-base) * 0.4);
  --radius-sm-token: calc(var(--radius-base) * 0.6);
  --radius-md-token: calc(var(--radius-base) * 0.8);
  --radius-lg-token: var(--radius-base);
  --radius-xl-token: calc(var(--radius-base) * 1.4);
  --radius-2xl-token: calc(var(--radius-base) * 1.8);
  --radius-3xl-token: calc(var(--radius-base) * 2.2);
  --radius-4xl-token: calc(var(--radius-base) * 2.6);
  --radius-full-token: 9999px;

  --radius: var(--radius-base);
  }

@themm inline {
  --radius-xs: var(--radius-xs-token);
  --radius-sm: var(--radius-sm-token);
  --radius-md: var(--radius-md-token);
  --radius-lg: var(--radius-lg-token);
  --radius-xl: var(--radius-xl-token);
  --radius-2xl: var(--radius-2xl-token);
  --radius-3xl: var(--radius-3xl-token);
  --radius-4xl: var(--radius-4xl-token);
  --radius-full: var(--radius-full-token);
}

```


### Font Families

```
:root {
  --font-family-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-family-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-family-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco,
    Consolas, "Liberation Mono", "Courier New", monospace;

  --font-body: var(--font-family-sans);
  --font-heading: var(--font-family-sans);
  --font-code: var(--font-family-mono);
}

@theme inline {
  --font-sans: var(--font-body);
  --font-serif: var(--font-family-serif);
  --font-mono: var(--font-code);
}
```