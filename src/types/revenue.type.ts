export interface StudentRevenueSummary {
  studentId: string;
  studentName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  subject: string;
  unpaidLessonsCount: number; 
  unpaidAmount: number;       
  paidAmount: number;        
}

export interface MonthlyRevenueStats {
  monthYear: string; 
  totalAmount: number;
  completedLessonsCount: number;
}

export interface RevenueDashboardData {
  totalPaidRevenue: number;     
  totalUnpaidRevenue: number;  
  studentSummaries: StudentRevenueSummary[];
  monthlyStats: MonthlyRevenueStats[];
}