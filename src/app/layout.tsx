import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const font = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://giasuhub.vn"),
  title: {
    default: "GiaSuHub - Kết nối gia sư và học viên uy tín",
    template: "%s | GiaSuHub",
  },
  description: "Nền tảng kết nối gia sư uy tín, giàu kinh nghiệm theo môn học, cấp học và khu vực.",
  keywords: ["gia sư", "tìm gia sư", "học kèm", "gia sư toán", "gia sư tiếng anh", "GiaSuHub"],
  authors: [{ name: "GiaSuHub Team" }],
  openGraph: {
    title: "GiaSuHub - Nền tảng kết nối gia sư chất lượng cao",
    description: "Tìm gia sư phù hợp chỉ với vài thao tác. Minh bạch thông tin, học phí linh hoạt.",
    url: "https://giasuhub.vn",
    siteName: "GiaSuHub",
    locale: "vi_VN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={font.variable}>
      <body className={`${font.className} bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}