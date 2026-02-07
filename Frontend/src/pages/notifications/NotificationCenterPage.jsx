import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchNotifications, markAsRead, markAllAsRead } from '@/features/notification/notificationSlice';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';

const NotificationCenterPage = () => {
  const dispatch = useAppDispatch();
  const { notifications, isLoading, unreadCount } = useAppSelector((state) => state.notification);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  if (isLoading) return <AppLayout><LoadingSpinner text="Loading notifications..." /></AppLayout>;

  return (
    <AppLayout>
      <div className="page-container max-w-3xl mx-auto">
        <PageHeader title="Notifications" subtitle={`${unreadCount} unread`} actions={unreadCount > 0 && <Button variant="outline" onClick={() => dispatch(markAllAsRead())}><CheckCheck className="mr-2 h-4 w-4" />Mark all read</Button>} />
        <Card>
          <CardContent className="p-0 divide-y">
            {notifications.map((n) => (
              <div key={n.id} className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50 ${!n.read ? 'bg-primary/5' : ''}`} onClick={() => !n.read && dispatch(markAsRead(n.id))}>
                <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${n.type === 'success' ? 'bg-success/10 text-success' : n.type === 'warning' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}><Bell className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NotificationCenterPage;
