import React from 'react';
import TutorDashboardClient from '@/src/app/_components/dashboard/tutor/TutorDashboardClient';

export const metadata = {
  title: 'GiaSuHub – Tổng quan gia sư',
  description: 'Trang quản lý lịch dạy và yêu cầu học cho gia sư trên GiaSuHub.',
};

export default function TutorDashboardPage() {
  return <TutorDashboardClient />;
}