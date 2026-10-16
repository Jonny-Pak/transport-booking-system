package com.transport.ticketbooking;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.UUID;
import java.util.TimeZone;

import static org.junit.jupiter.api.Assertions.*;

/** Opt-in real PostgreSQL test. Uses and removes only its own random schema. */
@EnabledIfEnvironmentVariable(named = "MIGRATION_TEST_DB_URL", matches = ".+")
class DatabaseMigrationTest {
    private static TimeZone originalTimeZone;

    @BeforeAll
    static void useUtcForJdbc() {
        originalTimeZone = TimeZone.getDefault();
        // Some PostgreSQL images omit legacy timezone aliases such as Asia/Saigon.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }

    @AfterAll
    static void restoreTimeZone() {
        TimeZone.setDefault(originalTimeZone);
    }

    @Test
    void migratesAndEnforcesJourneyAndPaymentIntegrity() throws Exception {
        String url = System.getenv("MIGRATION_TEST_DB_URL");
        String user = System.getenv("MIGRATION_TEST_DB_USER");
        String password = System.getenv("MIGRATION_TEST_DB_PASSWORD");
        String schema = "migration_test_" + UUID.randomUUID().toString().replace("-", "");
        Flyway flyway = Flyway.configure().dataSource(url, user, password)
                .schemas(schema).defaultSchema(schema).locations("classpath:db/migration").load();
        try (Connection connection = DriverManager.getConnection(url, user, password)) {
            try {
                assertEquals(2, flyway.migrate().migrationsExecuted);
                flyway.validate();
                assertEquals(0, flyway.migrate().migrationsExecuted, "Restart must not reapply migrations");
                execute(connection, "SET search_path TO " + schema);
                try (var result = connection.createStatement().executeQuery(
                        "SELECT count(*) FROM information_schema.tables WHERE table_schema = '" + schema
                                + "' AND table_name <> 'flyway_schema_history'")) {
                    assertTrue(result.next());
                    assertEquals(17, result.getInt(1));
                }
                seed(connection);
                rejected(connection, "23505", "INSERT INTO users(full_name,email,password_hash) VALUES ('Duplicate','test@example.com','hash')");
                rejected(connection, "23514", "INSERT INTO vehicles(code,name,transport_type) VALUES ('bad','Bus','BUS')");
                rejected(connection, "23503", "INSERT INTO trips(code,route_id,vehicle_id,transport_type) VALUES ('bad',1,2,'TRAIN')");
                rejected(connection, "23514", "INSERT INTO vehicle_seats(vehicle_id,transport_type,seat_number,seat_class,row_number,column_number) VALUES (2,'TRAIN','2','STANDARD',1,2)");
                rejected(connection, "23505", "INSERT INTO vehicle_seats(vehicle_id,transport_type,seat_number,seat_class,row_number,column_number) VALUES (1,'BUS','A1','STANDARD',2,1)");
                rejected(connection, "23503", "INSERT INTO trip_seats(trip_id,vehicle_id,vehicle_seat_id,seat_number_snapshot,seat_class) VALUES (1,1,2,'1','STANDARD')");
                rejected(connection, "23503", "UPDATE bookings SET destination_trip_stop_id = 4 WHERE id = 1");
                rejected(connection, "23514", "UPDATE bookings SET origin_trip_stop_id=3,origin_stop_order=3 WHERE id=1");
                rejected(connection, "23514", "UPDATE trip_fares SET amount=-1");

                rejected(connection, "23503", allocation(4, 3, 1, 4, 1, 2, 1, 3)); // wrong trip
                execute(connection, allocation(1, 1, 1, 2, 1, 2, 1, 2));
                execute(connection, allocation(2, 2, 2, 3, 2, 3, 2, 3)); // adjacent journey succeeds
                rejected(connection, "23505", allocation(3, 3, 1, 2, 1, 2, 1, 3));
                rejected(connection, "23514", allocation(4, 1, 2, 3, 2, 3, 1, 2)); // outside booking
                rejected(connection, "23514", allocation(4, 3, 1, 3, 1, 3, 1, 3)); // non-adjacent segment
                execute(connection, "UPDATE seat_segment_allocations SET status='EXPIRED' WHERE id=1");
                execute(connection, allocation(3, 3, 1, 2, 1, 2, 1, 3)); // history does not block reuse

                // A real second connection competes with an uncommitted allocation.
                execute(connection, "UPDATE seat_segment_allocations SET status='RELEASED' WHERE id=3");
                connection.setAutoCommit(false);
                execute(connection, allocation(5, 1, 1, 2, 1, 2, 1, 2));
                try (Connection competitor = DriverManager.getConnection(url, user, password)) {
                    execute(competitor, "SET search_path TO " + schema);
                    execute(competitor, "SET lock_timeout = '500ms'");
                    rejected(competitor, "55P03", allocation(6, 3, 1, 2, 1, 2, 1, 3));
                    connection.commit();
                    rejected(competitor, "23505", allocation(6, 3, 1, 2, 1, 2, 1, 3));
                } finally {
                    connection.rollback();
                    connection.setAutoCommit(true);
                }

                execute(connection, "INSERT INTO payment_attempts(id,booking_id,provider,payment_reference,amount,expires_at) VALUES (1,1,'SANDBOX','ref1',100000,now()+interval '10 minutes')");
                rejected(connection, "23514", "UPDATE payment_attempts SET status='SUCCEEDED' WHERE id=1");
                execute(connection, "UPDATE payment_attempts SET status='SUCCEEDED',paid_at=now(),provider_transaction_id='tx1' WHERE id=1");
                rejected(connection, "23505", "INSERT INTO payment_attempts(booking_id,provider,payment_reference,provider_transaction_id,amount,expires_at) VALUES (2,'SANDBOX','ref2','tx1',100000,now()+interval '10 minutes')");
                execute(connection, "INSERT INTO payment_events(payment_attempt_id,deduplication_key,signature_valid) VALUES (1,'event1',true)");
                rejected(connection, "23505", "INSERT INTO payment_events(payment_attempt_id,deduplication_key,signature_valid) VALUES (1,'event1',true)");
                rejected(connection, "23514", "INSERT INTO payment_events(deduplication_key,signature_valid,processing_status,processed_at) VALUES ('invalid',false,'PROCESSED',now())");
                execute(connection, "INSERT INTO tickets(ticket_code,booking_item_id,verification_token) VALUES ('ticket1',1,'random-token1')");
                rejected(connection, "23505", "INSERT INTO tickets(ticket_code,booking_item_id,verification_token) VALUES ('ticket2',1,'random-token2')");
            } finally {
                execute(connection, "DROP SCHEMA IF EXISTS " + schema + " CASCADE");
            }
        }
    }

    private static void seed(Connection c) throws SQLException {
        execute(c, """
                INSERT INTO users(id,full_name,email,password_hash) VALUES (1,'Test','test@example.com','test-hash');
                INSERT INTO stations(id,code,name,station_type,province_city,address) VALUES
                  (1,'A','A','BUS','City','Address'),(2,'B','B','BUS','City','Address'),
                  (3,'C','C','BUS','City','Address'),(4,'T','T','TRAIN','City','Address');
                INSERT INTO routes(id,code,name,transport_type) VALUES (1,'BUS','Bus route','BUS'),(2,'TRAIN','Train route','TRAIN');
                INSERT INTO route_stops(route_id,station_id,transport_type,stop_order,distance_from_origin_km) VALUES
                  (1,1,'BUS',1,0),(1,2,'BUS',2,50),(1,3,'BUS',3,100);
                INSERT INTO vehicles(id,code,name,transport_type,license_plate) VALUES
                  (1,'BUS','Bus','BUS','TEST-01'),(2,'TRAIN','Train','TRAIN',NULL);
                INSERT INTO vehicle_carriages(id,vehicle_id,carriage_number,carriage_type,display_order) VALUES
                  (1,2,'1','SEATED',1),(2,2,'2','SEATED',2);
                INSERT INTO vehicle_seats(id,vehicle_id,transport_type,carriage_id,seat_number,seat_class,row_number,column_number) VALUES
                  (1,1,'BUS',NULL,'A1','STANDARD',1,1),(2,2,'TRAIN',1,'1','SOFT_SEAT',1,1),
                  (3,2,'TRAIN',2,'1','SOFT_SEAT',1,1);
                INSERT INTO trips(id,code,route_id,vehicle_id,transport_type) VALUES
                  (1,'BUS1',1,1,'BUS'),(2,'BUS2',1,1,'BUS'),(3,'TRAIN1',2,2,'TRAIN');
                INSERT INTO trip_stops(id,trip_id,station_id,transport_type,stop_order,arrival_time,departure_time) VALUES
                  (1,1,1,'BUS',1,'2030-01-01 08:00Z','2030-01-01 08:05Z'),
                  (2,1,2,'BUS',2,'2030-01-01 09:00Z','2030-01-01 09:05Z'),
                  (3,1,3,'BUS',3,'2030-01-01 10:00Z','2030-01-01 10:05Z'),
                  (4,2,2,'BUS',2,'2030-01-02 09:00Z','2030-01-02 09:05Z');
                INSERT INTO trip_fares(trip_id,origin_trip_stop_id,destination_trip_stop_id,origin_stop_order,destination_stop_order,seat_class,amount)
                  VALUES (1,1,3,1,3,'STANDARD',100000);
                INSERT INTO trip_seats(id,trip_id,vehicle_id,vehicle_seat_id,seat_number_snapshot,carriage_number_snapshot,seat_class) VALUES
                  (1,1,1,1,'A1',NULL,'STANDARD'),(2,3,2,2,'1','1','SOFT_SEAT');
                INSERT INTO bookings(id,booking_code,user_id,trip_id,origin_trip_stop_id,destination_trip_stop_id,origin_stop_order,destination_stop_order,total_amount,expires_at) VALUES
                  (1,'B1',1,1,1,2,1,2,100000,now()+interval '10 minutes'),
                  (2,'B2',1,1,2,3,2,3,100000,now()+interval '10 minutes'),
                  (3,'B3',1,1,1,3,1,3,100000,now()+interval '10 minutes');
                INSERT INTO booking_items(id,booking_id,trip_id,trip_seat_id,origin_stop_order,destination_stop_order,unit_price) VALUES
                  (1,1,1,1,1,2,100000),(2,2,1,1,2,3,100000),(3,3,1,1,1,3,100000);
                """);
        // Explicit fixture IDs do not advance PostgreSQL identity sequences.
        for (String table : new String[]{"users", "stations", "routes", "vehicles", "vehicle_carriages",
                "vehicle_seats", "trips", "trip_stops", "trip_seats", "bookings", "booking_items"}) {
            execute(c, "SELECT setval(pg_get_serial_sequence('" + table
                    + "','id'), (SELECT max(id)+1 FROM " + table + "), false)");
        }
    }

    private static String allocation(int id, int item, int start, int end, int startOrder, int endOrder, int origin, int destination) {
        return "INSERT INTO seat_segment_allocations(id,trip_id,trip_seat_id,booking_item_id,segment_start_trip_stop_id,segment_end_trip_stop_id,segment_start_order,segment_end_order,origin_stop_order,destination_stop_order,expires_at) VALUES ("
                + id + ",1,1," + item + "," + start + "," + end + "," + startOrder + "," + endOrder
                + "," + origin + "," + destination + ",now()+interval '10 minutes')";
    }

    private static void rejected(Connection c, String sqlState, String sql) {
        SQLException error = assertThrows(SQLException.class, () -> execute(c, sql), sql);
        assertEquals(sqlState, error.getSQLState(), sql);
    }

    private static void execute(Connection c, String sql) throws SQLException {
        try (var statement = c.createStatement()) {
            statement.execute(sql);
        }
    }
}
