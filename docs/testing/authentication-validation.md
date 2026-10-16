# Kết quả kiểm thử xác thực — 14/10/2026

## Kết quả cuối cùng

| Kiểm tra | Kết quả thực tế |
| --- | --- |
| Maven `test package` trên Java 21 | Đạt, tạo executable JAR |
| Backend | 14 tests, 0 failures/errors/skips: 7 auth + 1 migration + 6 health/security |
| PostgreSQL | Test trên PostgreSQL 17.11 riêng; Flyway V1/V2 và Hibernate validate chạy thành công |
| Playwright Chromium desktop/mobile | 6 tests đạt, không mock API trong luồng đăng ký/đăng nhập |
| Frontend typecheck, lint, format:check, build | Tất cả đạt sau sửa lỗi |
| `npm ls --all` | Exit 0, không có dependency invalid/missing |
| Cài Playwright | Thành công; npm audit báo 0 vulnerabilities tại thời điểm cài |
| Docker Compose `config --quiet` | Đạt, dùng biến mật khẩu kiểm tra tạm |
| HTTP health của backend chạy từ JAR | Trả success=true trên cổng kiểm thử 18080 |
| `git diff --check` | Đạt; Git chỉ cảnh báo chuyển LF/CRLF |

Auth integration kiểm tra email chuẩn hóa/trùng, bỏ qua role/status do client gửi, BCrypt hash, dữ liệu sai và giới hạn 72 byte, sai mật khẩu/tài khoản khóa, session fixation, CSRF trước/sau login, logout, quyền CUSTOMER/ADMIN và CORS. Các endpoint probe phân quyền chỉ tồn tại trong test.

Playwright kiểm tra form đăng ký, email trùng, sai mật khẩu, đăng nhập thành công, tải lại trang vẫn có phiên, cookie HttpOnly/SameSite, CUSTOMER bị chặn khỏi admin, logout và chuyển khách chưa đăng nhập tới login, lỗi xác thực form, không tràn ngang và API lỗi/thử lại.

## Lỗi đã xử lý khi chạy thực tế

- Windows JDK không mở được Unix-domain loopback ở đường dẫn TEMP của môi trường: chạy với `-Djdk.net.unixdomain.tmpdir` trỏ vào `.cache/tmp` đã khắc phục. Dùng timezone UTC để tránh alias Asia/Saigon bị PostgreSQL từ chối.
- Xóa toàn bộ QueryClient làm observer auth giữ trạng thái cũ sau login: giữ query auth, chỉ xóa cache nghiệp vụ khi đổi tài khoản và cập nhật auth trực tiếp.
- Form không hợp lệ để lại trạng thái loading trong luồng kiểm thử: quản lý trạng thái gửi API bằng `try/finally`, tách khỏi trạng thái validation của React Hook Form.
- Bổ sung DOM types cho test trình duyệt và fallback khi router tải trang.

## Phạm vi và cách chạy lại

Xem [hướng dẫn authentication](../design/authentication.md). Database test dùng schema ngẫu nhiên và tự dọn; browser test dùng container PostgreSQL tạm không gắn volume ứng dụng. Không sửa tài khoản hoặc database phát triển của người dùng. Các tiến trình/container kiểm thử được dừng sau khi hoàn tất.

Không có kiểm thử Safari/Firefox, HTTPS deployment, thanh toán hay nghiệp vụ đặt vé trong lượt này. Quyền session có hiệu lực theo thời điểm login; thu hồi hàng loạt phiên, rate limiting và khôi phục mật khẩu chưa triển khai. Cảnh báo Mockito dynamic-agent/Node FORCE_COLOR không làm test thất bại.
