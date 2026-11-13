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

## Cấu trúc Cơ sở Dữ liệu

Hệ thống triển khai trên PostgreSQL (Supabase) gồm 8 bảng dữ liệu chính, được bảo vệ bằng Row Level Security (RLS) và các Database Triggers chống leo thang đặc quyền (`protect_profile_role`, `protect_tutor_status`):

### 1. Bảng `profiles`
| Tên cột | Kiểu dữ liệu | Ràng buộc |
| :--- | :--- | :--- |
| `id` | `uuid` | `PK, FK -> auth.users(id)` |
| `full_name` | `text` | `NOT NULL` |
| `email` | `text` | `NOT NULL` |
| `avatar_url` | `text` | `NULL` |
| `phone` | `text` | `NULL` |
| `role` | `text` | `DEFAULT 'student', CHECK ('student', 'tutor', 'admin')` |
| `status` | `text` | `DEFAULT 'active', CHECK ('active', 'blocked', 'pending')` |
| `province` | `text` | `NULL` |
| `district` | `text` | `NULL` |
| `address` | `text` | `NULL` |
| `gender` | `text` | `NULL` |
| `date_of_birth` | `text` | `NULL` |
| `hometown` | `text` | `NULL` |
| `created_at` | `timestamptz` | `DEFAULT now()` |
| `updated_at` | `timestamptz` | `DEFAULT now()` |

### 2. Bảng `tutor_profiles`
| Tên cột | Kiểu dữ liệu | Ràng buộc |
| :--- | :--- | :--- |
| `id` | `uuid` | `PK, DEFAULT gen_random_uuid()` |
| `user_id` | `uuid` | `UNIQUE, NOT NULL, FK -> profiles(id)` |
| `bio` | `text` | `NULL` |
| `headline` | `text` | `NULL` |
| `quote` | `text` | `NULL` |
| `subjects` | `text[]` | `DEFAULT '{}', GIN INDEX` |
| `grades` | `text[]` | `DEFAULT '{}'` |
| `hourly_rate` | `numeric` | `DEFAULT 0, BTREE INDEX` |
| `address` | `text` | `NULL` |
| `is_online` | `boolean` | `DEFAULT true` |
| `experience_years` | `integer` | `DEFAULT 0` |
| `status` | `text` | `DEFAULT 'pending', CHECK ('pending', 'approved', 'rejected')` |
| `verification_status` | `text` | `DEFAULT 'Draft', CHECK ('Draft', 'Pending', 'Approved', 'Rejected')` |
| `is_verified` | `boolean` | `DEFAULT false, BTREE INDEX` |
| `is_completed` | `boolean` | `DEFAULT false` |
| `rejection_reason` | `text` | `NULL` |
| `school_name` | `text` | `NULL` |
| `education` | `text` | `NULL` |
| `teaching_modes` | `text[]` | `DEFAULT '{}'` |
| `teaching_areas` | `text[]` | `DEFAULT '{}'` |
| `achievements` | `text[]` | `DEFAULT '{}'` |
| `skills` | `text[]` | `DEFAULT '{}'` |
| `schedules` | `text[]` | `DEFAULT '{}'` |
| `certificates` | `text[]` | `DEFAULT '{}'` |
| `total_lessons_taught` | `integer` | `DEFAULT 0` |
| `subject_details` | `jsonb` | `DEFAULT '[]'` |
| `experiences` | `jsonb` | `DEFAULT '[]'` |
| `educations` | `jsonb` | `DEFAULT '[]'` |
| `certificates_data` | `jsonb` | `DEFAULT '[]'` |
| `schedules_data` | `jsonb` | `DEFAULT '[]'` |
| `created_at` | `timestamptz` | `DEFAULT now()` |
| `updated_at` | `timestamptz` | `DEFAULT now()` |

### 3. Bảng `booking_requests`
| Tên cột | Kiểu dữ liệu | Ràng buộc |
| :--- | :--- | :--- |
| `id` | `uuid` | `PK, DEFAULT gen_random_uuid()` |
| `student_id` | `uuid` | `NOT NULL, FK -> profiles(id)` |
| `tutor_id` | `uuid` | `NOT NULL, FK -> profiles(id)` |
| `subject` | `text` | `NOT NULL` |
| `message` | `text` | `NULL` |
| `contact_phone` | `text` | `NOT NULL` |
| `schedule_slot_id` | `text` | `NULL` |
| `lesson_date` | `date` | `NULL` |
| `status` | `text` | `DEFAULT 'Pending', CHECK ('Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed')` |
| `lesson_status` | `text` | `DEFAULT 'Pending', CHECK ('Pending', 'Completed', 'Cancelled')` |
| `rejection_reason` | `text` | `NULL` |
| `is_paid` | `boolean` | `DEFAULT false` |
| `paid_at` | `timestamptz` | `NULL` |
| `created_at` | `timestamptz` | `DEFAULT now()` |
| `updated_at` | `timestamptz` | `DEFAULT now()` |

### 4. Bảng `lessons`
| Tên cột | Kiểu dữ liệu | Ràng buộc |
| :--- | :--- | :--- |
| `id` | `uuid` | `PK, DEFAULT gen_random_uuid()` |
| `booking_id` | `uuid` | `NOT NULL, FK -> booking_requests(id)` |
| `tutor_id` | `uuid` | `NOT NULL, FK -> profiles(id)` |
| `student_id` | `uuid` | `NOT NULL, FK -> profiles(id)` |
| `subject` | `text` | `NOT NULL` |
| `lesson_date` | `date` | `NOT NULL` |
| `start_time` | `time` | `NULL` |
| `end_time` | `time` | `NULL` |
| `schedule_text` | `text` | `NULL` |
| `status` | `text` | `DEFAULT 'Scheduled'` |
| `is_paid` | `boolean` | `DEFAULT false` |
| `created_at` | `timestamptz` | `DEFAULT now()` |

### 5. Bảng `certificate_requests`
| Tên cột | Kiểu dữ liệu | Ràng buộc |
| :--- | :--- | :--- |
| `id` | `uuid` | `PK, DEFAULT gen_random_uuid()` |
| `tutor_id` | `uuid` | `NOT NULL, FK -> tutor_profiles(user_id)` |
| `certificate_url` | `text` | `NOT NULL` |
| `title` | `text` | `NULL` |
| `issued_by` | `text` | `NULL` |
| `issue_year` | `text` | `NULL` |
| `detail` | `text` | `NULL` |
| `status` | `text` | `DEFAULT 'Pending', CHECK ('Pending', 'Approved', 'Rejected')` |
| `rejection_reason` | `text` | `NULL` |
| `created_at` | `timestamptz` | `DEFAULT timezone('utc', now())` |

### 6. Bảng `reviews`
| Tên cột | Kiểu dữ liệu | Ràng buộc |
| :--- | :--- | :--- |
| `id` | `uuid` | `PK, DEFAULT gen_random_uuid()` |
| `student_id` | `uuid` | `NOT NULL, UNIQUE(student_id, tutor_id), FK -> profiles(id)` |
| `tutor_id` | `uuid` | `NOT NULL, UNIQUE(student_id, tutor_id), FK -> profiles(id)` |
| `rating` | `integer` | `NOT NULL, CHECK (1 <= rating <= 5)` |
| `comment` | `text` | `NULL` |
| `created_at` | `timestamptz` | `DEFAULT now()` |

### 7. Bảng `saved_tutors`
| Tên cột | Kiểu dữ liệu | Ràng buộc |
| :--- | :--- | :--- |
| `id` | `uuid` | `PK, DEFAULT gen_random_uuid()` |
| `student_id` | `uuid` | `NOT NULL, UNIQUE(student_id, tutor_id), FK -> profiles(id)` |
| `tutor_id` | `uuid` | `NOT NULL, UNIQUE(student_id, tutor_id), FK -> profiles(id)` |
| `created_at` | `timestamptz` | `DEFAULT now()` |

### 8. Bảng `contact_messages`
| Tên cột | Kiểu dữ liệu | Ràng buộc |
| :--- | :--- | :--- |
| `id` | `uuid` | `PK, DEFAULT gen_random_uuid()` |
| `user_id` | `uuid` | `NULL, FK -> profiles(id) ON DELETE SET NULL` |
| `name` | `text` | `NOT NULL` |
| `email` | `text` | `NOT NULL` |
| `subject` | `text` | `NOT NULL` |
| `message` | `text` | `NOT NULL` |
| `status` | `text` | `DEFAULT 'pending', CHECK ('pending', 'processing', 'resolved', 'archived')` |
| `created_at` | `timestamptz` | `DEFAULT timezone('utc', now())` |
