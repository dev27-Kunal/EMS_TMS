import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchRoles } from '@/features/employee/employeeSlice';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Settings, Plus, Key } from 'lucide-react';

function RolePermissionPage() {
    const dispatch = useAppDispatch();
    const { roles, isLoading } = useAppSelector((state) => state.employee);
    useEffect(() => { dispatch(fetchRoles()); }, [dispatch]);
    if (isLoading) return <AppLayout><LoadingSpinner text="Loading roles..." /></AppLayout>;
    const hasPerm = (role, pattern) => role.permissions.includes('all') || role.permissions.some(p => p.includes(pattern));
    return (
        <AppLayout>
            <div className="page-container">
                <PageHeader title="Roles & Permissions" subtitle="Manage system roles and access permissions" actions={<Button asChild><Link to="/employees/roles/create"><Plus className="mr-2 h-4 w-4" />Create Role</Link></Button>} />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (<Card key={role.id} className="hover:shadow-md transition-shadow"><CardHeader className="pb-3"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div><div><CardTitle className="text-lg">{role.name}</CardTitle><p className="text-sm text-muted-foreground font-mono">{role.code}</p></div></div></div></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">{role.description}</p><div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Users with this role:</span><span className="ml-auto font-semibold">{role.userCount}</span></div><div><div className="flex items-center gap-2 mb-2"><Key className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Permissions</span></div><div className="flex flex-wrap gap-1">{role.permissions.slice(0, 4).map((permission) => (<Badge key={permission} variant="secondary" className="text-xs">{permission}</Badge>))}{role.permissions.length > 4 && <Badge variant="outline" className="text-xs">+{role.permissions.length - 4} more</Badge>}</div></div><div className="flex gap-2"><Button variant="outline" size="sm" className="flex-1" asChild><Link to={'/employees/roles/' + role.id + '/edit'}><Settings className="mr-2 h-4 w-4" />Edit Role</Link></Button><Button variant="outline" size="sm" className="flex-1" asChild><Link to={'/employees/roles/' + role.id}><Users className="mr-2 h-4 w-4" />View Users</Link></Button></div></CardContent></Card>))}
                </div>
                <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Key className="h-5 w-5" />Permission Matrix</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Role</th><th>Employees</th><th>Jobs</th><th>Approvals</th><th>Reports</th><th>Settings</th></tr></thead><tbody>{roles.map((role) => (<tr key={role.id}><td><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><Link to={'/employees/roles/' + role.id} className="font-medium hover:underline">{role.name}</Link></div></td><td><Badge variant={hasPerm(role, 'employees') ? 'default' : 'secondary'}>{role.permissions.includes('all') ? 'Full' : hasPerm(role, 'employees:team') ? 'Team' : 'Own'}</Badge></td><td><Badge variant={hasPerm(role, 'jobs') ? 'default' : 'secondary'}>{role.permissions.includes('all') ? 'Full' : hasPerm(role, 'jobs:all') ? 'All' : 'Own'}</Badge></td><td><Badge variant={hasPerm(role, 'approvals') ? 'default' : 'outline'}>{hasPerm(role, 'approvals:all') || role.permissions.includes('all') ? 'Yes' : 'No'}</Badge></td><td><Badge variant={hasPerm(role, 'reports') ? 'default' : 'outline'}>{role.permissions.includes('all') ? 'All' : hasPerm(role, 'reports') ? 'Limited' : 'No'}</Badge></td><td><Badge variant={role.permissions.includes('all') ? 'default' : 'outline'}>{role.permissions.includes('all') ? 'Yes' : 'No'}</Badge></td></tr>))}</tbody></table></div></CardContent></Card>
            </div>
        </AppLayout>
    );
}
export default RolePermissionPage;
