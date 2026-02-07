import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchApprovals } from "@/features/approval/approvalSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye, Briefcase } from "lucide-react";

function JobApprovalsPage() {
  const dispatch = useAppDispatch();
  const { approvals, isLoading } = useAppSelector((state) => state.approval);

  useEffect(() => {
    dispatch(fetchApprovals());
  }, [dispatch]);

  const jobApprovals = approvals.filter((a) =>
    (a.type || "").toLowerCase().includes("job")
  );
  const pending = jobApprovals.filter((a) => a.status === "pending");

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner text="Loading job approvals..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container">
        <PageHeader
          title="Job Approvals"
          subtitle={`${pending.length} pending · ${jobApprovals.length} total job-related`}
          actions={
            <Button variant="outline" asChild>
              <Link to="/approvals">View All Approvals</Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="p-0">
            {jobApprovals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-medium">No job-related approvals</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Approvals related to jobs will appear here.
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobApprovals.map((approval) => (
                      <tr key={approval.id}>
                        <td>
                          <StatusBadge status={approval.type} variant="info" />
                        </td>
                        <td className="font-medium">{approval.requester}</td>
                        <td>{approval.department}</td>
                        <td className="max-w-xs truncate">{approval.description}</td>
                        <td>
                          {new Date(approval.submittedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <StatusBadge status={approval.status} />
                        </td>
                        <td>
                          {approval.status === "pending" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="default">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/approvals/${approval.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
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

export default JobApprovalsPage;
