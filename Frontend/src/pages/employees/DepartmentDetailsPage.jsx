import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchDepartment, fetchEmployees } from "@/features/employee/employeeSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  DollarSign,
  Pencil,
  User,
  Eye,
} from "lucide-react";

function DepartmentDetailsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { selectedDepartment, employees, isLoading } = useAppSelector(
    (state) => state.employee
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchDepartment(id));
      dispatch(fetchEmployees());
    }
  }, [dispatch, id]);

  const departmentStaff =
    selectedDepartment?.name
      ? employees.filter((e) => e.department === selectedDepartment.name)
      : [];

  const activeCount = departmentStaff.filter((e) => e.status === "active").length;
  const onLeaveCount = departmentStaff.filter(
    (e) => e.status === "on_leave"
  ).length;

  if (isLoading || !selectedDepartment) {
    return (
      <AppLayout>
        <LoadingSpinner text="Loading department details..." />
      </AppLayout>
    );
  }

  const dept = selectedDepartment;

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto">
        <PageHeader
          title="Department Details"
          subtitle={dept.name}
          showBack
          actions={
            <Button asChild>
              <Link to={"/employees/departments/" + id + "/edit"}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Department
              </Link>
            </Button>
          }
        />

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{dept.name}</h2>
                    <StatusBadge status={dept.status} />
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Head: {dept.head}
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl font-semibold">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    {departmentStaff.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Staff</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-semibold text-success">
                    {activeCount}
                  </span>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-semibold text-warning">
                    {onLeaveCount}
                  </span>
                  <p className="text-xs text-muted-foreground">On Leave</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">
                    ${(dept.budget || 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">budget</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Department Staff ({departmentStaff.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Employees in {dept.name}
            </p>
          </CardHeader>
          <CardContent>
            {departmentStaff.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No employees assigned to this department yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Supervisor</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStaff.map((emp) => (
                      <tr key={emp.id}>
                        <td className="font-mono text-sm">
                          {emp.employeeId}
                        </td>
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
                                {emp.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>{emp.position}</td>
                        <td>{emp.supervisor}</td>
                        <td>
                          <StatusBadge status={emp.status} />
                        </td>
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
                <Link to={"/employees/departments/" + id + "/edit"}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Department
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={"/employees?department=" + encodeURIComponent(dept.name)}>
                  <Users className="mr-2 h-4 w-4" />
                  View All Staff
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/employees/create">
                  <User className="mr-2 h-4 w-4" />
                  Add Employee
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default DepartmentDetailsPage;
