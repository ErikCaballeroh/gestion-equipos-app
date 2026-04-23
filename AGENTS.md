# AGENTS.md

## Quick Commands (npm)
- Install: `npm install` (lockfile: `package-lock.json`)
- Dev server: `npm run start` (same as `npx expo start`)
- Platform shortcuts: `npm run android` / `npm run ios` / `npm run web`
- Lint: `npm run lint` (runs `expo lint`)
- Typecheck (no script wired): `npx tsc -p tsconfig.json --noEmit`

## App Entrypoints / Routing
- Entry is Expo Router (`package.json#main = expo-router/entry`).
- File-based routes live in `app/`.
- Root navigation wiring: `app/_layout.tsx` (Stack with route groups `/(admin)` and `/(tecnico)`).
- Tab navigators per role: `app/(admin)/_layout.tsx` and `app/(tecnico)/_layout.tsx`.

## Styling (NativeWind + Tailwind)
- Global Tailwind directives live in `global.css`; it is imported once in `app/_layout.tsx`.
- Metro is wrapped with NativeWind and points at `./global.css` (`metro.config.js`); don’t move/rename without updating that path.
- Babel enables NativeWind JSX transform (`babel.config.js` with `jsxImportSource: "nativewind"`).

## Firebase / Env
- Firebase is initialized in `firebase/config.ts` using `process.env.EXPO_PUBLIC_*` variables.
- `.env` is gitignored; don’t commit it. If Firebase calls fail, verify those `EXPO_PUBLIC_FIREBASE_*` vars are present in your local env.

## Code Organization
- Domain logic lives in `src/controllers/*` and calls `src/services/*` which wrap `firebase/*` helpers.
- Path alias `@/*` maps to repo root (`tsconfig.json`), e.g. `@/firebase/firestore`.

## Repo-Specific Gotchas
- `npm run reset-project` points to `./scripts/reset-project.js`, but `scripts/reset-project.js` is missing in this repo (running it will fail unless restored).
- There are multiple “enum” sources with inconsistent spelling/accents/casing (e.g. controllers validate `"Perifericos"`/`"Telefonos"` and status `"Disponible"`, while screens use `"Periféricos"`/`"Teléfonos"` and status like `"disponible"`). Align these before wiring UI to controllers/Firestore.
- Native folders (`/ios`, `/android`) are gitignored and not present by default; generate them only if needed (e.g. `npx expo prebuild`).
