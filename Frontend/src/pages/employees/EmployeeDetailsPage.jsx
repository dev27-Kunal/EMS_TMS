import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchEmployee, deleteEmployee } from '@/features/employee/employeeSlice';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Mail, Phone, Building2, User, Calendar, Briefcase, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ROLES } from '@/utils/constants';

const ADMIN_ROLES = [ROLES.SYSTEM_ADMIN, ROLES.HR_ADMIN, ROLES.GM, ROLES.MANAGER, ROLES.SUPERVISOR];

function EmployeeDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { selectedEmployee, isLoading } = useAppSelector((state) => state.employee);
    const canDelete = ADMIN_ROLES.includes(user?.role);
    useEffect(() => { if (id) dispatch(fetchEmployee(id)); }, [dispatch, id]);
    const handleDelete = async () => {
        try {
            await dispatch(deleteEmployee(id)).unwrap();
            toast.success('Employee removed successfully');
            navigate('/employees');
        } catch (err) {
            toast.error(err || 'Failed to remove employee');
        }
    };
    if (isLoading || !selectedEmployee) return <AppLayout><LoadingSpinner text="Loading employee details..." /></AppLayout>;
    const employee = selectedEmployee;
    return (
        <AppLayout>
            <div className="page-container max-w-4xl mx-auto">
                <PageHeader title="Employee Details" subtitle={employee.employeeId} showBack actions={<div className="flex gap-2"><Button asChild><Link to={'/employees/' + id + '/edit'}><Pencil className="mr-2 h-4 w-4" />Edit Employee</Link></Button>{canDelete && <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Remove Employee</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove Employee</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove {employee.name}? This will delete their account and login credentials. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}</div>} />
                <Card><CardContent className="p-6"><div className="flex flex-col items-center gap-6 sm:flex-row"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground">{employee.name.split(' ').map((n) => n[0]).join('')}</div><div className="flex-1 text-center sm:text-left"><div className="flex items-center gap-3 justify-center sm:justify-start"><h2 className="text-2xl font-bold">{employee.name}</h2><StatusBadge status={employee.status} /></div><p className="mt-1 text-lg text-muted-foreground">{employee.position}</p><p className="text-muted-foreground">{employee.department}</p></div></div></CardContent></Card>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" />Contact Information</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Mail className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{employee.email}</p></div></div><Separator /><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Phone className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{employee.phone || 'Not provided'}</p></div></div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Briefcase className="h-5 w-5" />Employment Information</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Building2 className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Department</p><p className="font-medium">{employee.department}</p></div></div><Separator /><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><User className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Supervisor</p><p className="font-medium">{employee.supervisor}</p></div></div><Separator /><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Calendar className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Hire Date</p><p className="font-medium">{new Date(employee.hireDate).toLocaleDateString()}</p></div></div></CardContent></Card>
                </div>
                <Card><CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-3"><Button variant="outline" className="justify-start" asChild><Link to={'/employees/' + id + '/edit'}><Pencil className="mr-2 h-4 w-4" />Edit Profile</Link></Button><Button variant="outline" className="justify-start" asChild><Link to={'/jobs?assigneeId=' + employee.id}><Briefcase className="mr-2 h-4 w-4" />View Assigned Jobs</Link></Button><Button variant="outline" className="justify-start" asChild><Link to={'/login-history/user/' + employee.id}><Calendar className="mr-2 h-4 w-4" />Login History</Link></Button>{canDelete && <AlertDialog><AlertDialogTrigger asChild><Button variant="outline" className="justify-start text-destructive hover:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remove Employee</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove Employee</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove {employee.name}? This will delete their account and login credentials. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}</div></CardContent></Card>
            </div>
        </AppLayout>
    );
}
export default EmployeeDetailsPage;
