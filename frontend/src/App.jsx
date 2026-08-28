import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import MemberLayout from "./layouts/MemberLayout";
import AdminLayout from "./layouts/AdminLayout";
import GuestGuard from "./components/guards/GuestGuard";
import AuthGuard from "./components/guards/AuthGuard";
import SplashScreen from "./components/SplashScreen";

import HomePage from "./pages/public/HomePage";
import ClassesPage from "./pages/public/ClassesPage";
import SchedulePage from "./pages/public/SchedulePage";
import AboutPage from "./pages/public/AboutPage";
import PackagesPage from "./pages/public/PackagesPage";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import MemberDashboardPage from "./pages/member/MemberDashboardPage";
import MemberBookingsPage from "./pages/member/MemberBookingsPage";
import MemberProfilePage from "./pages/member/MemberProfilePage";
import MemberPackagesPage from "./pages/member/MemberPackagesPage";
import MemberBookingPage from "./pages/member/MemberBookingPage";
import MemberPaymentPage from "./pages/member/MemberPaymentPage";
import MemberPackagePurchasePage from "./pages/member/MemberPackagePurchasePage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminSchedulesPage from "./pages/admin/AdminSchedulesPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminMembersPage from "./pages/admin/AdminMembersPage";
import AdminClassesPage from "./pages/admin/AdminClassesPage";
import AdminInstructorsPage from "./pages/admin/AdminInstructorsPage";
import AdminPackagesPage from "./pages/admin/AdminPackagesPage";
import AdminCmsPage from "./pages/admin/AdminCmsPage";

import InstructorLayout from "./layouts/InstructorLayout";
import InstructorDashboardPage from "./pages/instructor/InstructorDashboardPage";
import InstructorSchedulePage from "./pages/instructor/InstructorSchedulePage";
import InstructorAttendancePage from "./pages/instructor/InstructorAttendancePage";
import InstructorAttendanceDetailPage from "./pages/instructor/InstructorAttendanceDetailPage";
import InstructorProfilePage from "./pages/instructor/InstructorProfilePage";

import OwnerLayout from "./layouts/OwnerLayout";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import OwnerFinancePage from "./pages/owner/OwnerFinancePage";
import OwnerFinanceComparePage from "./pages/owner/OwnerFinanceComparePage";
import OwnerAdminsPage from "./pages/owner/OwnerAdminsPage";
import OwnerMembersPage from "./pages/owner/OwnerMembersPage";
import OwnerVouchersPage from "./pages/owner/OwnerVouchersPage";
import OwnerNotificationLogsPage from "./pages/owner/OwnerNotificationLogsPage";
import OwnerAuditTrailPage from "./pages/owner/OwnerAuditTrailPage";

import NotFoundPage from "./pages/NotFoundPage";

const PlaceholderPage = ({ name }) => (
  <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif", color: "#6B5E4A", fontSize: "18px" }}>
    {name} - Coming Soon
  </div>
);

export default function App() {
  const [showSplash, setShowSplash] = useState(!sessionStorage.getItem("splashShown"));

  if (showSplash) {
    return (
      <SplashScreen onFinish={() => { sessionStorage.setItem("splashShown", "true"); setShowSplash(false); }} />
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/packages" element={<PackagesPage />} />
      </Route>

      {/* Auth */}
      <Route element={<GuestGuard><AuthLayout /></GuestGuard>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Member */}
      <Route element={<AuthGuard role="member"><MemberLayout /></AuthGuard>}>
        <Route path="/member/dashboard" element={<MemberDashboardPage />} />
        <Route path="/member/bookings" element={<MemberBookingsPage />} />
        <Route path="/member/packages" element={<MemberPackagesPage />} />
        <Route path="/member/profile" element={<MemberProfilePage />} />
        <Route path="/member/booking/:scheduleId" element={<MemberBookingPage />} />
        <Route path="/member/payment/:bookingId" element={<MemberPaymentPage />} />
        <Route path="/member/package/:packageId" element={<MemberPackagePurchasePage />} />
      </Route>

      {/* Admin */}
      <Route element={<AuthGuard role="admin"><AdminLayout /></AuthGuard>}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/schedules" element={<AdminSchedulesPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/admin/members" element={<AdminMembersPage />} />
        <Route path="/admin/classes" element={<AdminClassesPage />} />
        <Route path="/admin/packages" element={<AdminPackagesPage />} />
        <Route path="/admin/instructors" element={<AdminInstructorsPage />} />
        <Route path="/admin/cms" element={<AdminCmsPage />} />
      </Route>

      {/* Instructor */}
      <Route element={<AuthGuard role="instructor"><InstructorLayout /></AuthGuard>}>
        <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
        <Route path="/instructor/schedule" element={<InstructorSchedulePage />} />
        {/* Daftar jadwal per minggu */}
        <Route path="/instructor/attendance" element={<InstructorAttendancePage />} />
        {/* Detail kehadiran per kelas */}
        <Route path="/instructor/attendance/:scheduleId" element={<InstructorAttendanceDetailPage />} />
        <Route path="/instructor/profile" element={<InstructorProfilePage />} />
      </Route>

      {/* Owner */}
      <Route element={<AuthGuard role="owner"><OwnerLayout /></AuthGuard>}>
        <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
        <Route path="/owner/finance" element={<OwnerFinancePage />} />
        <Route path="/owner/finance/compare" element={<OwnerFinanceComparePage />} />
        <Route path="/owner/admins" element={<OwnerAdminsPage />} />
        <Route path="/owner/members" element={<OwnerMembersPage />} />
        <Route path="/owner/vouchers" element={<OwnerVouchersPage />} />
        <Route path="/owner/notification-logs" element={<OwnerNotificationLogsPage />} />
        <Route path="/owner/audit-trail" element={<OwnerAuditTrailPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
