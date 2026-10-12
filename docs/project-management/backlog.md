# MVP backlog

Capacity assumption: one developer, 4–6 weeks. Stories remain planned until acceptance checks pass. Initialization supplies only scaffolding and the health contract.

| ID | Story | Acceptance criteria | Priority / target |
| --- | --- | --- | --- |
| US-01 | As a customer, I can register and sign in. | Validated email, unique account, BCrypt hashes, secure authentication lifecycle, failure tests. | P0 / Sprint 1 |
| US-02 | As an admin, I can manage routes. | Admin-only writes, validated stops, duplicate rules, paginated list. | P0 / Sprint 1 |
| US-03 | As an admin, I can configure buses and seats. | Unique vehicle identifier, reviewed seat layout, referential integrity. | P0 / Sprint 1 |
| US-04 | As an admin, I can schedule trips. | Route/vehicle selection, fares, time validation, conflicting schedules rejected. | P0 / Sprint 2 |
| US-05 | As a visitor, I can search trips. | Origin/date filters, paging, empty states, accurate departure details. | P0 / Sprint 2 |
| US-06 | As a customer, I can select and temporarily hold a seat. | Atomic seat allocation, expiry, double-booking prevention with concurrent tests. | P0 / Sprint 2 |
| US-07 | As a customer, I can book for passengers. | Valid passenger details, immutable quoted fare, server-validated seat hold, ownership checks. | P0 / Sprint 3 |
| US-08 | As a customer, I can pay through a provider sandbox. | Secrets in environment, verified signatures, idempotent callback, timeout/failure reconciliation. | P0 / Sprint 3 |
| US-09 | As a customer, I receive an electronic ticket. | Ticket issued only after confirmed payment; unique code; only owner/admin can view. | P0 / Sprint 3 |
| US-10 | As a customer, I can view my bookings. | Paginated account-specific list and details; other users' records inaccessible. | P0 / Sprint 3 |
| US-11 | As an admin, I can monitor bookings and revenue. | Role checks; revenue uses confirmed payments; date filters with defined timezone. | P1 / Sprint 4 |
| US-12 | As a customer, I can cancel according to policy. | Agreed cutoff/state rules; released seats; documented refund handling. | P1 / Sprint 4 |

## Delivery plan

- Sprint 1 (week 1): review scope/ERD/API conventions, implement auth and master data.
- Sprint 2 (week 2): trips, search, seat availability and concurrency protection.
- Sprint 3 (weeks 3–4): booking, sandbox payments, electronic tickets and account history.
- Sprint 4 (weeks 5–6 if available): admin reporting, cancellation, integration testing, deployment and capstone evidence.

For a four-week schedule, reduce P1 scope before weakening payment or seat-allocation correctness. Train bookings, live payment rollout, promotions and advanced analytics are post-MVP.

Definition of done: reviewed acceptance criteria; migration + DTO validation; authorization where needed; relevant unit/integration tests; typecheck/lint/build; documented API and manual demo. No feature is marked complete based on a placeholder UI.
