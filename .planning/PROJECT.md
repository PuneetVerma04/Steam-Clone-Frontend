# Gray Zone Frontend

## What This Is

Gray Zone is an Angular 18 game storefront — a Steam-like platform where players browse, purchase, and review games. It replaces an existing Blazor Server frontend with a cinematic, immersive experience built on a dark post-apocalyptic design language. The backend REST API (.NET, running at `/store`) is already built and fully functional.

## Core Value

A player can discover a game, buy it, and feel like they're inside the world — not on a website.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Player can register and log in with email/password; session persists via JWT
- [ ] Player can browse the game catalog with search, genre filter, price range, and pagination
- [ ] Player can view a full game detail page with description, price, and reviews
- [ ] Player can add games to cart, adjust quantities, remove items, and see running total
- [ ] Player can check out (place order), which clears the cart on success
- [ ] Player can view order history and individual order details
- [ ] Player can write, edit, and delete reviews on games they've purchased (1–5 stars + comment)
- [ ] Player can view and edit their profile (username, email)
- [ ] UI is cinematic: full-bleed game art, dark earth-tone palette, hover animations, smooth transitions

### Out of Scope

- Publisher features (create/edit/delete games) — deferred to v2, not part of player experience
- Admin features (analytics dashboard, coupon management) — deferred to v2
- Real-time features (live chat, notifications) — not in current API surface
- OAuth / social login — JWT email/password is sufficient for v1
- Mobile app — web-first; responsive design is in scope but native app is not

## Context

- **Backend is live:** REST API at `http://localhost:5062/store` covers auth, games, cart, orders, reviews, coupons, analytics, users. See `docs/05-API-REFERENCE.md` for full endpoint reference.
- **Design system defined:** Post-apocalyptic earth tones. Primary `#F55410`, background `#332F2E`, surface `#4B3D37`. 8px spacing grid, breakpoints at 640/768/1024px. See `docs/03-DESIGN-SYSTEM.md`.
- **Architecture decided:** Angular 18 + Angular Material + SCSS. Service-based state with RxJS BehaviorSubjects (no NgRx). Lazy-loaded feature modules. JWT stored in localStorage. See `CLAUDE.md` and `docs/04-ARCHITECTURE.md`.
- **Prior art:** Full model interfaces, service patterns, and component patterns documented in `docs/06-MODELS.md` and `docs/08-COMMON-PATTERNS.md`.
- **Blazor predecessor:** Existing docs describe the Blazor version's structure — useful for understanding intended UX flow, but code is removed.

## Constraints

- **Tech Stack:** Angular 18, Angular Material, SCSS, ngx-toastr, jwt-decode — no changes to this stack without explicit discussion
- **API contract:** Frontend must match the existing backend API exactly; no backend changes in scope for this project
- **Design:** Must use the defined color palette and spacing system from `docs/03-DESIGN-SYSTEM.md`
- **Performance:** Lazy loading required on all feature modules to keep initial bundle small
- **Security:** JWT stored in localStorage (known XSS trade-off, acceptable for v1 per architecture decision)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Angular 18 over Blazor | Team migrating away from .NET frontend; Angular ecosystem better for long-term | — Pending |
| Service-based state (no NgRx) | MVP scope doesn't justify NgRx boilerplate; can migrate later | — Pending |
| JWT in localStorage | Simple implementation, works across tabs; XSS risk accepted for v1 | — Pending |
| Lazy-loaded feature modules | Faster initial load; each feature isolated and independently loadable | — Pending |
| Player-only v1 | Full player loop is the core value; publisher/admin are table stakes not critical path | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-09 after initialization*
