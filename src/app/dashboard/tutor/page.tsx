import React from 'react';
import { getDashboardTutorData } from '@/src/modules/tutor/getDashboardTutorData';
import TutorDashboardClient from '../../_components/dashboard/tutor/TutorDashboardClient';

export const revalidate = 0;

export default async function TutorDashboardPage() {
  const res = await getDashboardTutorData();
  const dashboardData = res.data;

  return <TutorDashboardClient data={dashboardData} />;
}