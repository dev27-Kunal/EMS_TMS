export const ROLES = {
  EMPLOYEE: "employee",
  SUPERVISOR: "supervisor",
  MANAGER: "manager",
  GM: "gm",
  HR_ADMIN: "hr_admin",
  SYSTEM_ADMIN: "system_admin",
};

export const ROLE_LABELS = {
  [ROLES.EMPLOYEE]: "Employee",
  [ROLES.SUPERVISOR]: "Supervisor",
  [ROLES.MANAGER]: "Manager",
  [ROLES.GM]: "General Manager",
  [ROLES.HR_ADMIN]: "HR Admin",
  [ROLES.SYSTEM_ADMIN]: "System Admin",
};

export const JOB_STATUS = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  ACTIVE: "in_progress", // alias for "Active"
  COMPLETED: "completed",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
  ON_HOLD: "on_hold",
};

export const JOB_STATUS_LABELS = {
  [JOB_STATUS.DRAFT]: "Draft",
  [JOB_STATUS.PENDING_APPROVAL]: "Pending Approval",
  [JOB_STATUS.PENDING]: "Pending",
  [JOB_STATUS.IN_PROGRESS]: "In Progress",
  [JOB_STATUS.COMPLETED]: "Completed",
  [JOB_STATUS.OVERDUE]: "Overdue",
  [JOB_STATUS.CANCELLED]: "Cancelled",
  [JOB_STATUS.ON_HOLD]: "On Hold",
};

export const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const EMPLOYEE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ON_LEAVE: "on_leave",
  TERMINATED: "terminated",
};

export const AVAILABLE_PERMISSIONS = [
  { value: "all", label: "Full Access (All Permissions)" },
  { value: "employees:all", label: "Employees: Full Access" },
  { value: "employees:view", label: "Employees: View Only" },
  { value: "employees:team", label: "Employees: Team Only" },
  { value: "departments:all", label: "Departments: Full Access" },
  { value: "jobs:all", label: "Jobs: All Jobs" },
  { value: "jobs:team", label: "Jobs: Team Jobs" },
  { value: "jobs:own", label: "Jobs: Own Jobs Only" },
  { value: "approvals:all", label: "Approvals: All" },
  { value: "approvals:team", label: "Approvals: Team" },
  { value: "reports:all", label: "Reports: All" },
  { value: "reports:hr", label: "Reports: HR Only" },
  { value: "profile:own", label: "Profile: Own Profile" },
];
