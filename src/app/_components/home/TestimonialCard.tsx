'use client';

import Image from "next/image";
import {
  GraduationCap,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";

// 1. Định nghĩa kiểu dữ liệu (TypeScript Interfaces & Types)
export type ReviewTheme = "blue" | "green" | "orange";

export interface ReviewItem {
  id: number;
  image: string;
  content: string;
  name: string;
  school: string;
  theme: ReviewTheme;
}

export interface TestimonialCardProps {
  review: ReviewItem;
}

// 2. Dữ liệu mẫu
const reviews: ReviewItem[] = [
  {
    id: 1,
    image: "/images/stu/stu1.jpg",
    content:
      "Giảng viên dạy siêu dễ hiểu, mình thấy tự tin hơn hẳn chỉ sau một tháng học. Việc chọn gia sư qua hệ số rõ ràng thế này làm mình cực kỳ yên tâm.",
    name: "Học sinh lớp 10",
    school: "THPT, Hà Nội",
    theme: "blue",
  },
  {
    id: 2,
    image: "/images/stu/stu2.jpg",
    content:
      "Mình tìm được thầy dạy Tiếng Anh đúng giờ, mình rảnh, học online rất tiện và có lộ trình ôn thi cụ thể.",
    name: "Học sinh lớp 12",
    school: "THPT, Đà Nẵng",
    theme: "green",
  },
  {
    id: 3,
    image: "/images/stu/stu3.jpg",
    content:
      "Mình học thêm Toán cao cấp với một anh khóa trên. Tìm theo môn và khu vực nên liên hệ rất nhanh.",
    name: "Sinh viên năm hai",
    school: "Đại học Bách Khoa, TP.HCM",
    theme: "orange",
  },
];

// 3. Mapping kiểu dáng giao diện theo theme
const themeStyles: Record<
  ReviewTheme,
  { blob: string; decoration: string; avatar: string; quote: string }
> = {
  blue: {
    blob: "bg-blue-100",
    decoration: "text-blue-500",
    avatar: "bg-blue-100",
    quote: "text-blue-200/60",
  },
  green: {
    blob: "bg-green-100",
    decoration: "text-green-500",
    avatar: "bg-green-100",
    quote: "text-green-200/60",
  },
  orange: {
    blob: "bg-orange-100",
    decoration: "text-orange-500",
    avatar: "bg-orange-100",
    quote: "text-orange-200/60",
  },
};

// 4. Sub-component TestimonialCard
function TestimonialCard({ review }: TestimonialCardProps) {
  const theme = themeStyles[review.theme] || themeStyles.blue;

  return (
    <article className="group relative flex flex-col sm:flex-row items-center gap-6 rounded-[30px] border border-white bg-white/90 p-6 shadow-[0_12px_35px_rgba(64,105,165,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(64,105,165,0.15)]">
      {/* Student image */}
      <div className="relative h-[200px] w-full sm:h-[220px] sm:w-[160px] shrink-0">
        <div
          className={`absolute inset-0 scale-105 rotate-[-8deg] rounded-[40%_45%_35%_45%] ${theme.blob}`}
        />

        <Image
          src={review.image}
          alt={review.name}
          fill
          sizes="(max-width: 640px) 100vw, 160px"
          className="relative rounded-[40%_18%_35%_20%] object-cover object-top"
        />

        <Sparkles
          size={24}
          className={`absolute -left-2 -top-2 ${theme.decoration}`}
        />
      </div>

      {/* Review content */}
      <div className="relative min-w-0 flex-1 w-full">
        {/* Rating Stars */}
        <div className="mb-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={20}
              className="fill-amber-400 text-amber-400"
            />
          ))}
        </div>

        {/* Review text */}
        <p className="mb-5 text-[14px] sm:text-[15px] leading-[1.7] text-slate-600">
          {`"${review.content}"`}
        </p>

        {/* Author info */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <div
            className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm ${theme.avatar}`}
          >
            <Image
              src={review.image}
              alt={review.name}
              fill
              sizes="44px"
              className="object-cover object-top"
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-5 text-[#19345F] truncate">
              {review.name}
            </h3>

            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400 truncate">
              <GraduationCap size={15} className="shrink-0" />
              <span className="truncate">{review.school}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Quote mark */}
      <Quote
        size={36}
        className={`absolute right-4 top-4 fill-current pointer-events-none ${theme.quote}`}
      />
    </article>
  );
}

// 5. Component chính với Bleed Background 100% Full-width
export default function TestimonialSection() {
  return (
    /* LỚP NỀN TRÀN VIỀN (Bleed Background): w-full + bg-gradient phủ 100% chiều ngang màn hình */
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#F2F7FF] via-white to-[#F3F8FF] py-14 md:py-20">
      
      {/* Background decorations */}
      <div className="absolute left-[4%] top-12 hidden -rotate-6 font-serif text-base font-semibold italic leading-6 text-indigo-500 lg:block select-none pointer-events-none">
        Real Student
        <br />
        Real Experience
        <div className="mt-1.5 h-[2px] w-36 rotate-[-4deg] rounded-full bg-indigo-400" />
      </div>

      <GraduationCap
        size={58}
        strokeWidth={1.5}
        className="absolute right-[5%] top-10 hidden -rotate-6 text-indigo-400/80 lg:block select-none pointer-events-none"
      />

      {/* LỚP NỘI DUNG ĐÓNG KHUNG (Constrained Content): Căn giữa chuẩn lề đồng bộ max-w-[1920px] */}
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        
        {/* Section Header */}
        <div className="relative mx-auto mb-10 max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <Sparkles className="hidden text-amber-400 sm:block" size={28} />

            <h2 className="text-2xl font-extrabold tracking-tight text-[#19345F] sm:text-3xl md:text-4xl">
              Học viên nói gì về GiaSuHub
            </h2>

            <Sparkles className="hidden text-amber-400 sm:block" size={28} />
          </div>

          <div className="mx-auto mt-3 h-1.5 w-48 -rotate-1 rounded-full bg-amber-400" />

          <p className="mt-4 text-sm leading-6 text-slate-500 md:text-base">
            Những chia sẻ chân thật từ các bạn học viên đã và đang đồng hành cùng GiaSuHub.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {reviews.map((review) => (
            <TestimonialCard key={review.id} review={review} />
          ))}
        </div>

      </div>
    </section>
  );
}