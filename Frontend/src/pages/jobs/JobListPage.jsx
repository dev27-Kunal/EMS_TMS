import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchJobs, setFilters, clearFilters, setView, deleteJob } from '@/features/job/jobSlice';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import DataTableFilters from '@/components/DataTableFilters';
import Pagination from '@/components/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Briefcase, Eye, Pencil, Trash2 } from 'lucide-react';
import { ROLES } from '@/utils/constants';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['draft', 'pending_approval', 'pending', 'in_progress', 'completed', 'overdue', 'cancelled'].map((s) => ({
  value: s,
  label: s.replace(/_/g, ' '),
}));

function JobListPage({ view: viewProp }) {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { user } = useAppSelector((state) => state.auth);
    const { jobs, isLoading, filters, view } = useAppSelector((state) => state.job);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const canCreateJob = [ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.GM, ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN].includes(user?.role);
    const showViewTabs = [ROLES.SUPERVISOR, ROLES.GM].includes(user?.role);

    const resolvedView = viewProp ?? (location.pathname === '/jobs/my-jobs' ? 'my_jobs' : location.pathname === '/jobs/assigned' ? 'assigned_jobs' : '');
    useEffect(() => {
      dispatch(setView(resolvedView));
    }, [dispatch, resolvedView]);
    useEffect(() => {
      dispatch(fetchJobs({ view: resolvedView }));
    }, [dispatch, resolvedView]);

    const isOverdue = (job) => {
      if (job.status === 'completed' || job.status === 'cancelled') return false;
      return new Date(job.dueDate) < new Date();
    };

    const filteredJobs = jobs.filter((job) => {
        const statusToShow = isOverdue(job) ? 'overdue' : job.status;
        if (filters.status && filters.status !== 'all' && statusToShow !== filters.status) return false;
        if (filters.department && filters.department !== 'all' && job.department !== filters.department) return false;
        if (filters.search) {
            const s = filters.search.toLowerCase();
            return job.title.toLowerCase().includes(s) || (job.jobId && job.jobId.toLowerCase().includes(s));
        }
        if (filters.dateFrom) {
            const d = new Date(job.dueDate);
            if (d < new Date(filters.dateFrom)) return false;
        }
        if (filters.dateTo) {
            const d = new Date(job.dueDate);
            if (d > new Date(filters.dateTo)) return false;
        }
        return true;
    });
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    if (isLoading) return <AppLayout><LoadingSpinner text="Loading jobs..." /></AppLayout>;
    const onFilterChange = (k, v) => { dispatch(setFilters({ [k]: v })); };
    const filterOpts = [
        { key: 'status', label: 'Status', options: STATUS_OPTIONS },
        { key: 'department', label: 'Department', options: [...new Set(jobs.map((j) => j.department))].map((d) => ({ value: d, label: d })) },
    ];
    const hasDateFilters = filters.dateFrom || filters.dateTo;
    const clearAll = () => { dispatch(clearFilters()); };

    return (
        <AppLayout>
            <div className="page-container">
                <PageHeader
                    title={resolvedView === 'my_jobs' ? 'My Jobs' : resolvedView === 'assigned_jobs' ? 'Assigned Jobs' : 'Jobs & Tasks'}
                    subtitle={filteredJobs.length + ' jobs'}
                    actions={
                      <>
                        {showViewTabs && (
                          <div className="flex gap-2 mr-2">
                            <Button variant={resolvedView === '' ? 'default' : 'outline'} size="sm" asChild>
                              <Link to="/jobs">Job List</Link>
                            </Button>
                            <Button variant={resolvedView === 'my_jobs' ? 'default' : 'outline'} size="sm" asChild>
                              <Link to="/jobs/my-jobs">My Jobs</Link>
                            </Button>
                            <Button variant={resolvedView === 'assigned_jobs' ? 'default' : 'outline'} size="sm" asChild>
                              <Link to="/jobs/assigned">Assigned Jobs</Link>
                            </Button>
                          </div>
                        )}
                        {canCreateJob && <Button asChild><Link to="/jobs/create"><Plus className="mr-2 h-4 w-4" />Create Job</Link></Button>}
                      </>
                    }
                />
                <Card>
                    <CardContent className="p-0">
                        <div className="p-4 border-b space-y-3">
                            <DataTableFilters
                                searchValue={filters.search}
                                onSearchChange={(v) => dispatch(setFilters({ search: v }))}
                                searchPlaceholder="Search jobs..."
                                filters={filterOpts}
                                filterValues={{ status: filters.status, department: filters.department }}
                                onFilterChange={onFilterChange}
                                onClearFilters={clearAll}
                            />
                            <div className="flex flex-wrap items-end gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Due from</Label>
                                    <Input
                                        type="date"
                                        value={filters.dateFrom || ''}
                                        onChange={(e) => onFilterChange('dateFrom', e.target.value || '')}
                                        className="w-40"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Due to</Label>
                                    <Input
                                        type="date"
                                        value={filters.dateTo || ''}
                                        onChange={(e) => onFilterChange('dateTo', e.target.value || '')}
                                        className="w-40"
                                    />
                                </div>
                                {(hasDateFilters || filters.status || filters.department || filters.search) && (
                                    <Button variant="ghost" size="sm" onClick={clearAll}>Clear filters</Button>
                                )}
                            </div>
                        </div>
                        {filteredJobs.length === 0 ? <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting filters or create a new job." /> : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="data-table">
                                        <thead><tr><th>Job ID</th><th>Title</th><th>Assignee</th><th>Department</th><th>Priority</th><th>Progress</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {paginatedJobs.map((job) => (
                                                <tr key={job.id}>
                                                    <td className="font-mono text-sm">{job.jobId}</td>
                                                    <td className="font-medium">{job.title}</td>
                                                    <td>{job.assignee?.name ?? "Unassigned"}</td>
                                                    <td>{job.department}</td>
                                                    <td><StatusBadge status={job.priority} variant={job.priority === 'urgent' ? 'destructive' : job.priority === 'high' ? 'warning' : 'muted'} /></td>
                                                    <td><div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: job.progress + '%' }} /></div><span className="text-sm">{job.progress}%</span></div></td>
                                                    <td>{new Date(job.dueDate).toLocaleDateString()}</td>
                                                    <td><StatusBadge status={isOverdue(job) ? 'overdue' : job.status} /></td>
                                                    <td className="flex gap-1">
                                                        <Button variant="ghost" size="icon" asChild><Link to={'/jobs/' + job.id}><Eye className="h-4 w-4" /></Link></Button>
                                                        {canCreateJob && <Button variant="ghost" size="icon" asChild><Link to={'/jobs/' + job.id + '/edit'}><Pencil className="h-4 w-4" /></Link></Button>}
                                                        {canCreateJob && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Job</AlertDialogTitle>
                                                                        <AlertDialogDescription>Are you sure you want to delete &quot;{job.title}&quot;? This action cannot be undone.</AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={async () => { try { await dispatch(deleteJob(job.id)).unwrap(); toast.success('Job deleted'); } catch (e) { toast.error(e || 'Failed to delete'); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
export default JobListPage;
