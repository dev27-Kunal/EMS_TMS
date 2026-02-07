import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchApproval, approveRequest, rejectRequest } from "@/features/approval/approvalSlice";
import { fetchJobs } from "@/features/job/jobSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, History, Briefcase } from "lucide-react";
import { toast } from "sonner";

function ApprovalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedApproval: approval, isLoading } = useAppSelector((state) => state.approval);
  const canApprove = user?.role !== "hr_admin";
  const { jobs } = useAppSelector((state) => state.job);
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchApproval(id));
    dispatch(fetchJobs());
  }, [dispatch, id]);

  const job = approval?.jobId && jobs.length ? jobs.find((j) => j.id === approval.jobId) : null;
  const historyItems = [];

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await dispatch(approveRequest({ id: approval.id, comment: remarks })).unwrap();
      toast.success("Approval submitted.");
      navigate("/approvals");
    } catch (e) {
      toast.error(e?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    setActionLoading(true);
    try {
      await dispatch(rejectRequest({ id: approval.id, reason: remarks })).unwrap();
      toast.success("Rejection submitted.");
      navigate("/approvals");
    } catch (e) {
      toast.error(e?.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading || !approval) {
    return (
      <AppLayout>
        <LoadingSpinner text="Loading approval..." />
      </AppLayout>
    );
  }

  const isPending = approval.status === "pending";

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto">
        <PageHeader
          title="Approval Details"
          subtitle={`${approval.type} · ${approval.status}`}
          showBack
          actions={
            <Button variant="outline" asChild>
              <Link to="/approvals">Back to list</Link>
            </Button>
          }
        />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Request / Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <StatusBadge status={approval.type} variant="info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge
                    status={approval.status}
                    variant={
                      approval.status === "approved"
                        ? "success"
                        : approval.status === "rejected"
                        ? "destructive"
                        : "pending"
                    }
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requester</p>
                  <p className="font-medium">{approval.requester}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{approval.department}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{approval.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p>{new Date(approval.submittedAt).toLocaleString()}</p>
                </div>
              </div>
              {job && (
                <div className="mt-4 pt-4 border-t grid gap-2 sm:grid-cols-2">
                  <p className="text-sm text-muted-foreground sm:col-span-2">Linked Job</p>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Title</p>
                    <p className="font-medium">{job.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p>{new Date(job.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assignee</p>
                    <p>{job.assignee?.name ?? job.assignee ?? "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p>{job.progress}%</p>
                  </div>
                </div>
              )}
              {approval.jobTitle && !job && (
                <div className="mt-4 pt-4 border-t grid gap-2 sm:grid-cols-2">
                  <p className="text-sm text-muted-foreground">Job Title</p>
                  <p className="font-medium">{approval.jobTitle}</p>
                  {approval.jobDueDate && (
                    <>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p>{new Date(approval.jobDueDate).toLocaleDateString()}</p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Approval History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history yet.</p>
              ) : (
                <ul className="space-y-3">
                  {historyItems.map((h) => (
                    <li key={h.id} className="flex items-center gap-3 text-sm">
                      <span className="font-medium">{h.action}</span>
                      <span className="text-muted-foreground">by {h.by}</span>
                      <span className="text-muted-foreground">
                        {new Date(h.at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {approval.approvedBy && (
                <p className="mt-3 text-sm text-success">
                  Approved by {approval.approvedBy} on{" "}
                  {approval.approvedAt && new Date(approval.approvedAt).toLocaleDateString()}
                  {approval.remark && ` — ${approval.remark}`}
                </p>
              )}
              {approval.rejectedBy && (
                <p className="mt-3 text-sm text-destructive">
                  Rejected by {approval.rejectedBy} on{" "}
                  {approval.rejectedAt && new Date(approval.rejectedAt).toLocaleDateString()}
                  {approval.remark && ` — ${approval.remark}`}
                </p>
              )}
            </CardContent>
          </Card>

          {isPending && canApprove && (
            <Card>
              <CardHeader>
                <CardTitle>Approve / Reject</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Enter remarks (required for rejection)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default ApprovalDetailPage;
