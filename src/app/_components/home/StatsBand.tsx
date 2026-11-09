import { Clock, ShieldCheck, Star, Users } from "lucide-react";
import { createClient } from "@/src/lib/supabase/server";

async function getStatsData() {
  const supabase = await createClient();

  // 1. Đếm tổng số gia sư đã duyệt (Approved)
  const { count: tutorCount } = await supabase
    .from("tutor_profiles")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "Approved");

  // 2. Lấy dữ liệu đánh giá từ bảng reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating");

  let avgRating = "5.0";
  if (reviews && reviews.length > 0) {
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    avgRating = (totalRating / reviews.length).toFixed(1);
  }

  // 3. Đếm tổng số gia sư đã xác minh (is_verified = true)
  const { count: verifiedCount } = await supabase
    .from("tutor_profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", true);

  const totalTutors = tutorCount || 0;
  const verifiedTutors = verifiedCount || 0;
  
  const verificationRate = totalTutors > 0 
    ? `${Math.round((verifiedTutors / totalTutors) * 100)}%` 
    : "100%";

  return [
    { 
      icon: Users, 
      value: totalTutors > 0 ? `${totalTutors.toLocaleString("vi-VN")}+` : "1.000+", 
      label: "Gia sư đã đăng ký" 
    },
    { 
      icon: Star, 
      value: `${avgRating}/5`, 
      label: "Đánh giá trung bình" 
    },
    { 
      icon: ShieldCheck, 
      value: verificationRate, 
      label: "Gia sư được xác minh" 
    },
    { 
      icon: Clock, 
      value: "24/7", 
      label: "Hỗ trợ người dùng" 
    },
  ];
}

export async function StatsBand() {
  const stats = await getStatsData();

  return (
    <section className="w-full bg-white py-6">
      {/* Khung lề ĐỒNG BỘ HOÀN TOÀN với Hero & FeaturedTutors */}
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        <dl className="grid gap-y-6 rounded-2xl bg-blue-50/70 border border-blue-100/60 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-blue-100">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center justify-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-100/80 text-blue-600">
                <Icon className="size-6" aria-hidden="true" />
              </div>
              <div>
                <dt className="sr-only">{label}</dt>
                <dd className="text-xl font-bold tracking-tight text-slate-900">{value}</dd>
                <dd className="text-xs font-medium text-slate-600">{label}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}