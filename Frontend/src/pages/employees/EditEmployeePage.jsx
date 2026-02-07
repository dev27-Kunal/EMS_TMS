import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchEmployee, updateEmployee, deleteEmployee, fetchRoles, fetchDepartments, fetchReportingManagers } from "@/features/employee/employeeSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Briefcase, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ROLES } from "@/utils/constants";
function EditEmployeePage() {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const { selectedEmployee, isLoading, roles, departments, reportingManagers } = useAppSelector((state) => state.employee);
    const canDelete = [ROLES.SYSTEM_ADMIN, ROLES.HR_ADMIN, ROLES.GM, ROLES.MANAGER, ROLES.SUPERVISOR].includes(user?.role);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", department: "", position: "", supervisor: "", hireDate: "", status: "", role: "", password: "", confirmPassword: "" });
    useEffect(() => { if (id) dispatch(fetchEmployee(id)); dispatch(fetchRoles()); dispatch(fetchDepartments()); }, [dispatch, id]);
    useEffect(() => { if (formData.department) dispatch(fetchReportingManagers(formData.department)); }, [dispatch, formData.department]);
    useEffect(() => {
        if (selectedEmployee) setFormData({
            name: selectedEmployee.name, email: selectedEmployee.email, phone: selectedEmployee.phone || "",
            department: selectedEmployee.department, position: selectedEmployee.position, supervisor: selectedEmployee.supervisor || "",
            hireDate: selectedEmployee.hireDate, status: selectedEmployee.status, role: selectedEmployee.role || "employee",
            password: "", confirmPassword: ""
        });
    }, [selectedEmployee]);
    const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
    const handleToggleEnabled = async () => {
        const newStatus = formData.status === "active" ? "inactive" : "active";
        handleChange("status", newStatus);
        try {
            const { password, confirmPassword, ...data } = formData;
            await dispatch(updateEmployee({ id, data: { ...data, status: newStatus } }));
        } catch (e) { console.error(e); }
    };
    const handleDelete = async () => {
        try {
            await dispatch(deleteEmployee(id)).unwrap();
            toast.success("Employee removed successfully");
            navigate("/employees");
        } catch (err) {
            toast.error(err || "Failed to remove employee");
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setIsSubmitting(true);
        try {
            const { confirmPassword, ...data } = formData;
            const payload = { ...data };
            if (data.password) payload.password = data.password;
            else delete payload.password;
            await dispatch(updateEmployee({ id, data: payload }));
            navigate('/employees/' + id);
        } catch (error) { console.error("Failed to update employee:", error); } finally { setIsSubmitting(false); }
    };
    if (isLoading || !selectedEmployee) return <AppLayout><LoadingSpinner text="Loading employee..." /></AppLayout>;
    return (
        <AppLayout>
            <div className="page-container max-w-4xl mx-auto">
                <PageHeader title="Edit Employee" subtitle={'Editing ' + selectedEmployee.name} showBack />
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" />Personal Information</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="name">Full Name *</Label><Input id="name" placeholder="Enter full name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="email">Email Address *</Label><Input id="email" type="email" placeholder="Enter email address" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" placeholder="Enter phone number" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} /></div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Briefcase className="h-5 w-5" />Employment Details</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="department">Department *</Label><Select value={formData.department} onValueChange={(value) => handleChange("department", value)}><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{departments.map((dept) => (<SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="position">Position *</Label><Input id="position" placeholder="Enter job title" value={formData.position} onChange={(e) => handleChange("position", e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="role">Role</Label><Select value={formData.role} onValueChange={(value) => handleChange("role", value)}><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent>{roles.map((r) => (<SelectItem key={r.id} value={r.code}>{r.name}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="supervisor">Reporting Manager</Label><Select value={formData.supervisor || "none"} onValueChange={(value) => handleChange("supervisor", value === "none" ? "" : value)}><SelectTrigger><SelectValue placeholder="Select reporting manager" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{reportingManagers.filter((emp) => emp.id !== id).map((emp) => (<SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="hireDate">Hire Date *</Label><Input id="hireDate" type="date" value={formData.hireDate} onChange={(e) => handleChange("hireDate", e.target.value)} required /></div><div className="space-y-2 flex items-center gap-4"><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={(value) => handleChange("status", value)}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="on_leave">On Leave</SelectItem><SelectItem value="terminated">Terminated</SelectItem></SelectContent></Select></div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><KeyRound className="h-5 w-5" />Set / Update Password</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="password">New Password</Label><Input id="password" type="password" placeholder="Leave blank to keep existing password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} minLength={6} /></div><div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" placeholder="Confirm new password" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} minLength={6} />{formData.password && formData.password !== formData.confirmPassword && <p className="text-sm text-destructive">Passwords do not match</p>}</div></CardContent></Card>
                    <Card><CardHeader><CardTitle>Enable / Disable Employee</CardTitle></CardHeader><CardContent><div className="flex items-center gap-4"><Switch checked={formData.status === "active"} onCheckedChange={handleToggleEnabled} /><span className="text-sm text-muted-foreground">{formData.status === "active" ? "Enabled" : "Disabled"}</span></div></CardContent></Card>
                    <div className="flex flex-wrap gap-3 items-center justify-between"><div className="flex gap-3"><Button type="submit" disabled={isSubmitting || (formData.password && formData.password !== formData.confirmPassword)}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button><Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button></div>{canDelete && <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive" className="text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" />Remove Employee</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove Employee</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove {selectedEmployee?.name}? This will delete their account and login credentials. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}</div>
                </form>
            </div>
        </AppLayout>
    );
}
export default EditEmployeePage;
