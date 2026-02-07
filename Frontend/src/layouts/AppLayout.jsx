import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { fetchNotifications } from '@/features/notification/notificationSlice';
import { ROLES, ROLE_LABELS } from '@/utils/constants';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Bell,
  History,
  User,
  Settings,
  Shield,
  Building2,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Employees',
    href: '/employees',
    icon: Users,
    roles: [ROLES.HR_ADMIN, ROLES.GM, ROLES.SYSTEM_ADMIN, ROLES.SUPERVISOR],
    children: [
      { title: 'Employee List', href: '/employees', icon: Users },
      { title: 'Create Employee', href: '/employees/create', icon: Users, roles: [ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN] },
      { title: 'Departments', href: '/employees/departments', icon: Building2, roles: [ROLES.HR_ADMIN, ROLES.GM, ROLES.SYSTEM_ADMIN] },
      { title: 'Create Department', href: '/employees/departments/create', icon: Building2, roles: [ROLES.HR_ADMIN, ROLES.GM, ROLES.SYSTEM_ADMIN] },
      { title: 'Roles & Permissions', href: '/employees/roles', icon: Shield, roles: [ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN] },
      { title: 'Create Role', href: '/employees/roles/create', icon: Shield, roles: [ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN] },
    ],
  },
  {
    title: 'Jobs & Tasks',
    href: '/jobs',
    icon: Briefcase,
    children: [
      { title: 'Job List', href: '/jobs', icon: Briefcase },
      { title: 'My Jobs', href: '/jobs/my-jobs', icon: Briefcase, roles: [ROLES.SUPERVISOR, ROLES.GM] },
      { title: 'Assigned Jobs', href: '/jobs/assigned', icon: Briefcase, roles: [ROLES.SUPERVISOR, ROLES.GM] },
      { title: 'Create Job', href: '/jobs/create', icon: Briefcase, roles: [ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.GM, ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN] },
      { title: 'Job Approvals', href: '/jobs/approvals', icon: CheckSquare, roles: [ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.GM, ROLES.HR_ADMIN] },
    ],
  },
  {
    title: 'Approvals',
    href: '/approvals',
    icon: CheckSquare,
    roles: [ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.GM, ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN],
    children: [
      { title: 'Pending Approvals', href: '/approvals', icon: CheckSquare },
      { title: 'Approval History', href: '/approvals/history', icon: History },
    ],
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    children: [
      { title: 'Notification Center', href: '/notifications', icon: Bell },
      { title: 'Settings', href: '/notifications/settings', icon: Settings },
    ],
  },
  {
    title: 'Login History',
    href: '/login-history',
    icon: History,
    roles: [ROLES.SUPERVISOR, ROLES.GM, ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN],
  },
  {
    title: 'My Profile',
    href: '/profile',
    icon: User,
  },
];

const AppLayout = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount } = useAppSelector((state) => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState([]);

  const userRole = user?.role;

  const toggleExpanded = (title) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isItemVisible = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  };

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {sidebarOpen && (
            <span className="text-lg font-bold text-sidebar-primary-foreground">
              HR<span className="text-sidebar-primary">System</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {navigationItems.filter(isItemVisible).map((item) => (
            <div key={item.title} className="mb-1">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive(item.href) && 'bg-sidebar-accent text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        {item.title === 'Notifications' && unreadCount > 0 && (
                          <Badge className="bg-destructive text-destructive-foreground">
                            {unreadCount}
                          </Badge>
                        )}
                        {expandedItems.includes(item.title) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                  {sidebarOpen && expandedItems.includes(item.title) && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                      {item.children.filter(isItemVisible).map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            isActive(child.href) && 'bg-sidebar-primary text-sidebar-primary-foreground'
                          )}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive(item.href) && 'bg-sidebar-primary text-sidebar-primary-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.title}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User section */}
        {sidebarOpen && user && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/70">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">
              {user ? `Welcome, ${user.name.split(' ')[0]}` : 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96">
                <div className="p-3 border-b">
                  <p className="font-semibold">Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </p>
                </div>
                <div className="overflow-y-auto flex-1 max-h-64">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <DropdownMenuItem key={n.id} asChild>
                        <Link to="/notifications" className={`block p-3 cursor-pointer ${!n.read ? 'bg-muted/50' : ''}`}>
                          <p className="font-medium text-sm">{n.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/notifications" className="cursor-pointer">
                    View all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/sessions">
                    <History className="mr-2 h-4 w-4" />
                    Login Activity
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/change-password">
                    <Settings className="mr-2 h-4 w-4" />
                    Change Password
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 min-h-0 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
