import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchEmployees, fetchDepartments, fetchRoles } from '@/features/employee/employeeSlice';
import { fetchJobs } from '@/features/job/jobSlice';
import { fetchLoginHistory } from '@/features/loginHistory/loginHistorySlice';
import AppLayout from '@/layouts/AppLayout';
import KPICard from '@/components/KPICard';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, Activity, AlertTriangle, Server, Database, Settings, History } from 'lucide-react';
import { Link } from 'react-router-dom';

function SystemAdminDashboard() {
    const dispatch = useAppDispatch();
    const { employees, departments, roles, isLoading: employeesLoading } = useAppSelector((state) => state.employee);
    const { jobs, isLoading: jobsLoading } = useAppSelector((state) => state.job);
    const { records: loginRecords, isLoading: loginLoading } = useAppSelector((state) => state.loginHistory);
    useEffect(() => { dispatch(fetchEmployees()); dispatch(fetchDepartments()); dispatch(fetchRoles()); dispatch(fetchJobs()); dispatch(fetchLoginHistory()); }, [dispatch]);
    const isLoading = employeesLoading || jobsLoading || loginLoading;
    const failedLogins = loginRecords.filter((r) => r.status === 'failed');
    const activeUsers = employees.filter((e) => e.status === 'active');
    const systemMetrics = { uptime: '99.9%', dbSize: '2.4 GB', apiRequests: '12,456', activeConnections: 45 };
    if (isLoading) return <AppLayout><LoadingSpinner text="Loading dashboard..." /></AppLayout>;
    return (
        <AppLayout>
            <div className="page-container">
                <div className="mb-6"><h1 className="text-2xl font-bold">System Administration</h1><p className="text-muted-foreground">Full System Overview and Security Monitoring</p></div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KPICard title="Total Users" value={employees.length} subtitle={activeUsers.length + ' active'} icon={Users} variant="primary" />
                    <KPICard title="Security Alerts" value={failedLogins.length} subtitle="Failed login attempts" icon={AlertTriangle} variant="warning" />
                    <KPICard title="System Roles" value={roles.length} subtitle="Permission groups" icon={Shield} variant="info" />
                    <KPICard title="Active Jobs" value={jobs.filter((j) => j.status === 'in_progress').length} subtitle="Currently running" icon={Activity} variant="success" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-2"><CardContent className="flex items-center gap-4 p-4"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10"><Server className="h-6 w-6 text-success" /></div><div><p className="text-sm text-muted-foreground">System Uptime</p><p className="text-2xl font-bold text-success">{systemMetrics.uptime}</p></div></CardContent></Card>
                    <Card className="border-2"><CardContent className="flex items-center gap-4 p-4"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10"><Database className="h-6 w-6 text-info" /></div><div><p className="text-sm text-muted-foreground">Database Size</p><p className="text-2xl font-bold text-info">{systemMetrics.dbSize}</p></div></CardContent></Card>
                    <Card className="border-2"><CardContent className="flex items-center gap-4 p-4"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><Activity className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">API Requests (24h)</p><p className="text-2xl font-bold">{systemMetrics.apiRequests}</p></div></CardContent></Card>
                    <Card className="border-2"><CardContent className="flex items-center gap-4 p-4"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pending/10"><Users className="h-6 w-6 text-pending" /></div><div><p className="text-sm text-muted-foreground">Active Connections</p><p className="text-2xl font-bold text-pending">{systemMetrics.activeConnections}</p></div></CardContent></Card>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-lg"><History className="h-5 w-5" />Recent Login Activity</CardTitle><Button variant="outline" size="sm" asChild><Link to="/login-history">View All</Link></Button></CardHeader><CardContent><div className="space-y-3">{loginRecords.slice(0, 6).map((record) => (<div key={record.id} className={'flex items-center justify-between rounded-lg border p-3 ' + (record.status === 'failed' ? 'border-destructive/30 bg-destructive/5' : '')}><div className="flex items-center gap-3"><div className={'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ' + (record.status === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>{record.userName.split(' ').map((n) => n[0]).join('')}</div><div><p className="font-medium">{record.userName}</p><p className="text-xs text-muted-foreground">{record.ipAddress} - {record.device}</p></div></div><div className="text-right"><StatusBadge status={record.status} /><p className="mt-1 text-xs text-muted-foreground">{new Date(record.loginAt).toLocaleString()}</p></div></div>))}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5" />Role and Permission Management</CardTitle><Button variant="outline" size="sm" asChild><Link to="/employees/roles">Manage</Link></Button></CardHeader><CardContent><div className="space-y-3">{roles.map((role) => (<div key={role.id} className="flex items-center justify-between rounded-lg border p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div><div><p className="font-medium">{role.name}</p><p className="text-sm text-muted-foreground">{role.permissions.length} permissions</p></div></div><div className="flex items-center gap-3"><div className="text-right"><p className="text-lg font-semibold">{role.userCount}</p><p className="text-xs text-muted-foreground">users</p></div><Button variant="ghost" size="sm" asChild><Link to={'/employees/roles/' + role.id}><Settings className="h-4 w-4" /></Link></Button></div></div>))}</div></CardContent></Card>
                </div>
                <Card><CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4"><Button variant="outline" className="h-auto flex-col gap-2 py-6" asChild><Link to="/employees/create"><Users className="h-6 w-6" /><span>Add User</span></Link></Button><Button variant="outline" className="h-auto flex-col gap-2 py-6" asChild><Link to="/employees/roles"><Shield className="h-6 w-6" /><span>Manage Roles</span></Link></Button><Button variant="outline" className="h-auto flex-col gap-2 py-6" asChild><Link to="/login-history"><History className="h-6 w-6" /><span>Audit Logs</span></Link></Button><Button variant="outline" className="h-auto flex-col gap-2 py-6" asChild><Link to="/employees/departments"><Settings className="h-6 w-6" /><span>System Settings</span></Link></Button></div></CardContent></Card>
            </div>
        </AppLayout>
    );
}
export default SystemAdminDashboard;
