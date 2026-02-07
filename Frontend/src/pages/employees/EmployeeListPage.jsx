import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchEmployees, setFilters, clearFilters } from '@/features/employee/employeeSlice';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import DataTableFilters from '@/components/DataTableFilters';
import Pagination from '@/components/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, Eye, Pencil, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ROLES, ROLE_LABELS } from '@/utils/constants';
import { updateEmployee, deleteEmployee } from '@/features/employee/employeeSlice';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

function EmployeeListPage() {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const { user } = useAppSelector((state) => state.auth);
    const { employees, isLoading, filters } = useAppSelector((state) => state.employee);
    const canEnableDisable = [ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN].includes(user?.role);
    const canDelete = [ROLES.SYSTEM_ADMIN, ROLES.HR_ADMIN, ROLES.GM, ROLES.MANAGER, ROLES.SUPERVISOR].includes(user?.role);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    useEffect(() => { dispatch(fetchEmployees()); }, [dispatch]);
    useEffect(() => {
        const dept = searchParams.get('department');
        if (dept) dispatch(setFilters({ department: dept }));
    }, [dispatch, searchParams]);
    const filteredEmployees = employees.filter((employee) => {
        if (filters.department && filters.department !== 'all' && employee.department !== filters.department) return false;
        if (filters.status && filters.status !== 'all' && employee.status !== filters.status) return false;
        if (filters.search) { const searchLower = filters.search.toLowerCase(); return employee.name.toLowerCase().includes(searchLower) || employee.email.toLowerCase().includes(searchLower) || employee.employeeId.toLowerCase().includes(searchLower); }
        return true;
    });
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const departments = [...new Set(employees.map((e) => e.department))];
    const statuses = ['active', 'inactive', 'on_leave', 'terminated'];
    const filterConfigs = [{ key: 'department', label: 'Department', options: departments.map((d) => ({ value: d, label: d })) }, { key: 'status', label: 'Status', options: statuses.map((s) => ({ value: s, label: s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) })) }];
    if (isLoading) return <AppLayout><LoadingSpinner text="Loading employees..." /></AppLayout>;
    return (
        <AppLayout>
            <div className="page-container">
                <PageHeader title="Employees" subtitle={employees.length + ' total employees'} actions={<Button asChild><Link to="/employees/create"><UserPlus className="mr-2 h-4 w-4" />Add Employee</Link></Button>} />
                <Card><CardContent className="p-0">
                    <div className="p-4 border-b"><DataTableFilters searchValue={filters.search} onSearchChange={(value) => dispatch(setFilters({ search: value }))} searchPlaceholder="Search employees..." filters={filterConfigs} filterValues={{ department: filters.department, status: filters.status }} onFilterChange={(key, value) => { const o = {}; o[key] = value; dispatch(setFilters(o)); }} onClearFilters={() => dispatch(clearFilters())} /></div>
                    {filteredEmployees.length === 0 ? <EmptyState icon={Users} title="No employees found" description="Try adjusting your filters or add a new employee." action={{ label: 'Add Employee', onClick: () => window.location.href = '/employees/create' }} /> : (<><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Employee ID</th><th>Name</th><th>Department</th><th>Role</th><th>Position</th><th>Supervisor</th><th>Hire Date</th><th>Status</th><th>{canEnableDisable ? 'Enable/Disable' : ''}</th><th>Actions</th></tr></thead><tbody>{paginatedEmployees.map((employee) => (<tr key={employee.id}><td className="font-mono text-sm">{employee.employeeId}</td><td><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{employee.name.split(' ').map((n) => n[0]).join('')}</div><div><p className="font-medium">{employee.name}</p><p className="text-xs text-muted-foreground">{employee.email}</p></div></div></td><td>{employee.department}</td><td>{employee.role ? ROLE_LABELS[employee.role] || employee.role : '—'}</td><td>{employee.position}</td><td>{employee.supervisor}</td><td>{new Date(employee.hireDate).toLocaleDateString()}</td><td><StatusBadge status={employee.status} /></td><td>{canEnableDisable && <Switch checked={employee.status === 'active'} onCheckedChange={() => dispatch(updateEmployee({ id: employee.id, data: { ...employee, status: employee.status === 'active' ? 'inactive' : 'active' } }))} />}</td><td><div className="flex items-center gap-1"><Button variant="ghost" size="icon" asChild><Link to={'/employees/' + employee.id}><Eye className="h-4 w-4" /></Link></Button><Button variant="ghost" size="icon" asChild><Link to={'/employees/' + employee.id + '/edit'}><Pencil className="h-4 w-4" /></Link></Button>{canDelete && <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove Employee</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove {employee.name}? This will delete their account and login credentials. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => dispatch(deleteEmployee(employee.id)).unwrap().then(() => toast.success("Employee removed")).catch((e) => toast.error(e || "Failed to remove"))} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}</div></td></tr>))}</tbody></table></div>{totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}</>)}
                </CardContent></Card>
            </div>
        </AppLayout>
    );
}
export default EmployeeListPage;
