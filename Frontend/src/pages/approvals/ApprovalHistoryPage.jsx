import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchApprovals } from "@/features/approval/approvalSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { History } from "lucide-react";

function ApprovalHistoryPage() {
  const dispatch = useAppDispatch();
  const { approvals, isLoading } = useAppSelector((state) => state.approval);

  useEffect(() => {
    dispatch(fetchApprovals());
  }, [dispatch]);

  const historyItems = approvals.filter(
    (a) => a.status === "approved" || a.status === "rejected"
  );

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner text="Loading approval history..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container">
        <PageHeader
          title="Approval History"
          subtitle={`${historyItems.length} completed approvals`}
          actions={
            <Button variant="outline" asChild>
              <Link to="/approvals">Pending Approvals</Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="p-0">
            {historyItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-medium">No approval history yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Approved or rejected items will appear here.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/approvals">Go to Approvals</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Requester</th>
                      <th>Department</th>
                      <th>Description</th>
                      <th>Submitted</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyItems.map((approval) => (
                      <tr key={approval.id}>
                        <td>
                          <StatusBadge status={approval.type} variant="info" />
                        </td>
                        <td className="font-medium">{approval.requester}</td>
                        <td>{approval.department}</td>
                        <td className="max-w-xs truncate">
                          {approval.description}
                        </td>
                        <td>
                          {new Date(approval.submittedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <StatusBadge
                            status={approval.status}
                            variant={
                              approval.status === "approved"
                                ? "success"
                                : "destructive"
                            }
                          />
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

export default ApprovalHistoryPage;
