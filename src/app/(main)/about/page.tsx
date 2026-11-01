import type { Metadata } from "next";
import { AboutHero } from "../../components/about/AboutHero";
import { AboutMission, AboutStats, AboutTeam, AboutValues, AboutVerification } from "../../components/about/AboutSection";
import { ContactSection } from "../../components/about/ContactSection";
export const metadata: Metadata = {
  title: "Về chúng tôi | GiaSuHub",
  description: "GiaSuHub kết nối học viên với gia sư đã được xác minh. Tìm hiểu sứ mệnh, giá trị và quy trình xác minh của chúng tôi.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero  variant="organic"/>
        <AboutStats />
        <AboutMission />
        <AboutValues />
        <AboutVerification />
        <AboutTeam />
        <ContactSection />
    </>
  );
}
