# MVP scope

The MVP supports both bus and train trips, carriages, ordered stops, segment-based seat allocation, customer registration/login, seat selection and booking, provider sandbox payment, ticket issuance, booking history, and administration of routes, vehicles and schedules. Revenue reporting and policy-based cancellation depend on remaining capacity.

Initialization implements health and infrastructure, plus Flyway V2 for the approved 17-table schema. Public, customer and admin pages are demonstration skeletons. Registration/login/logout and CUSTOMER/ADMIN guards are implemented. Live seat inventory services, reservation, ticket issuance and payment processing are not implemented yet.

Review before implementation: ERD, passenger information requirements, seat-hold duration, cancellation/refund policy, payment provider sandbox, role permissions, booking/payment state transitions, timezone and revenue definitions. Both BUS and TRAIN are required for initial delivery. The approved model contains 17 business tables; see [database design](../design/database-design.md). Each booking covers one trip and one origin/destination pair. Connecting trips and changing train composition after sales open are outside the MVP.
