# VibePoster Frontend Agent Spec

## 1) Codebase Synthesis

### Product Intent
- `VibePoster` is a trend-to-post pipeline for X: create trend, scrape Bluesky, analyze style card, generate drafts, approve/publish.
- Current UX is functionally complete for v0.1 but visually minimal.

### App Stack
- Framework: Next.js 14 App Router + TypeScript.
- Styling: Tailwind CSS with a very small token layer in `src/app/globals.css`.
- Icons: `lucide-react`.
- Data: Prisma + SQLite.

### Frontend Surface Area
- Global shell: `src/app/layout.tsx`.
- Global styles: `src/app/globals.css`.
- Pages:
  - Dashboard: `src/app/page.tsx`
  - Trends list: `src/app/trends/page.tsx`
  - Trend detail pipeline: `src/app/trends/[id]/page.tsx`
  - Queue: `src/app/queue/page.tsx`
- Shared UI components:
  - `src/components/create-trend-form.tsx`
  - `src/components/trend-card.tsx`
  - `src/components/style-card-view.tsx`
  - `src/components/post-preview.tsx`
  - `src/components/scraped-posts-list.tsx`

### Current UX Behavior
- Dashboard: counts + trend list.
- Trend detail: explicit action pipeline buttons (scrape, analyze, lock, compose) + style card + drafts + scraped posts.
- Queue: tabbed statuses (approved/draft/published).

### Constraint Notes
- Keep all functional actions and API contract unchanged.
- Prioritize animation performance: transform/opacity-first, avoid heavy continuous paint work.
- Preserve mobile usability and dark-mode-first visual language.

## 2) Proposed Design Language (for confirmation)

### Design Direction: "Obsidian Liquid Glass"
- Atmosphere: deep charcoal/navy layered background with moving aurora gradients and subtle grain.
- Surface model: translucent glass panels with edge highlights, liquid reflections, and depth hierarchy.
- Character: editorial-luxury meets futuristic control room.

### Typography Pairing
- Display: `Bodoni Moda` (dramatic, premium headlines).
- Body/UI: `Plus Jakarta Sans` (clean and modern for controls and dense content).
- Mono/meta: existing local `Geist Mono` for metrics and tags.

### Color System
- Base: near-black slate spectrum.
- Accent A: icy cyan for active/interactive focus.
- Accent B: mint/emerald for successful states.
- Accent C: coral for destructive/error states.
- All colors exposed as CSS variables for consistency.

### Motion Language
- Page-load stagger reveals for cards and sections.
- Hover: subtle glass tilt + edge glow (short easing).
- Stateful controls: animated gradients and halo rings.
- Accessibility/performance:
  - Respect `prefers-reduced-motion`.
  - Keep backdrop blur scoped and bounded.
  - Use low-cost keyframes and avoid layout-thrashing animations.

## 3) Proposed Sections/Composition (for confirmation)

### Shared Shell
- Floating premium nav bar with liquid glass treatment.
- Ambient background layers (aurora + radial lights + grain).
- Reusable glass primitives (`glass-panel`, `glass-pill`, `liquid-button`, `status-chip`).

### Dashboard (`/`)
- Hero block with expressive title + product pulse line.
- Three KPI glass capsules with animated value emphasis.
- Trend cards redesigned into asymmetrical layered glass tiles.

### Trends (`/trends`)
- Same visual system as dashboard for consistency.
- Collection framing with stronger section heading and command action area.

### Trend Detail (`/trends/[id]`)
- Pipeline rail as premium step controls.
- Style Card transformed into a centerpiece "glass dossier".
- Generated posts and scraped posts use differentiated glass depths.

### Queue (`/queue`)
- Segmented liquid tabs with animated active indicator.
- Post cards become polished moderation/publish surfaces with clearer status hierarchy.

## 4) Implementation Plan

1. Build global design tokens, font imports, animation keyframes, and reusable glass utility classes.
2. Refactor layout shell/navigation to premium floating glass structure.
3. Restyle each page and shared component while preserving existing logic.
4. Add responsive tuning and reduced-motion handling.
5. Run lint/build checks and fix any regressions.

