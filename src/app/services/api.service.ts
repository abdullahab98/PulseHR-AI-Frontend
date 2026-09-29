import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Employee, Department, Attendance, LeaveRequest,
  Project, TaskItem, Meeting, AuditLog,
  BurnoutAnalysisItem, TaskRecommendationItem,
  DashboardInsights, AIAssistantResponse,
  QABugReport, FinanceRecord, ITTicket, InventoryAsset,
  DocumentRecord, SalesLead, UserPermissionItem,
  Office, Rank, Designation, DesignationCreate, DesignationUpdate, SystemPanelMeta,
  AttendanceReportResponse, AttendanceApplication, TimeSlot, TimeSlotApplication, WeekendSetup,
  LeaveTypeConfig, DesignationChain, MyLeaveReport, EmployeeLeaveReport
} from '../models/api.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.baseUrl || environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- Auth Profile ---
  getMe(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/me`);
  }

  // --- Permissions Management (Super Admin Control Center) ---
  getAllUserPermissions(): Observable<UserPermissionItem[]> {
    return this.http.get<UserPermissionItem[]>(`${this.baseUrl}/permissions/users`);
  }

  updateUserPermissions(userId: number, payload: {
    allowed_panels?: string[];
    custom_permissions?: Record<string, any>;
    data_scope?: string;
  }): Observable<any> {
    return this.http.put(`${this.baseUrl}/permissions/users/${userId}`, payload);
  }

  // --- QA Bug Reports ---
  getBugs(): Observable<QABugReport[]> {
    return this.http.get<QABugReport[]>(`${this.baseUrl}/qa/bugs`);
  }

  createBug(bug: Partial<QABugReport>): Observable<QABugReport> {
    return this.http.post<QABugReport>(`${this.baseUrl}/qa/bugs`, bug);
  }

  updateBugStatus(bugId: number, status: string): Observable<QABugReport> {
    return this.http.put<QABugReport>(`${this.baseUrl}/qa/bugs/${bugId}/status`, { status });
  }

  // --- Finance Records ---
  getFinanceRecords(): Observable<FinanceRecord[]> {
    return this.http.get<FinanceRecord[]>(`${this.baseUrl}/finance/records`);
  }

  createFinanceRecord(record: Partial<FinanceRecord>): Observable<FinanceRecord> {
    return this.http.post<FinanceRecord>(`${this.baseUrl}/finance/records`, record);
  }

  // --- IT Support Tickets ---
  getITTickets(): Observable<ITTicket[]> {
    return this.http.get<ITTicket[]>(`${this.baseUrl}/it-support/tickets`);
  }

  createITTicket(ticket: Partial<ITTicket>): Observable<ITTicket> {
    return this.http.post<ITTicket>(`${this.baseUrl}/it-support/tickets`, ticket);
  }

  updateITTicketStatus(ticketId: number, status: string): Observable<ITTicket> {
    return this.http.put<ITTicket>(`${this.baseUrl}/it-support/tickets/${ticketId}/status`, { status });
  }

  // --- Inventory & Assets ---
  getInventoryAssets(): Observable<InventoryAsset[]> {
    return this.http.get<InventoryAsset[]>(`${this.baseUrl}/inventory/assets`);
  }

  createInventoryAsset(asset: Partial<InventoryAsset>): Observable<InventoryAsset> {
    return this.http.post<InventoryAsset>(`${this.baseUrl}/inventory/assets`, asset);
  }

  // --- Documents Management ---
  getDocuments(): Observable<DocumentRecord[]> {
    return this.http.get<DocumentRecord[]>(`${this.baseUrl}/documents/files`);
  }

  uploadDocument(doc: Partial<DocumentRecord>): Observable<DocumentRecord> {
    return this.http.post<DocumentRecord>(`${this.baseUrl}/documents/files`, doc);
  }

  // --- Sales & CRM ---
  getSalesLeads(): Observable<SalesLead[]> {
    return this.http.get<SalesLead[]>(`${this.baseUrl}/sales/leads`);
  }

  createSalesLead(lead: Partial<SalesLead>): Observable<SalesLead> {
    return this.http.post<SalesLead>(`${this.baseUrl}/sales/leads`, lead);
  }

  updateSalesStage(leadId: number, stage: string): Observable<SalesLead> {
    return this.http.put<SalesLead>(`${this.baseUrl}/sales/leads/${leadId}/stage`, { stage });
  }

  // --- Employees & Profile ---
  getMyProfile(): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/employees/me/profile`);
  }

  updateMyProfile(data: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/employees/me/profile`, data);
  }

  changeMyPassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/employees/me/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  getEmployees(departmentId?: number, search?: string): Observable<Employee[]> {
    const params: string[] = [];
    if (departmentId) params.push(`department_id=${departmentId}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/${query}`);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/employees/${id}`);
  }

  createEmployee(data: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/employees/`, data);
  }

  updateEmployee(id: number, data: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/employees/${id}`, data);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/employees/${id}`);
  }

  // --- Departments ---
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments/`);
  }

  createDepartment(data: { name: string; code: string; budget: number }): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/departments/`, data);
  }

  // --- Attendance ---
  getMyTodayAttendance(): Observable<Attendance | null> {
    return this.http.get<Attendance | null>(`${this.baseUrl}/attendance/me/today`);
  }

  checkIn(employeeId?: number): Observable<Attendance> {
    const payload = employeeId ? { employee_id: employeeId } : {};
    return this.http.post<Attendance>(`${this.baseUrl}/attendance/check-in`, payload);
  }

  checkOut(employeeId?: number): Observable<Attendance> {
    const payload = employeeId ? { employee_id: employeeId } : {};
    return this.http.post<Attendance>(`${this.baseUrl}/attendance/check-out`, payload);
  }

  getDailyAttendance(dateStr?: string): Observable<Attendance[]> {
    const url = dateStr ? `${this.baseUrl}/attendance/daily?target_date=${dateStr}` : `${this.baseUrl}/attendance/daily`;
    return this.http.get<Attendance[]>(url);
  }

  getEmployeeAttendance(employeeId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.baseUrl}/attendance/employee/${employeeId}`);
  }

  // 1. Attendance Report
  getAttendanceReport(filters?: { startDate?: string; endDate?: string; employeeId?: number; status?: string }): Observable<AttendanceReportResponse> {
    const params: string[] = [];
    if (filters?.startDate) params.push(`start_date=${filters.startDate}`);
    if (filters?.endDate) params.push(`end_date=${filters.endDate}`);
    if (filters?.employeeId) params.push(`employee_id=${filters.employeeId}`);
    if (filters?.status) params.push(`status=${filters.status}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<AttendanceReportResponse>(`${this.baseUrl}/attendance/report${query}`);
  }

  // 2. Attendance Applications
  getAttendanceApplications(status?: string): Observable<AttendanceApplication[]> {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    return this.http.get<AttendanceApplication[]>(`${this.baseUrl}/attendance/applications${query}`);
  }

  createAttendanceApplication(payload: Partial<AttendanceApplication>): Observable<AttendanceApplication> {
    return this.http.post<AttendanceApplication>(`${this.baseUrl}/attendance/applications`, payload);
  }

  updateAttendanceApplicationStatus(appId: number, status: string): Observable<AttendanceApplication> {
    return this.http.patch<AttendanceApplication>(`${this.baseUrl}/attendance/applications/${appId}/status`, { status });
  }

  // 3. Attendance Time Slots
  getTimeSlots(): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.baseUrl}/attendance/time-slots`);
  }

  createTimeSlot(payload: Partial<TimeSlot>): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(`${this.baseUrl}/attendance/time-slots`, payload);
  }

  // 4. Apply for New Time Slot
  getTimeSlotApplications(status?: string): Observable<TimeSlotApplication[]> {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    return this.http.get<TimeSlotApplication[]>(`${this.baseUrl}/attendance/slot-applications${query}`);
  }

  createTimeSlotApplication(payload: { employee_id?: number; time_slot_id: number; effective_from: string; reason: string }): Observable<TimeSlotApplication> {
    return this.http.post<TimeSlotApplication>(`${this.baseUrl}/attendance/slot-applications`, payload);
  }

  updateTimeSlotApplicationStatus(appId: number, status: string): Observable<TimeSlotApplication> {
    return this.http.patch<TimeSlotApplication>(`${this.baseUrl}/attendance/slot-applications/${appId}/status`, { status });
  }

  // 5. Weekend Setup
  getWeekendSetup(departmentId?: number): Observable<WeekendSetup> {
    const query = departmentId ? `?department_id=${departmentId}` : '';
    return this.http.get<WeekendSetup>(`${this.baseUrl}/attendance/weekend-setup${query}`);
  }

  saveWeekendSetup(payload: { days: string[]; department_id?: number; note?: string }): Observable<WeekendSetup> {
    return this.http.post<WeekendSetup>(`${this.baseUrl}/attendance/weekend-setup`, payload);
  }


  // --- Leaves ---
  getLeaves(employeeId?: number, statusFilter?: string): Observable<LeaveRequest[]> {
    let params: string[] = [];
    if (employeeId) params.push(`employee_id=${employeeId}`);
    if (statusFilter) params.push(`status_filter=${statusFilter}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/leaves/${query}`);
  }

  applyLeave(leave: { employee_id: number; leave_type: string; start_date: string; end_date: string; reason: string }): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.baseUrl}/leaves/`, leave);
  }

  updateLeaveStatus(leaveId: number, status: 'APPROVED' | 'REJECTED'): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.baseUrl}/leaves/${leaveId}/status`, { status });
  }

  // 1. My Leave Report
  getMyLeaveReport(employeeId?: number): Observable<MyLeaveReport> {
    const query = employeeId ? `?employee_id=${employeeId}` : '';
    return this.http.get<MyLeaveReport>(`${this.baseUrl}/leaves/reports/my${query}`);
  }

  // 4. Employee Leave Report (Company-Wide)
  getEmployeeLeaveReport(): Observable<EmployeeLeaveReport> {
    return this.http.get<EmployeeLeaveReport>(`${this.baseUrl}/leaves/reports/employee-summary`);
  }

  // 5. Designation Chains
  getDesignationChains(): Observable<DesignationChain[]> {
    return this.http.get<DesignationChain[]>(`${this.baseUrl}/leaves/designation-chains`);
  }

  createDesignationChain(payload: { designation_id: number; approver_designation_id: number; level?: number; auto_approve_days?: number; notes?: string }): Observable<DesignationChain> {
    return this.http.post<DesignationChain>(`${this.baseUrl}/leaves/designation-chains`, payload);
  }

  deleteDesignationChain(chainId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/leaves/designation-chains/${chainId}`);
  }

  // 6. Leave Types Configuration
  getLeaveTypes(): Observable<LeaveTypeConfig[]> {
    return this.http.get<LeaveTypeConfig[]>(`${this.baseUrl}/leaves/types`);
  }

  createLeaveType(payload: Partial<LeaveTypeConfig>): Observable<LeaveTypeConfig> {
    return this.http.post<LeaveTypeConfig>(`${this.baseUrl}/leaves/types`, payload);
  }

  updateLeaveType(typeId: number, payload: Partial<LeaveTypeConfig>): Observable<LeaveTypeConfig> {
    return this.http.put<LeaveTypeConfig>(`${this.baseUrl}/leaves/types/${typeId}`, payload);
  }

  // --- Projects ---
  getProjects(departmentId?: number): Observable<Project[]> {
    const url = departmentId ? `${this.baseUrl}/projects/?department_id=${departmentId}` : `${this.baseUrl}/projects/`;
    return this.http.get<Project[]>(url);
  }

  createProject(proj: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/projects/`, proj);
  }

  updateProject(id: number, proj: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/projects/${id}`, proj);
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/projects/${id}`);
  }

  // --- Tasks ---
  getTasks(projectId?: number, assigneeId?: number): Observable<TaskItem[]> {
    let params: string[] = [];
    if (projectId) params.push(`project_id=${projectId}`);
    if (assigneeId) params.push(`assignee_id=${assigneeId}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<TaskItem[]>(`${this.baseUrl}/tasks/${query}`);
  }

  createTask(task: Partial<TaskItem>): Observable<TaskItem> {
    return this.http.post<TaskItem>(`${this.baseUrl}/tasks/`, task);
  }

  updateTask(id: number, task: Partial<TaskItem>): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${this.baseUrl}/tasks/${id}`, task);
  }

  addTaskComment(taskId: number, comment: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/tasks/${taskId}/comments`, { comment });
  }

  // --- Meetings ---
  getMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.baseUrl}/meetings/`);
  }

  scheduleMeeting(meeting: Partial<Meeting>): Observable<Meeting> {
    return this.http.post<Meeting>(`${this.baseUrl}/meetings/`, meeting);
  }

  summarizeMeeting(id: number, rawNotes: string): Observable<Meeting> {
    return this.http.post<Meeting>(`${this.baseUrl}/meetings/${id}/summarize`, { raw_notes: rawNotes });
  }

  // --- Audit Logs ---
  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/audit-logs/`);
  }

  // --- AI Features ---
  queryAIAssistant(query: string): Observable<AIAssistantResponse> {
    return this.http.post<AIAssistantResponse>(`${this.baseUrl}/ai/assistant`, { query });
  }

  getBurnoutAnalytics(): Observable<BurnoutAnalysisItem[]> {
    return this.http.get<BurnoutAnalysisItem[]>(`${this.baseUrl}/ai/burnout`);
  }

  recommendTaskAssignees(requiredSkills: string[], priority: string = 'MEDIUM'): Observable<{ recommendations: TaskRecommendationItem[] }> {
    return this.http.post<{ recommendations: TaskRecommendationItem[] }>(`${this.baseUrl}/ai/recommend-task`, {
      required_skills: requiredSkills,
      priority
    });
  }

  generateAIReport(reportType: string, startDate?: string, endDate?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/generate-report`, {
      report_type: reportType,
      start_date: startDate,
      end_date: endDate
    });
  }

  getDashboardInsights(): Observable<DashboardInsights> {
    return this.http.get<DashboardInsights>(`${this.baseUrl}/ai/dashboard-insights`);
  }

  // --- Office Methods ---
  getOffices(): Observable<Office[]> {
    return this.http.get<Office[]>(`${this.baseUrl}/offices`);
  }

  createOffice(data: Partial<Office>): Observable<Office> {
    return this.http.post<Office>(`${this.baseUrl}/offices`, data);
  }

  updateOffice(id: number, data: Partial<Office>): Observable<Office> {
    return this.http.put<Office>(`${this.baseUrl}/offices/${id}`, data);
  }

  deleteOffice(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/offices/${id}`);
  }

  // --- Rank Methods ---
  getRanks(): Observable<Rank[]> {
    return this.http.get<Rank[]>(`${this.baseUrl}/ranks`);
  }

  createRank(data: { name: string }): Observable<Rank> {
    return this.http.post<Rank>(`${this.baseUrl}/ranks`, data);
  }

  updateRank(id: number, data: { name: string }): Observable<Rank> {
    return this.http.put<Rank>(`${this.baseUrl}/ranks/${id}`, data);
  }

  deleteRank(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/ranks/${id}`);
  }

  // --- Designation & RBAC Methods ---
  getSystemPanels(): Observable<SystemPanelMeta[]> {
    return this.http.get<SystemPanelMeta[]>(`${this.baseUrl}/designations/meta/panels`);
  }

  getDesignations(officeId?: number, rankId?: number, search?: string): Observable<Designation[]> {
    const params: any = {};
    if (officeId) params.office_id = officeId;
    if (rankId) params.rank_id = rankId;
    if (search) params.search = search;
    return this.http.get<Designation[]>(`${this.baseUrl}/designations`, { params });
  }

  getDesignation(id: number): Observable<Designation> {
    return this.http.get<Designation>(`${this.baseUrl}/designations/${id}`);
  }

  createDesignation(data: DesignationCreate): Observable<Designation> {
    return this.http.post<Designation>(`${this.baseUrl}/designations`, data);
  }

  updateDesignation(id: number, data: DesignationUpdate): Observable<Designation> {
    return this.http.put<Designation>(`${this.baseUrl}/designations/${id}`, data);
  }

  deleteDesignation(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/designations/${id}`);
  }
}
