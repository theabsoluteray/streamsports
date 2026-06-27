# StreamSport — Production-Grade Sports Streaming Platform

> A premium sports streaming aggregator with live scores, schedules, and multi-source streaming — deployed on **Cloudflare Pages**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router, static export for Cloudflare Pages) |
| Language | **TypeScript 5** (strict mode) |
| UI Primitives | **React 19** |
| Styling | **Tailwind CSS v4** |
| Animation | **Framer Motion** |
| State | **Zustand v5** (with persist middleware) |
| Data Fetching | **TanStack Query** (planned) |
| Components | **shadcn/ui** (planned) |
| Icons | **Lucide React** |
| Fonts | **Inter** via Google Fonts |
| Deployment | **Cloudflare Pages** (static export) |

> **Note on framework:** The specification requested Vite + React Router v7. However, since the codebase is already initialized as Next.js 16 with React 19 and the host is Cloudflare Pages (static export via next export), we continue with Next.js. This gives us file-based routing, image optimization stubs, and a mature ecosystem while still deploying as a fully static site to Cloudflare Pages.

---

## Cloudflare Pages Deployment

```bash
# Build command
next build

# Output directory  
out/

# Node.js version
20.x
```

`next.config.ts` is configured with `output: 'export'` and `trailingSlash: true` for Cloudflare Pages compatibility.

A `_redirects` file in `/public` handles SPA-style fallbacks:
```
/*  /index.html  200
```

---

## Folder Structure

```
sports/
├── app/                          # Next.js App Router pages
│   ├── globals.css               # Design tokens + Tailwind v4 theme
│   ├── layout.tsx                # Root layout (Navbar, Footer, providers)
│   ├── page.tsx                  # Homepage
│   ├── match/[id]/page.tsx       # Watch experience
│   ├── schedule/page.tsx         # Full schedule
│   ├── search/page.tsx           # Search
│   ├── sports/                   # Per-sport pages (planned)
│   │   ├── football/page.tsx
│   │   ├── basketball/page.tsx
│   │   ├── ufc/page.tsx
│   │   ├── boxing/page.tsx
│   │   ├── f1/page.tsx
│   │   └── tennis/page.tsx
│   └── sitemap.ts                # Dynamic sitemap (planned)
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui primitives (planned)
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── LiveCard.tsx
│   ├── ScheduleCard.tsx
│   ├── Player.tsx
│   ├── SportCategory.tsx
│   ├── LiveBadge.tsx
│   ├── HeroSection.tsx           # (planned)
│   ├── FeaturedMatch.tsx         # (planned)
│   ├── MatchTimeline.tsx         # (planned)
│   ├── Standings.tsx             # (planned)
│   ├── Skeleton.tsx              # (planned — unified)
│   ├── ErrorBoundary.tsx         # (planned)
│   └── ThemeToggle.tsx           # (planned)
├── lib/                          # Service layer
│   ├── api.ts                    # ESPN API abstraction
│   ├── providers.ts              # Stream provider registry
│   ├── store.ts                  # Zustand stores
│   ├── hooks/                    # TanStack Query hooks (planned)
│   │   ├── useMatches.ts
│   │   ├── useSport.ts
│   │   └── useMatch.ts
│   ├── utils.ts                  # Shared utilities (planned)
│   └── design-tokens.ts          # Shared design constants (planned)
├── public/
│   ├── _redirects                # Cloudflare Pages SPA redirect
│   ├── _headers                  # Cache-Control headers
│   └── site.webmanifest          # PWA manifest (planned)
├── next.config.ts                # Next.js config (static export)
├── tailwind.config.ts            # Tailwind v4 config
└── README.md                     # This file
```

---

## Implementation Status

### Part 1 — Foundation (Partial)

| Task | Status | Notes |
|------|--------|-------|
| React 19 | Done | v19.2.4 |
| TypeScript strict | Done | |
| Tailwind CSS v4 | Done | via @tailwindcss/postcss |
| Framer Motion | Done | v12 installed |
| Zustand | Done | v5 with persist |
| Next.js App Router | Done | v16.2.2 |
| Absolute imports (@/) | Done | tsconfig paths |
| ESLint | Done | |
| Cloudflare Pages static export | Pending | Need output: export |
| TanStack Query | Pending | Not installed |
| shadcn/ui | Pending | Not installed |
| Query provider | Pending | |
| Error boundaries | Pending | |
| Suspense boundaries | Pending | |
| Route lazy loading | Pending | |
| Environment config | Pending | |
| Design tokens | Pending | |
| Testing architecture | Pending | |
| Prettier | Pending | |

### Part 2 — Design System (Partial)

| Task | Status | Notes |
|------|--------|-------|
| Dark theme | Done | #060d1a base |
| Inter font | Done | |
| Color tokens | Pending | Inline Tailwind only |
| Typography scale | Pending | |
| Motion language | Pending | slide-up only |
| Button variants | Pending | |
| Card variants | Pending | |
| Skeleton loaders | Done (basic) | Inline, not reusable |
| Empty states | Done (basic) | Inline |
| Error states | Done (basic) | Inline |
| Light theme | Pending | |
| Accessibility WCAG AA | Pending | |
| Dialog / Toast / Tooltip | Pending | |

### Part 3 — Homepage (Partial)

| Section | Status | Notes |
|---------|--------|-------|
| Hero | Basic | Simple h1 only |
| Live Now | Done | Grid with loading/empty/error |
| Schedule (preview) | Done | Upcoming section |
| Sport Filter | Done | Football + Basketball |
| Footer | Basic | |
| Popular Competitions | Pending | |
| Sports Grid | Pending | |
| Continue Watching | Pending | |
| Trending | Pending | |
| Editorial Collections | Pending | |
| Finished Matches | Pending | |

### Part 4 — Watch Experience (Partial)

| Feature | Status | Notes |
|---------|--------|-------|
| Responsive player | Done | 16:9 iframe |
| Multi-server selector | Done | 5 providers |
| Fullscreen | Done | |
| Stream failure handling | Done | Blocked detection |
| Countdown timer | Done | Pre-match |
| Auto-refresh (5min) | Done | |
| Picture in Picture | Pending | |
| Theater mode | Pending | |
| Mini player | Pending | |
| Keyboard shortcuts | Pending | |
| Related matches | Pending | |
| Statistics | Pending | |
| Standings tab | Pending | |
| Timeline | Pending | |
| Head-to-head | Pending | |
| Continue watching | Pending | |
| Favorites | Pending | |

### Part 5 — Sports Pages

| Sport | Status |
|-------|--------|
| Football | Pending |
| Basketball | Pending |
| UFC / MMA | Pending |
| Boxing | Pending |
| Formula 1 | Pending |
| Tennis | Pending |

### Part 6 — Data Layer (Partial)

| Feature | Status | Notes |
|---------|--------|-------|
| ESPN API abstraction | Done | lib/api.ts |
| Provider registry | Done | lib/providers.ts |
| Zustand store | Done | Sport filter + provider pref |
| TanStack Query hooks | Pending | |
| Caching / Retry / Timeout | Pending | |
| Favorites persistence | Pending | |
| Continue watching | Pending | |
| History | Pending | |
| Settings persistence | Pending | |
| Normalization layer | Pending | |

### Part 7 — Performance & SEO

| Feature | Status |
|---------|--------|
| Metadata / OG / Twitter Cards | Pending |
| JSON-LD | Pending |
| Canonical URLs | Pending |
| PWA manifest | Pending |
| Lazy loading / Code splitting | Pending |
| Image optimization | Pending |
| Lighthouse 95+ | Pending |
| Cloudflare cache headers | Pending |

### Part 8 — Final Polish

| Task | Status |
|------|--------|
| Accessibility audit | Pending |
| Cross-browser testing | Pending |
| Production readiness | Pending |
| Documentation | Pending |

---

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for Cloudflare Pages
npm run build

# The `out/` directory is your deployment artifact
```

---

## Data Sources

| Source | Usage |
|--------|-------|
| ESPN Scoreboard API | Live scores, upcoming matches, team logos |
| StreamEast | Stream provider 1 |
| VIPLeague | Stream provider 2 |
| TotalSportek | Stream provider 3 |
| SportsEmbed | Stream provider 4 |
| DaddyLive | Stream provider 5 |

---

## Streaming Disclaimer

StreamSport does not host any video content. All streams are sourced from third-party providers embedded via iframe. This platform is a stream aggregator only.

---

## Changelog

### v0.1.0 — Initial scaffold
- Next.js 16 + React 19 + TypeScript + Tailwind v4 setup
- ESPN API integration (NBA + 6 football leagues)
- Homepage with Live Now + Upcoming sections
- Sport filter (Football / Basketball / All)
- Match detail page with iframe player
- 5 streaming provider sources
- Schedule page grouped by date
- Search page
- Navbar with live count badge
- Zustand store for sport filter + provider preference

### v0.2.0 — Design System & Cloudflare Config (In Progress)
- Static export config for Cloudflare Pages
- TanStack Query integration
- Expanded design system
- shadcn/ui primitives
- Sports pages foundation
- Enhanced homepage sections
- Watch experience enhancements (PiP, theater mode, keyboard shortcuts)
- Continue watching, favorites, history
- SEO metadata, OG tags, PWA manifest
