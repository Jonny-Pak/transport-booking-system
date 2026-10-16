# Transport Ticket Booking System

**Hệ thống bán vé tàu xe trực tuyến tích hợp thanh toán tự động**

University Software Project Management capstone, built by one developer over 4–6 weeks. The MVP targets both bus and train tickets, including carriages and segment-based seat allocation. The approved model has [17 business tables](docs/design/database-design.md). This repository is the runnable application foundation for Sprint 1, not a completed booking product.

## Current foundation and planned MVP

Implemented: Spring Boot REST infrastructure, health endpoint, PostgreSQL/Flyway V1–V2 (17 business tables), registration/login/logout with BCrypt and cookie sessions, CSRF protection, CUSTOMER/ADMIN authorization, Vietnamese React forms and route guards, sample trip search, typed Axios integration and a development-only API status indicator. See [authentication guide](docs/design/authentication.md).

Planned: trip search against real schedules, seat selection/holds, bookings, provider sandbox payment, electronic tickets, booking history, admin route/vehicle/trip/booking management and revenue reporting. Booking, ticket issuance and payment are not implemented. Customer/admin business pages remain previews behind real authentication and role guards. All showcased routes and fares are sample data.

## Technology stack

- Backend: Java 21, Spring Boot 3.5.16, Maven Wrapper (Maven 3.9.12), Spring Web, JPA, Security, Validation, PostgreSQL JDBC, Flyway, Lombok, Actuator, Springdoc 2.8.17, JUnit 5 and Mockito.
- Frontend: React 19, TypeScript 6, Vite 8, React Router 7, Ant Design 6, Tailwind CSS 4 with its Vite plugin, Axios, TanStack Query, authentication Context, React Hook Form, Zod and Lucide React.
- Tooling: PostgreSQL 17 via Docker Compose, ESLint 10, Prettier, Git/GitHub and Swagger UI. Exact resolved frontend versions are recorded in `frontend/package-lock.json`.

Version references: [Spring Boot 3.5 documentation](https://docs.spring.io/spring-boot/3.5/reference/index.html), [Springdoc compatibility matrix](https://springdoc.org/v2/#what-is-the-compatibility-matrix-of-springdoc-openapi-with-spring-boot), [Vite setup](https://vite.dev/guide/), [Tailwind Vite setup](https://tailwindcss.com/docs/installation/using-vite).

## Architecture and repository layout

A modular monolith deploys as one backend process. React is a separate application within the same repository and communicates through REST `/api/v1`. One PostgreSQL database is managed by Flyway; Hibernate uses `ddl-auto=validate`. Business modules are `auth`, `user`, `route`, `vehicle`, `trip`, `booking`, `payment` and `ticket`. Package descriptions establish their boundaries without generating empty CRUD classes.

```text
transport-booking-system/          # existing checkout name; product: transport-ticket-booking-system
├── backend/
│   ├── .mvn/wrapper/, mvnw, mvnw.cmd, pom.xml
│   ├── .env.example
│   └── src/
│       ├── main/java/com/transport/ticketbooking/
│       │   ├── TicketBookingApplication.java
│       │   ├── config/, common/, security/
│       │   └── modules/{auth,user,route,vehicle,trip,booking,payment,ticket}/
│       ├── main/resources/{application.yml,application-local.yml,db/migration/}
│       └── test/java/com/transport/ticketbooking/
├── frontend/
│   ├── .env.example, package.json, package-lock.json
│   └── src/
│       ├── app/{router,providers}/
│       ├── components/{common,layout}/
│       ├── features/{auth,trips}/
│       ├── hooks/, services/api/, types/
│       ├── pages/{public,customer,admin}/
│       └── App.tsx, main.tsx, index.css
├── database/README.md
├── docs/{project-management,requirements,design,testing}/
├── scripts/start-backend.ps1
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

Additional frontend feature/utility folders and backend controller/service/repository/entity/DTO packages are created when used. See [architecture](docs/design/architecture.md), [MVP scope](docs/requirements/mvp-scope.md) and [backlog](docs/project-management/backlog.md).

## Prerequisites

- JDK 21 with `JAVA_HOME` pointing to the JDK.
- Node.js 24 LTS (recommended), or Node 22.13+ to satisfy all tooling, and npm.
- Docker with Compose v2 for the local database, or an independently managed PostgreSQL 17 instance.
- Git and network access on the first dependency installation. Maven installation is optional because a wrapper is included.
- Enough disk space for npm/Maven caches, temporary downloads and database storage.

## Environment configuration

From the repository root in PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Set `POSTGRES_PASSWORD` in root `.env` to your local password and set the matching `DB_PASSWORD` in `backend/.env`. Keep these files untracked. The example values are placeholders, not production credentials. Compose reads the root `.env`; Vite reads `frontend/.env`. Spring Boot does not automatically read `.env`; the supplied PowerShell startup script loads the backend file as environment variables.

Backend variables:

| Variable | Example / purpose |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/transport_ticket_booking` |
| `DB_USERNAME` | `ticketbooking` |
| `DB_PASSWORD` | Required; match the configured database password |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173`; comma-separated explicit origins |
| `SERVER_PORT` | `8080` |
| `SPRING_PROFILES_ACTIVE` | `local` for development Swagger access |

Root `.env` also supports `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PORT`. If you change these, update the backend JDBC URL/credentials accordingly. Changing credentials in `.env` does not change users in an already initialized volume.

Frontend: `VITE_API_BASE_URL=http://localhost:8080/api/v1`. Vite variables are public client configuration; never put secrets in them.

## Start PostgreSQL

```powershell
docker compose config --quiet
docker compose up -d postgres
docker compose ps
```

PostgreSQL binds to localhost only and uses a named persistent volume. `docker compose down` stops services while retaining data. On backend startup, Flyway executes the V1 baseline and V2 to create the approved 17 business tables. See [database notes](database/README.md) for constraints, timezone setup and application responsibilities, and [migration tests](docs/testing/database-migrations.md) for verification on real PostgreSQL.

## Start backend

PowerShell, from the repository root:

```powershell
./scripts/start-backend.ps1
```

Alternatively, export the variables in `backend/.env` into your shell and run:

```powershell
cd backend
./mvnw.cmd spring-boot:run
```

On macOS/Linux use `sh ./mvnw spring-boot:run` after exporting the same environment variables. The default profile disables Swagger; enable `local` only for local development. No default login account or JWT is provided. Register through the UI; follow the authentication guide to promote an account to ADMIN locally. CSRF and security headers remain enabled. Set SESSION_COOKIE_SECURE=true when deploying over HTTPS.

If your Windows system drive is full, use another drive for caches **and temporary downloads** before launching the wrapper:

```powershell
# From repository root; these directories are ignored by Git.
New-Item -ItemType Directory -Force .cache/tmp | Out-Null
$env:TEMP = "$PWD/.cache/tmp"
$env:TMP = $env:TEMP
$env:MAVEN_USER_HOME = "$PWD/.cache/maven"
$env:MAVEN_OPTS = "-Dmaven.repo.local=$PWD/.cache/m2"
```

## Start frontend

In a separate terminal, from the root:

```powershell
npm.cmd --prefix frontend ci
npm.cmd --prefix frontend run dev
```

Open <http://localhost:5173>. Vite uses a fixed port to match CORS. Restart Vite after changing its environment file. On macOS/Linux substitute `npm` for `npm.cmd`. To use a cache on this checkout's drive, append `--cache .cache/npm` to npm install/ci commands.

Available routes: `/`, `/login`, `/register`, `/trips`, `/trips/:tripId`, `/my-bookings`, `/my-bookings/:bookingId`, `/admin`, `/admin/routes`, `/admin/vehicles`, `/admin/trips`, `/admin/bookings`, plus a 404 fallback. Example trip detail: `/trips/sample-hcm-dalat`.

## API and Swagger

- Swagger UI (local profile): <http://localhost:8080/swagger-ui/index.html>
- OpenAPI (local profile): <http://localhost:8080/v3/api-docs>
- Application liveness: <http://localhost:8080/api/v1/health>
- Actuator health including database readiness: <http://localhost:8080/actuator/health>

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/health
```

Expected API response:

```json
{"success":true,"message":"Transport Ticket Booking API is running","data":null}
```

The small development-only indicator reports pending, connected or failed API health and allows retry. Production builds omit this indicator. Application health is a lightweight endpoint; use Actuator to inspect dependency readiness.

## Validation

```powershell
npm.cmd --prefix frontend run typecheck
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run format:check
npm.cmd --prefix frontend run build
npm.cmd --prefix frontend ls --depth=0
cd backend
./mvnw.cmd test
./mvnw.cmd package
```

The MVC tests require no database and exercise actual security filters. Opt-in DatabaseMigrationTest and AuthIntegrationTest exercise PostgreSQL/Flyway and real authentication; see [authentication guide](docs/design/authentication.md) for test environment variables and Playwright commands. See [validation results and manual checks](docs/testing/validation.md) for what actually ran and remaining environment blockers.

## Roadmap

1. Review MVP requirements, ERD, state transitions and API contracts.
2. Implement secure registration/login and role/ownership authorization.
3. Add route/vehicle/trip migrations and validated administrative APIs.
4. Implement real trip search, transactional seat holds and bookings.
5. Integrate provider sandbox payment with verified, idempotent callbacks; issue tickets after confirmation.
6. Add booking history, revenue reporting, agreed cancellation policies, integration tests and capstone deployment evidence.
7. Extend to connecting trips and advanced operational features after the bus and train MVP is stable.
