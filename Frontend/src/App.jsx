import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/app/store";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import ChangePasswordPage from "@/pages/auth/ChangePasswordPage";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";
import NotFoundPage from "@/pages/auth/NotFoundPage";

// Dashboard
import DashboardRouter from "@/pages/dashboards/DashboardRouter";

// Employee Management
import EmployeeListPage from "@/pages/employees/EmployeeListPage";
import CreateEmployeePage from "@/pages/employees/CreateEmployeePage";
import EditEmployeePage from "@/pages/employees/EditEmployeePage";
import EmployeeDetailsPage from "@/pages/employees/EmployeeDetailsPage";
import DepartmentManagementPage from "@/pages/employees/DepartmentManagementPage";
import CreateDepartmentPage from "@/pages/employees/CreateDepartmentPage";
import EditDepartmentPage from "@/pages/employees/EditDepartmentPage";
import DepartmentDetailsPage from "@/pages/employees/DepartmentDetailsPage";
import RolePermissionPage from "@/pages/employees/RolePermissionPage";
import CreateRolePage from "@/pages/employees/CreateRolePage";
import EditRolePage from "@/pages/employees/EditRolePage";
import RoleDetailsPage from "@/pages/employees/RoleDetailsPage";

// Jobs
import JobListPage from "@/pages/jobs/JobListPage";
import CreateJobPage from "@/pages/jobs/CreateJobPage";
import JobDetailsPage from "@/pages/jobs/JobDetailsPage";
import EditJobPage from "@/pages/jobs/EditJobPage";
import JobApprovalsPage from "@/pages/jobs/JobApprovalsPage";

// Approvals
import ApprovalsListPage from "@/pages/approvals/ApprovalsListPage";
import ApprovalDetailPage from "@/pages/approvals/ApprovalDetailPage";
import ApprovalHistoryPage from "@/pages/approvals/ApprovalHistoryPage";

// Notifications
import NotificationCenterPage from "@/pages/notifications/NotificationCenterPage";
import NotificationSettingsPage from "@/pages/notifications/NotificationSettingsPage";

// Login History
import LoginHistoryPage from "@/pages/loginHistory/LoginHistoryPage";
import UserLoginHistoryPage from "@/pages/loginHistory/UserLoginHistoryPage";

// Profile
import ProfilePage from "@/pages/profile/ProfilePage";
import EditProfilePage from "@/pages/profile/EditProfilePage";
import ProfileSessionsPage from "@/pages/profile/ProfileSessionsPage";

// Components
import ProtectedRoute from "@/components/ProtectedRoute";
import { ROLES } from "@/utils/constants";

const queryClient = new QueryClient();

const HR_AND_SYSTEM = [ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN];
const APPROVAL_ROLES = [ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.GM, ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN];
const LOGIN_HISTORY_ROLES = [ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.GM, ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN];
const EMPLOYEE_MANAGEMENT_ROLES = [ROLES.HR_ADMIN, ROLES.GM, ROLES.SYSTEM_ADMIN];

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

            {/* Employee Management - list visible to multiple roles; create/edit to HR & Admin */}
            <Route path="/employees" element={<ProtectedRoute><EmployeeListPage /></ProtectedRoute>} />
            <Route path="/employees/create" element={<ProtectedRoute allowedRoles={HR_AND_SYSTEM}><CreateEmployeePage /></ProtectedRoute>} />
            <Route path="/employees/departments" element={<ProtectedRoute allowedRoles={EMPLOYEE_MANAGEMENT_ROLES}><DepartmentManagementPage /></ProtectedRoute>} />
            <Route path="/employees/departments/create" element={<ProtectedRoute allowedRoles={EMPLOYEE_MANAGEMENT_ROLES}><CreateDepartmentPage /></ProtectedRoute>} />
            <Route path="/employees/departments/:id/edit" element={<ProtectedRoute allowedRoles={EMPLOYEE_MANAGEMENT_ROLES}><EditDepartmentPage /></ProtectedRoute>} />
            <Route path="/employees/departments/:id" element={<ProtectedRoute allowedRoles={EMPLOYEE_MANAGEMENT_ROLES}><DepartmentDetailsPage /></ProtectedRoute>} />
            <Route path="/employees/roles" element={<ProtectedRoute allowedRoles={HR_AND_SYSTEM}><RolePermissionPage /></ProtectedRoute>} />
            <Route path="/employees/roles/create" element={<ProtectedRoute allowedRoles={HR_AND_SYSTEM}><CreateRolePage /></ProtectedRoute>} />
            <Route path="/employees/roles/:id/edit" element={<ProtectedRoute allowedRoles={HR_AND_SYSTEM}><EditRolePage /></ProtectedRoute>} />
            <Route path="/employees/roles/:id" element={<ProtectedRoute allowedRoles={HR_AND_SYSTEM}><RoleDetailsPage /></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetailsPage /></ProtectedRoute>} />
            <Route path="/employees/:id/edit" element={<ProtectedRoute allowedRoles={HR_AND_SYSTEM}><EditEmployeePage /></ProtectedRoute>} />

            {/* Jobs */}
            <Route path="/jobs" element={<ProtectedRoute><JobListPage /></ProtectedRoute>} />
            <Route path="/jobs/my-jobs" element={<ProtectedRoute><JobListPage view="my_jobs" /></ProtectedRoute>} />
            <Route path="/jobs/assigned" element={<ProtectedRoute><JobListPage view="assigned_jobs" /></ProtectedRoute>} />
            <Route path="/jobs/create" element={<ProtectedRoute><CreateJobPage /></ProtectedRoute>} />
            <Route path="/jobs/approvals" element={<ProtectedRoute><JobApprovalsPage /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailsPage /></ProtectedRoute>} />
            <Route path="/jobs/:id/edit" element={<ProtectedRoute><EditJobPage /></ProtectedRoute>} />

            {/* Approvals - Supervisor, GM, HR, System Admin */}
            <Route path="/approvals" element={<ProtectedRoute allowedRoles={APPROVAL_ROLES}><ApprovalsListPage /></ProtectedRoute>} />
            <Route path="/approvals/:id" element={<ProtectedRoute allowedRoles={APPROVAL_ROLES}><ApprovalDetailPage /></ProtectedRoute>} />
            <Route path="/approvals/history" element={<ProtectedRoute allowedRoles={APPROVAL_ROLES}><ApprovalHistoryPage /></ProtectedRoute>} />

            {/* Notifications */}
            <Route path="/notifications" element={<ProtectedRoute><NotificationCenterPage /></ProtectedRoute>} />
            <Route path="/notifications/settings" element={<ProtectedRoute><NotificationSettingsPage /></ProtectedRoute>} />

            {/* Login History - Supervisor, GM, HR, System Admin */}
            <Route path="/login-history" element={<ProtectedRoute allowedRoles={LOGIN_HISTORY_ROLES}><LoginHistoryPage /></ProtectedRoute>} />
            <Route path="/login-history/user/:userId" element={<ProtectedRoute allowedRoles={LOGIN_HISTORY_ROLES}><UserLoginHistoryPage /></ProtectedRoute>} />

            {/* Profile */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
            <Route path="/profile/sessions" element={<ProtectedRoute><ProfileSessionsPage /></ProtectedRoute>} />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
