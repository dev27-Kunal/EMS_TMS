import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchJobs } from '@/features/job/jobSlice';
import { fetchEmployees, fetchDepartments } from '@/features/employee/employeeSlice';
import { fetchApprovals } from '@/features/approval/approvalSlice';
import AppLayout from '@/layouts/AppLayout';
import KPICard from '@/components/KPICard';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Briefcase, TrendingUp, CheckSquare, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

function GMDashboard() {
    const dispatch = useAppDispatch();
    const { jobs, isLoading: jobsLoading } = useAppSelector((state) => state.job);
    const { employees, departments, isLoading: employeesLoading } = useAppSelector((state) => state.employee);
    const { approvals, pendingCount } = useAppSelector((state) => state.approval);

    useEffect(() => {
        dispatch(fetchJobs());
        dispatch(fetchEmployees());
        dispatch(fetchDepartments());
        dispatch(fetchApprovals());
    }, [dispatch]);

    const activeEmployees = employees.filter((e) => e.status === 'active');
    const activeJobs = jobs.filter((j) => j.status === 'in_progress');
    const completedJobs = jobs.filter((j) => j.status === 'completed');
    const overdueTasks = jobs.filter((j) => {
        const dueDate = new Date(j.dueDate);
        return dueDate < new Date() && j.status !== 'completed';
    });

    const isLoading = jobsLoading || employeesLoading;

    const departmentStats = departments.map((dept) => ({
        ...dept,
        jobs: jobs.filter((j) => j.department === dept.name).length,
        activeJobs: jobs.filter((j) => j.department === dept.name && j.status === 'in_progress').length,
    }));

    if (isLoading) return <AppLayout><LoadingSpinner text="Loading dashboard..." /></AppLayout>;

    return (
        <AppLayout>
            <div className="page-container">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Executive Dashboard</h1>
                    <p className="text-muted-foreground">Organization-wide Overview</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <KPICard title="Total Employees" value={employees.length} subtitle={activeEmployees.length + ' active'} icon={Users} variant="primary" />
                    <KPICard title="Departments" value={departments.length} subtitle="Organization units" icon={Building2} variant="info" />
                    <KPICard title="Active Jobs" value={activeJobs.length} subtitle="In progress" icon={Briefcase} variant="pending" />
                    <KPICard title="Completed" value={completedJobs.length} subtitle="This month" icon={TrendingUp} variant="success" />
                    <KPICard title="Pending Approvals" value={pendingCount} subtitle="Requires action" icon={CheckSquare} variant="warning" />
                    <KPICard title="Overdue Tasks" value={overdueTasks.length} subtitle="Past deadline" icon={AlertTriangle} variant="warning" />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Department Overview</CardTitle>
                            <Button variant="outline" size="sm" asChild><Link to="/employees/departments">View All</Link></Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {departmentStats.map((dept) => (
                                    <div key={dept.id} className="rounded-lg border p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
                                                <div><p className="font-medium">{dept.name}</p><p className="text-sm text-muted-foreground">Head: {dept.head}</p></div>
                                            </div>
                                            <div className="text-right"><p className="font-semibold">{dept.employeeCount}</p><p className="text-xs text-muted-foreground">employees</p></div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{dept.jobs} total jobs - {dept.activeJobs} active</span>
                                            <StatusBadge status={dept.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Pending Approvals</CardTitle>
                            <Button variant="outline" size="sm" asChild><Link to="/approvals">View All</Link></Button>
                        </CardHeader>
                        <CardContent>
                            {approvals.filter((a) => a.status === 'pending').length === 0 ? <p className="text-center text-muted-foreground py-8">No pending approvals</p> : (
                                <div className="space-y-3">
                                    {approvals.filter((a) => a.status === 'pending').slice(0, 5).map((approval) => (
                                        <div key={approval.id} className="rounded-lg border p-4">
                                            <div className="flex items-center justify-between">
                                                <StatusBadge status={approval.type} variant="info" />
                                                <span className="text-sm text-muted-foreground">{approval.department}</span>
                                            </div>
                                            <p className="mt-2 font-medium">{approval.requester}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{approval.description}</p>
                                            <div className="mt-3 flex gap-2">
                                                <Button size="sm" className="flex-1">Approve</Button>
                                                <Button size="sm" variant="outline" className="flex-1">Review</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Organization Jobs</CardTitle>
                        <Button variant="outline" size="sm" asChild><Link to="/jobs">View All Jobs</Link></Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead><tr><th>Job ID</th><th>Title</th><th>Department</th><th>Assignee</th><th>Priority</th><th>Progress</th><th>Status</th></tr></thead>
                                <tbody>
                                    {jobs.slice(0, 10).map((job) => (
                                        <tr key={job.id}>
                                            <td className="font-mono text-sm">{job.jobId}</td>
                                            <td className="font-medium">{job.title}</td>
                                            <td>{job.department}</td>
                                            <td>{job.assignee?.name ?? "Unassigned"}</td>
                                            <td><StatusBadge status={job.priority} variant={job.priority === 'urgent' ? 'destructive' : job.priority === 'high' ? 'warning' : 'muted'} /></td>
                                            <td><div className="flex items-center gap-2"><div className="w-20 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: job.progress + '%' }} /></div><span className="text-sm">{job.progress}%</span></div></td>
                                            <td><StatusBadge status={job.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
export default GMDashboard;
