# Database foundation

PostgreSQL 17 runs through the root Docker Compose file. The only source of schema changes is `backend/src/main/resources/db/migration`.

`V1__initialize_database.sql` records a Flyway baseline and deliberately creates no business tables. Hibernate uses `ddl-auto=validate`; never switch to `update` to bypass a migration.

`V2__create_bus_and_train_booking_schema.sql` creates the approved 17 business tables for buses and trains. It contains no accounts or sample business data. Flyway applies it automatically on backend startup after V1. Keep applied migrations immutable; later changes belong in V3 and subsequent files.

See [database design](../docs/design/database-design.md) for the table list and [migration verification](../docs/testing/database-migrations.md) for real PostgreSQL tests.

## Apply locally

After configuring the root and backend environment files as described in the root README:

```powershell
docker compose up -d postgres
# Use a canonical timezone for JDBC; some images omit the legacy Asia/Saigon alias.
$env:JAVA_TOOL_OPTIONS = '-Duser.timezone=UTC'
./scripts/start-backend.ps1
```

Do not also execute V2 manually in pgAdmin; let Flyway record it. A fresh database will have 17 business tables plus `flyway_schema_history`. An existing V1 database will receive only V2. No application database is reset by this migration.

## Schema conventions and service responsibilities

- IDs are generated BIGINT identities; money is NUMERIC(14,2), currency VND, timestamps TIMESTAMPTZ.
- Copied `transport_type`, `vehicle_id`, `trip_id` and stop-order columns support composite foreign keys. Include these additional columns when drawing the ERD from the SQL file.
- Stop orders start at 1 and must be contiguous when a trip opens. An allocation includes the start and end stop, and a check requires adjacent orders within its booking journey.
- Only HELD/BOOKED allocations participate in the unique seat/segment index. Expiry is explicit: the service must release expired holds transactionally before reallocation. `expires_at` remains recorded for BOOKED/history rows.
- Services must lock/calculate/allocate all requested segments in one transaction; validate blocked seats, boarding flags, passenger details, fare totals and hold expiry. Lock bookings consistently during payment/expiry races.
- Before publishing a trip, validate at least two stops, chronological travel times, contiguous orders and vehicle schedule conflicts. Freeze its stops/seat inventory once sales open. These lifecycle rules are not implemented by the migration.
- Payment signature verification, amount matching, transition rules and issuing tickets only after successful payment belong to services. SQL unique keys provide duplicate protection, not payment authentication. Multiple successful attempts may be retained for reconciliation if a customer pays twice.
- No cascading deletes of financial/booking history. Archive via status. `updated_at` defaults initialize rows; the future application must update them (e.g. JPA auditing).
- No business triggers or extra PostgreSQL extensions are required. PostgreSQL partial unique indexes and composite foreign keys are used; see [PostgreSQL constraints](https://www.postgresql.org/docs/17/ddl-constraints.html).

Changing `.env` credentials does not update an existing PostgreSQL volume. Use the original credentials or deliberately manage the existing database; keep data unless a reset is explicitly intended.
