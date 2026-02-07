import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { createEmployee, fetchRoles, fetchDepartments, fetchReportingManagers } from "@/features/employee/employeeSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Briefcase, KeyRound } from "lucide-react";
import { EMPLOYEE_STATUS } from "@/utils/constants";
import { toast } from "sonner";

function CreateEmployeePage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { roles, departments, reportingManagers } = useAppSelector((state) => state.employee);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", department: "", position: "", supervisor: "",
        hireDate: new Date().toISOString().split("T")[0], status: EMPLOYEE_STATUS.ACTIVE, role: "employee",
        password: "", confirmPassword: ""
    });
    useEffect(() => { dispatch(fetchRoles()); dispatch(fetchDepartments()); }, [dispatch]);
    useEffect(() => { dispatch(fetchReportingManagers(formData.department || null)); }, [dispatch, formData.department]);
    const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setIsSubmitting(true);
        try {
            const { confirmPassword, ...data } = formData;
            const payload = { ...data, employeeId: 'EMP' + Date.now().toString().slice(-6) };
            if (data.password) payload.password = data.password;
            else delete payload.password;
            await dispatch(createEmployee(payload));
            navigate("/employees");
        } catch (error) { console.error("Failed to create employee:", error); } finally { setIsSubmitting(false); }
    };
    return (
        <AppLayout>
            <div className="page-container max-w-4xl mx-auto">
                <PageHeader title="Create Employee" subtitle="Add a new employee to the system" showBack />
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" />Personal Information</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="name">Full Name *</Label><Input id="name" placeholder="Enter full name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="email">Email Address *</Label><Input id="email" type="email" placeholder="Enter email address" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" placeholder="Enter phone number" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} /></div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><KeyRound className="h-5 w-5" />Login Credentials (optional)</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" placeholder="Set initial password for login (min 6 chars)" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} minLength={6} /></div><div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} minLength={6} />{formData.password && formData.password !== formData.confirmPassword && <p className="text-sm text-destructive">Passwords do not match</p>}</div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Briefcase className="h-5 w-5" />Employment Details</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="department">Department *</Label><Select value={formData.department} onValueChange={(value) => handleChange("department", value)}><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{departments.map((dept) => (<SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="position">Position *</Label><Input id="position" placeholder="Enter job title" value={formData.position} onChange={(e) => handleChange("position", e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="role">Role *</Label><Select value={formData.role} onValueChange={(value) => handleChange("role", value)}><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent>{roles.map((r) => (<SelectItem key={r.id} value={r.code}>{r.name}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="supervisor">Reporting Manager</Label><Select value={formData.supervisor || "none"} onValueChange={(value) => handleChange("supervisor", value === "none" ? "" : value)}><SelectTrigger><SelectValue placeholder="Select reporting manager" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{reportingManagers.map((emp) => (<SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="hireDate">Hire Date *</Label><Input id="hireDate" type="date" value={formData.hireDate} onChange={(e) => handleChange("hireDate", e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={(value) => handleChange("status", value)}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="on_leave">On Leave</SelectItem></SelectContent></Select></div></CardContent></Card>
                    <div className="flex gap-3"><Button type="submit" disabled={isSubmitting || (formData.password && formData.password !== formData.confirmPassword)}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Employee</Button><Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button></div>
                </form>
            </div>
        </AppLayout>
    );
}
export default CreateEmployeePage;
