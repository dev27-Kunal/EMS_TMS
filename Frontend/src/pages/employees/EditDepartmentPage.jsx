import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchDepartment, updateDepartment, deleteDepartment } from "@/features/employee/employeeSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function EditDepartmentPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedDepartment, isLoading } = useAppSelector(
    (state) => state.employee
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    head: "",
    budget: "",
    status: "active",
  });

  useEffect(() => {
    if (id) dispatch(fetchDepartment(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedDepartment) {
      setFormData({
        name: selectedDepartment.name,
        head: selectedDepartment.head,
        budget: String(selectedDepartment.budget || 0),
        status: selectedDepartment.status || "active",
      });
    }
  }, [selectedDepartment]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(
        updateDepartment({
          id,
          data: {
            name: formData.name,
            head: formData.head,
            budget: parseInt(formData.budget, 10) || 0,
            status: formData.status,
          },
        })
      );
      navigate("/employees/departments/" + id);
    } catch (error) {
      console.error("Failed to update department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !selectedDepartment) {
    return (
      <AppLayout>
        <LoadingSpinner text="Loading department..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto">
        <PageHeader
          title="Edit Department"
          subtitle={"Editing " + selectedDepartment.name}
          showBack
        />
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Department Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Engineering, Human Resources"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  disabled={selectedDepartment?.isDefault}
                  className={selectedDepartment?.isDefault ? "bg-muted" : ""}
                />
                {selectedDepartment?.isDefault && (
                  <p className="text-sm text-muted-foreground">The &quot;All&quot; department cannot be renamed or deleted.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="head">Department Head *</Label>
                <Input
                  id="head"
                  placeholder="Enter department head name"
                  value={formData.head}
                  onChange={(e) => handleChange("head", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Annual Budget *</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  placeholder="Enter annual budget amount"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3 items-center justify-between">
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/employees/departments/" + id)}
              >
                Cancel
              </Button>
            </div>
            {!selectedDepartment?.isDefault && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" className="text-destructive-foreground">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Department
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Department</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{selectedDepartment?.name}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        try {
                          await dispatch(deleteDepartment(id)).unwrap();
                          toast.success("Department deleted");
                          navigate("/employees/departments");
                        } catch (e) {
                          toast.error(e || "Failed to delete department");
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
        </form>
      </div>
    </AppLayout>
  );
}

export default EditDepartmentPage;
