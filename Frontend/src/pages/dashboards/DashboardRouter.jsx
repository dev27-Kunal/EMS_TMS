import { useAppSelector } from '@/app/hooks';
import { ROLES } from '@/utils/constants';
import EmployeeDashboard from './EmployeeDashboard';
import SupervisorDashboard from './SupervisorDashboard';
import GMDashboard from './GMDashboard';
import HRAdminDashboard from './HRAdminDashboard';
import SystemAdminDashboard from './SystemAdminDashboard';

const DashboardRouter = () => {
  const { user } = useAppSelector((state) => state.auth);
  const userRole = user?.role;

  switch (userRole) {
    case ROLES.SYSTEM_ADMIN: return <SystemAdminDashboard />;
    case ROLES.HR_ADMIN: return <HRAdminDashboard />;
    case ROLES.GM: return <GMDashboard />;
    case ROLES.SUPERVISOR:
    case ROLES.MANAGER: return <SupervisorDashboard />;
    case ROLES.EMPLOYEE:
    default: return <EmployeeDashboard />;
  }
};

export default DashboardRouter;
