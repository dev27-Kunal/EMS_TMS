import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchLoginHistory } from '@/features/loginHistory/loginHistorySlice';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';

const UserLoginHistoryPage = () => {
  const { userId } = useParams();
  const dispatch = useAppDispatch();
  const { records, isLoading } = useAppSelector((state) => state.loginHistory);

  useEffect(() => {
    dispatch(fetchLoginHistory({ userId }));
  }, [dispatch, userId]);

  if (isLoading) return <AppLayout><LoadingSpinner text="Loading login history..." /></AppLayout>;

  const userRecords = records;
  const userName = userRecords[0]?.userName || 'User';

  return (
    <AppLayout>
      <div className="page-container">
        <PageHeader
          title={`Login History: ${userName}`}
          subtitle={`${userRecords.length} login attempt(s)`}
          showBack
        />
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>Device</th>
                    <th>Location</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted-foreground py-8">
                        No login history found for this user.
                      </td>
                    </tr>
                  ) : (
                    userRecords.map((r) => (
                      <tr key={r.id} className={r.status === 'failed' ? 'bg-destructive/5' : ''}>
                        <td className="font-mono text-sm">{r.ipAddress}</td>
                        <td>{r.device}</td>
                        <td>{r.location}</td>
                        <td>{new Date(r.loginAt).toLocaleString()}</td>
                        <td><StatusBadge status={r.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default UserLoginHistoryPage;
