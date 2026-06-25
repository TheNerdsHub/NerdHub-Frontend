# Frontend Rebuild Plan

## Stack

**React 18 + TypeScript + Vite + Tailwind CSS v3 + shadcn/ui + TanStack Query**

## What was kept

The business-logic layer was ported from JS to TS:

| File | New Location |
|------|-------------|
| `api.js` | `src/lib/api.ts` — typed fetch wrapper |
| `gameService.js` | `src/lib/game-service.ts` — typed API functions |
| `quoteService.js` | `src/lib/quote-service.ts` — typed API functions |
| `clipboard.js` | `src/lib/clipboard.ts` — `copyToClipboard` util |
| `AuthContext.js` | `src/lib/auth-context.tsx` — typed auth context |
| `useDocumentTitle.js` | `src/hooks/use-document-title.ts` — typed hook |

## Page build order

### Phase 1 — Layout shell
- [x] `components/layout/layout.tsx` (done)
- [x] `components/layout/navigation-bar.tsx` (done - mobile menu refined with Sheet)
- [x] `components/layout/footer.tsx` (done)

### Phase 2 — Info pages
- [x] `pages/home-page.tsx` (done - hero, featured games, QotD widget)
- [x] `pages/about-page.tsx` (done - version info)
- [x] `pages/not-found-page.tsx` (done)

### Phase 3 — Games
- [x] `pages/games-page.tsx` - game list with search/filter, uses `useQuery` from TanStack
- [x] `pages/game-details-page.tsx` - full game detail view, playtime, ownership
- [x] Add shadcn components: `Table`, `Input`, `Card`, `Badge`

### Phase 4 — Quotes
- [x] `pages/quotes-page.tsx` - table view + kanban view (matching existing functionality)
- [x] Add shadcn components: `Table`, `Dialog`, `Tabs`, `Select`

### Phase 5 — Admin (most complex)
- [x] `pages/admin-page.tsx` - user mappings table, progress polling, bulk updates
- [x] Add shadcn components: `Progress`, `Select`, `Textarea`, `Toast`

### Phase 6 — Auth/Profile
- [x] Authentik integration in `auth-context.tsx` (prepared TODO hooks)
- [x] `pages/profile-page.tsx`
- [x] `pages/timeline-page.tsx`

## Per-page checklist

Each page port follows this pattern:
1. Fetch data with `@tanstack/react-query` (no manual `useEffect` for loading state)
2. Render with shadcn/ui components (no bootstrap classes anywhere)
3. Style with Tailwind utilities (no separate CSS files)
4. Handle loading/error/empty states with shadcn `Skeleton` or inline elements

## Files to delete when done

All files under `src/` from old project were already removed. The `public/` directory preserves original assets (favicon, logos, manifest).
