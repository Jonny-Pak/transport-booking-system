# Initialization validation

Latest authentication delivery: see [authentication validation](authentication-validation.md) for 14 backend tests, 6 desktop/mobile browser tests and current build results. The initialization results below are historical.

Executed on 12 October 2026 in the Windows checkout `D:\Code\transport-booking-system`, using Java 21.0.12, Node 24.19.0 and npm 11.17.0.

| Check | Actual result |
| --- | --- |
| Workspace inspection | Only existing README and Git metadata; no uncommitted work before initialization. |
| Frontend dependency installation | Passed; final install audited 275 packages with 0 reported vulnerabilities. |
| `npm.cmd --prefix frontend run typecheck` | Passed with TypeScript strict mode enabled. |
| `npm.cmd --prefix frontend run lint` | Passed with ESLint 10. |
| `npm.cmd --prefix frontend run format:check` | Passed. |
| `npm.cmd --prefix frontend run build` | Passed; lazy secondary routes; final build had no chunk-size warning. |
| `npm.cmd --prefix frontend ls --all` | Passed, exit 0; no invalid/missing dependency relationships reported. |
| Frontend dev server | Started successfully; HTTP GET `http://127.0.0.1:5173/` returned 200. This is not visual/browser interaction verification. |
| Backend tests | Passed: 6 tests, 0 failures/errors/skips. |
| Backend compilation/package | Passed; executable `backend/target/ticketbooking-0.0.1-SNAPSHOT.jar` produced. |
| Maven Wrapper | Generated with Apache wrapper plugin 3.3.4; `backend/mvnw.cmd --version` passed and reported Maven 3.9.12 / Java 21. |
| Git whitespace check | `git diff --check` passed. |
| Docker Compose runtime/config check | Not run: `docker` not installed/on PATH, and the usual Docker Desktop executable path was absent. |
| PostgreSQL + Flyway + Hibernate startup | Not run: no Docker or local `psql`/`pg_ctl` executable was available. No database integration success is claimed. |
| Desktop/mobile browser QA | Not run: computer-use browser inventory returned no connected browsers. |

The backend validation command was Apache Maven 3.9.12 downloaded from Maven Central into ignored `.tools`, with Java 21 and a workspace repository cache:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21.0.12'
./.tools/apache-maven-3.9.12/bin/mvn.cmd -B -ntp -f backend/pom.xml '-Dmaven.repo.local=D:\Code\transport-booking-system\.cache\m2' test package
```

This executed compilation, six MVC tests, jar creation and Spring Boot repackaging. Tests use the actual Spring Security filter chain and verify the public health JSON contract, business endpoint 401, private documentation outside the local profile, CSRF rejection, permitted local origin and rejection of an unknown origin. They intentionally require no PostgreSQL and do not prove database connectivity or migration execution.

## Resolved environment issues

- The initial Vite scaffold referenced a React release npm could not resolve. The manifest was corrected to registry-verified React/ReactDOM 19.3.0. The installed tree is recorded in the lockfile.
- ESLint 9 emitted an unsupported-version warning. The final setup uses supported ESLint 10 and compatible TypeScript ESLint peers. TypeScript remains on compatible 6.0.x rather than upgrading beyond the lint tool's peer range.
- C: had zero free space. Default npm cache writes and Maven Wrapper temporary downloads failed. Dependency caches and wrapper temporary files were redirected into ignored `.cache` on D:. Wrapper startup then passed. No unrelated files were removed to free space.
- PowerShell initially split an unquoted Maven property containing dots. Quoting the property fixed wrapper generation.
- The initial frontend bundle triggered Vite's 500 kB warning. Lazy loading secondary pages resolved it; the final largest emitted chunk was approximately 438 kB before gzip.

Keep sufficient free space on C: for the operating system and development tools. The README includes workspace cache/temp settings if needed on this checkout.

## Manual checks after Docker/browser access is available

1. Copy all environment examples; configure matching local database passwords.
2. Run `docker compose config --quiet` and `docker compose up -d postgres`; confirm the service becomes healthy.
3. Start the backend with the local profile. Confirm Flyway records V1 and JPA validation completes without schema generation.
4. Request `/api/v1/health`; confirm `{success:true,message:"Transport Ticket Booking API is running",data:null}`. Request `/actuator/health`; confirm database readiness. Open local Swagger UI and inspect the health endpoint.
5. Start Vite at port 5173. Confirm the development indicator transitions from pending to connected. Stop the backend and confirm failure/retry messaging. Confirm the indicator is absent from a production preview.
6. Inspect homepage, search, detail, customer and admin pages at desktop width and 375 px mobile width; check menus, keyboard focus, form labels, wrapping and horizontal overflow.
7. Submit an empty search and identical origin/destination; confirm validation. Search TP. Hồ Chí Minh → Đà Lạt and follow the sample detail link. Try a combination without sample routes; confirm the empty state.
8. Visit every README route, including `/my-bookings/sample`, and an unknown path. Confirm clear preview labels and that login/booking/payment never claim success.
9. Start without the local profile; confirm documentation is disabled/private. Verify business endpoints remain protected.

Next integration tests should exercise real PostgreSQL migrations and transactional constraints after the ERD is approved. Add concurrency tests when implementing seat allocation and idempotency tests when implementing payment callbacks.
