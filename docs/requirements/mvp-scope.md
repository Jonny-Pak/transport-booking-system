# MVP scope

The MVP supports bus trips, customer registration/login, seat selection and booking, provider sandbox payment, ticket issuance, booking history, and administration of routes, vehicles and schedules. Revenue reporting and policy-based cancellation depend on remaining capacity.

Initialization implements health and infrastructure only. Public, customer and admin pages are demonstration skeletons. No business database schema, secure authentication, live seat inventory, reservation, ticket issuance or payment processing exists yet.

Review before implementation: ERD, passenger information requirements, seat-hold duration, cancellation/refund policy, payment provider sandbox, role permissions, booking/payment state transitions, timezone and revenue definitions. Train support is an architectural extension point, outside initial delivery.
