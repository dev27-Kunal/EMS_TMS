import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchApprovals } from '@/features/approval/approvalSlice';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

function ApprovalsListPage() {
  const dispatch = useAppDispatch();
  const { approvals, isLoading, pendingCount } = useAppSelector((state) => state.approval);
  useEffect(() => { dispatch(fetchApprovals()); }, [dispatch]);
  if (isLoading) return <AppLayout><LoadingSpinner text="Loading approvals..." /></AppLayout>;
  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  return (
    <AppLayout>
      <div className="page-container">
        <PageHeader title="Pending Approvals" subtitle={String(pendingCount) + ' items require your attention'} />
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Type</th><th>Requester</th><th>Department</th><th>Description</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {pendingApprovals.map((approval) => (
                    <tr key={approval.id}>
                      <td><StatusBadge status={approval.type} variant="info" /></td>
                      <td className="font-medium">{approval.requester}</td>
                      <td>{approval.department}</td>
                      <td className="max-w-xs truncate">{approval.description}</td>
                      <td>{new Date(approval.submittedAt).toLocaleDateString()}</td>
                      <td><StatusBadge status={approval.status} /></td>
                      <td>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" asChild><Link to={`/approvals/${approval.id}`}><Eye className="h-4 w-4" /></Link></Button>
                        </div>
                      </td>
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
export default ApprovalsListPage;
