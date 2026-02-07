import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import userReducer from "@/features/user/userSlice";
import employeeReducer from "@/features/employee/employeeSlice";
import jobReducer from "@/features/job/jobSlice";
import approvalReducer from "@/features/approval/approvalSlice";
import notificationReducer from "@/features/notification/notificationSlice";
import loginHistoryReducer from "@/features/loginHistory/loginHistorySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    employee: employeeReducer,
    job: jobReducer,
    approval: approvalReducer,
    notification: notificationReducer,
    loginHistory: loginHistoryReducer,
  },
});
