import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { CreateEmployeeComponent } from './pages/employees/create-employee/create-employee.component';
import { EmployeeOrganogramComponent } from './pages/employees/employee-organogram/employee-organogram.component';
import { AttendanceReportComponent } from './pages/attendance/attendance-report/attendance-report.component';
import { AttendanceApplicationsComponent } from './pages/attendance/attendance-applications/attendance-applications.component';
import { AttendanceTimeSlotComponent } from './pages/attendance/attendance-time-slot/attendance-time-slot.component';
import { ApplyTimeSlotComponent } from './pages/attendance/apply-time-slot/apply-time-slot.component';
import { WeekendSetupComponent } from './pages/attendance/weekend-setup/weekend-setup.component';
import { MyLeaveReportComponent } from './pages/leaves/my-leave-report/my-leave-report.component';
import { MyLeaveApplicationsComponent } from './pages/leaves/my-leave-applications/my-leave-applications.component';
import { LeaveApplicationsComponent } from './pages/leaves/leave-applications/leave-applications.component';
import { EmployeeLeaveReportComponent } from './pages/leaves/employee-leave-report/employee-leave-report.component';
import { DesignationChainComponent } from './pages/leaves/designation-chain/designation-chain.component';
import { LeaveTypesComponent } from './pages/leaves/leave-types/leave-types.component';
import { LeavesComponent } from './pages/leaves/leaves.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { MeetingsComponent } from './pages/meetings/meetings.component';
import { BurnoutComponent } from './pages/burnout/burnout.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { AuditLogsComponent } from './pages/audit-logs/audit-logs.component';

import { PermissionsComponent } from './pages/permissions/permissions.component';
import { QaComponent } from './pages/qa/qa.component';
import { FinanceComponent } from './pages/finance/finance.component';
import { ItSupportComponent } from './pages/it-support/it-support.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { SalesComponent } from './pages/sales/sales.component';
import { OfficesComponent } from './pages/offices/offices.component';
import { RanksComponent } from './pages/ranks/ranks.component';
import { DesignationsComponent } from './pages/designations/designations.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PayrollOverviewComponent } from './pages/payroll/payroll-overview/payroll-overview.component';
import { SalaryStructureComponent } from './pages/payroll/salary-structure/salary-structure.component';
import { AttendanceIntegrationComponent } from './pages/payroll/attendance-integration/attendance-integration.component';
import { AllowancesBonusesComponent } from './pages/payroll/allowances-bonuses/allowances-bonuses.component';
import { DeductionsComponent } from './pages/payroll/deductions/deductions.component';
import { ProcessingComponent } from './pages/payroll/processing/processing.component';
import { DisbursementComponent } from './pages/payroll/disbursement/disbursement.component';
import { PayslipsComponent } from './pages/payroll/payslips/payslips.component';
import { PayrollReportsComponent } from './pages/payroll/payroll-reports/payroll-reports.component';

import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'permissions', component: PermissionsComponent, canActivate: [authGuard] },
  { path: 'employees', component: EmployeesComponent, canActivate: [authGuard] },
  { path: 'employees/create', component: CreateEmployeeComponent, canActivate: [authGuard] },
  { path: 'employees/organogram', component: EmployeeOrganogramComponent, canActivate: [authGuard] },
  { path: 'hr', redirectTo: 'employees', pathMatch: 'full' },
  { path: 'hr/offices', redirectTo: 'offices', pathMatch: 'full' },
  { path: 'hr/ranks', redirectTo: 'ranks', pathMatch: 'full' },
  { path: 'hr/designations', redirectTo: 'designations', pathMatch: 'full' },
  { path: 'hr/employees', redirectTo: 'employees', pathMatch: 'full' },
  { path: 'hr/create-employee', redirectTo: 'employees/create', pathMatch: 'full' },
  { path: 'hr/organogram', redirectTo: 'employees/organogram', pathMatch: 'full' },
  { path: 'attendance', redirectTo: 'attendance/report', pathMatch: 'full' },
  { path: 'attendance/report', component: AttendanceReportComponent, canActivate: [authGuard] },
  { path: 'attendance/applications', component: AttendanceApplicationsComponent, canActivate: [authGuard] },
  { path: 'attendance/time-slots', component: AttendanceTimeSlotComponent, canActivate: [authGuard] },
  { path: 'attendance/apply-slot', component: ApplyTimeSlotComponent, canActivate: [authGuard] },
  { path: 'attendance/weekend-setup', component: WeekendSetupComponent, canActivate: [authGuard] },
  { path: 'leaves', redirectTo: 'leaves/my-report', pathMatch: 'full' },
  { path: 'leaves/my-report', component: MyLeaveReportComponent, canActivate: [authGuard] },
  { path: 'leaves/my-applications', component: MyLeaveApplicationsComponent, canActivate: [authGuard] },
  { path: 'leaves/applications', component: LeaveApplicationsComponent, canActivate: [authGuard] },
  { path: 'leaves/employee-report', component: EmployeeLeaveReportComponent, canActivate: [authGuard] },
  { path: 'leaves/designation-chain', component: DesignationChainComponent, canActivate: [authGuard] },
  { path: 'leaves/types', component: LeaveTypesComponent, canActivate: [authGuard] },
  { path: 'leaves/legacy', component: LeavesComponent, canActivate: [authGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [authGuard] },
  { path: 'tasks', component: TasksComponent, canActivate: [authGuard] },
  { path: 'qa', component: QaComponent, canActivate: [authGuard] },
  { path: 'finance', component: FinanceComponent, canActivate: [authGuard] },
  { path: 'payroll', component: PayrollOverviewComponent, canActivate: [authGuard] },
  { path: 'payroll/overview', component: PayrollOverviewComponent, canActivate: [authGuard] },
  { path: 'payroll/salary-structure', component: SalaryStructureComponent, canActivate: [authGuard] },
  { path: 'payroll/attendance-integration', component: AttendanceIntegrationComponent, canActivate: [authGuard] },
  { path: 'payroll/allowances-bonuses', component: AllowancesBonusesComponent, canActivate: [authGuard] },
  { path: 'payroll/deductions', component: DeductionsComponent, canActivate: [authGuard] },
  { path: 'payroll/processing', component: ProcessingComponent, canActivate: [authGuard] },
  { path: 'payroll/disbursement', component: DisbursementComponent, canActivate: [authGuard] },
  { path: 'payroll/payslips', component: PayslipsComponent, canActivate: [authGuard] },
  { path: 'payroll/reports', component: PayrollReportsComponent, canActivate: [authGuard] },
  { path: 'it-support', component: ItSupportComponent, canActivate: [authGuard] },
  { path: 'inventory', component: InventoryComponent, canActivate: [authGuard] },
  { path: 'documents', component: DocumentsComponent, canActivate: [authGuard] },
  { path: 'sales', component: SalesComponent, canActivate: [authGuard] },
  { path: 'meetings', component: MeetingsComponent, canActivate: [authGuard] },
  { path: 'burnout', component: BurnoutComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'audit-logs', component: AuditLogsComponent, canActivate: [authGuard] },
  { path: 'offices', component: OfficesComponent, canActivate: [authGuard] },
  { path: 'ranks', component: RanksComponent, canActivate: [authGuard] },
  { path: 'designations', component: DesignationsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
