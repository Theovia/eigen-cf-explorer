# Eigen CF Explorer v2 — Phase 1: Scaffold + Visual Explorer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the single-file HTML Cloudflare Architecture Explorer into a TanStack Start app with React Flow for visual architecture diagrams, shadcn/ui for UI components, deployed on Cloudflare Pages.

**Architecture:** TanStack Start (React full-stack framework with native CF Workers support) serves the app from Cloudflare Pages. React Flow renders interactive architecture diagrams with draggable service nodes and connection edges. shadcn/ui provides accessible dark-mode components. All service/architecture data lives in TypeScript modules (migrated from the current HTML's inline JS objects). No backend yet (Phase 2).

**Tech Stack:** TanStack Start, React 19, React Flow, shadcn/ui, Tailwind CSS v4, Vite, TypeScript strict, Cloudflare Pages

**Source data:** The current explorer at `/Users/raulzhou/Desktop/eigen-cf-explorer.html` contains all SERVICES, ARCHITECTURES, and DECISIONS data objects to migrate.

---

## File Structure

```
eigen-cf-explorer/
├── app.config.ts                 # TanStack Start config (CF Pages preset)
├── wrangler.toml                 # CF Pages deployment config
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── app/
│   ├── root.tsx                  # Root layout (dark theme, fonts)
│   ├── router.tsx                # TanStack router config
│   ├── client.tsx                # Client entry
│   ├── routes/
│   │   ├── index.tsx             # Main explorer page
│   │   ├── __root.tsx            # Root route with layout shell
│   │   ├── architectures.tsx     # Architecture view route
│   │   ├── catalog.tsx           # Service catalog route
│   │   └── decisions.tsx         # Decision assistant route
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx       # Left sidebar: presets + sliders
│   │   │   ├── inspector.tsx     # Right inspector panel
│   │   │   └── prompt-bar.tsx    # Bottom prompt output + copy
│   │   ├── architecture/
│   │   │   ├── flow-canvas.tsx   # React Flow canvas with nodes/edges
│   │   │   ├── service-node.tsx  # Custom React Flow node per service
│   │   │   └── cost-breakdown.tsx # Cost table component
│   │   ├── catalog/
│   │   │   ├── catalog-grid.tsx  # Service cards grid with search
│   │   │   └── catalog-filters.tsx # Category filter tabs
│   │   ├── decisions/
│   │   │   ├── question-card.tsx # Single decision question
│   │   │   └── synthesis.tsx     # Final synthesis after 3 questions
│   │   └── ui/                   # shadcn/ui components (auto-generated)
│   ├── data/
│   │   ├── services.ts           # SERVICES catalog (migrated from HTML)
│   │   ├── architectures.ts      # ARCHITECTURES presets (migrated)
│   │   ├── decisions.ts          # DECISIONS tree (migrated)
│   │   └── types.ts              # TypeScript types for all data
│   ├── lib/
│   │   ├── cost.ts               # Cost calculation logic
│   │   ├── prompt-builder.ts     # Prompt generation logic
│   │   └── utils.ts              # Formatters, helpers
│   └── stores/
│       └── explorer-store.ts     # Zustand store for global state
├── public/
│   └── favicon.svg
└── docs/
    └── superpowers/plans/        # This plan
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `app.config.ts`, `wrangler.toml`, `tsconfig.json`, `tailwind.config.ts`, `app/root.tsx`, `app/router.tsx`, `app/client.tsx`, `app/routes/__root.tsx`, `app/routes/index.tsx`

- [ ] **Step 1: Initialize TanStack Start project**

```bash
cd /Users/raulzhou/Projects/eigen-cf-explorer
npm create @tanstack/start@latest . -- --template basic
```

Select: TypeScript, Cloudflare Pages preset if prompted.

- [ ] **Step 2: Install dependencies**

```bash
npm install @tanstack/react-router zustand react-icons
npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer wrangler
npx tailwindcss init --ts
```

- [ ] **Step 3: Configure for Cloudflare Pages**

Update `app.config.ts`:
```ts
import { defineConfig } from "@tanstack/react-start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    preset: "cloudflare-pages",
  },
});
```

Create `wrangler.toml`:
```toml
name = "eigen-cf-explorer"
pages_build_output_dir = "./dist"
compatibility_date = "2025-04-01"
```

- [ ] **Step 4: Setup Tailwind with dark theme**

Update `tailwind.config.ts` with custom colors matching the current explorer theme (--bg, --accent, etc.).

Add to `app/root.tsx`: import of Tailwind CSS, dark mode class on html, custom fonts (Inter, JetBrains Mono via Google Fonts).

- [ ] **Step 5: Verify dev server runs**

```bash
npm run dev
```

Expected: App running on localhost:3000 with blank dark page.

- [ ] **Step 6: Commit**

```bash
git init -b main && git add -A && git commit -m "feat: TanStack Start scaffold with CF Pages + Tailwind dark theme"
```

---

## Task 2: Data Layer (migrate from HTML)

**Files:**
- Create: `app/data/types.ts`, `app/data/services.ts`, `app/data/architectures.ts`, `app/data/decisions.ts`

- [ ] **Step 1: Define TypeScript types**

Create `app/data/types.ts` with strict types for Service, Architecture, Decision, CostBreakdownRow. Extract from the existing HTML's data structures.

```ts
export interface Service {
  id: string;
  name: string;
  cat: "compute" | "storage" | "ai" | "security" | "integration";
  desc: string;
  limits: [string, string][];
  pricing: string;
  gotcha: string;
  use: string;
  notUse: string;
  link: string;
  vs: { title: string; body: string }[];
}

export interface Architecture {
  id: string;
  name: string;
  tag: string;
  desc: string;
  services: string[];
  flow: string;
  steps: string[];
  costBreakdown: (rps: number, storage: number, ai: number, tenants: number) => CostBreakdownRow[];
}
// ... etc
```

- [ ] **Step 2: Migrate SERVICES data**

Read the SERVICES object from `/Users/raulzhou/Desktop/eigen-cf-explorer.html` (the updated v2 with ~20 services including analyticsEngine, workersCalls). Migrate each entry to `app/data/services.ts` as typed TypeScript with the Service interface. Include all `vs` comparisons.

- [ ] **Step 3: Migrate ARCHITECTURES data**

Read ARCHITECTURES from the HTML. Migrate to `app/data/architectures.ts`. Include costBreakdown functions, implementation steps, and flow diagrams.

- [ ] **Step 4: Migrate DECISIONS data**

Read DECISIONS from the HTML. Migrate to `app/data/decisions.ts`.

- [ ] **Step 5: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 6: Commit**

```bash
git add app/data/ && git commit -m "feat: migrate service/architecture/decision data from HTML to TypeScript modules"
```

---

## Task 3: Global State Store

**Files:**
- Create: `app/stores/explorer-store.ts`, `app/lib/utils.ts`, `app/lib/cost.ts`, `app/lib/prompt-builder.ts`

- [ ] **Step 1: Create Zustand store**

```ts
// app/stores/explorer-store.ts
import { create } from "zustand";

interface ExplorerState {
  selectedArch: string | null;
  selectedService: string | null;
  rps: number;
  storage: number;
  aiCalls: number;
  tenants: number;
  decisionStep: number;
  decisionAnswers: (number | undefined)[];
  promptExpanded: boolean;
  // actions
  selectArch: (id: string) => void;
  selectService: (id: string | null) => void;
  updateTraffic: (field: string, value: number) => void;
  answerDecision: (index: number) => void;
  nextDecision: () => void;
  resetDecision: () => void;
  togglePrompt: () => void;
}
```

- [ ] **Step 2: Create utility functions**

`app/lib/utils.ts`: formatNumber (K/M), category colors mapping.
`app/lib/cost.ts`: cost calculation given architecture + traffic params.
`app/lib/prompt-builder.ts`: build comprehensive prompt string from selected architecture + services + traffic.

- [ ] **Step 3: Commit**

```bash
git add app/stores/ app/lib/ && git commit -m "feat: Zustand store + cost/prompt/utils"
```

---

## Task 4: Layout Shell

**Files:**
- Create: `app/routes/__root.tsx` (update), `app/components/layout/sidebar.tsx`, `app/components/layout/inspector.tsx`, `app/components/layout/prompt-bar.tsx`

- [ ] **Step 1: Root layout with 3-column grid**

Update `app/routes/__root.tsx` with the 3-column layout: sidebar (280px) | main (flex) | inspector (340px), plus header with tabs and footer with prompt bar. Same grid structure as current HTML but using Tailwind classes.

- [ ] **Step 2: Build Sidebar component**

`app/components/layout/sidebar.tsx`: preset buttons list (from architectures data) + traffic slider group (4 range inputs). Wire to Zustand store.

- [ ] **Step 3: Build Inspector component**

`app/components/layout/inspector.tsx`: reads `selectedService` from store, renders service details (name, category, description, limits table, pricing, use/notUse, gotchas, vs comparisons, doc link). Empty state when nothing selected.

- [ ] **Step 4: Build Prompt Bar component**

`app/components/layout/prompt-bar.tsx`: reads prompt from prompt-builder, shows preview line, expand button for full prompt, copy button with feedback.

- [ ] **Step 5: Verify layout renders**

```bash
npm run dev
```

Expected: 3-column dark layout with sidebar, empty canvas, empty inspector, footer.

- [ ] **Step 6: Commit**

```bash
git add app/ && git commit -m "feat: layout shell with sidebar, inspector, prompt bar"
```

---

## Task 5: React Flow Architecture Diagrams

**Files:**
- Create: `app/components/architecture/flow-canvas.tsx`, `app/components/architecture/service-node.tsx`, `app/components/architecture/cost-breakdown.tsx`

- [ ] **Step 1: Install React Flow**

```bash
npm install @xyflow/react
```

- [ ] **Step 2: Create custom ServiceNode component**

`app/components/architecture/service-node.tsx`: React Flow custom node that displays service name, category badge (colored), role in architecture. onClick selects service in store for inspector. Styled with category-colored left border.

- [ ] **Step 3: Create FlowCanvas component**

`app/components/architecture/flow-canvas.tsx`: Takes an Architecture, converts its `services` array into React Flow nodes (auto-laid out in a logical flow: left-to-right for data flow). Generates edges between services based on the architecture's data flow (derive from the `flow` text or define explicit connections in the architecture data).

Auto-layout: use dagre or a simple horizontal layout algorithm. Services ordered by their role in the data flow (ingress → processing → storage → output).

- [ ] **Step 4: Create CostBreakdown component**

`app/components/architecture/cost-breakdown.tsx`: table showing per-service cost breakdown. Reads from architecture's costBreakdown function with current traffic params from store.

- [ ] **Step 5: Wire into architectures route**

`app/routes/architectures.tsx`: FlowCanvas + CostBreakdown, reacts to selectedArch from store.

- [ ] **Step 6: Verify diagrams render**

Select an architecture from sidebar → see React Flow diagram with clickable nodes, edges, cost breakdown.

- [ ] **Step 7: Commit**

```bash
git add app/ && git commit -m "feat: React Flow architecture diagrams with custom nodes and cost breakdown"
```

---

## Task 6: Service Catalog View

**Files:**
- Create: `app/components/catalog/catalog-grid.tsx`, `app/components/catalog/catalog-filters.tsx`, `app/routes/catalog.tsx`

- [ ] **Step 1: Build CatalogGrid with search**

`app/components/catalog/catalog-grid.tsx`: grid of service cards, text search input that filters against name + desc + gotcha. Each card is clickable → selects service in store.

- [ ] **Step 2: Build CatalogFilters**

`app/components/catalog/catalog-filters.tsx`: tab buttons for each category (compute, storage, ai, security, integration) + "all". Filters the grid.

- [ ] **Step 3: Wire into catalog route**

`app/routes/catalog.tsx`: CatalogFilters + CatalogGrid.

- [ ] **Step 4: Commit**

```bash
git add app/ && git commit -m "feat: service catalog with search and category filters"
```

---

## Task 7: Decision Assistant

**Files:**
- Create: `app/components/decisions/question-card.tsx`, `app/components/decisions/synthesis.tsx`, `app/routes/decisions.tsx`

- [ ] **Step 1: Build QuestionCard**

`app/components/decisions/question-card.tsx`: renders one decision question with clickable options. Selected option shows result with explanation.

- [ ] **Step 2: Build Synthesis**

`app/components/decisions/synthesis.tsx`: after all 3 questions answered, computes: deduplicated services chosen, best-matching architecture (max overlap), estimated cost, "Ver esta arquitectura" button.

- [ ] **Step 3: Wire into decisions route**

`app/routes/decisions.tsx`: sequential QuestionCards + Synthesis.

- [ ] **Step 4: Commit**

```bash
git add app/ && git commit -m "feat: decision assistant with synthesis"
```

---

## Task 8: Deploy to Cloudflare Pages

**Files:**
- Modify: `wrangler.toml`, `package.json`

- [ ] **Step 1: Build and verify locally**

```bash
npm run build
npx wrangler pages dev dist
```

Expected: App works on localhost:8788.

- [ ] **Step 2: Create CF Pages project and deploy**

```bash
npx wrangler pages project create eigen-cf-explorer
npx wrangler pages deploy dist
```

- [ ] **Step 3: Verify live URL**

Access the deployed URL. All 3 views (architectures, catalog, decisions) work. React Flow diagrams render. Inspector shows details. Cost updates with sliders.

- [ ] **Step 4: Commit and push**

```bash
git remote add origin <github-url>
git push -u origin main
```

- [ ] **Step 5: Setup GitHub Actions for auto-deploy**

Create `.github/workflows/deploy.yml` that deploys to CF Pages on push to main.

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "feat: CF Pages deployment + GitHub Actions CI"
```

---

## Parallel Execution Strategy

Tasks that can run **in parallel** (after Task 1 scaffold completes):

| Group | Tasks | Agent |
|-------|-------|-------|
| Data | Task 2 (data migration) + Task 3 (store + utils) | Agent A |
| Diagrams | Task 5 (React Flow) | Agent B |
| UI | Task 4 (layout) + Task 6 (catalog) + Task 7 (decisions) | Agent C |
| Deploy | Task 8 (CF Pages) — after all merge | Agent D |

Dependency chain: Task 1 → [Tasks 2-7 in parallel groups] → Task 8.

---

## Success Criteria

- [ ] App deploys to CF Pages and loads in <2s
- [ ] 8 architecture presets with React Flow visual diagrams
- [ ] 20 services in catalog with search + filter
- [ ] Decision assistant produces synthesis with architecture match
- [ ] Cost breakdown updates live with traffic sliders
- [ ] Prompt generator produces comprehensive, copy-pasteable prompt for Claude Code
- [ ] Inspector shows full service details with vs comparisons
- [ ] Dark theme consistent with Eigen brand
- [ ] Mobile-responsive (basic — full mobile is Phase 2)
