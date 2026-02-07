import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchLoginHistory, setFilters, clearFilters } from '@/features/loginHistory/loginHistorySlice';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLES, ROLE_LABELS } from '@/utils/constants';

const LoginHistoryPage = () => {
  const dispatch = useAppDispatch();
  const { records, isLoading, filters } = useAppSelector((state) => state.loginHistory);

  useEffect(() => { dispatch(fetchLoginHistory()); }, [dispatch]);

  const filteredRecords = records.filter((r) => {
    if (filters.status && filters.status !== 'all' && r.status !== filters.status) return false;
    if (filters.role && filters.role !== 'all' && r.role !== filters.role) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      return (r.userName && r.userName.toLowerCase().includes(s)) ||
        (r.email && r.email.toLowerCase().includes(s));
    }
    if (filters.startDate) {
      if (new Date(r.loginAt) < new Date(filters.startDate)) return false;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(r.loginAt) > end) return false;
    }
    return true;
  });

  const hasFilters = filters.status || filters.role || filters.search || filters.startDate || filters.endDate;

  if (isLoading) return <AppLayout><LoadingSpinner text="Loading login history..." /></AppLayout>;

  return (
    <AppLayout>
      <div className="page-container">
        <PageHeader title="Login History" subtitle="Security audit log — read-only" />
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b space-y-3">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Employee</Label>
                  <Input
                    placeholder="Search by name or email"
                    value={filters.search || ''}
                    onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                    className="w-48"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role</Label>
                  <Select
                    value={filters.role || 'all'}
                    onValueChange={(v) => dispatch(setFilters({ role: v === 'all' ? '' : v }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Login status</Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(v) => dispatch(setFilters({ status: v === 'all' ? '' : v }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date from</Label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => dispatch(setFilters({ startDate: e.target.value || '' }))}
                    className="w-40"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date to</Label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => dispatch(setFilters({ endDate: e.target.value || '' }))}
                    className="w-40"
                  />
                </div>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={() => dispatch(clearFilters())}>
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>IP Address</th>
                    <th>Device</th>
                    <th>Location</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className={r.status === 'failed' ? 'bg-destructive/5' : ''}>
                      <td className="font-medium">
                        <Link to={`/login-history/user/${r.userId}`} className="text-primary hover:underline">
                          {r.userName}
                        </Link>
                      </td>
                      <td>{r.email}</td>
                      <td>{r.role ? ROLE_LABELS[r.role] || r.role : '—'}</td>
                      <td className="font-mono text-sm">{r.ipAddress}</td>
                      <td>{r.device}</td>
                      <td>{r.location}</td>
                      <td>{new Date(r.loginAt).toLocaleString()}</td>
                      <td><StatusBadge status={r.status} /></td>
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
};

export default LoginHistoryPage;
