'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  GraduationCap, Menu, Search, Bell, LogOut, User, Send, 
  Bookmark, Star, Settings 
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { logout } from "@/src/modules/auth/actions/auth";
import { RequestedTutorsModal, RequestedTutor } from "../student/RequestedTutorsModal";

const NAV_ITEMS = [
  { href: "/", label: "Trang chủ" },
  { href: "/tutors", label: "Tìm gia sư" },
  { href: "/tutor-onboarding", label: "Dành cho gia sư", roleHide: "student" },
  { href: "/about", label: "Về chúng tôi" },
];

type RawBookingRequest = {
  id: string;
  tutor_id: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed';
  created_at: string;
  subject: string;
  tutor?: {
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

function getInitials(name?: string): string {
  if (!name) return "HV";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function Header() {
  const pathname = usePathname();
  const supabase = createClient();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"student" | "tutor" | "admin" | null>(null);
  const [userInitials, setUserInitials] = useState("HV");
  const [userName, setUserName] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestsList, setRequestsList] = useState<RequestedTutor[]>([]);

  const closeDropdowns = () => {
    const openDetails = document.querySelectorAll("details[open]");
    openDetails.forEach((detail) => detail.removeAttribute("open"));
  };

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setIsLoggedIn(true);
        const fullName = user.user_metadata?.full_name || user.email || "";
        setUserName(fullName);
        setUserInitials(getInitials(fullName));
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role || "student");
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    }

    getUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        const fullName = session.user.user_metadata?.full_name || session.user.email || "";
        setUserName(fullName);
        setUserInitials(getInitials(fullName));

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUserRole(profile?.role || "student");
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleOpenRequestsModal = async () => {
    closeDropdowns();
    setIsModalOpen(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: requestsData } = await supabase
      .from('booking_requests')
      .select(`
        id,
        tutor_id,
        status,
        created_at,
        subject,
        tutor:profiles!booking_requests_tutor_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('student_id', user.id);

    if (requestsData) {
      const rawData = requestsData as unknown as RawBookingRequest[];
      const tutorIds = rawData.map(r => r.tutor_id);

      const { data: tutorProfilesData } = await supabase
        .from('tutor_profiles')
        .select('user_id, hourly_rate')
        .in('user_id', tutorIds);

      const rateMap = new Map<string, number>();
      if (tutorProfilesData) {
        tutorProfilesData.forEach((tp) => {
          rateMap.set(tp.user_id, Number(tp.hourly_rate) || 0);
        });
      }

      const formatted: RequestedTutor[] = rawData.map((item) => ({
        id: item.id,
        tutor_user_id: item.tutor_id, 
        tutor_name: item.tutor?.full_name || "Gia sư",
        tutor_avatar: item.tutor?.avatar_url || null,
        subject: item.subject || "Chưa xác định",
        grade: "Lớp học",
        status: (item.status === 'Accepted' || item.status === 'Completed') 
          ? 'accepted' 
          : item.status === 'Rejected' 
          ? 'rejected' 
          : 'pending',
        created_at: item.created_at,
        hourly_rate: rateMap.get(item.tutor_id) || 0, 
      }));

      setRequestsList(formatted);
    }
  };

  const filteredNavLinks = NAV_ITEMS.filter((item) => {
    if (isLoggedIn && userRole === "student" && item.roleHide === "student") {
      return false;
    }
    return true;
  });

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
          
          {/* LOGO & TAGLINE */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              onClick={closeDropdowns}
              className="flex items-center gap-2.5 text-xl font-extrabold text-blue-700 transition-opacity hover:opacity-90"
            >
              <GraduationCap className="size-8 text-blue-600" aria-hidden="true" />
              <span className="tracking-tight">GiaSuHub</span>
            </Link>

            <span className="hidden text-xs font-bold text-slate-700 xl:inline-block border-l border-slate-200 pl-4 py-0.5">
              Kết nối tri thức - Kiến tạo tương lai
            </span>
          </div>

          <nav aria-label="Điều hướng chính" className="hidden items-center gap-6 lg:flex h-full">
            {filteredNavLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeDropdowns}
                  className={`relative flex h-full items-center px-1 text-sm font-semibold transition-colors ${
                    isActive ? "text-blue-600" : "text-slate-700 hover:text-blue-600"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-blue-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/tutors"
              onClick={closeDropdowns}
              aria-label="Tìm gia sư"
              className="grid size-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>

            {/* TRẠNG THÁI 1: ĐÃ ĐĂNG NHẬP */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3 pl-1">
                <button
                  type="button"
                  aria-label="Thông báo"
                  className="relative grid size-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600"
                >
                  <Bell className="size-5" />
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>

                <details className="relative group">
                  <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm ring-2 ring-blue-100 transition-transform hover:scale-105 active:scale-95 [&::-webkit-details-marker]:hidden">
                    {userInitials}
                  </summary>

                  <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
                    
                    {/* THÔNG TIN USER HEADER */}
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {userRole === 'tutor' ? 'Gia sư' : userRole === 'admin' ? 'Quản trị viên' : 'Học viên'}
                      </p>
                    </div>

                    {userRole === 'student' && (
                      <div className="py-1 space-y-0.5 border-b border-slate-100">
                        <Link
                          href="/dashboard/student"
                          onClick={closeDropdowns}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <User className="size-4 text-slate-500" />
                          <span>Hồ sơ cá nhân</span>
                        </Link>

                        <button
                          type="button"
                          onClick={handleOpenRequestsModal}
                          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer text-left"
                        >
                          <Send className="size-4 text-slate-500" />
                          <span>Yêu cầu tìm gia sư</span>
                        </button>

                        <Link
                          href="/dashboard/student/saved-tutors"
                          onClick={closeDropdowns}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Bookmark className="size-4 text-slate-500" />
                          <span>Gia sư đã lưu</span>
                        </Link>

                        <Link
                          href="/dashboard/student/reviews"
                          onClick={closeDropdowns}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Star className="size-4 text-slate-500" />
                          <span>Đánh giá gia sư</span>
                        </Link>

                        <Link
                          href="/dashboard/student/settings"
                          onClick={closeDropdowns}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Settings className="size-4 text-slate-500" />
                          <span>Cài đặt & Bảo mật</span>
                        </Link>
                      </div>
                    )}

                    {userRole === 'tutor' && (
                      <div className="py-1 border-b border-slate-100">
                        <Link
                          href="/dashboard/tutor"
                          onClick={closeDropdowns}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <User className="size-4 text-slate-500" />
                          <span>Quản lý hồ sơ gia sư</span>
                        </Link>
                      </div>
                    )}

                    {/* NÚT ĐĂNG XUẤT */}
                    <form action={logout}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors mt-1 cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeDropdowns}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 ml-1"
              >
                Đăng nhập
              </Link>
            )}

            {/* MOBILE MENU DROPDOWN */}
            <details className="relative lg:hidden group">
              <summary
                aria-label="Mở menu"
                className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
              </summary>
              
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl ring-1 ring-black/5 backdrop-blur-lg z-50">
                {filteredNavLinks.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={closeDropdowns}
                    className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>

        </div>
      </header>

      <RequestedTutorsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requests={requestsList}
      />
    </>
  );
}