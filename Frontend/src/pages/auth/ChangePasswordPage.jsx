import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { changePassword, clearError } from "@/features/auth/authSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, KeyRound, CheckCircle } from "lucide-react";

const ChangePasswordPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    dispatch(clearError());
    if (newPassword.length < 8) { setValidationError("New password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { setValidationError("Passwords do not match"); return; }
    const result = await dispatch(changePassword({ currentPassword, newPassword }));
    if (changePassword.fulfilled.match(result)) { setSuccess(true); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
  };

  return (
    <AppLayout>
      <div className="page-container max-w-2xl mx-auto">
        <PageHeader title="Change Password" subtitle="Update your account password" showBack />
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><KeyRound className="h-5 w-5 text-primary" /></div>
              <div><CardTitle className="text-lg">Password Settings</CardTitle><CardDescription>Choose a strong password with at least 8 characters</CardDescription></div>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {success && <Alert className="border-success bg-success/10"><CheckCircle className="h-4 w-4 text-success" /><AlertDescription className="text-success">Password changed successfully!</AlertDescription></Alert>}
              {(error || validationError) && <Alert variant="destructive"><AlertDescription>{error || validationError}</AlertDescription></Alert>}
              <div className="space-y-2"><Label htmlFor="currentPassword">Current Password</Label><Input id="currentPassword" type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} /><p className="text-xs text-muted-foreground">Must be at least 8 characters</p></div>
              <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm New Password</Label><Input id="confirmPassword" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update Password</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ChangePasswordPage;
