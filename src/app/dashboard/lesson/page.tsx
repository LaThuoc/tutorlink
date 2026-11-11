import React from 'react';
import TutorDashboardHeader from '@/src/app/_components/dashboard/tutor/TutorDashboardHeader';
import TutorDashboardSidebar from '@/src/app/_components/dashboard/tutor/TutorDashboardSidebar';
import { getTutorBookingRequests } from '@/src/modules/tutor/getStudentRequest';
import TutorLessonManager from './_components/TutorLessonManager';

export const revalidate = 0;

export default async function TutorLessonPage() {
  const result = await getTutorBookingRequests();

  const acceptedLessons = (result.success && result.data ? result.data : []).filter(
    (item) => item.status === 'Accepted'
  );

  return (
    <div className="min-h-screen w-full bg-slate-50/60 text-slate-800 font-sans">
      <TutorDashboardHeader />
      <div className="flex w-full">
        <TutorDashboardSidebar />
        <main className="flex-1 p-4 lg:p-6 max-w-7xl">
          <TutorLessonManager initialLessons={acceptedLessons} />
        </main>
      </div>
    </div>
  );
}