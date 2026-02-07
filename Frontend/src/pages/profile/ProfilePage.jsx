import { useAppSelector } from '@/app/hooks';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building2, Pencil, Key } from 'lucide-react';
import { ROLE_LABELS } from '@/utils/constants';

const ProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);
  return (
    <AppLayout>
      <div className="page-container max-w-3xl mx-auto">
        <PageHeader title="My Profile" actions={<Button asChild><Link to="/profile/edit"><Pencil className="mr-2 h-4 w-4" />Edit Profile</Link></Button>} />
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <StatusBadge status={ROLE_LABELS[user?.role] || 'User'} variant="info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5" />Department</CardTitle></CardHeader>
            <CardContent><p className="text-lg font-medium">{user?.department || 'Not assigned'}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Key className="h-5 w-5" />Security</CardTitle></CardHeader>
            <CardContent><Button variant="outline" asChild><Link to="/change-password">Change Password</Link></Button></CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
