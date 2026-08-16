# Aphelion Frontend

Backend: [Aphelion-Backend](https://github.com/PuneetVerma04/Aphelion-Backend)

Angular frontend for Aphelion, a Steam-like game store web app. This is a full rewrite of an
earlier Blazor implementation — the Blazor code was removed and this Angular app was built from
scratch against the same backend API.

## Status

Actively developed, functional against a local instance of [Aphelion-Backend](https://github.com/PuneetVerma04/Aphelion-Backend).
Not deployed anywhere publicly yet. Test suite: **28 spec files, 117 `it()` tests** under
`src/**/*.spec.ts`. No CI pipeline is configured.

## Features

- **Auth** — register/login against the backend, JWT stored client-side, route guards for
  authenticated and role-gated routes (`Player`, `Publisher`, `Admin`)
- **Games** — catalog browsing with pagination and filtering
- **Cart** — add/update items with optimistic UI updates
- **Orders** — checkout flow and order history
- **Reviews** — per-game reviews
- **User profile** — view/update account details

## Tech stack

- **Angular 21** (standalone build tooling via `@angular/build`)
- **Angular Material** + **Angular CDK** for UI components
- **RxJS** (`BehaviorSubject`-based state, no NgRx)
- **Vitest** for unit tests
- **ESLint** + **Prettier**

## Architecture

Three-tier module structure:

- `src/app/core/` — singleton services, HTTP interceptors, route guards (imported once, in the root)
- `src/app/shared/` — shared, stateless declarations (components, pipes, directives)
- `src/app/features/` — lazy-loaded feature modules: `auth`, `games`, `cart`, `orders`, `reviews`,
  `user-profile`

## Getting started

Requires Node.js and npm.

```bash
npm install
npm start          # ng serve — http://localhost:4200
```

The app expects [Aphelion-Backend](https://github.com/PuneetVerma04/Aphelion-Backend) running
locally; the API base URL is configured in `src/environments/environment.ts`.

### Running tests

```bash
npm test           # ng test (Vitest)
```

### Building

```bash
npm run build       # production build, output in dist/
```

## License

MIT — see [LICENSE](LICENSE).
