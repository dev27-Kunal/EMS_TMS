import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchRole, fetchEmployees } from "@/features/employee/employeeSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Pencil, Eye, Key } from "lucide-react";
import { ROLE_LABELS } from "@/utils/constants";

function RoleDetailsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { selectedRole, employees, isLoading } = useAppSelector(
    (state) => state.employee
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchRole(id));
      dispatch(fetchEmployees());
    }
  }, [dispatch, id]);

  const usersWithRole =
    selectedRole?.code
      ? employees.filter((e) => e.role === selectedRole.code)
      : [];

  if (isLoading || !selectedRole) {
    return (
      <AppLayout>
        <LoadingSpinner text="Loading role details..." />
      </AppLayout>
    );
  }

  const role = selectedRole;

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto">
        <PageHeader
          title="Role Details"
          subtitle={role.name}
          showBack
          actions={
            <Button asChild>
              <Link to={"/employees/roles/" + id + "/edit"}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Role
              </Link>
            </Button>
          }
        />

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{role.name}</h2>
                  <p className="font-mono text-muted-foreground">
                    {role.code}
                  </p>
                  {role.description && (
                    <p className="mt-1 text-muted-foreground">
                      {role.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{role.userCount}</span>
                  <span className="text-sm text-muted-foreground">users</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5" />
              Permissions ({role.permissions?.length || 0})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Permissions granted to users with this role
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {role.permissions?.map((perm) => (
                <Badge key={perm} variant="secondary" className="text-sm">
                  {perm}
                </Badge>
              ))}
              {(!role.permissions || role.permissions.length === 0) && (
                <p className="text-muted-foreground">No permissions assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Users with this Role ({usersWithRole.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              System users assigned the {role.name} role
            </p>
          </CardHeader>
          <CardContent>
            {usersWithRole.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No users assigned to this role yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersWithRole.map((emp) => (
                        <tr key={emp.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                {emp.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div>
                                <p className="font-medium">{emp.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ROLE_LABELS[emp.role] || emp.role}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>{emp.email}</td>
                          <td>{emp.department || "-"}</td>
                          <td>
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={"/employees/" + emp.id}>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link to={"/employees/roles/" + id + "/edit"}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Role
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/employees/roles">Back to Roles</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default RoleDetailsPage;
