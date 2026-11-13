# GiaSuHub — Nền tảng Kết nối Gia sư & Học viên Trực tuyến

**GiaSuHub** là hệ thống ứng dụng web hỗ trợ kết nối trực tiếp giữa Học viên (Student) và Gia sư (Tutor). Nền tảng cung cấp quy trình khép kín từ tìm kiếm gia sư theo nhiều tiêu chí, đặt lịch học trực tuyến hoặc tại nhà, quản lý tiến độ học tập, đánh giá chất lượng giảng dạy cho đến kiểm duyệt hồ sơ chuyên môn bởi Quản trị viên (Admin).

* **Bản triển khai trực tuyến (Production):** https://tutorlink-opal.vercel.app

---

## Tài khoản Kiểm thử (Demo Accounts)

Hệ thống cung cấp sẵn tài khoản quản trị để kiểm thử đầy đủ các luồng nghiệp vụ và phân quyền trên môi trường thực tế:

| Vai trò | Email | Mật khẩu | Phạm vi truy cập |
| :--- | :--- | :--- | :--- |
| Quản trị viên (Admin) | `admin@gmail.com` | `123456` | Khu vực quản trị (`/admin`), duyệt hồ sơ gia sư, quản lý người dùng |
| Học viên / Gia sư | *Đăng ký mới hoặc đăng nhập qua Google* | — | Tìm kiếm gia sư, đặt lịch học, quản lý hồ sơ giảng dạy và đánh giá |

---

## Chức năng Chính theo Phân quyền (RBAC)

### 1. Phân hệ Học viên (Student)
* **Tìm kiếm và lọc gia sư:** Lọc danh sách gia sư theo môn học, cấp lớp, mức học phí theo giờ, hình thức dạy (Online / Tại nhà), khu vực địa lý và trạng thái xác minh (`is_verified`).
* **Xem hồ sơ chi tiết gia sư:** Tra cứu thông tin học vấn, bằng cấp/chứng chỉ, kinh nghiệm giảng dạy, lịch trống và điểm đánh giá trung bình từ các học viên trước.
* **Đặt lịch học và theo dõi trạng thái:** Gửi yêu cầu nhận lớp đến gia sư và theo dõi trạng thái xử lý (`pending`, `accepted`, `rejected`, `completed`) tại `/dashboard/student`.
* **Đánh giá và phản hồi:** Chấm điểm từ 1–5 sao kèm nhận xét sau khi học. Hệ thống áp dụng ràng buộc `UNIQUE(student_id, tutor_id)` để ngăn chặn đánh giá trùng lặp.

### 2. Phân hệ Gia sư (Tutor)
* **Quản lý và xác minh hồ sơ chuyên môn:** Khai báo môn dạy, học phí, kinh nghiệm, chứng chỉ và gửi yêu cầu xét duyệt qua các trạng thái (`Draft` -> `Pending` -> `Approved`).
* **Quản lý lịch dạy và yêu cầu học:** Tiếp nhận, xác nhận hoặc từ chối yêu cầu đặt lịch từ học viên tại `/dashboard/tutor`.

### 3. Phân hệ Quản trị viên (Admin)
* **Kiểm duyệt hồ sơ gia sư:** Đối chiếu thông tin bằng cấp, chứng chỉ của gia sư đăng ký mới; phê duyệt (`Approved`) hoặc từ chối kèm lý do cụ thể (`rejection_reason`).
* **Quản trị hệ thống:** Theo dõi danh sách tài khoản, kiểm soát phân quyền người dùng và giám sát hoạt động toàn hệ thống tại `/admin`.

---

## Công nghệ Sử dụng

* **Framework:** Next.js (App Router, Server Components, Server Actions, Edge Middleware)
* **Ngôn ngữ:** TypeScript
* **Giao diện:** Tailwind CSS, Lucide Icons
* **Backend & Cơ sở dữ liệu (Supabase):**
  * **Supabase Auth:** Xác thực người dùng qua Email/Password và Google OAuth 2.0 (`@supabase/ssr`).
  * **PostgreSQL:** Thiết kế cơ sở dữ liệu quan hệ kết hợp các kiểu dữ liệu `JSONB`, `TEXT[]`, chỉ mục `GIN Index` tối ưu truy vấn tìm kiếm và `Database Triggers` bảo vệ tính toàn vẹn dữ liệu (`protect_profile_role`, `protect_tutor_status`).
  * **Row Level Security (RLS):** Phân quyền truy xuất dữ liệu trực tiếp ở tầng cơ sở dữ liệu theo từng vai trò (`student`, `tutor`, `admin`).
  * **Supabase Storage:** Lưu trữ ảnh đại diện và tài liệu, chứng chỉ xác minh của gia sư.
* **Triển khai (Deployment):** Vercel (cấu hình vùng máy chủ Singapore `sin1` nhằm giảm độ trễ phản hồi tại Việt Nam).

---

## Sơ đồ Cơ sở Dữ liệu (ERD)

Cơ sở dữ liệu được triển khai trên PostgreSQL với các bảng chính liên kết thông qua khóa ngoại và ràng buộc toàn vẹn:

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "1-1 (id)"
    PROFILES ||--o| TUTOR_PROFILES : "1-1 (user_id)"
    PROFILES ||--o{ BOOKINGS : "student_id"
    PROFILES ||--o{ BOOKINGS : "tutor_id"
    PROFILES ||--o{ REVIEWS : "student_id"
    PROFILES ||--o{ REVIEWS : "tutor_id"

    PROFILES {
        uuid id PK "FK -> auth.users(id)"
        text full_name
        text email
        text avatar_url
        text phone
        text role "student | tutor | admin"
        text province
        text district
        text address
        text gender
        text date_of_birth
        timestamptz created_at
    }

    TUTOR_PROFILES {
        uuid id PK
        uuid user_id UK "FK -> profiles(id)"
        text headline
        text bio
        text[] subjects
        text[] grades
        numeric hourly_rate
        boolean is_online
        integer experience_years
        text status "pending | approved | rejected"
        text verification_status "Draft | Pending | Approved | Rejected"
        boolean is_verified
        text school_name
        text[] teaching_modes
        jsonb subject_details
        jsonb experiences
        jsonb educations
        jsonb certificates_data
        jsonb schedules_data
        text rejection_reason
    }

    BOOKINGS {
        uuid id PK
        uuid student_id FK "FK -> profiles(id)"
        uuid tutor_id FK "FK -> profiles(id)"
        text subject
        text schedule
        text mode "online | offline"
        text status "pending | accepted | rejected | completed"
        text note
        timestamptz created_at
    }

    REVIEWS {
        uuid id PK
        uuid student_id FK "FK -> profiles(id)"
        uuid tutor_id FK "FK -> profiles(id)"
        integer rating "1..5"
        text comment
        timestamptz created_at
    }
