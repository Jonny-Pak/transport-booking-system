# Thiết kế database: xe khách và tàu hỏa

## Quyết định phạm vi

Người dùng đã chốt sử dụng **17 bảng nghiệp vụ** cho cả `BUS` và `TRAIN`. DDL được triển khai tại [migration V2](../../backend/src/main/resources/db/migration/V2__create_bus_and_train_booking_schema.sql). Bảng kỹ thuật `flyway_schema_history` không nằm trong số 17 bảng. Danh sách dưới đây là bản tóm tắt; dùng SQL làm nguồn chính xác khi vẽ ERD.

Mỗi đơn thuộc một chuyến, một cặp điểm lên/xuống, có thể có nhiều hành khách. Tàu có toa; xe khách có ghế trực tiếp. Ghế được phân bổ theo từng đoạn giữa hai điểm dừng liên tiếp. Thành phần toa/ghế được cố định khi mở bán. Nối chuyến, đổi thành phần đoàn tàu sau mở bán và hoàn tiền tự động nằm ngoài MVP.

## Danh sách bảng đã chốt

Các thuộc tính sau là nền tảng cho ERD chi tiết. Dùng `BIGINT` cho khóa chính/ngoại, `TIMESTAMPTZ` cho thời gian, `NUMERIC(14,2)` cho tiền, `VND` cho đơn vị tiền MVP. Bổ sung `created_at`, `updated_at` cho các bản ghi nghiệp vụ có vòng đời cập nhật; sự kiện dùng thời điểm nhận/xử lý. Nullability, constraint và index chi tiết cần hoàn thiện trước migration nghiệp vụ.

| # | Bảng | Thuộc tính chính |
| --- | --- | --- |
| 1 | `users` | `id`, `full_name`, `email`, `password_hash`, `phone`, `role`, `status` |
| 2 | `stations` | `id`, `code`, `name`, `station_type`, `province_city`, `address` |
| 3 | `routes` | `id`, `code`, `name`, `transport_type`, `status` |
| 4 | `route_stops` | `id`, `route_id`, `station_id`, `stop_order`, `distance_from_origin_km` |
| 5 | `vehicles` | `id`, `code`, `name`, `transport_type`, `license_plate`, `status` |
| 6 | `vehicle_carriages` | `id`, `vehicle_id`, `carriage_number`, `carriage_type`, `display_order` |
| 7 | `vehicle_seats` | `id`, `vehicle_id`, `carriage_id`, `seat_number`, `seat_class`, `floor_number`, `row_number`, `column_number`, `active` |
| 8 | `trips` | `id`, `code`, `route_id`, `vehicle_id`, `status` |
| 9 | `trip_stops` | `id`, `trip_id`, `station_id`, `stop_order`, `arrival_time`, `departure_time`, `boarding_allowed`, `alighting_allowed` |
| 10 | `trip_fares` | `id`, `trip_id`, `origin_trip_stop_id`, `destination_trip_stop_id`, `seat_class`, `amount`, `currency` |
| 11 | `trip_seats` | `id`, `trip_id`, `vehicle_seat_id`, `seat_number_snapshot`, `carriage_number_snapshot`, `seat_class`, `is_blocked` |
| 12 | `seat_segment_allocations` | `id`, `trip_seat_id`, `segment_start_trip_stop_id`, `booking_item_id`, `status`, `expires_at` |
| 13 | `bookings` | `id`, `booking_code`, `user_id`, `trip_id`, `origin_trip_stop_id`, `destination_trip_stop_id`, `contact_name`, `contact_phone`, `contact_email`, `total_amount`, `currency`, `status`, `expires_at` |
| 14 | `booking_items` | `id`, `booking_id`, `trip_seat_id`, `passenger_name`, `passenger_phone`, `unit_price` |
| 15 | `payment_attempts` | `id`, `booking_id`, `provider`, `payment_reference`, `provider_transaction_id`, `amount`, `currency`, `status`, `reconciliation_status`, `paid_at` |
| 16 | `payment_events` | `id`, `payment_attempt_id`, `deduplication_key`, `signature_valid`, `processing_status`, `received_at`, `processed_at` |
| 17 | `tickets` | `id`, `ticket_code`, `booking_item_id`, `verification_token`, `status`, `issued_at`, `used_at` |

## Quan hệ chính

- `routes` có nhiều `route_stops`; mỗi điểm dừng tham chiếu `stations`.
- `vehicles` có nhiều `vehicle_seats`; tàu có thêm `vehicle_carriages`, mỗi ghế tàu thuộc một toa của chính phương tiện đó.
- `trips` tham chiếu một tuyến và một phương tiện cùng loại; có lịch dừng `trip_stops`, giá `trip_fares` và ghế `trip_seats` riêng.
- `users` có nhiều `bookings`; mỗi booking có nhiều `booking_items`, mỗi item là một hành khách và một ghế.
- Một booking item có nhiều `seat_segment_allocations`, tương ứng các đoạn hành trình đã chọn.
- Một booking có nhiều `payment_attempts`; mỗi attempt có nhiều `payment_events`.
- Một booking item có tối đa một `tickets`; chỉ phát hành sau xác nhận thanh toán hợp lệ.

## Quy tắc cần thể hiện trong ERD và triển khai

1. `carriage_id` trống với ghế xe khách và bắt buộc với ghế tàu. `license_plate` áp dụng cho xe khách. Số ghế duy nhất trong một xe khách hoặc trong một toa tàu, không phải trên toàn đoàn tàu.
2. Thứ tự dừng duy nhất trong mỗi tuyến/chuyến. Điểm lên và xuống phải thuộc cùng chuyến; điểm lên đứng trước điểm xuống. Giá duy nhất theo chuyến, cặp điểm đi/đến và hạng ghế.
3. `trip_stops` là lịch của chuyến cụ thể, không tự thay đổi theo chỉnh sửa tuyến mẫu. Không sửa cấu trúc hành trình/ghế đã mở bán làm sai các đơn hiện có.
4. `trip_seats` duy nhất theo `(trip_id, vehicle_seat_id)`. Ghế, điểm dừng, booking item và allocation liên quan phải thuộc cùng chuyến; cần thiết kế FK/constraint kết hợp kiểm tra service để bảo đảm điều này.
5. Một đoạn bắt đầu tại `segment_start_trip_stop_id` và kết thúc ở điểm dừng kế tiếp. Không tạo đoạn bắt đầu ở điểm dừng cuối. Đặt A → C trên tuyến A → B → C phải giữ cả A → B và B → C trong cùng transaction.
6. Mỗi ghế/đoạn chỉ có một allocation hoạt động (`HELD` hoặc `BOOKED`). Thiết kế ràng buộc duy nhất cho các trạng thái hoạt động; chuyển giữ ghế hết hạn sang trạng thái giải phóng trong transaction trước khi cấp lại. Không dựa vào điều kiện thời gian tự động trong unique index.
7. Giữ ghế tạo booking nháp `PENDING_PAYMENT` và booking items để allocation có chủ sở hữu. Thông tin hành khách có thể được hoàn thiện trước thanh toán. Hạn giữ dùng thời gian server; các chi tiết nullability sẽ được chốt trong ERD.
8. Không đặt unique toàn cục trên `booking_items.trip_seat_id`: các booking hết hạn vẫn được lưu lịch sử, và cùng ghế được bán cho các hành trình không chồng lấn.
9. Email chuẩn hóa, mã booking, payment reference, ticket code và verification token phải duy nhất theo phạm vi tương ứng. Mã giao dịch nhà cung cấp duy nhất theo nhà cung cấp khi có giá trị; callback có khóa chống xử lý trùng.
10. Tiền tính tại backend; `booking_items.unit_price` lưu giá lúc mua. Callback phải xác minh chữ ký, mã đơn, số tiền và tiền tệ; callback lặp không cấp thêm vé. Thanh toán thành công nhưng không còn ghế phải chuyển sang đối soát, không phát hành vé sai.

## Kiểm thử nghiệm thu bắt buộc

- Tìm kiếm, chọn ghế, thanh toán sandbox và nhận vé cho cả BUS lẫn TRAIN.
- Hai khách đặt cùng ghế trên đoạn chồng lấn: chỉ một người thành công.
- Cùng ghế A → B và B → C: cả hai đơn được phép thành công.
- Yêu cầu nhiều đoạn bị xung đột ở một đoạn: không giữ dở các đoạn còn lại.
- Hết hạn giữ và callback thanh toán đến đồng thời: kết quả nhất quán, không bán trùng hoặc cấp vé sai.
- Giữ nguyên dữ liệu lịch sử khi đơn hết hạn; callback lặp không nhân đôi doanh thu/vé.

## Bước tiếp theo

Vẽ ERD từ migration V2, bao gồm các cột bổ sung cho khóa ngoại tổng hợp (`transport_type`, `vehicle_id`, `trip_id`, thứ tự điểm dừng và điểm cuối đoạn). Xem [hướng dẫn database](../../database/README.md) để phân biệt ràng buộc SQL với trách nhiệm của service. Tiếp theo triển khai entity và nghiệp vụ theo module. Migration không triển khai luồng đặt vé hoặc thanh toán.
