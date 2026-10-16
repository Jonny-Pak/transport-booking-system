# Kế hoạch triển khai đồ án

Tên đề tài: Quản lý dự án xây dựng hệ thống bán vé tàu xe trực tuyến tích hợp thanh toán tự động.

## 1. Cơ sở lập kế hoạch

Kế hoạch dự kiến cho một lập trình viên trong 6 tuần, khoảng 25–30 giờ/tuần, bao gồm code, kiểm thử và tài liệu. Đây là ước lượng cần cập nhật sau tuần đầu, không phải cam kết tiến độ. Nếu thời gian thực tế ít hơn, giảm phạm vi thay vì bỏ kiểm thử đặt ghế/thanh toán.

Qua kiểm tra mã nguồn: backend đã có Spring Boot, Security, JPA, Flyway, health API và kiểm thử MVC; frontend đã có React, TypeScript, Vite, các layout/trang và dữ liệu mẫu. Cập nhật: AuthContext đã kết nối đăng ký/đăng nhập/đăng xuất bằng session và phân quyền; các module đặt vé/thanh toán chưa được triển khai. Không cần khởi tạo lại dự án.

Kết quả build trước đây nằm trong [validation.md](../testing/validation.md). Kế hoạch này không xác nhận lại các kết quả đó. PostgreSQL/Flyway và kiểm tra giao diện trình duyệt cần được chạy thực tế theo checklist còn thiếu.

## 2. Công nghệ và phạm vi

- Giữ Java 21 + Spring Boot, PostgreSQL và Flyway cho backend.
- Giữ React + TypeScript + Vite cho frontend; Ant Design cho form/bảng/dialog, Tailwind cho bố cục và responsive.
- React Router điều hướng; Axios gọi API; TanStack Query quản lý dữ liệu máy chủ; Context chỉ giữ trạng thái đăng nhập; React Hook Form + Zod xác thực form.
- Kiến trúc modular monolith, một backend và một database, frontend riêng trong cùng repository. Chưa cần thêm Redux hay microservice.
- MVP: cả xe khách và tàu hỏa, toa tàu, điểm dừng và đặt ghế theo chặng, hai vai trò CUSTOMER/ADMIN, chuyến đi một chiều, ghế cố định, một loại tiền VND, một cổng thanh toán sandbox.
- Sau MVP: nối chuyến, thay đổi thành phần đoàn tàu sau mở bán, vé khứ hồi, khuyến mãi, hoàn tiền tự động, nhiều nhà xe, nhiều cổng thanh toán.

Đã chốt cả xe khách và tàu hỏa trong MVP với 17 bảng nghiệp vụ. Lịch 6 tuần là mục tiêu ban đầu cần ước lượng lại sau ERD chi tiết; không loại bỏ tàu để rút ngắn tiến độ. Ưu tiên giảm báo cáo nâng cao và hủy/hoàn tiền tự động nếu thiếu thời gian.

Tài liệu tham khảo: [React với Vite/TypeScript](https://react.dev/learn/build-a-react-app-from-scratch), [Vite](https://vite.dev/guide/), [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/reference). Giữ lockfile hiện tại; không nâng phiên bản chỉ để chạy theo bản mới.

## 3. Tiến độ và sản phẩm nghiệm thu

| Tuần | Công việc backend | Công việc frontend | Mốc nghiệm thu và tài liệu |
| --- | --- | --- | --- |
| 1 | Kiểm tra DB/Flyway; chốt ERD, API, auth; đăng ký/đăng nhập/đăng xuất, phân quyền | Nối Login/Register vào API; phiên đăng nhập và route guard | Đăng nhập thật; 401/403 đúng; charter, phạm vi, WBS, ERD, backlog có tiêu chí |
| 2 | CRUD ga/bến, tuyến, xe/tàu, toa, ghế; lịch dừng và giá theo điểm đi/đến; chặn lịch xe trùng; API tìm chuyến | Trang quản trị tuyến/xe/chuyến; tìm kiếm và chi tiết bằng dữ liệu DB | Admin tạo chuyến và khách tìm thấy; test dữ liệu sai và quyền truy cập; demo sprint |
| 3 | Ghế theo chuyến và đoạn; giữ toàn bộ các đoạn nguyên tử, có hạn; booking và hành khách; tính tiền tại server | Sơ đồ ghế xe/toa tàu, chọn điểm lên/xuống, form hành khách, tóm tắt đơn, đếm ngược theo hạn server | Ghế trên đoạn chồng lấn chỉ một người đặt được; đoạn liền kề được bán độc lập; hết hạn giải phóng ghế; báo cáo tiến độ/rủi ro |
| 4 | Tạo yêu cầu thanh toán sandbox; xác minh callback; chống xử lý lặp; phát hành vé | Chuyển tới sandbox, trang trạng thái thanh toán, lịch sử và chi tiết vé | Luồng đặt vé → thanh toán sandbox → vé; callback giả/lặp không phát hành sai; bằng chứng kiểm thử |
| 5 | Danh sách booking admin, tổng doanh thu đơn giản; đối soát giao dịch treo; tích hợp PostgreSQL | Bộ lọc admin, trạng thái rỗng/lỗi, responsive; hoàn thiện luồng khách | Kiểm thử tích hợp và end-to-end; doanh thu từ giao dịch đã xác nhận; xử lý lỗi nghiêm trọng |
| 6 | Sửa lỗi, cấu hình môi trường demo, kiểm tra migration từ DB trống | Kiểm tra trình duyệt/điện thoại, thông báo dễ hiểu | Bản demo ổn định; báo cáo, slide, hướng dẫn, nghiệm thu và retrospective |

Mỗi tuần dự trù 18–21 giờ triển khai, 4–5 giờ kiểm thử/tài liệu và 3–4 giờ dự phòng. Nếu quá tải, giảm phạm vi thống kê/hủy vé trước. Không tính cả khung giao diện là chức năng đã hoàn thành.

Nếu chỉ có 4 tuần: giữ luồng chính của tuần 1–4; dành thời gian kiểm thử/tài liệu ngay mỗi tuần; giảm giao diện quản trị nâng cao, báo cáo doanh thu và hủy vé. Cần đánh giá lại năng lực sau tuần 1; không mặc định cùng phạm vi 6 tuần sẽ hoàn thành trong 4 tuần.

## 4. Thứ tự code trong từng chức năng

1. Viết user story, điều kiện nghiệm thu và hợp đồng API/DTO.
2. Thiết kế bảng/constraint; review ERD rồi mới thêm Flyway migration. Không sửa migration đã chạy.
3. Viết entity/repository, service với transaction và kiểm tra quyền, controller mỏng.
4. Viết kiểm thử nghiệp vụ và API cho thành công, lỗi dữ liệu, quyền truy cập.
5. Viết API client/hook và UI; thay dữ liệu mẫu bằng API của chức năng đó.
6. Kiểm tra loading/error/empty state; chạy typecheck, lint, build và Maven test/package.
7. Demo theo tiêu chí, cập nhật backlog, ghi nhận thời gian thực tế và commit theo chức năng.

Backend giữ module `auth`, `user`, `route`, `vehicle`, `trip`, `booking`, `payment`, `ticket`. Frontend thêm thư mục feature khi có chức năng thật. Không đưa quy tắc tính giá, xác nhận tiền hay cấp vé vào component React.

## 5. Các quyết định phải chốt trước khi code nghiệp vụ

### Dữ liệu và xác thực

Đã chốt [17 bảng nghiệp vụ](../design/database-design.md) cho cả BUS và TRAIN; thông tin hành khách nằm trong booking_items, không có bảng booking_passengers riêng. Danh sách bảng đã được duyệt; ERD/DDL chi tiết chưa triển khai. Quy định khóa duy nhất, khóa ngoại, chỉ mục, timezone, VND và chính sách lưu thông tin hành khách trước migration V2.

Đề xuất cho ứng dụng web một backend: Spring Security session với cookie HttpOnly, CSRF và BCrypt; production dùng HTTPS/Secure cookie. Khi triển khai cần cấu hình credentials/CORS cho origin cụ thể và cơ chế gửi CSRF token. Không tự thêm JWT vào giai đoạn khởi tạo. Backend phải kiểm tra ADMIN và quyền sở hữu booking; route guard chỉ phục vụ UX. Tài khoản quản trị không được tạo qua đăng ký công khai.

### Ghế và booking

- Dự kiến giữ ghế 10 phút, cần chốt theo quy trình thanh toán sandbox.
- Một trip_seat duy nhất cho `(trip_id, vehicle_seat_id)`; seat_segment_allocations quản lý giữ/đặt trên từng đoạn. Cấp toàn bộ các đoạn bằng khóa/ràng buộc trong cùng transaction. Không chỉ kiểm tra ghế trống ở frontend.
- Trạng thái dự kiến: booking `PENDING_PAYMENT → CONFIRMED / EXPIRED / CANCELLED`; allocation theo đoạn `HELD → BOOKED` hoặc giải phóng khi hết hạn/hủy; ghế trống được tính theo các đoạn được yêu cầu.
- Server quyết định giá và hạn giữ; lưu giá tại thời điểm đặt. Client không được tự quyết định số tiền.
- Kiểm thử cạnh tranh đồng thời, retry tạo đơn, hết hạn, truy cập đơn người khác; dùng PostgreSQL thật cho kiểm thử constraint/locking.

### Thanh toán tự động

- Chọn một nhà cung cấp có sandbox và đăng ký quyền truy cập ngay tuần 1; kiểm tra tài liệu tích hợp chính thức khi lựa chọn.
- Mỗi lần thử thanh toán có định danh riêng. Xác minh chữ ký, mã đơn, số tiền, đơn vị tiền và trạng thái trước cập nhật.
- Callback hợp lệ được xử lý idempotent; xác nhận booking/cấp vé đúng một lần trong transaction phù hợp. Trang redirect của trình duyệt chỉ hiển thị trạng thái lấy từ server.
- Phải chốt xử lý tiền về sau khi giữ ghế hết hạn: nếu ghế đã cấp cho người khác, đánh dấu cần đối soát/hoàn tiền thủ công, không tự xác nhận vé. Lưu dấu vết giao dịch.
- Thiết kế xử lý callback lặp, đến sai thứ tự, sai chữ ký, mất callback và timeout; có cơ chế truy vấn trạng thái theo khả năng nhà cung cấp.
- Nếu chưa có sandbox, có thể dùng adapter mô phỏng được ghi rõ để phát triển/kiểm thử; không đánh dấu tích hợp thanh toán tự động hoàn thành.

## 6. Quản lý dự án và bằng chứng môn học

Theo dõi bằng GitHub Issues/Projects hoặc bảng công việc tương đương: Backlog → Ready → In progress → Review/Test → Done. Với một người, chỉ làm một chức năng chính tại một thời điểm. Dùng ID trong [backlog.md](backlog.md) để liên kết công việc, commit và test case.

| Sản phẩm quản lý | Nội dung cần có | Thời điểm |
| --- | --- | --- |
| Project charter và phạm vi | Mục tiêu, bên liên quan, giả định, phạm vi trong/ngoài, tiêu chí thành công | Tuần 1 |
| WBS và lịch | Công việc nhỏ, phụ thuộc, ước lượng giờ, mốc demo | Tuần 1; cập nhật hằng tuần |
| Sổ rủi ro | Xác suất/ảnh hưởng, người phụ trách, biện pháp, dấu hiệu kích hoạt | Mỗi tuần |
| Báo cáo tiến độ | Kế hoạch so với thực tế, phần hoàn thành, lỗi, điều chỉnh tuần sau | Cuối mỗi tuần |
| Nhật ký thay đổi | Yêu cầu mới, lý do, ảnh hưởng thời gian/phạm vi, quyết định | Khi có thay đổi |
| Ma trận truy vết | User story → API/UI → test case → kết quả/bằng chứng | Từ tuần 1 |
| Nghiệm thu và tổng kết | Demo, kết quả kiểm thử, hạn chế, bài học kinh nghiệm | Tuần cuối |

Rủi ro ưu tiên: thiếu sandbox (đăng ký sớm), trùng ghế (transaction + test đồng thời), callback sai/lặp (xác minh + idempotency), thiếu môi trường DB (xác minh tuần 1), độ phức tạp toa/chặng (cố định thành phần đoàn tàu, không nối chuyến), thiếu thời gian (giảm P1). Đối chiếu biểu mẫu/rubric môn học trước khi hoàn thiện báo cáo.

## 7. Definition of Done

- Đạt tiêu chí user story và chạy được với dữ liệu từ PostgreSQL.
- Kiểm tra input, vai trò/quyền sở hữu ở backend; không lộ secret hoặc dữ liệu người khác.
- Có test phù hợp và bằng chứng kết quả; booking/payment có cả tình huống đồng thời/lặp/thất bại.
- Frontend có trạng thái loading/error/empty, dùng tiếng Việt, kiểm tra mobile.
- Typecheck/lint/build và backend test/package thực sự chạy thành công; ghi rõ blocker nếu chưa chạy được.
- Migration, Swagger, hướng dẫn demo và backlog được cập nhật. Không đánh dấu Done dựa trên mock UI.

## 8. Công việc tiếp theo ngay sau kế hoạch

1. Xác nhận thời hạn, số giờ mỗi tuần và yêu cầu nghiệm thu sandbox; cả tàu và xe khách đã được xác nhận trong phạm vi.
2. Chạy PostgreSQL, backend và frontend cùng nhau; ghi nhận Flyway/health thực tế.
3. Soạn ERD và sơ đồ trạng thái booking/payment để review trước V2.
4. Chốt session auth, API đăng ký/đăng nhập/đăng xuất/me và ma trận phân quyền.
5. Triển khai US-01 từ migration đến UI và kiểm thử, sau đó US-02/US-03.
