import type { Metadata } from "next";
import { Faq, type FaqItem } from "../../_components/tutor-onboarding/Faq";
import { TutorHero } from "../../_components/tutor-onboarding/TutorHero";
import {
  TutorBenefits,
  TutorDashboardPreview,
  TutorFinalCta,
  TutorProfilePreview,
  TutorSteps,
} from "../../_components/tutor-onboarding/TutorSection";
export const metadata: Metadata = {
  title: "Dành cho gia sư | GiaSuHub",
  description: "Tạo hồ sơ gia sư miễn phí, tự đặt học phí và nhận yêu cầu học từ học viên trên GiaSuHub.",
};

const TUTOR_FAQ: FaqItem[] = [
  { q: "Tạo hồ sơ gia sư có mất phí không?", a: "Tạo hồ sơ hoàn toàn miễn phí. Học phí do bạn và học viên tự thỏa thuận." },
  { q: "Hồ sơ của tôi được duyệt như thế nào?", a: "Quản trị viên sẽ xem xét thông tin bạn cung cấp và thông báo kết quả. Hồ sơ đầy đủ, trung thực sẽ thuận lợi hơn." },
  { q: "Tôi có thể sửa hồ sơ sau khi được duyệt không?", a: "Có. Một số thay đổi quan trọng có thể cần được duyệt lại để bảo đảm thông tin chính xác." },
  { q: "Tôi có thể từ chối yêu cầu học không?", a: "Có. Bạn toàn quyền chấp nhận hoặc từ chối từng yêu cầu học gửi đến." },
];

export default function BecomeTutorPage() {
  return (
    <main className="space-y-16 pb-16">
      <TutorHero />
      <TutorBenefits />
      <TutorSteps />
      <TutorProfilePreview />
      <TutorDashboardPreview />
      <Faq
        title="Câu hỏi của gia sư"
        description="Còn thắc mắc về việc đăng ký? Hãy liên hệ để được hỗ trợ."
        items={TUTOR_FAQ}
      />
      <TutorFinalCta />
    </main>
  );
}