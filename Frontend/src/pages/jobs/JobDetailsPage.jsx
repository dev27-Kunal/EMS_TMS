import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchJob, fetchJobHistory, clearSelectedJob, deleteJob } from "@/features/job/jobSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Briefcase, User, ListTodo, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ROLES } from "@/utils/constants";

function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const canDeleteJob = [ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.GM, ROLES.HR_ADMIN, ROLES.SYSTEM_ADMIN].includes(user?.role);
  const { selectedJob, jobHistory, isLoading } = useAppSelector((state) => state.job);

  useEffect(() => {
    if (id) {
      dispatch(fetchJob(id));
      dispatch(fetchJobHistory(id));
    }
    return () => dispatch(clearSelectedJob());
  }, [dispatch, id]);

  if (isLoading || !selectedJob) {
    return (
      <AppLayout>
        <LoadingSpinner text="Loading job details..." />
      </AppLayout>
    );
  }

  const job = selectedJob;

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto">
        <PageHeader
          title={job.title}
          subtitle={job.jobId}
          showBack
          actions={
            <div className="flex gap-2">
              <Button asChild>
                <Link to={`/jobs/${id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Job
                </Link>
              </Button>
              {canDeleteJob && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="text-destructive-foreground">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Job
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Job</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{job.title}&quot;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            await dispatch(deleteJob(id)).unwrap();
                            toast.success("Job deleted");
                            navigate("/jobs");
                          } catch (e) {
                            toast.error(e || "Failed to delete job");
                          }
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{job.description || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{job.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <StatusBadge
                    status={job.priority}
                    variant={
                      job.priority === "urgent"
                        ? "destructive"
                        : job.priority === "high"
                        ? "warning"
                        : "muted"
                    }
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={job.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <span className="text-sm">{job.progress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Assignment & Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Assignee</p>
                <p className="font-medium">{job.assignee?.name ?? "Unassigned"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">
                  {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListTodo className="h-5 w-5" />
              Activity History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {jobHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{entry.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.details} · {entry.user}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default JobDetailsPage;
