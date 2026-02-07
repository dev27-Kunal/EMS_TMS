import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchJobs } from '@/features/job/jobSlice';
import { fetchNotifications } from '@/features/notification/notificationSlice';
import AppLayout from '@/layouts/AppLayout';
import KPICard from '@/components/KPICard';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const dispatch = useAppDispatch();
  const { jobs, isLoading } = useAppSelector((state) => state.job);
  const { notifications } = useAppSelector((state) => state.notification);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const { user } = useAppSelector((state) => state.auth);
  const myJobs = jobs.filter((job) => !user?.employeeId || job.assignee?.id === user.employeeId);
  const activeJobs = myJobs.filter((j) => j.status === 'in_progress');
  const pendingJobs = myJobs.filter((j) => j.status === 'pending');
  const completedJobs = myJobs.filter((j) => j.status === 'completed');
  const overdueJobs = myJobs.filter((j) => {
    if (j.status === 'completed' || j.status === 'cancelled') return false;
    return new Date(j.dueDate) < new Date();
  });
  const upcomingDeadlines = myJobs.filter((j) => {
    const dueDate = new Date(j.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0 && j.status !== 'completed';
  });

  if (isLoading) return <AppLayout><LoadingSpinner text="Loading dashboard..." /></AppLayout>;

  return (
    <AppLayout>
      <div className="page-container">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard title="My Active Jobs" value={activeJobs.length} subtitle="Currently in progress" icon={Briefcase} variant="info" />
          <KPICard title="Pending Tasks" value={pendingJobs.length} subtitle="Waiting to start" icon={Clock} variant="pending" />
          <KPICard title="Completed" value={completedJobs.length} subtitle="Tasks finished" icon={CheckCircle} variant="success" />
          <KPICard title="Overdue" value={overdueJobs.length} subtitle="Past due date" icon={AlertTriangle} variant="destructive" />
          <KPICard title="Upcoming Deadlines" value={upcomingDeadlines.length} subtitle="Due within 7 days" icon={Calendar} variant="warning" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">My Jobs</CardTitle>
              <Button variant="outline" size="sm" asChild><Link to="/jobs">View All</Link></Button>
            </CardHeader>
            <CardContent>
              {myJobs.length === 0 ? <p className="text-center text-muted-foreground py-8">No jobs assigned</p> : (
                <div className="space-y-4">
                  {myJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">Due: {new Date(job.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${job.progress}%` }} /></div>
                          <p className="mt-1 text-xs text-muted-foreground text-right">{job.progress}%</p>
                        </div>
                        <StatusBadge status={job.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              <Button variant="outline" size="sm" asChild><Link to="/notifications">View All</Link></Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className={`flex items-start gap-3 rounded-lg border p-4 ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}>
                    <div className={`mt-1 h-2 w-2 rounded-full ${notification.type === 'warning' ? 'bg-warning' : notification.type === 'success' ? 'bg-success' : 'bg-info'}`} />
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5" />Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? <p className="text-center text-muted-foreground py-8">No upcoming deadlines in the next 7 days</p> : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingDeadlines.map((job) => {
                    const dueDate = new Date(job.dueDate);
                    const today = new Date();
                    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={job.id} className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                        <div className="flex items-center justify-between">
                          <StatusBadge status={job.priority} variant="warning" />
                          <span className="text-sm font-medium text-warning">{diffDays} day{diffDays !== 1 ? 's' : ''} left</span>
                        </div>
                        <p className="mt-2 font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">Due: {dueDate.toLocaleDateString()}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmployeeDashboard;
