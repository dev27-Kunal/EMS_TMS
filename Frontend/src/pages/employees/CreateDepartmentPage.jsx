import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { createDepartment } from "@/features/employee/employeeSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2 } from "lucide-react";

function CreateDepartmentPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    head: "",
    budget: "",
    status: "active",
  });

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await dispatch(
        createDepartment({
          name: formData.name,
          head: formData.head,
          budget: parseInt(formData.budget, 10) || 0,
          status: formData.status,
          employeeCount: 0,
        })
      ).unwrap();
      navigate("/employees/departments/" + result.id);
    } catch (error) {
      console.error("Failed to create department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto">
        <PageHeader
          title="Create Department"
          subtitle="Add a new department to the organization"
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
                />
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
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Department
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/employees/departments")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default CreateDepartmentPage;
