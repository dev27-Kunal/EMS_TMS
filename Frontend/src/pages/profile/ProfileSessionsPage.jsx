import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchLoginHistory } from "@/features/loginHistory/loginHistorySlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

function ProfileSessionsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { records, isLoading } = useAppSelector((state) => state.loginHistory);

  useEffect(() => {
    if (user?.id) dispatch(fetchLoginHistory({ userId: user.id }));
  }, [dispatch, user?.id]);

  const mySessions = records || [];

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner text="Loading login activity..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container">
        <PageHeader
          title="Login Activity"
          subtitle="Your recent sign-in history"
          showBack
          actions={
            <Button variant="outline" asChild>
              <Link to="/login-history">View All History</Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="p-0">
            {mySessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-medium">No login activity found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your recent sessions will appear here.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/login-history">View full login history</Link>
                </Button>
              </div>
            ) : (
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
                    {mySessions.map((r) => (
                      <tr
                        key={r.id}
                        className={
                          r.status === "failed" ? "bg-destructive/5" : ""
                        }
                      >
                        <td className="font-mono text-sm">{r.ipAddress}</td>
                        <td>{r.device}</td>
                        <td>{r.location}</td>
                        <td>{new Date(r.loginAt).toLocaleString()}</td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default ProfileSessionsPage;
