# Đăng ký, đăng nhập và phân quyền

## Luồng và cấu trúc code

- `User` ánh xạ bảng `users`; `UserRepository` truy vấn bằng email.
- `AuthService` xử lý đăng ký, BCrypt, email trùng và thông tin tài khoản.
- `AuthenticationConfig` nối Spring Security với tài khoản trong PostgreSQL.
- `AuthController` nhận DTO hợp lệ, gọi service/AuthenticationManager và lưu session theo cơ chế Spring Security.
- `SecurityConfig` quản lý CORS, CSRF, cookie session, logout và quyền theo đường dẫn.
- Frontend: `authApi.ts` gọi API, `AuthProvider` giữ trạng thái phiên, `RequireAuth` bảo vệ trang; Login/Register chỉ xử lý form và điều hướng.

Không có JWT, token trong localStorage hoặc tài khoản quản trị mặc định. Mật khẩu không được trả về API. Không cần migration mới vì bảng users đã có trong V2.

## API

| Method | Endpoint | Quyền | Kết quả |
| --- | --- | --- | --- |
| GET | `/api/v1/auth/csrf` | Công khai | Header name và CSRF token |
| POST | `/api/v1/auth/register` | Công khai + CSRF | 201, tài khoản CUSTOMER; không tự đăng nhập |
| POST | `/api/v1/auth/login` | Công khai + CSRF | 200, thông tin tài khoản và session |
| GET | `/api/v1/auth/me` | Đã đăng nhập | Thông tin tài khoản hiện tại |
| POST | `/api/v1/auth/logout` | CSRF | 200, hủy session và xóa cookie |

Đăng ký nhận `fullName`, `email`, `password`, `phone` (không bắt buộc). Email được trim/lowercase, phải duy nhất; mật khẩu ít nhất 8 ký tự và tối đa 72 byte UTF-8 do giới hạn BCrypt. Trường role/status từ client không được dùng để tạo tài khoản. Đăng nhập nhận email/password. Không trim mật khẩu.

Lỗi: 400 dữ liệu không hợp lệ; 401 chưa đăng nhập hoặc sai thông tin; 403 sai quyền/CSRF; 409 email trùng. Các phản hồi ứng dụng dùng `{success,message,data}`.

## Session, CSRF và quyền

Browser gửi cookie `JSESSIONID` với HttpOnly và SameSite=Lax. Session hết hạn sau 30 phút không hoạt động. Local HTTP dùng `SESSION_COOKIE_SECURE=false`; môi trường HTTPS đặt true. Nên triển khai frontend/API cùng site. Local phải dùng cùng hostname `localhost`, không trộn với `127.0.0.1`.

Axios bật `withCredentials`; trước mỗi request thay đổi dữ liệu lấy CSRF mới từ `/auth/csrf` và gửi header được trả về. Login đổi session ID để chống session fixation và thay CSRF token. Logout do Spring Security xử lý, không có controller tự mô phỏng logout. Không tắt CSRF toàn cục. CORS chỉ chấp nhận origin được cấu hình.

| Đường dẫn | Quyền |
| --- | --- |
| `/api/v1/admin/**`, trang `/admin/**` | ADMIN |
| `/api/v1/customer/**`, trang `/my-bookings/**` | CUSTOMER |
| `/api/v1/auth/me` và API còn lại | Đã đăng nhập, trừ các endpoint public được liệt kê |

Các module CRUD/booking tương lai phải dùng đúng namespace và kiểm tra quyền sở hữu tại service. Route guard không thay thế quyền backend. Chưa có API nghiệp vụ admin/customer; các endpoint kiểm tra quyền trong test chỉ tồn tại trong test context.

## Tạo admin cho môi trường phát triển

1. Đăng ký tài khoản bằng giao diện với email bạn kiểm soát.
2. Đăng xuất tài khoản đó.
3. Trong database phát triển, người quản lý database chạy SQL sau, thay email bằng tài khoản thật cần cấp quyền:

```sql
UPDATE users
SET role = 'ADMIN', updated_at = CURRENT_TIMESTAMP
WHERE email = 'your-admin@example.com' AND status = 'ACTIVE';
```

4. Đăng nhập lại và mở `/admin`. Không tạo API công khai để tự nâng quyền.

Quyền nằm trong session ở thời điểm đăng nhập. Sau thay đổi role/status bằng SQL, cần hủy các phiên hiện có (ở môi trường phát triển có thể khởi động lại backend) và đăng nhập lại. Chưa có chức năng quản lý tài khoản/thu hồi tất cả phiên, quên mật khẩu, xác thực email hoặc giới hạn tốc độ đăng nhập; đây là công việc tiếp theo trước triển khai công khai.

## Kiểm thử

Backend: cấu hình ba biến `MIGRATION_TEST_DB_URL`, `MIGRATION_TEST_DB_USER`, `MIGRATION_TEST_DB_PASSWORD` theo [hướng dẫn test DB](../testing/database-migrations.md), rồi chạy `./mvnw.cmd test package`. Test auth tạo schema ngẫu nhiên riêng; Flyway tạo cấu trúc thật, Hibernate validate, không dùng H2. Nếu thiếu URL, test tích hợp được báo skipped.

Frontend: backend phải đang chạy trên DB kiểm thử. Không dùng DB production vì E2E tạo tài khoản thật trong DB kiểm thử.

```powershell
# Trong frontend
npm.cmd ci
npx.cmd playwright install chromium
$env:E2E_API_BASE_URL = 'http://localhost:8080/api/v1'
npm.cmd run test:e2e
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run format:check
npm.cmd run build
```

Playwright tự mở Vite ở localhost:5173 (cổng phải trống), chạy Chromium desktop và giả lập mobile. Nó kiểm tra đăng ký, email trùng, mật khẩu sai, đăng nhập, tải lại trang, cookie HttpOnly/SameSite, CUSTOMER bị chặn khỏi admin, đăng xuất, form lỗi và API lỗi/thử lại.

Nếu Windows báo `Unable to establish loopback connection` khi Tomcat khởi động, tạo thư mục tạm ngắn trong project và đặt đường dẫn socket JDK trước khi chạy backend:

```powershell
New-Item -ItemType Directory -Force .cache/tmp | Out-Null
$socketTemp = (Resolve-Path .cache/tmp).Path
$env:JAVA_TOOL_OPTIONS = '-Duser.timezone=UTC "-Djdk.net.unixdomain.tmpdir=' + $socketTemp + '"'
./scripts/start-backend.ps1
```

Đây là cấu hình môi trường Windows, không sửa security hay logic ứng dụng. Nếu đã có JAVA_TOOL_OPTIONS, giữ các tùy chọn cần thiết khi bổ sung hai tham số trên.

Tham khảo cơ chế nền tảng: [Spring Security session persistence](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html), [CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html).
