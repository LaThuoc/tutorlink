import React from 'react';
import TutorDashboardHeader from '@/src/app/_components/dashboard/tutor/TutorDashboardHeader';
import TutorDashboardSidebar from '@/src/app/_components/dashboard/tutor/TutorDashboardSidebar';
import { getTutorBookingRequests } from '@/src/modules/tutor/getStudentRequest';
import BookingRequestsManager from './_components/BookingRequestsManager';

export const revalidate = 0;

export default async function TutorRequestsPage() {
  const result = await getTutorBookingRequests();
  const initialRequests = result.success && result.data ? result.data : [];
  const tutorSchedules = result.tutorSchedules || [];

  return (
    <div className="min-h-screen w-full bg-slate-50/60 text-slate-800 font-sans">
      <TutorDashboardHeader />
      <div className="flex w-full">
        <TutorDashboardSidebar />
        <main className="flex-1 p-4 lg:p-6 max-w-7xl">
          <BookingRequestsManager 
            initialRequests={initialRequests} 
            tutorSchedules={tutorSchedules} 
          />
        </main>
      </div>
    </div>
  );
}