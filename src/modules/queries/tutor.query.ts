import { createClient } from "@/src/lib/supabase/server";
import { GetTutorsFilter, TutorWithProfile } from "../../types/tutor.type";
import {
  SORTS,
  type SortKey,
  type TutorFilters,
  type TutorCardData,
  type RawTutorRow,
} from "../../types/tutor.type";

export const PAGE_SIZE = 6;
type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | string[] | undefined) => {
  const s = first(v);
  if (s === undefined || s.trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export function parseFilters(sp: SearchParams): TutorFilters {
  const subjects = [...new Set(([] as string[]).concat(sp.subject ?? []).filter(Boolean))];
  const sort = first(sp.sort);
  const modeRaw = first(sp.online);

  let online: "online" | "offline" | undefined = undefined;
  if(modeRaw === "online" || modeRaw === "1") online = "online"
  else if (modeRaw === "offline" || modeRaw === "0") online = "offline"
  return {
    q: first(sp.q)?.trim() || undefined,
    subjects: subjects.length ? subjects : undefined,
    grade: first(sp.grade) || undefined,
    online,
    min: num(sp.min),
    max: num(sp.max),
    area: first(sp.area)?.trim() || undefined,
    rating: num(sp.rating),
    sort: sort && sort in SORTS ? (sort as SortKey) : "rating",
    page: Math.max(1, Math.floor(num(sp.page) ?? 1)),
  };
}

export function filtersToQuery(f: TutorFilters) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  f.subjects?.forEach((s) => p.append("subject", s));
  if (f.grade) p.set("grade", f.grade);
  if (f.online) p.set("online", f.online);
  if (f.min !== undefined) p.set("min", String(f.min));
  if (f.max !== undefined) p.set("max", String(f.max));
  if (f.area) p.set("area", f.area);
  if (f.rating) p.set("rating", String(f.rating));
  if (f.sort && f.sort !== "rating") p.set("sort", f.sort);
  if (f.page && f.page > 1) p.set("page", String(f.page));
  return p.toString();
}

const safe = (s: string) => s.replace(/[,()%*"\\{}]/g, " ").replace(/\s+/g, " ").trim();

const COLUMNS =
  "user_id, headline, subjects, grades, hourly_rate, address, is_online, teaching_modes, experience_years, school_name, education, profiles(full_name, avatar_url, district, province, address)";


export async function getTutors(filters: TutorFilters, pageSize = PAGE_SIZE) {
  const supabase = await createClient();

  let query = supabase
    .from("tutor_profiles")
    .select(COLUMNS, { count: "exact" })
    .eq("verification_status", "Approved");

  const q = filters.q ? safe(filters.q) : "";
  if (q) {
    const { data: byName } = await supabase
      .from("profiles")
      .select("id")
      .ilike("full_name", `%${q}%`)
      .limit(50);

    const conds = [`headline.ilike.%${q}%`, `address.ilike.%${q}%`, `subjects.cs.{"${q}"}`];
    const ids = (byName ?? []).map((p) => p.id);
    if (ids.length) conds.push(`user_id.in.(${ids.join(",")})`);
    query = query.or(conds.join(","));
  }

  if (filters.subjects?.length) query = query.overlaps("subjects", filters.subjects);
  if (filters.grade) query = query.contains("grades", [filters.grade]);


  if(filters.online === "online"){
    query = query.contains("teaching_modes", ["Online"])
  }else if (filters.online === "offline"){
    query = query.contains("teaching_modes", ["Offline"])
  }



  if (filters.min !== undefined) query = query.gte("hourly_rate", filters.min);
  if (filters.max !== undefined) query = query.lte("hourly_rate", filters.max);
  if (filters.area) query = query.ilike("address", `%${safe(filters.area)}%`);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("hourly_rate", { ascending: true });
      break;
    case "price_desc":
      query = query.order("hourly_rate", { ascending: false });
      break;
    case "experience":
      query = query.order("experience_years", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }
  query = query.order("user_id");

  const page = filters.page ?? 1;
  const from = (page - 1) * pageSize;
  const { data, count, error } = await query.range(from, from + pageSize - 1);

  const rawRows = (data ?? []) as unknown as RawTutorRow[];
  const tutorIds = rawRows.map((r) => r.user_id);

  const stats = new Map<string, { sum: number; count: number }>();
  if (tutorIds.length > 0) {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("tutor_id, rating")
      .in("tutor_id", tutorIds);

    for (const r of reviews ?? []) {
      const s = stats.get(r.tutor_id) ?? { sum: 0, count: 0 };
      s.sum += r.rating;
      s.count += 1;
      stats.set(r.tutor_id, s);
    }
  }

  let tutors: TutorCardData[] = rawRows.map((r) => {
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    const s = stats.get(r.user_id);
    const avgRating = s ? s.sum / s.count : null;

    const displayAddress =
      r.address ||
      p?.address ||
      (p?.district ? `${p.district}, ${p.province || ""}` : "Hà Nội");

    return {
      user_id: r.user_id,
      name: p?.full_name ?? "Gia sư",
      avatar: p?.avatar_url ?? null,
      headline: r.headline,
      subjects: r.subjects ?? [],
      grades: r.grades ?? [],
      hourly_rate: r.hourly_rate ?? 0,
      address: displayAddress,
      is_online: !!r.is_online,
      experience_years: r.experience_years ?? 0,
      rating_avg: avgRating,
      rating_count: s?.count ?? 0,
      school_name: r.school_name,
      education: r.education,
    };
  });

  if (filters.rating) {
    tutors = tutors.filter((t) => (t.rating_avg ?? 0) >= filters.rating!);
  }

  const total = count ?? 0;
  return {
    tutors,
    total,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    failed: !!error,
  };
}






export async function getVerifiedTutor(filters: GetTutorsFilter = {}){
    const supabase = await createClient()


    const {subject, province, district, minRate, maxRate, page = 1, limit = 9} = filters

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('tutor_profiles')
        .select(
            `user_id,
            bio,
            quote,
            education,
            school_name,
            subjects,
            hourly_rate,
            teaching_areas,
            teaching_modes,
            achievements,
            skills,
            total_lessons_taught,
            certificates_data,
            experiences,
            educations,
            schedules,
            is_verified,
            profiles!inner (
                full_name,
                avatar_url,
                phone,
                province,
                district,
                address
            )
            `,
            {count: 'exact'}

        )
        .eq('is_verified', true)
    
    if (subject) query = query.contains('subjects', [subject])
    if (district) query = query.contains('teaching_areas', [district])
    if (province) query = query.eq('profiles.province', province)

    if (minRate !== undefined) {
        query = query.gte('hourly_rate', minRate)
    }
    if (maxRate !== undefined) {
        query = query.lte('hourly_rate', maxRate)
    }
     
    query = query.range(from, to)
    const {data, count, error} = await query
    if(error){
        console.error('Lỗi lấy danh sách gia sư', error.message)
        return {tutors: [], total: 0}
    }
    const tutors = (data || []) as unknown as TutorWithProfile[]
    return {tutors, total: count || 0}
}

export async function getTutorDetail(tutorId: string){
    const supabase = await createClient()

    const {data: tutor, error: tutorError} = await supabase
        .from('tutor_profiles')
        .select(
            `user_id,
            bio,
            quote,
            education,
            school_name,          
            subjects,
            hourly_rate,          
            subject_details,     
            teaching_areas,
            teaching_modes,      
            achievements,
            skills,
            total_lessons_taught,
            certificates_data,
            experiences,
            educations,
            schedules,
            is_verified,
            verification_status,
            rejection_reason,
            profiles( 
                full_name,
                avatar_url,
                phone,
                province,
                district,
                address
            )
        `)
        .eq('user_id', tutorId)
        .single()
        if(tutorError || !tutor) return null

        const {data: reviews} = await supabase
            .from('reviews')
            .select(`
                id,
                rating,
                comment,
                created_at,
                student:student_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('tutor_id', tutorId)
            .order('created_at', {ascending: false})

        const totalReviews = reviews?.length || 0
        const avgRating = totalReviews > 0 
                ? Number((reviews!.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews).toFixed(1))
                : 0
        return {
            tutor: tutor as unknown as TutorWithProfile,
            reviews: reviews || [],
            stats: {
                totalReviews,
                avgRating,
            }
        }
}