# BoilerPlates.NuxtJS_Admin

![Nuxt](https://img.shields.io/badge/Nuxt-3.19-00DC82?logo=nuxt.js)
![Vue](https://img.shields.io/badge/Vue-3.5-41B883?logo=vue.js)
![GraphQL](https://img.shields.io/badge/GraphQL-Apollo_Client_3-e10098?logo=graphql)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Pinia](https://img.shields.io/badge/State_Pinia-2.3-facc15)
![License](https://img.shields.io/badge/License-MIT-yellow)

Modern admin dashboard boilerplate built with **Nuxt 3**, **Apollo Client**, **Pinia**, and **Tailwind CSS**. It consumes the GraphQL API exposed by the companion [BoilerPlates.Express_GraphQL](../BoilerPlates.Express_GraphQL) backend and ships with ready-to-use pages for users, roles, and permissions management.

- **Live URL**: [https://nuxt.sheikhthewizard.world](https://nuxt.sheikhthewizard.world)

---

## 🚀 Features

- **Nuxt 3 application** with typed runtime config and modular architecture
- **Apollo Client 3** GraphQL integration via `@vue/apollo-composable`
- **Authentication-aware layouts** that hydrate the Pinia store before rendering
- **Role & permission dashboards** with rich modals for inline management
- **Responsive UI** powered by Tailwind CSS and `lucide-vue-next` icons
- **Pinia store** for lightweight auth/session persistence with localStorage & cookies
- **Reusable UI primitives** (buttons, cards, blocking loader, charts) for rapid extension
- **Production-ready build** (`pnpm build`) with Tailwind tree-shaking

---

## 📂 Project Structure

```
nuxt-admin/
├── src/
│   ├── assets/                 # Tailwind entrypoint and global styles
│   ├── components/             # Dashboard widgets, shared UI, and providers
│   ├── layouts/                # Default layout wrappers (auth + dashboard shells)
│   ├── pages/                  # Public auth routes and protected dashboard routes
│   ├── plugins/                # Apollo client injection and runtime utilities
│   ├── services/               # Centralised GraphQL queries & mutations
│   ├── stores/                 # Pinia stores for auth/session state
│   └── types/                  # Shared TypeScript types
├── public/                     # Static assets
├── nuxt.config.ts              # Nuxt configuration (modules, runtime config, meta)
├── tailwind.config.ts          # Tailwind theme/tokens
├── tsconfig.json               # TypeScript configuration (extends Nuxt types)
└── package.json                # Scripts, dependencies, metadata
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create an `.env` (or `.env.local`) and specify your API base URL:

```bash
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

By default the app expects the Express GraphQL backend to be available at `http://localhost:8000/graphql`.

### 3. Run the development server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the dashboard UI. Make sure the Express GraphQL backend is running so data can be fetched successfully.

---

## 🌐 Available Pages

| Route                                     | Description                                                       |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `/login`, `/register`, `/forgot-password` | Public auth flows that interact with the GraphQL backend          |
| `/dashboard`                              | Overview metrics (user counts, signup trend, status distribution) |
| `/users`                                  | User directory with role assignment and status management modals  |
| `/roles`                                  | Role overview with permission assignment modals                   |
| `/permissions`                            | Permission inventory with role assignment management              |

All dashboard routes are gated by the auth layout. If session tokens are missing or invalid, the UI shows a blocking loader while redirecting to `/login`.

---

## 🔌 GraphQL Integration

The admin UI communicates with the Express GraphQL server through service modules in `src/services/`. Key operations:

- `GET_USERS_QUERY`, `GET_ROLES_QUERY`, `GET_PERMISSIONS_QUERY`
- `ASSIGN_PERMISSION_MUTATION` / `REVOKE_PERMISSION_MUTATION`
- `ASSIGN_ROLE_MUTATION` / `REVOKE_ROLE_MUTATION`
- `LOGIN_MUTATION`, `REGISTER_MUTATION`, `REQUEST_PASSWORD_RESET_MUTATION`

These operations are consumed through `@vue/apollo-composable` hooks inside pages and components, providing loading/error states and refetch helpers out of the box.

---

## 📦 Scripts

| Command        | Description                           |
| -------------- | ------------------------------------- |
| `pnpm dev`     | Start the development server with HMR |
| `pnpm build`   | Generate a production build           |
| `pnpm preview` | Preview the production build locally  |
| `pnpm lint`    | Run ESLint across the project         |

---

## 🤝 Working with the Backend

This frontend pairs with **BoilerPlates.Express_GraphQL**. Ensure that project is running (Docker or local) so GraphQL queries hit a live endpoint. Adjust `NUXT_PUBLIC_API_BASE_URL` if the backend runs on a different host/port.

---

## 📝 License

MIT © [Elias Shekh](https://sheikhthewizard.world)

Feel free to fork, adapt, and extend the dashboard for your own role/permission management workflows.
