Supabase password: SIGA2026-G5  
Supabase API url: [https://iprztcuxfstdgxjbrsxd.supabase.co/rest/v1/](https://iprztcuxfstdgxjbrsxd.supabase.co/rest/v1/)  
Public API Key: sb\_publishable\_uQD7XcgAYaz\_odZRD4LH0w\_R6lsLDKO  
Secret / Service API Key: sb\_secret\_eu55QnrXZNK4jbQMQFS2Mw\_GTNoiIBB

# **`Info:`**  **`● ✅ Fase 1 completa — Scaffold + dependencias`**

  `Paro acá para que la revises antes de seguir. Esto es lo que hice:`

  `Qué se creó`

  `- Scaffold Next.js con create-next-app (App Router + TypeScript + Tailwind + ESLint + src/). Como la carpeta tenía mayúsculas`  
  `(SIGA) y npm no las acepta como nombre de paquete, lo generé en una subcarpeta siga y subí el contenido a la raíz, preservando tu`  
  `.git y tu README.md original.`  
  `- Dependencias instaladas:`  
    `- Runtime: @supabase/ssr (el moderno, no auth-helpers), @supabase/supabase-js, @tanstack/react-query, zod, e infra de shadcn`  
  `(class-variance-authority, clsx, tailwind-merge, lucide-react).`  
    `- Testing: vitest, @vitejs/plugin-react, jsdom, @testing-library/{react,dom,jest-dom,user-event}, @vitest/coverage-v8,`  
  `tw-animate-css.`  
  `- Infra shadcn/ui (a mano, sin el CLI interactivo): components.json (new-york, neutral), src/lib/utils.ts con cn(), y globals.css`  
  `con el theme oklch + dark mode.`  
  `- Esqueleto del backend en capas: src/server/{controllers,services,repositories,schemas,lib/supabase} + supabase/migrations (con`  
  `.gitkeep).`  
  `- .env.local.example documentado (URL + anon key públicas, SUPABASE_SERVICE_ROLE_KEY marcada como solo-servidor). Sin claves`  
  `reales.`  
  `- .gitignore corregido + scripts en package.json: type-check, test, test:watch, test:coverage.`  
  `- Quité el AGENTS.md/CLAUDE.md boilerplate que genera create-next-app (el README es la fuente de verdad).`

  `Decisiones que conviene que sepas`

  `1. Layout src/: app → src/app, backend → src/server, alias @/* → ./src/*. Así quedan coherentes el /app/api y /src/server que el`  
  `README mostraba por separado.`  
  `2. Versiones reales que trae el stack actual: Next 16.2.7 · React 19.2.4 · Tailwind v4. El README pedía "Next App Router"`  
  `genérico, así que es compatible. Si preferís fijar Next 15, decime.`  
  `3. Testing fijado a vitest 3 / vite 6 a propósito: el node de este entorno es 20.13 (npm reporta 20.11), por debajo del 20.19 que`  
  `exigen vite 8 / vitest 4. Con esto los tests van a correr de verdad.`

  `Verificaciones (todo en verde)`

  `┌────────────────────┬───────────────────────────────────────────────────────┐`  
  `│       Check        │                       Resultado                       │`  
  `├────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ npm run type-check │ ✅ sin errores                                        │`  
  `├────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ npm run lint       │ ✅ sin errores                                        │`  
  `├────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ npm run build      │ ✅ compila (Next 16/Turbopack)                        │`  
  `├────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ .gitignore env     │ ✅ .env.local ignorado, .env.local.example versionado │`  
  `└────────────────────┴───────────────────────────────────────────────────────┘`

  `▎ Nota npm audit: 2 hallazgos no accionables en nuestro uso — postcss (transitivo de Next, se arregla cuando Next lo suba) y el`  
  `▎ server de Vitest UI (no usamos vitest --ui). No corrí audit fix --force porque rompería versiones.`

  `---`  
  `Próximo paso (Fase 2): cliente de Supabase browser/server con @supabase/ssr + middleware.ts para refrescar/proteger la sesión.`

# **`● ✅ Fase 2 completa — Cliente Supabase + sesión`**

  `Paro acá para revisión. Esto es lo que armé:`

  `Archivos nuevos`

  `src/lib/env.ts                      → valida env PÚBLICO con Zod (getPublicEnv / getPublicEnvSafe)`  
  `src/server/lib/env.ts               → valida env PRIVADO (getServerEnv → service_role)`  
  `src/lib/supabase/client.ts          → cliente BROWSER (anon key) — auth/sesión`  
  `src/server/lib/supabase/server.ts   → cliente SERVER por cookies (respeta RLS) — default repos`  
  `src/server/lib/supabase/admin.ts    → cliente ADMIN (service_role, saltea RLS) — solo con RBAC`  
  `src/lib/supabase/middleware.ts      → updateSession(): refresca sesión + protege rutas`  
  `src/proxy.ts                        → convención Next 16 (export proxy + matcher)`

  `Decisiones clave`

  `1. Separé el env en público vs privado (dos módulos Zod). Así SUPABASE_SERVICE_ROLE_KEY vive solo en código de servidor y no hay`  
  `forma de arrastrarla a un bundle de cliente.`  
  `2. Tres clientes con roles distintos, alineado con el README:`  
    `- server (cookies del usuario) es el default para repositorios → mantiene RLS como segunda barrera.`  
    `- admin (service_role) saltea RLS → documentado para usarse solo en operaciones que lo justifiquen (p. ej. ABM de admin) y`  
  `siempre detrás de chequeo de rol.`  
  `3. proxy.ts en vez de middleware.ts ⚠️ — Next 16 deprecó la convención middleware. El build lo avisó explícitamente, así que migré`  
  `a src/proxy.ts (exporta proxy()). Conceptualmente sigue siendo el "middleware" del README (Next incluso lo etiqueta Proxy`  
  `(Middleware)); solo cambió el nombre del archivo. Si para la presentación querés respetar literal la palabra "middleware", lo`  
  `renombro de vuelta — avisame.`  
  `4. El proxy no rompe la app sin .env.local: si faltan las vars, loguea un warning y deja pasar el request (usa getPublicEnvSafe).`  
  `Una vez configurado Supabase, protege /dashboard y redirige a/desde /login.`

  `Verificaciones (todo verde)`

  `┌────────────────────┬─────────────────────────────────────────────────────────┐`  
  `│       Check        │                        Resultado                        │`  
  `├────────────────────┼─────────────────────────────────────────────────────────┤`  
  `│ npm run type-check │ ✅                                                      │`  
  `├────────────────────┼─────────────────────────────────────────────────────────┤`  
  `│ npm run lint       │ ✅                                                      │`  
  `├────────────────────┼─────────────────────────────────────────────────────────┤`  
  `│ npm run build      │ ✅ (sin la advertencia de deprecación, proxy detectado) │`  
  `└────────────────────┴─────────────────────────────────────────────────────────┘`

  `Nota`

  `- /login y /dashboard todavía no existen → el proxy ya los contempla pero las páginas llegan en fases posteriores (auth +`  
  `frontend). Hoy / renderiza normal.`  
  `- Los tipos Database generados de Supabase los agregaremos en la Fase 3/4 (requieren las migraciones aplicadas); por ahora los`  
  `clientes van sin tipar.`

  `---`  
  `Próximo paso (Fase 3): migraciones SQL en supabase/migrations para las 8 tablas (profiles, materias, inscripciones, notas,`  
  `trabajos_practicos, entregas, eventos_calendario, avisos) + políticas RLS por rol.`

# **`● ✅ Fase 3 completa — Migraciones + RLS (aplicadas y verificadas)`**

  `Paro para revisión. Creé 3 migraciones en supabase/migrations/ y las apliqué al proyecto remoto (la base ya está lista de verdad).`

  `20260605120000_init_schema.sql`

  `- Enum user_role = estudiante | docente | administrador.`  
  `- 8 tablas con FKs e índices: profiles, materias, inscripciones, notas, trabajos_practicos, entregas, eventos_calendario, avisos.`  
  `- Triggers: updated_at automático; handle_new_user (crea el profile al registrarse, siempre rol estudiante — no se confía en`  
  `metadata del cliente, evita auto-promoción); enforce_profile_role_change (un no-admin no puede cambiarse el rol).`  
  `- Funciones SECURITY DEFINER para RLS sin recursión: current_user_role(), is_admin(), is_docente_of_materia().`

  `20260605120100_rls_policies.sql`

  `RLS activado en las 8 tablas, políticas por rol (la "segunda barrera" del README):`  
  `- Estudiante ve/gestiona lo suyo (su perfil, sus inscripciones, sus notas, sus entregas).`  
  `- Docente ve/gestiona los datos de sus materias (notas, TPs, entregas, avisos, eventos).`  
  `- Admin ve/gestiona todo.`  
  `- materias, avisos, eventos_calendario, profiles legibles según corresponda; service_role saltea RLS por diseño y anon no accede a`  
  `nada.`

  `20260605120200_storage_entregas.sql`

  `- Bucket privado entregas + políticas: el estudiante sube/lee/borra solo en su carpeta (<uid>/…); docentes/admin pueden leer para`  
  `corregir.`

  `Verificación contra el proyecto remoto`

  `┌───────────────────────────────────────┬───────────────────────────────────────────┐`  
  `│                 Check                 │                 Resultado                 │`  
  `├───────────────────────────────────────┼───────────────────────────────────────────┤`  
  `│ supabase db push (IPv6 directo)       │ ✅ las 3 migraciones aplicadas            │`  
  `├───────────────────────────────────────┼───────────────────────────────────────────┤`  
  `│ 8 tablas existen (REST, publishable)  │ ✅ todas HTTP 200, RLS activo (anon → []) │`  
  `├───────────────────────────────────────┼───────────────────────────────────────────┤`  
  `│ Bucket entregas                       │ ✅ existe (privado)                       │`  
  `├───────────────────────────────────────┼───────────────────────────────────────────┤`  
  `│ Data API con publishable y con secret │ ✅ ambas funcionan (vía curl/fetch)       │`  
  `└───────────────────────────────────────┴───────────────────────────────────────────┘`

  `▎ Nota: durante la verificación, Invoke-WebRequest de PowerShell daba 401 con la secret key — resultó ser un quirk del cmdlet; con`  
  `▎ curl (y por ende con fetch/supabase-js) anda perfecto. No es un problema de la base ni de las claves.`

  `Decisiones a tener en cuenta`

  `1. No hay tabla periodos (el README lista 8 tablas): dejé periodo como campo text en materias para no salirme de ese alcance. Si`  
  `querés un ABM de períodos real, lo charlamos.`  
  `2. El primer admin: como todos nacen estudiante, hay que promover a alguien a administrador (un UPDATE puntual o vía el cliente`  
  `admin). Te lo puedo dejar hecho cuando tengamos un usuario, o seedear datos de prueba.`

  `---`  
  `Próximo paso (Fase 4 — backend de materias punta a punta): empezaría generando los tipos TypeScript desde la base (supabase gen`  
  `types) para tipar los repositorios, y después armo route handler → controller → service → repository + schema Zod para GET/POST`  
  `/api/materias.`

# **`✅ Fase 4 completa — Módulo materias punta a punta`**

  `Paro para revisión. Implementé el módulo completo respetando la arquitectura en capas del README.`

  `Tipos de la base`

  `- src/server/lib/supabase/database.types.ts — escrito a mano con el formato de supabase gen types (la generación automática`  
  `necesita Docker o un access token, que no tenemos). Tipé los clientes server y admin con <Database>.`

  `Capas del módulo (flujo de una request)`

  `src/app/api/materias/route.ts          GET/POST delgados → controller, try/catch → handleApiError`  
    `└─ controllers/materias.controller.ts  auth + RBAC + valida Zod, devuelve datos planos`  
        `└─ services/materias.service.ts     reglas de negocio (docente a cargo, código único)`  
            `└─ repositories/materias.repository.ts  acceso a Supabase (RLS), aísla la DB`  
                `└─ schemas/materia.schema.ts  DTOs Zod (create / list)`

  `Infra de soporte (reutilizable por los próximos módulos)`

  `- server/lib/auth.ts → getAuthContext() (usuario + rol para RBAC).`  
  `- server/lib/api-error.ts → ApiError + helpers (unauthorized, forbidden, badRequest, conflict…).`  
  `- server/lib/http.ts → ok() y handleApiError() (mapeo centralizado: ApiError→su código, ZodError→400, resto→500 sin filtrar`  
  `internals).`

  `Endpoints`

  `┌────────┬───────────────┬─────────────────┬──────────────────────────────┐`  
  `│ Método │   Endpoint    │      Quién      │             Qué              │`  
  `├────────┼───────────────┼─────────────────┼──────────────────────────────┤`  
  `│ GET    │ /api/materias │ autenticados    │ lista (con ?search=)         │`  
  `├────────┼───────────────┼─────────────────┼──────────────────────────────┤`  
  `│ POST   │ /api/materias │ docente / admin │ crea (docente queda a cargo) │`  
  `└────────┴───────────────┴─────────────────┴──────────────────────────────┘`

  `Verificaciones`

  `┌───────────────────────────┬────────────────────────────────────────────────────────────────────────┐`  
  `│           Check           │                               Resultado                                │`  
  `├───────────────────────────┼────────────────────────────────────────────────────────────────────────┤`  
  `│ type-check / lint / build │ ✅ (ruta ƒ /api/materias dinámica)                                     │`  
  `├───────────────────────────┼────────────────────────────────────────────────────────────────────────┤`  
  `│ Smoke test runtime        │ ✅ 401 sin sesión, JSON de error correcto, authz antes de parsear body │`  
  `└───────────────────────────┴────────────────────────────────────────────────────────────────────────┘`

  `Decisiones / notas`

  `1. Doble barrera: RBAC en el controller + RLS en la base (la política materias_insert también exige docente/admin).`  
  `2. Anti-inyección: el ?search se sanitiza antes del filtro or(...) de PostgREST.`  
  `3. Falta el happy-path autenticado: probarlo por HTTP necesita una cookie de sesión real (la arma @supabase/ssr al loguearse). Lo`  
  `cubrimos en la fase de testing (integración) y al tener login en el frontend.`

  `---`  
  `Próximo paso (Fase 5 — frontend de materias): como sin login no puedo ejercitar la UI, propongo incluir un login mínimo + el`  
  `layout/sidebar por rol y la pantalla de materias (TanStack Query + DataTable/FormDialog). Ahí sí uso el MCP de Playwright para`  
  `probarlo en el navegador de verdad. También puedo seedear un usuario admin/docente y algunas materias para tener datos.`

# **`● ✅ Fase 5 completa — Frontend de materias + login (verificado en navegador)`**

  `Esta tanda incluyó: commit/push de la Fase 4, seed de datos, y el frontend del módulo, probado de verdad con Playwright.`

  `1. Seed de datos (scripts/seed.mjs, npm run seed)`

  `Crea usuarios de auth (Admin API) y puebla las 8 tablas (idempotente). Usuarios — password Siga.2026!:`

  `┌───────────────────────────────────────────────┬───────────────┐`  
  `│                     Email                     │      Rol      │`  
  `├───────────────────────────────────────────────┼───────────────┤`  
  `│ admin@siga.test                               │ administrador │`  
  `├───────────────────────────────────────────────┼───────────────┤`  
  `│ docente1@siga.test, docente2@siga.test        │ docente       │`  
  `├───────────────────────────────────────────────┼───────────────┤`  
  `│ estudiante1@siga.test … estudiante3@siga.test │ estudiante    │`  
  `└───────────────────────────────────────────────┴───────────────┘`

  `(+ 5 materias, inscripciones, notas, TPs, entregas, eventos y avisos.)`

  `2. Frontend`

  `- Login /login (browser client signInWithPassword, Suspense para useSearchParams, toasts).`  
  `- Layout /dashboard (RSC: carga perfil/rol) + Sidebar por rol (links del README; "Materias" activo, el resto "Próximamente") +`  
  `logout.`  
  `- Materias /dashboard/materias: MateriasView con TanStack Query (useMaterias/useCreateMateria) → pega a /api/materias (nunca a la`  
  `DB directo), tabla con búsqueda, skeletons, y diálogo de alta (solo docente/admin).`  
  `- Infra: Providers (QueryClient), Toaster, componentes shadcn (button, input, table, dialog, card, sonner, badge, skeleton, label,`  
  `dropdown-menu).`  
  `- Nuevas deps: shadcn+Radix, next-themes, sonner, ws (polyfill WebSocket para el seed en Node 20).`

  `3. Verificación con Playwright MCP (navegador real)`

  `┌──────────────────────┬────────────────────────────────────────────────────────────────────┐`  
  `│         Caso         │                             Resultado                              │`  
  `├──────────────────────┼────────────────────────────────────────────────────────────────────┤`  
  `│ / sin sesión         │ → redirige a /login ✅                                             │`  
  `├──────────────────────┼────────────────────────────────────────────────────────────────────┤`  
  `│ Login docente        │ → /dashboard/materias, ve las 5 materias (RLS) ✅                  │`  
  `├──────────────────────┼────────────────────────────────────────────────────────────────────┤`  
  `│ Crear materia (POST) │ "Álgebra Lineal" aparece en la tabla ✅                            │`  
  `├──────────────────────┼────────────────────────────────────────────────────────────────────┤`  
  `│ Login estudiante     │ rol "Estudiante", sin botón "Nueva materia" (RBAC), ve materias ✅ │`  
  `└──────────────────────┴────────────────────────────────────────────────────────────────────┘`

  `Esto confirma el happy-path autenticado que faltaba: login → cookie de sesión → RSC con rol → API con RLS → RBAC en front y back.`  
  `type-check/lint/build en verde.`

  `Limpieza`

  `.playwright-mcp/ agregado al .gitignore; screenshots de prueba borrados.`

  `---`  
  `Estado del plan: las 5 fases del README ya están. Quedan los transversales: tests con Vitest (unit del service + integración de`  
  `endpoints) y el CI/CD (.github/workflows/ci.yml + deploy). Y módulos adicionales (notas, TPs con upload, calendario, avisos,`  
  `usuarios) si querés seguir.`

# **`✅ Testing + CI/CD + prueba E2E completa`**

  `Testing (Vitest) — 11 tests, todos verdes`

  `- Unit del service (materias.service.test.ts, mockea el repositorio): docente queda a cargo, admin asigna docente, 409 si el`  
  `código existe (no inserta), getMaterias delega bien.`  
  `- Integración de endpoints (route.test.ts, mockea auth/repo y corre route→controller→service→error-handling): GET 401/200, POST`  
  `401/403/400/201/409. Verifica respuestas y permisos sin DB.`  
  `- Tests con // @vitest-environment node; no rompen el build de Next.`

  `CI/CD (.github/workflows/ci.yml)`

  `- Job ci (push + PR): npm ci → lint → type-check → test → build.`  
  `- Job deploy (solo en main, needs: ci): supabase db push --db-url + deploy a Vercel por CLI. Los pasos están guardados por`  
  `presencia de secrets (si no los configurás, se saltean y CI no falla). Secrets a setear: SUPABASE_DB_URL, VERCEL_TOKEN,`  
  `VERCEL_ORG_ID, VERCEL_PROJECT_ID.`

  `Prueba E2E con Playwright MCP — 8 escenarios, todos ✓`

  `┌─────┬─────────────────────────────────────────┬───────────────────────────────────────────────────────┐`  
  `│  #  │                Escenario                │                       Resultado                       │`  
  `├─────┼─────────────────────────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ 1   │ Acceso sin sesión a /dashboard/materias │ → /login?redirectTo=… (proxy)                         │`  
  `├─────┼─────────────────────────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ 2   │ Login con password incorrecto           │ toast "Invalid login credentials", sin sesión         │`  
  `├─────┼─────────────────────────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ 3   │ Login admin                             │ rol "Administrador", nav admin, botón "Nueva materia" │`  
  `├─────┼─────────────────────────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ 4   │ Búsqueda "fis"                          │ filtra a solo Física I (server-side)                  │`  
  `├─────┼─────────────────────────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ 5   │ Crear con código MAT101 (existe)        │ 409, diálogo queda abierto                            │`  
  `├─────┼─────────────────────────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ 6   │ Crear TST900 (admin)                    │ éxito, aparece en la tabla                            │`  
  `├─────┼─────────────────────────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ 7   │ Login estudiante                        │ read-only, sin botón crear, ve materias (RLS)         │`  
  `├─────┼─────────────────────────────────────────┼───────────────────────────────────────────────────────┤`  
  `│ 8   │ POST directo a la API como estudiante   │ 403 (RBAC a nivel API, no solo UI)                    │`  
  `└─────┴─────────────────────────────────────────┴───────────────────────────────────────────────────────┘`

  `(En Fase 5 ya había verificado login docente + alta.) Quedó probada la doble barrera: RBAC en front y back, y RLS en la base.`

`Hasta ahora:`

`● Hecho ✅`

  `- Commit 1179ee0 — test: add Vitest tests and GitHub Actions CI/CD (3 archivos: ci.yml + 2 de tests). Sin artefactos sueltos.`  
  `- Push: 3e80c5e..1179ee0 main -> main.`

  `Estado del repo (todo en main, pusheado)`

  `┌─────────┬─────────────────────────────────────────────────┐`  
  `│ Commit  │                    Contenido                    │`  
  `├─────────┼─────────────────────────────────────────────────┤`  
  `│ 0fe7c6b │ Fase 1 — scaffold                               │`  
  `├─────────┼─────────────────────────────────────────────────┤`  
  `│ c08efb9 │ Fase 2 — clientes Supabase + proxy              │`  
  `├─────────┼─────────────────────────────────────────────────┤`  
  `│ 3bde06d │ Fase 3 — migraciones + RLS + Storage            │`  
  `├─────────┼─────────────────────────────────────────────────┤`  
  `│ 5542fc6 │ Fase 4 — backend materias en capas              │`  
  `├─────────┼─────────────────────────────────────────────────┤`  
  `│ 3e80c5e │ Fase 5 — login + dashboard + UI materias + seed │`  
  `├─────────┼─────────────────────────────────────────────────┤`  
  `│ 1179ee0 │ Testing (Vitest) + CI/CD                        │`  
  `└─────────┴─────────────────────────────────────────────────┘`

  `Las 5 fases del README + testing + CI/CD están completas, commiteadas y pusheadas. La base remota tiene las migraciones aplicadas`  
  `y datos de prueba.`

  `Próximos pasos posibles`

  `- Módulo TPs con upload a Storage (ejercita el bucket entregas que ya creamos) — sería el siguiente módulo más jugoso.`  
  `- Otros módulos: notas, inscripciones (botón "inscribirme"), calendario, avisos, ABM de usuarios (admin).`  
  `- Configurar los secrets en GitHub (SUPABASE_DB_URL, VERCEL_*) para que el deploy automático corra de verdad, y conectar el repo a`  
  `Vercel.`  
  `- npm run seed si querés resetear la base al estado base (sacando MAT201/TST900 de las pruebas).`  
