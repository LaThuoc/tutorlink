export interface ReviewItem {
  id: string;
  student_id: string;
  tutor_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  student?: {
    full_name: string;
    avatar_url?: string | null;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: Record<number, number>; 
}