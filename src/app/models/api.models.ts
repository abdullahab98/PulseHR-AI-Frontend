export type UserRole = 'SUPER_ADMIN' | 'DEPARTMENT_HEAD' | 'MANAGER' | 'TEAM_LEADER' | 'EMPLOYEE' | 'SPECIAL_USER';

export type PanelId = 'EXECUTIVE' | 'HR' | 'PROJECTS' | 'DEVELOPMENT' | 'QA' | 'DESIGN' | 'FINANCE' | 'PAYROLL' | 'BURNOUT' | 'IT_SUPPORT' | 'SALES' | 'INVENTORY' | 'MEETINGS' | 'DOCUMENTS' | 'OFFICES' | 'RANKS';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  allowed_panels?: PanelId[];
  custom_permissions?: Record<string, any>;
  data_scope?: 'ALL' | 'DEPARTMENT' | 'TEAM' | 'OWN';
  created_at: string;
}

export interface UserPermissionItem {
  id: number;
  email: string;
  role: UserRole;
  data_scope: 'ALL' | 'DEPARTMENT' | 'TEAM' | 'OWN';
  allowed_panels: PanelId[];
  custom_permissions: Record<string, any>;
  employee_name: string;
  designation: string;
  department_name: string;
}

export interface AddressItem {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface AddressInfo {
  present?: AddressItem;
  permanent?: AddressItem;
}

export interface FamilyInfo {
  father_name?: string;
  mother_name?: string;
  spouse_name?: string;
  marital_status?: string;
  dependents?: string;
  emergency_family_phone?: string;
}

export interface Employee {
  id: number;
  user_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  role?: UserRole;
  department_id?: number;
  department_name?: string;
  office_id?: number;
  office_name?: string;
  rank_id?: number;
  rank_name?: string;
  designation_id?: number;
  designation_name?: string;
  designation: string;
  salary: number;
  phone?: string;
  personal_email?: string;
  address_info?: AddressInfo;
  family_info?: FamilyInfo;
  bio?: string;
  skills: string[];
  emergency_contact: Record<string, string>;
  documents: Array<{ name: string; url: string }>;
  hire_date: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  budget: number;
  created_at: string;
}

export interface Office {
  id: number;
  name: string;
  establishment?: string;
  description?: string;
  mission?: string;
  vision?: string;
  created_at: string;
}

export interface Rank {
  id: number;
  name: string;
  created_at: string;
}

export interface PanelPermissionAction {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type PanelPermissionsMap = Record<string, PanelPermissionAction>;

export interface Designation {
  id: number;
  name: string;
  office_id?: number | null;
  office_name?: string | null;
  rank_id?: number | null;
  rank_name?: string | null;
  description?: string | null;
  permissions: PanelPermissionsMap;
  created_at: string;
  employees_count?: number;
}

export interface DesignationCreate {
  name: string;
  office_id?: number | null;
  rank_id?: number | null;
  description?: string | null;
  permissions: PanelPermissionsMap;
}

export interface DesignationUpdate {
  name?: string;
  office_id?: number | null;
  rank_id?: number | null;
  description?: string | null;
  permissions?: PanelPermissionsMap;
}

export interface SystemPanelMeta {
  id: string;
  name: string;
  category: string;
  icon: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  employee_name?: string;
  date: string;
  check_in?: string;
  check_out?: string;
  work_hours: number;
  overtime_hours: number;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'ON_LEAVE';
}

export interface AttendanceReportSummary {
  total_records: number;
  total_present: number;
  total_late: number;
  total_absent: number;
  total_overtime_hours: number;
  avg_work_hours: number;
}

export interface AttendanceReportItem {
  id: number;
  date: string;
  employee_id: number;
  employee_name: string;
  department_name?: string;
  check_in?: string;
  check_out?: string;
  work_hours: number;
  overtime_hours: number;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'ON_LEAVE';
}

export interface AttendanceReportResponse {
  summary: AttendanceReportSummary;
  records: AttendanceReportItem[];
}

export interface AttendanceApplication {
  id: number;
  employee_id: number;
  employee_name?: string;
  date: string;
  requested_check_in?: string;
  requested_check_out?: string;
  application_type: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  created_at?: string;
}

export interface TimeSlot {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  late_grace_minutes: number;
  is_active: boolean;
  description?: string;
  created_at?: string;
}

export interface TimeSlotApplication {
  id: number;
  employee_id: number;
  employee_name?: string;
  time_slot_id: number;
  time_slot_name?: string;
  effective_from: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  created_at?: string;
}

export interface WeekendSetup {
  id: number;
  days: string[];
  department_id?: number;
  note?: string;
  updated_at?: string;
}


export interface LeaveTypeConfig {
  id: number;
  name: string;
  code: string;
  days_allowed: number;
  is_paid: boolean;
  requires_attachment: boolean;
  carry_forward: boolean;
  is_active: boolean;
  description?: string;
  created_at?: string;
}

export interface DesignationChain {
  id: number;
  designation_id: number;
  designation_name?: string;
  approver_designation_id: number;
  approver_designation_name?: string;
  level: number;
  auto_approve_days: number;
  notes?: string;
  created_at?: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count?: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by_id?: number;
  approver_name?: string;
  created_at: string;
}

export interface MyLeaveQuotaItem {
  leave_type: string;
  name: string;
  allocated: number;
  used: number;
  pending: number;
  remaining: number;
  is_paid: boolean;
}

export interface MyLeaveReport {
  employee_id: number;
  employee_name: string;
  department_name?: string;
  total_allocated: number;
  total_used: number;
  total_remaining: number;
  total_pending: number;
  quotas: MyLeaveQuotaItem[];
  history: LeaveRequest[];
}

export interface EmployeeLeaveReportItem {
  employee_id: number;
  employee_name: string;
  employee_code?: string;
  department_name?: string;
  designation_name?: string;
  annual_allocated: number;
  annual_used: number;
  casual_used: number;
  sick_used: number;
  other_used: number;
  total_used: number;
  remaining_balance: number;
  pending_applications: number;
}

export interface EmployeeLeaveReportSummary {
  total_employees: number;
  total_days_taken: number;
  avg_leave_per_emp: number;
  total_pending_requests: number;
  most_used_leave_type: string;
}

export interface EmployeeLeaveReport {
  summary: EmployeeLeaveReportSummary;
  department_breakdown: Record<string, number>;
  employees: EmployeeLeaveReportItem[];
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  department_id: number;
  department_name?: string;
  project_manager_id?: number;
  project_manager_name?: string;
  budget: number;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'DELAYED';
  start_date?: string;
  end_date?: string;
  task_count?: number;
  completed_task_count?: number;
  created_at: string;
}

export interface TaskComment {
  id: number;
  task_id: number;
  author_id: number;
  author_name?: string;
  comment: string;
  created_at: string;
}

export interface TaskItem {
  id: number;
  project_id: number;
  project_title?: string;
  title: string;
  description?: string;
  assignee_id?: number;
  assignee_name?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date?: string;
  required_skills: string[];
  progress: number;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  dependencies: number[];
  comments: TaskComment[];
  created_at: string;
}

export interface QABugReport {
  id: number;
  project_id: number;
  project_title?: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  reporter_id: number;
  reporter_name?: string;
  assignee_id?: number;
  assignee_name?: string;
  created_at: string;
}

export interface FinanceRecord {
  id: number;
  title: string;
  record_type: 'REVENUE' | 'EXPENSE' | 'PAYROLL';
  amount: number;
  department_id?: number;
  department_name?: string;
  employee_id?: number;
  employee_name?: string;
  date: string;
  notes?: string;
}

export interface ITTicket {
  id: number;
  ticket_code: string;
  title: string;
  description: string;
  employee_id: number;
  employee_name?: string;
  assigned_to_id?: number;
  assigned_to_name?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
}

export interface InventoryAsset {
  id: number;
  asset_code: string;
  name: string;
  category: string;
  serial_number?: string;
  assigned_to_id?: number;
  assigned_to_name?: string;
  department_name?: string;
  status: string;
  purchased_date: string;
}

export interface DocumentRecord {
  id: number;
  title: string;
  category: string;
  file_name: string;
  uploader_id: number;
  uploader_name?: string;
  confidentiality_level: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  created_at: string;
}

export interface SalesLead {
  id: number;
  client_name: string;
  deal_title: string;
  deal_value: number;
  stage: 'PROSPECT' | 'PROPOSAL' | 'CONTRACT' | 'WON' | 'LOST';
  assigned_to_id?: number;
  assigned_to_name?: string;
  created_at: string;
}

export interface Meeting {
  id: number;
  title: string;
  organizer_id: number;
  organizer_name?: string;
  scheduled_time: string;
  duration_mins: number;
  attendees: number[];
  raw_notes?: string;
  ai_summary?: string;
  ai_action_items: Array<{ task: string; owner: string; deadline: string }>;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  details: Record<string, any>;
  ip_address?: string;
  timestamp: string;
}

export interface BurnoutAnalysisItem {
  employee_id: number;
  employee_name: string;
  department_name?: string;
  designation?: string;
  avatar_url?: string;
  burnout_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  health_status: string;
  work_life_balance_score: number;
  retention_risk: 'Low' | 'Moderate' | 'High' | 'Critical' | string;
  fatigue_level: 'Mild' | 'Moderate' | 'Severe' | 'Extreme' | string;
  overtime_hours_month: number;
  late_arrivals_count: number;
  pending_tasks_count: number;
  overdue_tasks_count: number;
  high_priority_tasks_count: number;
  completed_tasks_30d: number;
  leave_days_taken_last_60d: number;
  days_since_last_leave: number;
  weekend_work_days: number;
  avg_daily_work_hours: number;
  meetings_count_14d: number;
  ai_summary: string;
  detailed_analysis?: string;
  ai_model?: string;
  key_stressors: string[];
  recommendations: string[];
  employee_wellness_tips: string[];
  last_evaluated_at?: string;
}

export interface BurnoutSummary {
  total_evaluated: number;
  avg_burnout_score: number;
  company_work_life_balance: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  top_stressors: string[];
  executive_summary: string;
}

export interface TaskRecommendationItem {
  employee_id: number;
  employee_name: string;
  designation: string;
  match_score: number;
  confidence_score: number;
  reasoning: string;
  skill_match_percentage: number;
  current_workload_level: string;
}

export interface DashboardInsights {
  project_health_score: number;
  active_projects: number;
  delayed_projects: number;
  completed_projects: number;
  total_tasks: number;
  task_completion_rate: number;
  average_burnout_score: number;
  high_risk_employees: number;
  ai_insights_narrative: string;
}

export interface AIAssistantResponse {
  answer: string;
  action_type?: string;
  data?: any;
}

export interface ReportMetrics {
  time_period?: string;
  scope?: string;
  total_employees?: number;
  department_distribution?: Record<string, number>;
  total_projects?: number;
  active_projects?: number;
  delayed_projects?: number;
  completed_projects?: number;
  planning_projects?: number;
  on_hold_projects?: number;
  total_tasks?: number;
  completed_tasks?: number;
  in_progress_tasks?: number;
  todo_tasks?: number;
  overdue_tasks?: number;
  urgent_priority_tasks?: number;
  task_completion_rate?: number;
  attendance_logs_count?: number;
  avg_daily_work_hours?: number;
  total_overtime_hours?: number;
  late_arrivals_count?: number;
  weekend_shifts_count?: number;
  pending_leave_requests?: number;
  approved_leave_requests?: number;
  avg_burnout_score?: number;
  critical_burnout_alerts?: number;
  high_burnout_alerts?: number;
  [key: string]: any;
}

export interface ReportGenerationResponse {
  report_type: string;
  generated_at: string;
  title: string;
  summary: string;
  metrics: ReportMetrics;
  markdown_content: string;
  executive_takeaways: string[];
  strategic_recommendations: string[];
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
}

// ==========================================
// Payroll Management Interfaces (9 Modules)
// ==========================================

export interface SalaryStructure {
  id?: number;
  employee_id: number;
  employee_name?: string;
  department_name?: string;
  designation?: string;
  basic_salary: number;
  house_rent_allowance: number;
  medical_allowance: number;
  transport_allowance: number;
  food_allowance: number;
  other_allowances: number;
  total_allowances?: number;
  gross_salary?: number;
  provident_fund_rate: number;
  tax_deduction_rate: number;
  bank_name?: string;
  bank_account_no?: string;
  payment_method: 'BANK' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'CASH' | string;
  mobile_banking_no?: string;
  effective_date: string;
  is_active: boolean;
  notes?: string;
}

export interface AllowanceConfig {
  id?: number;
  name: string;
  allowance_type: 'FIXED' | 'PERCENTAGE' | string;
  value: number;
  is_taxable: boolean;
  applies_to: 'ALL' | 'DEPARTMENT' | 'DESIGNATION' | string;
  is_active: boolean;
  description?: string;
}

export interface BonusConfig {
  id?: number;
  title: string;
  bonus_type: 'FESTIVAL' | 'PERFORMANCE' | 'ANNUAL' | 'SPECIAL' | string;
  calculation_type: 'PERCENTAGE' | 'FIXED' | string;
  value: number;
  effective_month?: string;
  is_active: boolean;
  description?: string;
}

export interface DeductionConfig {
  id?: number;
  name: string;
  deduction_type: 'POLICY' | 'TAX' | 'PF' | 'LOAN' | 'ADVANCE' | 'OTHER' | string;
  calculation_type: 'FORMULA' | 'FIXED' | 'PERCENTAGE' | string;
  value: number;
  is_active: boolean;
  description?: string;
}

export interface Payslip {
  id: number;
  batch_id: number;
  employee_id: number;
  employee_name?: string;
  department_name?: string;
  department?: string;
  designation?: string;
  month_year: string;
  salary_month?: string;

  working_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  paid_leaves: number;
  unpaid_leaves: number;
  weekend_days: number;
  holiday_days: number;
  overtime_hours: number;
  overtime_amount: number;

  basic_salary: number;
  house_rent: number;
  house_rent_allowance?: number;
  medical_allowance: number;
  transport_allowance: number;
  food_allowance: number;
  other_allowance: number;
  other_allowances?: number;
  total_allowances?: number;
  total_allowance?: number;
  bonus_amount: number;
  bonus_note?: string;
  gross_salary: number;

  absent_deduction: number;
  late_deduction: number;
  tax_deduction: number;
  provident_fund: number;
  pf_deduction?: number;
  loan_installment: number;
  loan_deduction?: number;
  advance_adjustment: number;
  other_deduction: number;
  total_deductions: number;
  total_deduction?: number;

  net_salary: number;

  payment_status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | string;
  payment_method: string;
  payment_date?: string;
  account_number?: string;
  bank_account_no?: string;
  transaction_id?: string;
  payment_reference?: string;
}

export interface PayrollBatch {
  id: number;
  batch_month: string;
  title: string;
  total_employees: number;
  total_gross: number;
  total_allowances: number;
  total_bonuses: number;
  total_deductions: number;
  total_net_salary: number;
  status: 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'DISBURSED' | string;
  created_at?: string;
  payslips?: Payslip[];
}

export interface PayrollSummary {
  total_monthly_payout: number;
  total_allowances: number;
  total_bonuses: number;
  total_deductions: number;
  total_employees_paid: number;
  pending_disbursement_count: number;
  pending_disbursement_amount: number;
  department_breakdown: Array<{
    department: string;
    department_name?: string;
    employee_count: number;
    gross_total: number;
    total_gross?: number;
    net_total: number;
    total_net?: number;
    total_deductions?: number;
  }>;
}

export interface AttendanceIntegrationSummary {
  month_year: string;
  total_employees_analyzed: number;
  attendance_integration: Array<{
    employee_id: number;
    employee_name: string;
    department: string;
    total_month_days: number;
    weekend_days: number;
    working_days: number;
    present_days: number;
    late_days: number;
    absent_days: number;
    paid_leaves: number;
    unpaid_leaves: number;
    overtime_hours: number;
  }>;
}

