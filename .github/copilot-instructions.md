# Copilot Instructions for Gigasmart-Mobile

## Project Overview
- This is an [Expo](https://expo.dev) React Native project, scaffolded with `create-expo-app`.
- The main app code is in `src/app/`, using [file-based routing](https://docs.expo.dev/router/introduction).
- Major features are organized by route, e.g. `login.tsx`, `(protected)/(tabs)/dashboard.tsx`, etc.
- Shared logic is in `src/services/` (API calls), `src/context/` (global state), and `src/components/` (UI widgets).

## Architecture & Patterns
- **Routing:** Follows Expo Router conventions. Each file in `src/app/` is a route; nested folders represent route groups.
- **State Management:** Uses React Context (`src/context/AuthContext.tsx`) for authentication and global state.
- **API Layer:** All HTTP requests go through `src/api/client.ts` and `src/api/request.ts`. Services in `src/services/` wrap API calls and business logic.
- **DTOs & Types:** Data transfer objects and types are defined in `src/dtos/` and `src/types/`.
- **UI Components:** Reusable UI is in `src/components/` and `src/components/ui/`.
- **Theme:** Theming is managed via `src/constants/theme.ts` and hooks in `src/hooks/`.
- **Assets:** Images and icons are in `src/assets/images/`.

## Developer Workflows
- **Install dependencies:**
  ```sh
  npm install
  ```
- **Start app (development):**
  ```sh
  npx expo start
  ```
- **Reset project (if needed):**
  ```sh
  node scripts/reset-project.js
  ```
- **Supported platforms:** Android, iOS, Web (see Expo docs for emulator/simulator setup).

## Conventions & Tips
- **File-based routing:** Add new screens by creating files in `src/app/` or nested route folders.
- **Service pattern:** Place business logic and API calls in `src/services/`, not in components.
- **Type safety:** Use DTOs and types from `src/dtos/` and `src/types/` for all API responses and props.
- **Error handling:** Centralized in `src/utils/errors.ts`.
- **Token storage:** Managed in `src/utils/tokenStorage.ts`.
- **Environment config:** Use `src/config/env.ts` for environment variables.
- **Tailwind CSS:** Styling is configured via `tailwind.config.js`.

## External References
- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)

---

**For AI agents:**
- Always follow the service/component/type separation as described above.
- Reference existing files for patterns before introducing new ones.
- When adding features, update relevant DTOs, types, and services.
- Use file-based routing for new screens.
- Ask for clarification if a workflow or pattern is unclear.
