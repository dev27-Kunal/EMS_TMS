import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchEmployees, fetchDepartments, fetchRoles } from '@/features/employee/employeeSlice';
import { fetchLoginHistory } from '@/features/loginHistory/loginHistorySlice';
import AppLayout from '@/layouts/AppLayout';
import KPICard from '@/components/KPICard';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Building2, Calendar, History } from 'lucide-react';
import { Link } from 'react-router-dom';

function HRAdminDashboard() {
    const dispatch = useAppDispatch();
    const { employees, departments, roles, isLoading } = useAppSelector((state) => state.employee);
    const { records: loginRecords } = useAppSelector((state) => state.loginHistory);
    const recentLogins = loginRecords?.slice(0, 5) || [];
    useEffect(() => { dispatch(fetchEmployees()); dispatch(fetchDepartments()); dispatch(fetchRoles()); dispatch(fetchLoginHistory()); }, [dispatch]);
    const activeEmployees = employees.filter((e) => e.status === 'active');
    const onLeaveEmployees = employees.filter((e) => e.status === 'on_leave');
    const recentHires = employees.filter((e) => { const hireDate = new Date(e.hireDate); const d = new Date(); d.setDate(d.getDate() - 90); return hireDate > d; });
    if (isLoading) return <AppLayout><LoadingSpinner text="Loading dashboard..." /></AppLayout>;
    return (
        <AppLayout>
            <div className="page-container">
                <div className="mb-6"><h1 className="text-2xl font-bold">HR Dashboard</h1><p className="text-muted-foreground">Human Resources Management Overview</p></div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KPICard title="Total Employees" value={employees.length} subtitle={activeEmployees.length + ' active'} icon={Users} variant="primary" />
                    <KPICard title="New Hires" value={recentHires.length} subtitle="Last 90 days" icon={UserPlus} variant="success" />
                    <KPICard title="On Leave" value={onLeaveEmployees.length} subtitle="Currently away" icon={Calendar} variant="warning" />
                    <KPICard title="Departments" value={departments.length} subtitle="Organization units" icon={Building2} variant="info" />
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">Recent Hires</CardTitle><Button variant="outline" size="sm" asChild><Link to="/employees/create">Add New</Link></Button></CardHeader>
                        <CardContent>{recentHires.length === 0 ? <p className="text-center text-muted-foreground py-8">No recent hires</p> : <div className="space-y-3">{recentHires.slice(0, 5).map((employee) => (<div key={employee.id} className="flex items-center gap-3 rounded-lg border p-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success text-sm font-medium">{employee.name.split(' ').map((n) => n[0]).join('')}</div><div className="flex-1"><p className="font-medium">{employee.name}</p><p className="text-sm text-muted-foreground">{employee.position} - {employee.department}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Hired</p><p className="text-sm font-medium">{new Date(employee.hireDate).toLocaleDateString()}</p></div></div>))}</div>}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">Department Breakdown</CardTitle><Button variant="outline" size="sm" asChild><Link to="/employees/departments">Manage</Link></Button></CardHeader>
                        <CardContent><div className="space-y-4">{departments.map((dept) => { const deptEmployees = employees.filter((e) => e.department === dept.name); const percentage = ((deptEmployees.length / employees.length) * 100).toFixed(0); return (<div key={dept.id}><div className="flex items-center justify-between text-sm"><span className="font-medium">{dept.name}</span><span className="text-muted-foreground">{deptEmployees.length} ({percentage}%)</span></div><div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: percentage + '%' }} /></div></div>); })}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">Roles Distribution</CardTitle><Button variant="outline" size="sm" asChild><Link to="/employees/roles">Manage</Link></Button></CardHeader>
                        <CardContent><div className="space-y-3">{roles.map((role) => (<div key={role.id} className="flex items-center justify-between rounded-lg border p-3"><div><Link to={'/employees/roles/' + role.id} className="font-medium hover:underline">{role.name}</Link><p className="text-sm text-muted-foreground">{role.description}</p></div><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{role.userCount}</div><Button variant="ghost" size="sm" asChild><Link to={'/employees/roles/' + role.id}>View</Link></Button></div></div>))}</div></CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg"><History className="h-5 w-5" />Login Activity Summary</CardTitle>
                        <Button variant="outline" size="sm" asChild><Link to="/login-history">View All</Link></Button>
                    </CardHeader>
                    <CardContent>
                        {loginRecords?.length === 0 ? <p className="text-center text-muted-foreground py-6">No login records</p> : (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">{loginRecords?.length || 0} recent login attempts</p>
                                <ul className="space-y-2">{recentLogins.map((r) => (<li key={r.id} className="flex items-center justify-between text-sm"><span>{r.userName}</span><StatusBadge status={r.status} /><span className="text-muted-foreground">{new Date(r.loginAt).toLocaleString()}</span></li>))}</ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">All Employees</CardTitle><div className="flex gap-2"><Button variant="outline" size="sm" asChild><Link to="/employees">View All</Link></Button><Button size="sm" asChild><Link to="/employees/create"><UserPlus className="mr-2 h-4 w-4" />Add Employee</Link></Button></div></CardHeader>
                    <CardContent><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Employee ID</th><th>Name</th><th>Department</th><th>Position</th><th>Hire Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>{employees.slice(0, 8).map((employee) => (<tr key={employee.id}><td className="font-mono text-sm">{employee.employeeId}</td><td><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{employee.name.split(' ').map((n) => n[0]).join('')}</div><div><p className="font-medium">{employee.name}</p><p className="text-xs text-muted-foreground">{employee.email}</p></div></div></td><td>{employee.department}</td><td>{employee.position}</td><td>{new Date(employee.hireDate).toLocaleDateString()}</td><td><StatusBadge status={employee.status} /></td><td><Button variant="ghost" size="sm" asChild><Link to={'/employees/' + employee.id}>View</Link></Button></td></tr>))}</tbody></table></div></CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
export default HRAdminDashboard;
