import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchDepartments, fetchEmployees, deleteDepartment } from '@/features/employee/employeeSlice';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, DollarSign, Plus, Settings, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

function DepartmentManagementPage() {
    const dispatch = useAppDispatch();
    const { departments, employees, isLoading } = useAppSelector((state) => state.employee);
    useEffect(() => {
        dispatch(fetchDepartments());
        dispatch(fetchEmployees());
    }, [dispatch]);
    const getDepartmentStats = (deptName) => {
        const deptEmployees = employees.filter((e) => e.department === deptName);
        return { total: deptEmployees.length, active: deptEmployees.filter((e) => e.status === 'active').length, onLeave: deptEmployees.filter((e) => e.status === 'on_leave').length };
    };
    if (isLoading) return <AppLayout><LoadingSpinner text="Loading departments..." /></AppLayout>;
    return (
        <AppLayout>
            <div className="page-container">
                <PageHeader title="Department Management" subtitle={departments.length + ' departments in the organization'} actions={<Button asChild><Link to="/employees/departments/create"><Plus className="mr-2 h-4 w-4" />Add Department</Link></Button>} />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {departments.map((dept) => { const stats = getDepartmentStats(dept.name); return (<Card key={dept.id} className="hover:shadow-md transition-shadow"><CardHeader className="pb-3"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><Building2 className="h-6 w-6 text-primary" /></div><div><CardTitle className="text-lg">{dept.name}</CardTitle><p className="text-sm text-muted-foreground">Head: {dept.head}</p></div></div><StatusBadge status={dept.status} /></div></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-3 gap-4 text-center"><div><div className="flex items-center justify-center gap-1"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-lg font-semibold">{stats.total}</span></div><p className="text-xs text-muted-foreground">Total</p></div><div><span className="text-lg font-semibold text-success">{stats.active}</span><p className="text-xs text-muted-foreground">Active</p></div><div><span className="text-lg font-semibold text-warning">{stats.onLeave}</span><p className="text-xs text-muted-foreground">On Leave</p></div></div><div className="flex items-center justify-between rounded-lg bg-muted/50 p-3"><div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Annual Budget</span></div><span className="font-semibold">${dept.budget.toLocaleString()}</span></div><div className="flex gap-2"><Button variant="outline" size="sm" className="flex-1" asChild><Link to={'/employees/departments/' + dept.id + '/edit'}><Settings className="mr-2 h-4 w-4" />Manage</Link></Button><Button variant="outline" size="sm" className="flex-1" asChild><Link to={'/employees/departments/' + dept.id}><Users className="mr-2 h-4 w-4" />View Staff</Link></Button>{!dept.isDefault && (<AlertDialog><AlertDialogTrigger asChild><Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/50"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Department</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete &quot;{dept.name}&quot;? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { try { await dispatch(deleteDepartment(dept.id)).unwrap(); toast.success('Department deleted'); } catch (e) { toast.error(e || 'Failed to delete'); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>)}</div></CardContent></Card>); })}
                </div>
                <Card><CardHeader><CardTitle className="text-lg">Department Summary</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Department</th><th>Head</th><th>Employees</th><th>Budget</th><th>Status</th><th>Actions</th></tr></thead><tbody>{departments.map((dept) => (<tr key={dept.id}><td><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{dept.name}</span></div></td><td>{dept.head}</td><td>{dept.employeeCount}</td><td>${dept.budget.toLocaleString()}</td><td><StatusBadge status={dept.status} /></td><td><div className="flex gap-1"><Button variant="ghost" size="sm" asChild><Link to={'/employees/departments/' + dept.id}>View</Link></Button><Button variant="ghost" size="sm" asChild><Link to={'/employees/departments/' + dept.id + '/edit'}>Edit</Link></Button>{!dept.isDefault && (<AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Department</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete &quot;{dept.name}&quot;? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { try { await dispatch(deleteDepartment(dept.id)).unwrap(); toast.success('Department deleted'); } catch (e) { toast.error(e || 'Failed to delete'); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>)}</div></td></tr>))}</tbody></table></div></CardContent></Card>
            </div>
        </AppLayout>
    );
}
export default DepartmentManagementPage;
