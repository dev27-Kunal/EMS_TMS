import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchJobs } from '@/features/job/jobSlice';
import { fetchEmployees } from '@/features/employee/employeeSlice';
import { fetchApprovals } from '@/features/approval/approvalSlice';
import AppLayout from '@/layouts/AppLayout';
import KPICard from '@/components/KPICard';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, CheckSquare, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

function SupervisorDashboard() {
    const dispatch = useAppDispatch();
    const { jobs, isLoading: jobsLoading } = useAppSelector((state) => state.job);
    const { employees, isLoading: employeesLoading } = useAppSelector((state) => state.employee);
    const { approvals, pendingCount } = useAppSelector((state) => state.approval);
    useEffect(() => { dispatch(fetchJobs()); dispatch(fetchEmployees()); dispatch(fetchApprovals()); }, [dispatch]);
    const teamMembers = employees.filter((e) => e.department === 'Engineering');
    const activeTeamMembers = teamMembers.filter((e) => e.status === 'active');
    const teamJobs = jobs.filter((j) => j.department === 'Engineering');
    const activeJobs = teamJobs.filter((j) => j.status === 'in_progress');
    const completedJobs = teamJobs.filter((j) => j.status === 'completed');
    const overdueTeamJobs = teamJobs.filter((j) => {
      if (j.status === 'completed' || j.status === 'cancelled') return false;
      return new Date(j.dueDate) < new Date();
    });
    const teamApprovals = approvals.filter((a) => a.department === 'Engineering');
    const isLoading = jobsLoading || employeesLoading;
    if (isLoading) return <AppLayout><LoadingSpinner text="Loading dashboard..." /></AppLayout>;
    return (
        <AppLayout>
            <div className="page-container">
                <div className="mb-6"><h1 className="text-2xl font-bold">Team Dashboard</h1><p className="text-muted-foreground">Engineering Department Overview</p></div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KPICard title="Team Members" value={teamMembers.length} subtitle={activeTeamMembers.length + ' active'} icon={Users} variant="primary" />
                    <KPICard title="Active Jobs" value={activeJobs.length} subtitle="In progress" icon={Briefcase} variant="info" />
                    <KPICard title="Pending Approvals" value={pendingCount} subtitle="Requires action" icon={CheckSquare} variant="warning" />
                    <KPICard title="Completed Jobs" value={completedJobs.length} subtitle="This month" icon={TrendingUp} variant="success" />
                    <KPICard title="Overdue Jobs" value={overdueTeamJobs.length} subtitle="Past due" icon={Briefcase} variant="destructive" />
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">Team Members</CardTitle><Button variant="outline" size="sm" asChild><Link to="/employees">View All</Link></Button></CardHeader><CardContent><div className="space-y-3">{teamMembers.slice(0, 5).map((member) => (<div key={member.id} className="flex items-center justify-between rounded-lg border p-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">{member.name.split(' ').map((n) => n[0]).join('')}</div><div><p className="font-medium">{member.name}</p><p className="text-sm text-muted-foreground">{member.position}</p></div></div><StatusBadge status={member.status} /></div>))}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">Team Jobs</CardTitle><Button variant="outline" size="sm" asChild><Link to="/jobs">View All</Link></Button></CardHeader><CardContent><div className="space-y-3">{teamJobs.slice(0, 5).map((job) => (<div key={job.id} className="rounded-lg border p-3"><div className="flex items-center justify-between"><p className="font-medium">{job.title}</p><StatusBadge status={job.status} /></div><p className="mt-1 text-sm text-muted-foreground">Assigned to: {job.assignee?.name ?? "Unassigned"}</p><div className="mt-2"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>Progress</span><span>{job.progress}%</span></div><div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: job.progress + '%' }} /></div></div></div>))}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">Pending Approvals</CardTitle><Button variant="outline" size="sm" asChild><Link to="/approvals">View All</Link></Button></CardHeader><CardContent>{teamApprovals.filter((a) => a.status === 'pending').length === 0 ? <p className="text-center text-muted-foreground py-8">No pending approvals</p> : <div className="space-y-3">{teamApprovals.filter((a) => a.status === 'pending').slice(0, 5).map((approval) => (<div key={approval.id} className="rounded-lg border p-3"><div className="flex items-center justify-between"><StatusBadge status={approval.type} variant="info" /><span className="text-xs text-muted-foreground">{new Date(approval.submittedAt).toLocaleDateString()}</span></div><p className="mt-2 font-medium">{approval.requester}</p><p className="text-sm text-muted-foreground line-clamp-2">{approval.description}</p></div>))}</div>}</CardContent></Card>
                </div>
                <Card><CardHeader><CardTitle className="text-lg">Job Progress Overview</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Job ID</th><th>Title</th><th>Assignee</th><th>Priority</th><th>Progress</th><th>Due Date</th><th>Status</th></tr></thead><tbody>{teamJobs.map((job) => (<tr key={job.id}><td className="font-mono text-sm">{job.jobId}</td><td className="font-medium">{job.title}</td><td>{job.assignee?.name ?? "Unassigned"}</td><td><StatusBadge status={job.priority} variant={job.priority === 'urgent' ? 'destructive' : job.priority === 'high' ? 'warning' : 'muted'} /></td><td><div className="flex items-center gap-2"><div className="w-20 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: job.progress + '%' }} /></div><span className="text-sm text-muted-foreground">{job.progress}%</span></div></td><td>{new Date(job.dueDate).toLocaleDateString()}</td><td><StatusBadge status={job.status} /></td></tr>))}</tbody></table></div></CardContent></Card>
            </div>
        </AppLayout>
    );
}
export default SupervisorDashboard;
