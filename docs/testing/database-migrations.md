# PostgreSQL migration verification

`DatabaseMigrationTest` is an opt-in JUnit test using the application's Flyway and PostgreSQL JDBC dependencies, not an in-memory substitute. It creates a random `migration_test_<uuid>` schema and drops only that schema in `finally`. Use a dedicated disposable PostgreSQL database/user with permission to create schemas.

From the repository root (PowerShell), with a test PostgreSQL instance already running:

```powershell
$env:MIGRATION_TEST_DB_URL = 'jdbc:postgresql://localhost:5432/transport_ticket_booking_test'
$env:MIGRATION_TEST_DB_USER = 'your_test_user'
$env:MIGRATION_TEST_DB_PASSWORD = 'your_test_password'
cd backend
./mvnw.cmd test package
```

These are test configuration placeholders, not application credentials. Without `MIGRATION_TEST_DB_URL`, the database test is explicitly skipped; MVC tests still run. The test switches its JVM timezone to UTC during JDBC use and restores it afterwards. PostgreSQL images may reject the legacy Windows/JVM `Asia/Saigon` alias; use `-Duser.timezone=UTC` for the application JVM as well if encountered.

## Coverage

- Flyway applies V1 and V2 to an empty schema; exactly 17 business tables exist.
- Flyway validation succeeds; another migrate call applies zero migrations.
- Bus/train type matching, mandatory bus registration plate, mandatory train carriage and bus seat uniqueness.
- Same seat number allowed in different train carriages.
- Seat belongs to the vehicle assigned to its trip; origin/destination and allocations belong to the correct trip.
- Journey direction, positive pricing, adjacent segment boundaries and allocation contained within its booking journey.
- Adjacent journeys can share a seat; overlapping active allocations fail; released/expired history permits reallocation.
- Two actual JDBC connections contend for the same segment: the competing insert cannot pass an uncommitted hold and fails uniqueness after it commits.
- Payment success metadata, provider transaction uniqueness, callback deduplication and rejection of processed invalid callbacks.
- At most one ticket per booking item.

## Limits

This verifies schema constraints and Flyway execution, not booking/payment services or an end-to-end checkout. Service tests must later cover all-segment transaction rollback, expiry/payment races, blocked seats, passenger validation, amount verification, cryptographic callbacks, trip schedule conflicts and issuance only after confirmed payment.

## Execution environment — 13 October 2026

Verification used Java 21 and a disposable PostgreSQL 17.11 Docker container, without mounting the application's volume. No application database was migrated by this test. The test schema is removed after execution.

Result: `mvn test package` passed, 7 tests, 0 failures/errors/skips (1 migration/constraint integration test plus 6 MVC tests). Flyway applied V1/V2, validated history and reported zero pending migrations on the second run. The executable jar was produced successfully. Initial sandbox network denial, legacy timezone alias and fixture sequence/assertion-order issues were resolved before this successful run. Mockito emitted its existing dynamic-agent warning; it did not fail the build.
