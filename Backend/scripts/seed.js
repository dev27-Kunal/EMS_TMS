import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Role from '../models/Role.js';
import { Job } from '../models/Job.js';
import Approval from '../models/Approval.js';
import Notification from '../models/Notification.js';
import LoginHistory from '../models/LoginHistory.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems_tms';

async function seed() {
  await mongoose.connect(MONGODB_URI);

  // Clear existing data
  await User.deleteMany({});
  await Employee.deleteMany({});
  await Department.deleteMany({});
  await Role.deleteMany({});
  await Job.deleteMany({});
  await Approval.deleteMany({});
  await Notification.deleteMany({});
  await LoginHistory.deleteMany({});

  // Departments - "All" is default and cannot be deleted
  const depts = await Department.insertMany([
    { name: 'All', head: '', employeeCount: 0, budget: 0, status: 'active', isDefault: true },
    { name: 'Engineering', head: 'Team Supervisor', employeeCount: 0, budget: 500000, status: 'active' },
    { name: 'Human Resources', head: 'HR Manager', employeeCount: 0, budget: 150000, status: 'active' },
    { name: 'Marketing', head: 'Bob Johnson', employeeCount: 0, budget: 300000, status: 'active' },
    { name: 'Finance', head: 'CFO', employeeCount: 0, budget: 200000, status: 'active' },
    { name: 'Sales', head: 'Sales Director', employeeCount: 0, budget: 400000, status: 'active' },
    { name: 'Executive', head: 'CEO', employeeCount: 0, budget: 100000, status: 'active' },
    { name: 'IT', head: 'IT Manager', employeeCount: 0, budget: 100000, status: 'active' },
  ]);

  // Roles
  const roles = await Role.insertMany([
    { name: 'System Admin', code: 'system_admin', description: 'Full system access', permissions: ['all'] },
    { name: 'HR Admin', code: 'hr_admin', description: 'HR management access', permissions: ['employees:all', 'departments:all', 'reports:hr'] },
    { name: 'General Manager', code: 'gm', description: 'Organization-wide management', permissions: ['employees:view', 'jobs:all', 'approvals:all', 'reports:all'] },
    { name: 'Supervisor', code: 'supervisor', description: 'Team management access', permissions: ['employees:team', 'jobs:team', 'approvals:team'] },
    { name: 'Employee', code: 'employee', description: 'Basic employee access', permissions: ['profile:own', 'jobs:own'] },
  ]);

  // Users (password: password123) - must hash before insert since insertMany skips pre-save middleware
  const hashedPassword = await bcrypt.hash('password123', 12);
  const users = await User.insertMany([
    { email: 'admin@company.com', password: hashedPassword, name: 'System Administrator', role: 'system_admin', department: 'IT' },
    { email: 'hr@company.com', password: hashedPassword, name: 'HR Manager', role: 'hr_admin', department: 'Human Resources' },
    { email: 'gm@company.com', password: hashedPassword, name: 'General Manager', role: 'gm', department: 'Executive' },
    { email: 'supervisor@company.com', password: hashedPassword, name: 'Team Supervisor', role: 'supervisor', department: 'Engineering' },
    { email: 'employee@company.com', password: hashedPassword, name: 'John Doe', role: 'employee', department: 'Engineering' },
  ]);

  // Employees
  const employees = await Employee.insertMany([
    { employeeId: 'EMP001', name: 'John Doe', email: 'john@company.com', department: 'Engineering', position: 'Software Engineer', role: 'employee', status: 'active', hireDate: new Date('2023-01-15'), supervisor: 'Team Supervisor', phone: '+1 234 567 890' },
    { employeeId: 'EMP002', name: 'Jane Smith', email: 'jane@company.com', department: 'Engineering', position: 'Senior Developer', role: 'employee', status: 'active', hireDate: new Date('2022-06-10'), supervisor: 'Team Supervisor', phone: '+1 234 567 891' },
    { employeeId: 'EMP003', name: 'Bob Johnson', email: 'bob@company.com', department: 'Marketing', position: 'Marketing Manager', role: 'gm', status: 'active', hireDate: new Date('2021-03-20'), supervisor: 'General Manager', phone: '+1 234 567 892' },
    { employeeId: 'EMP004', name: 'Alice Williams', email: 'alice@company.com', department: 'Human Resources', position: 'HR Specialist', role: 'hr_admin', status: 'on_leave', hireDate: new Date('2022-09-01'), supervisor: 'HR Manager', phone: '+1 234 567 893' },
    { employeeId: 'EMP005', name: 'Charlie Brown', email: 'charlie@company.com', department: 'Finance', position: 'Financial Analyst', role: 'employee', status: 'active', hireDate: new Date('2023-05-12'), supervisor: 'General Manager', phone: '+1 234 567 894' },
    { employeeId: 'EMP006', name: 'Diana Ross', email: 'diana@company.com', department: 'Engineering', position: 'QA Engineer', role: 'employee', status: 'inactive', hireDate: new Date('2020-11-08'), supervisor: 'Team Supervisor', phone: '+1 234 567 895' },
    { employeeId: 'EMP007', name: 'Edward King', email: 'edward@company.com', department: 'Sales', position: 'Sales Representative', role: 'employee', status: 'active', hireDate: new Date('2023-08-21'), supervisor: 'General Manager', phone: '+1 234 567 896' },
    { employeeId: 'EMP008', name: 'Fiona Green', email: 'fiona@company.com', department: 'Engineering', position: 'DevOps Engineer', role: 'supervisor', status: 'active', hireDate: new Date('2022-02-14'), supervisor: 'Team Supervisor', phone: '+1 234 567 897' },
  ]);

  // Link users to employees (employeeId) for job assignment filtering
  const johnEmp = employees.find((e) => e.employeeId === 'EMP001');
  if (johnEmp) await User.findByIdAndUpdate(users[4]._id, { employeeId: johnEmp._id });

  // Update department employee counts
  for (const dept of depts) {
    dept.employeeCount = employees.filter((e) => e.department === dept.name).length;
    await dept.save();
  }

  // Jobs - use assigneeId (Employee ref) not name
  const johnDoe = employees.find((e) => e.employeeId === 'EMP001');
  const charlie = employees.find((e) => e.employeeId === 'EMP005');
  const alice = employees.find((e) => e.employeeId === 'EMP004');
  const bob = employees.find((e) => e.employeeId === 'EMP003');
  const fiona = employees.find((e) => e.employeeId === 'EMP008');
  const edward = employees.find((e) => e.employeeId === 'EMP007');
  const jobs = await Job.insertMany([
    { jobId: 'JOB001', title: 'Website Redesign', description: 'Complete redesign of company website', assigneeId: johnDoe?._id, department: 'Engineering', status: 'in_progress', priority: 'high', dueDate: new Date('2024-02-28'), progress: 65 },
    { jobId: 'JOB002', title: 'Q4 Financial Report', description: 'Prepare Q4 financial statements', assigneeId: charlie?._id, department: 'Finance', status: 'pending', priority: 'urgent', dueDate: new Date('2024-02-15'), progress: 0 },
    { jobId: 'JOB003', title: 'Employee Training Program', description: 'Develop new employee onboarding materials', assigneeId: alice?._id, department: 'Human Resources', status: 'completed', priority: 'medium', dueDate: new Date('2024-01-31'), progress: 100 },
    { jobId: 'JOB004', title: 'Marketing Campaign', description: 'Spring product launch campaign', assigneeId: bob?._id, department: 'Marketing', status: 'in_progress', priority: 'high', dueDate: new Date('2024-03-15'), progress: 40 },
    { jobId: 'JOB005', title: 'Server Migration', description: 'Migrate legacy servers to cloud', assigneeId: fiona?._id, department: 'Engineering', status: 'draft', priority: 'low', dueDate: new Date('2024-04-01'), progress: 0 },
    { jobId: 'JOB006', title: 'Sales Training', description: 'Product knowledge training for sales team', assigneeId: edward?._id, department: 'Sales', status: 'on_hold', priority: 'medium', dueDate: new Date('2024-02-20'), progress: 25 },
  ]);

  // Approvals
  await Approval.insertMany([
    { type: 'Leave Request', requester: 'John Doe', department: 'Engineering', status: 'pending', submittedAt: new Date('2024-02-01'), description: 'Annual leave for Feb 15-20', jobId: null },
    { type: 'Job Creation', requester: 'Bob Johnson', department: 'Marketing', status: 'pending', submittedAt: new Date('2024-02-02'), description: 'Request $50,000 additional budget for Q2 campaign', jobId: jobs[3]._id, jobTitle: 'Marketing Campaign', jobDueDate: new Date('2024-03-15') },
    { type: 'Job Completion', requester: 'Alice Williams', department: 'Human Resources', status: 'approved', submittedAt: new Date('2024-01-28'), description: 'Training program completion approval', jobId: jobs[2]._id, approvedBy: 'GM', approvedAt: new Date('2024-01-29'), remark: 'Approved for closure.' },
    { type: 'Job Request', requester: 'Fiona Green', department: 'Engineering', status: 'rejected', submittedAt: new Date('2024-01-25'), description: 'New development workstations - equipment job', jobId: null, rejectedBy: 'Manager', rejectedAt: new Date('2024-01-26'), remark: 'Out of budget this quarter.' },
    { type: 'Job Creation', requester: 'Jane Smith', department: 'Engineering', status: 'pending', submittedAt: new Date('2024-02-03'), description: 'Weekend overtime for project deadline', jobId: jobs[0]._id, jobTitle: 'Website Redesign', jobDueDate: new Date('2024-02-28') },
  ]);

  // Notifications for first user (John Doe / employee)
  const johnUser = users.find((u) => u.email === 'employee@company.com');
  if (johnUser) {
    await Notification.insertMany([
      { userId: johnUser._id, title: 'New Job Assigned', message: 'You have been assigned to Website Redesign project', type: 'info', read: false },
      { userId: johnUser._id, title: 'Approval Required', message: 'Leave request pending your approval', type: 'warning', read: false },
      { userId: johnUser._id, title: 'Task Completed', message: 'Employee Training Program has been marked complete', type: 'success', read: true },
      { userId: johnUser._id, title: 'Deadline Approaching', message: 'Q4 Financial Report due in 3 days', type: 'warning', read: false },
      { userId: johnUser._id, title: 'System Maintenance', message: 'Scheduled maintenance on Feb 10, 2024', type: 'info', read: true },
    ]);
  }

  // Login history
  await LoginHistory.insertMany([
    { userId: users[4]._id.toString(), userName: 'John Doe', email: 'john@company.com', role: 'employee', ipAddress: '192.168.1.100', device: 'Chrome on Windows', location: 'New York, US', status: 'success', loginAt: new Date() },
    { userId: users[1]._id.toString(), userName: 'HR Manager', email: 'hr@company.com', role: 'hr_admin', ipAddress: '192.168.1.101', device: 'Firefox on MacOS', location: 'Los Angeles, US', status: 'success', loginAt: new Date() },
    { userId: users[2]._id.toString(), userName: 'General Manager', email: 'gm@company.com', role: 'gm', ipAddress: '192.168.1.102', device: 'Safari on iOS', location: 'Chicago, US', status: 'success', loginAt: new Date() },
    { userId: users[4]._id.toString(), userName: 'John Doe', email: 'john@company.com', role: 'employee', ipAddress: '10.0.0.50', device: 'Unknown', location: 'Unknown', status: 'failed', loginAt: new Date() },
    { userId: users[0]._id.toString(), userName: 'System Administrator', email: 'admin@company.com', role: 'system_admin', ipAddress: '192.168.1.1', device: 'Chrome on Linux', location: 'San Francisco, US', status: 'success', loginAt: new Date() },
    { userId: users[3]._id.toString(), userName: 'Team Supervisor', email: 'supervisor@company.com', role: 'supervisor', ipAddress: '192.168.1.103', device: 'Edge on Windows', location: 'Seattle, US', status: 'success', loginAt: new Date() },
  ]);

  console.log('Seed completed successfully!');
  console.log('\nDemo login credentials (password: password123):');
  console.log('  admin@company.com - System Admin');
  console.log('  hr@company.com - HR Admin');
  console.log('  gm@company.com - General Manager');
  console.log('  supervisor@company.com - Supervisor');
  console.log('  employee@company.com - Employee');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
