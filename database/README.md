# Database foundation

PostgreSQL 17 runs through the root Docker Compose file. The only source of schema changes is `backend/src/main/resources/db/migration`.

`V1__initialize_database.sql` records a Flyway baseline and deliberately creates no business tables. Hibernate uses `ddl-auto=validate`; never switch to `update` to bypass a migration.

Before V2, review the ERD for users/roles, routes/stops, vehicles/seat layouts, trips/trip seats, bookings/passengers, payment attempts and tickets. Decide seat hold expiry, transaction boundaries, unique trip-seat constraints and idempotency rules before implementation.

Changing `.env` credentials does not update an existing PostgreSQL volume. Use the original credentials or deliberately manage the existing database; keep data unless a reset is explicitly intended.
