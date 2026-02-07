import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { createJob, fetchEligibleAssignees } from "@/features/job/jobSlice";
import { fetchDepartments } from "@/features/employee/employeeSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Briefcase, ListTodo, FileUp, Bell, Database } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 1.5;
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function CreateJobPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { departments } = useAppSelector((state) => state.employee);
  const { eligibleAssignees } = useAppSelector((state) => state.job);

  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    title: "",
    jobDetails: "",
    assigneeId: "",
    department: "",
    remarks: "",
    mdmReference: "",
    mdmCategory: "",
    alertDaily: true,
    alertWeekly: false,
    alertWeeklyDays: 1,
    alertMonthly: false,
    alertMonthlyDay: 1,
    dueDate: today,
    status: "draft",
    priority: "medium",
    progress: 0,
    encoder: user?.name ?? "",
    encodeDate: today,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isGM = user?.role === "gm";
  const isSystemAdmin = user?.role === "system_admin";
  const isSupervisor = user?.role === "supervisor";
  const [autoApprove, setAutoApprove] = useState(true);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);
  useEffect(() => {
    const dept = formData.department || null;
    dispatch(fetchEligibleAssignees(dept));
  }, [dispatch, formData.department]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFileError("");
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setFileError(`File must be under ${MAX_FILE_SIZE_MB} MB`);
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFileError("");
    if (file && file.size > MAX_FILE_BYTES) {
      setFileError(`File must be under ${MAX_FILE_SIZE_MB} MB`);
      return;
    }
    setIsSubmitting(true);
    try {
      const needsApproval = isSupervisor || (isGM && !autoApprove);
      const payload = {
        title: formData.title,
        description: formData.jobDetails,
        department: formData.department,
        assigneeId: formData.assigneeId || undefined,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status,
        autoApprove: isGM ? !!autoApprove : undefined,
      };
      await dispatch(createJob(payload)).unwrap();
      toast.success(needsApproval ? "Job submitted for approval" : "Job created");
      navigate("/jobs");
    } catch (error) {
      toast.error(error?.message || "Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto pb-6">
        <PageHeader
          title="Create Job"
          subtitle="Add a new job or task (enterprise form)"
          showBack
        />
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5" />
                Job Header
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Encoder</Label>
                <Input value={formData.encoder} readOnly disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Encode Date</Label>
                <Input type="date" value={formData.encodeDate} readOnly disabled className="bg-muted" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter job title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department / Category *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleChange("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">Assigned To</Label>
                <Select
                  value={formData.assigneeId}
                  onValueChange={(value) => handleChange("assigneeId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleAssignees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  placeholder="Optional remarks"
                  value={formData.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="h-5 w-5" />
                MDM Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mdmReference">MDM Reference</Label>
                <Input
                  id="mdmReference"
                  placeholder="Reference ID"
                  value={formData.mdmReference}
                  onChange={(e) => handleChange("mdmReference", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mdmCategory">MDM Category</Label>
                <Input
                  id="mdmCategory"
                  placeholder="Category"
                  value={formData.mdmCategory}
                  onChange={(e) => handleChange("mdmCategory", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Alert Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alertDaily"
                  checked={formData.alertDaily}
                  onCheckedChange={(v) => handleChange("alertDaily", !!v)}
                />
                <Label htmlFor="alertDaily">Daily reminder</Label>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="alertWeekly"
                    checked={formData.alertWeekly}
                    onCheckedChange={(v) => handleChange("alertWeekly", !!v)}
                  />
                  <Label htmlFor="alertWeekly">Weekly</Label>
                </div>
                {formData.alertWeekly && (
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Days before due:</Label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      className="w-20"
                      value={formData.alertWeeklyDays}
                      onChange={(e) => handleChange("alertWeeklyDays", parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="alertMonthly"
                    checked={formData.alertMonthly}
                    onCheckedChange={(v) => handleChange("alertMonthly", !!v)}
                  />
                  <Label htmlFor="alertMonthly">Monthly</Label>
                </div>
                {formData.alertMonthly && (
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Day of month:</Label>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      className="w-20"
                      value={formData.alertMonthlyDay}
                      onChange={(e) => handleChange("alertMonthlyDay", parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListTodo className="h-5 w-5" />
                Job Details (Rich content)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="jobDetails">Details *</Label>
              <Textarea
                id="jobDetails"
                placeholder="Enter job details (supports multi-line; can be replaced with rich text editor)"
                value={formData.jobDetails}
                onChange={(e) => handleChange("jobDetails", e.target.value)}
                rows={6}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileUp className="h-5 w-5" />
                File Upload (max {MAX_FILE_SIZE_MB} MB)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input type="file" onChange={handleFileChange} />
              {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
              {fileError && <p className="text-sm text-destructive mt-2">{fileError}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {isGM && (
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="autoApprove"
                    checked={autoApprove}
                    onCheckedChange={(v) => setAutoApprove(!!v)}
                  />
                  <Label htmlFor="autoApprove">Approve by default (no approval needed)</Label>
                </div>
              )}
              {isSupervisor && (
                <p className="text-sm text-muted-foreground mb-4">
                  Job will be submitted for approval to General Manager or System Admin.
                </p>
              )}
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSupervisor || (isGM && !autoApprove)
                    ? "Submit for Approval"
                    : "Create Job"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}

export default CreateJobPage;
