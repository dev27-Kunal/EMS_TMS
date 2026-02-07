import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchRole, updateRole } from "@/features/employee/employeeSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Shield, Key } from "lucide-react";
import { AVAILABLE_PERMISSIONS } from "@/utils/constants";

function EditRolePage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedRole, isLoading } = useAppSelector((state) => state.employee);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    permissions: [],
  });

  useEffect(() => {
    if (id) dispatch(fetchRole(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedRole) {
      setFormData({
        name: selectedRole.name,
        code: selectedRole.code,
        description: selectedRole.description || "",
        permissions: selectedRole.permissions || [],
      });
    }
  }, [selectedRole]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePermissionToggle = (permValue, checked) => {
    setFormData((prev) => {
      if (permValue === "all") {
        return { ...prev, permissions: checked ? ["all"] : [] };
      }
      if (checked) {
        const next = prev.permissions.filter((p) => p !== "all");
        return { ...prev, permissions: [...next, permValue] };
      }
      return {
        ...prev,
        permissions: prev.permissions.filter((p) => p !== permValue),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(
        updateRole({
          id,
          data: {
            name: formData.name,
            code: formData.code,
            description: formData.description,
            permissions: formData.permissions.length
              ? formData.permissions
              : ["profile:own"],
          },
        })
      );
      navigate("/employees/roles/" + id);
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAll = formData.permissions.includes("all");

  if (isLoading || !selectedRole) {
    return (
      <AppLayout>
        <LoadingSpinner text="Loading role..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto">
        <PageHeader
          title="Edit Role"
          subtitle={"Editing " + selectedRole.name}
          showBack
        />
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Project Manager"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Role Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g. project_manager"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of this role"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5" />
                Permissions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select the permissions this role should have
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <div
                    key={perm.value}
                    className="flex items-center space-x-2 rounded-lg border p-3"
                  >
                    <Checkbox
                      id={perm.value}
                      checked={
                        hasAll
                          ? perm.value === "all"
                          : formData.permissions.includes(perm.value)
                      }
                      onCheckedChange={(checked) =>
                        handlePermissionToggle(perm.value, !!checked)
                      }
                      disabled={hasAll && perm.value !== "all"}
                    />
                    <Label
                      htmlFor={perm.value}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {perm.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
              onClick={() => navigate("/employees/roles/" + id)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default EditRolePage;
