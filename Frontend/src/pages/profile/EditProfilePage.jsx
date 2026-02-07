import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setUser } from "@/features/auth/authSlice";
import { updateProfile } from "@/features/user/userSlice";
import { fetchDepartments } from "@/features/employee/employeeSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, User } from "lucide-react";
import { ROLE_LABELS } from "@/utils/constants";

function EditProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { departments } = useAppSelector((state) => state.employee);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    department: user?.department ?? "",
  });

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);
  useEffect(() => {
    setFormData({ name: user?.name ?? "", email: user?.email ?? "", department: user?.department ?? "" });
  }, [user]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await dispatch(updateProfile({ name: formData.name, department: formData.department }));
      if (updateProfile.fulfilled.match(result)) {
        dispatch(setUser({ ...user, ...formData }));
        navigate("/profile");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="page-container max-w-2xl mx-auto">
        <PageHeader
          title="Edit Profile"
          subtitle="Update your personal information"
          showBack
        />
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed. Contact an administrator.</p>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
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
                <Label>Role</Label>
                <Input
                  value={ROLE_LABELS[user.role] || user.role}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Role cannot be changed here. Contact an administrator.
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save changes
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default EditProfilePage;
