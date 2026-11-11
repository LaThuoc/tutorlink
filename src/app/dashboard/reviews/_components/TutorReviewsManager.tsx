'use client';

import React, { useState } from 'react';
import { Star, Filter, Calendar } from 'lucide-react';
import { ReviewItem, ReviewStats } from '@/src/types/review.type';

interface Props {
  initialReviews: ReviewItem[];
  stats: ReviewStats;
}

export default function TutorReviewsManager({ initialReviews, stats }: Props) {
  const [reviews] = useState<ReviewItem[]>(initialReviews);
  const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL');

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'ALL') return true;
    return Math.round(r.rating) === filterRating;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Đánh giá từ học viên</h1>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý phản hồi và xem mức độ hài lòng về chất lượng giảng dạy của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
          <span className="text-5xl font-black text-slate-900">{stats.averageRating}</span>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-5 ${
                  star <= Math.round(stats.averageRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200 fill-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Dựa trên {stats.totalReviews} đánh giá
          </span>
        </div>

        <div className="md:col-span-2 space-y-2 justify-center flex flex-col">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingCounts[star] || 0;
            const percent = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="font-bold text-slate-700 w-12 flex items-center gap-1">
                  {star} <Star className="size-3 text-amber-400 fill-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-slate-400 font-medium w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterRating('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterRating === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          Tất cả ({stats.totalReviews})
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            onClick={() => setFilterRating(star)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filterRating === star
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            <span>{star}</span>
            <Star className="size-3 text-amber-400 fill-amber-400" />
            <span className="opacity-70">({stats.ratingCounts[star] || 0})</span>
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
          <div className="size-16 bg-slate-50 text-slate-400 rounded-full grid place-items-center mx-auto">
            <Filter className="size-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa có đánh giá nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Hiện tại chưa có nhận xét nào thuộc mức xếp hạng đã chọn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.map((rev) => {
            const studentName = rev.student?.full_name || 'Học viên ẩn danh';
            const avatarUrl = rev.student?.avatar_url;

            return (
              <div
                key={rev.id}
                className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={studentName}
                        className="size-10 rounded-full object-cover ring-2 ring-blue-50"
                      />
                    ) : (
                      <div className="size-10 rounded-full bg-blue-100 text-blue-600 font-bold grid place-items-center text-xs">
                        {studentName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{studentName}</h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="size-3 text-slate-400" />
                        {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                    <Star className="size-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-700">{rev.rating}.0</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  {rev.comment ? (
                    <p className="italic">{`"${rev.comment}"`}</p>
                  ) : (
                    <span className="text-slate-400 italic">Học viên chỉ để lại bình chọn sao không có nhận xét.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}