import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { updateSettings, fetchNotificationSettings } from "@/features/notification/notificationSlice";
import AppLayout from "@/layouts/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Bell } from "lucide-react";

function NotificationSettingsPage() {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.notification);
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchNotificationSettings());
  }, [dispatch]);
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggle = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(updateSettings(localSettings));
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = [
    { key: "email", label: "Email notifications", desc: "Receive notifications by email" },
    { key: "push", label: "Push notifications", desc: "Browser or app push notifications" },
    { key: "jobUpdates", label: "Job updates", desc: "When your assigned jobs are updated" },
    { key: "approvalRequests", label: "Approval requests", desc: "When someone requests your approval" },
    { key: "systemAlerts", label: "System alerts", desc: "Important system-wide announcements" },
  ];

  return (
    <AppLayout>
      <div className="page-container max-w-2xl mx-auto">
        <PageHeader
          title="Notification Settings"
          subtitle="Choose how you want to be notified"
          showBack
        />
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {options.map((opt) => (
                <div
                  key={opt.key}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <Label htmlFor={opt.key} className="font-medium">
                      {opt.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                  <Switch
                    id={opt.key}
                    checked={!!localSettings[opt.key]}
                    onCheckedChange={(checked) =>
                      handleToggle(opt.key, checked)
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save settings
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default NotificationSettingsPage;
