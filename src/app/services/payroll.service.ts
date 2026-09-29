import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SalaryStructure,
  AllowanceConfig,
  BonusConfig,
  DeductionConfig,
  PayrollBatch,
  Payslip,
  PayrollSummary,
  AttendanceIntegrationSummary
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // -------------------------------------------------------------
  // MODULE 1: Salary Structure
  // -------------------------------------------------------------
  getSalaryStructures(departmentId?: number): Observable<SalaryStructure[]> {
    let params = new HttpParams();
    if (departmentId) {
      params = params.set('department_id', departmentId.toString());
    }
    return this.http.get<SalaryStructure[]>(`${this.baseUrl}/payroll/salary-structures`, { params });
  }

  getSalaryStructure(employeeId: number): Observable<SalaryStructure> {
    return this.http.get<SalaryStructure>(`${this.baseUrl}/payroll/salary-structures/${employeeId}`);
  }

  saveSalaryStructure(structure: Partial<SalaryStructure>): Observable<SalaryStructure> {
    return this.http.post<SalaryStructure>(`${this.baseUrl}/payroll/salary-structures`, structure);
  }

  // -------------------------------------------------------------
  // MODULE 3: Allowance Management
  // -------------------------------------------------------------
  getAllowanceConfigs(): Observable<AllowanceConfig[]> {
    return this.http.get<AllowanceConfig[]>(`${this.baseUrl}/payroll/allowance-configs`);
  }

  createAllowanceConfig(cfg: Partial<AllowanceConfig>): Observable<AllowanceConfig> {
    return this.http.post<AllowanceConfig>(`${this.baseUrl}/payroll/allowance-configs`, cfg);
  }

  deleteAllowanceConfig(cfgId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/payroll/allowance-configs/${cfgId}`);
  }

  // -------------------------------------------------------------
  // MODULE 4: Bonus Management
  // -------------------------------------------------------------
  getBonusConfigs(): Observable<BonusConfig[]> {
    return this.http.get<BonusConfig[]>(`${this.baseUrl}/payroll/bonus-configs`);
  }

  createBonusConfig(cfg: Partial<BonusConfig>): Observable<BonusConfig> {
    return this.http.post<BonusConfig>(`${this.baseUrl}/payroll/bonus-configs`, cfg);
  }

  deleteBonusConfig(cfgId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/payroll/bonus-configs/${cfgId}`);
  }

  // -------------------------------------------------------------
  // MODULE 5: Deduction Management
  // -------------------------------------------------------------
  getDeductionConfigs(): Observable<DeductionConfig[]> {
    return this.http.get<DeductionConfig[]>(`${this.baseUrl}/payroll/deduction-configs`);
  }

  createDeductionConfig(cfg: Partial<DeductionConfig>): Observable<DeductionConfig> {
    return this.http.post<DeductionConfig>(`${this.baseUrl}/payroll/deduction-configs`, cfg);
  }

  deleteDeductionConfig(cfgId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/payroll/deduction-configs/${cfgId}`);
  }

  // -------------------------------------------------------------
  // MODULE 2 & 6: Attendance Integration & Monthly Processing
  // -------------------------------------------------------------
  getAttendanceSummary(monthYear: string, employeeId?: number): Observable<AttendanceIntegrationSummary> {
    let params = new HttpParams().set('month_year', monthYear);
    if (employeeId) {
      params = params.set('employee_id', employeeId.toString());
    }
    return this.http.get<AttendanceIntegrationSummary>(`${this.baseUrl}/payroll/attendance-summary`, { params });
  }

  getBatches(): Observable<PayrollBatch[]> {
    return this.http.get<PayrollBatch[]>(`${this.baseUrl}/payroll/batches`);
  }

  getBatch(batchId: number): Observable<PayrollBatch> {
    return this.http.get<PayrollBatch>(`${this.baseUrl}/payroll/batches/${batchId}`);
  }

  generatePayroll(req: {
    month_year: string;
    title?: string;
    department_id?: number;
    include_bonus_id?: number;
  }): Observable<PayrollBatch> {
    return this.http.post<PayrollBatch>(`${this.baseUrl}/payroll/generate`, req);
  }

  updateBatchStatus(batchId: number, status: string): Observable<{ message: string; batch_id: number; status: string }> {
    return this.http.patch<{ message: string; batch_id: number; status: string }>(
      `${this.baseUrl}/payroll/batches/${batchId}/status?status_val=${status}`,
      {}
    );
  }

  // -------------------------------------------------------------
  // MODULE 7: Salary Disbursement
  // -------------------------------------------------------------
  getDisbursements(batchMonth?: string, paymentStatus?: string): Observable<Payslip[]> {
    let params = new HttpParams();
    if (batchMonth) params = params.set('batch_month', batchMonth);
    if (paymentStatus) params = params.set('payment_status', paymentStatus);
    return this.http.get<Payslip[]>(`${this.baseUrl}/payroll/disbursements`, { params });
  }

  disburse(req: {
    payslip_ids: number[];
    payment_method: string;
    payment_date?: string;
    transaction_id?: string;
    payment_reference?: string;
  }): Observable<{
    message: string;
    disbursed_count: number;
    total_disbursed_amount: number;
    payment_date: string;
    payment_method: string;
  }> {
    return this.http.post<any>(`${this.baseUrl}/payroll/disburse`, req);
  }

  disburseSalaries(req: any): Observable<any> {
    return this.disburse(req);
  }

  // -------------------------------------------------------------
  // MODULE 8: Payslips
  // -------------------------------------------------------------
  getPayslips(monthYear?: string, employeeId?: number, paymentStatus?: string): Observable<Payslip[]> {
    let params = new HttpParams();
    if (monthYear) params = params.set('month_year', monthYear);
    if (employeeId) params = params.set('employee_id', employeeId.toString());
    if (paymentStatus) params = params.set('payment_status', paymentStatus);
    return this.http.get<Payslip[]>(`${this.baseUrl}/payroll/payslips`, { params });
  }

  getPayslip(payslipId: number): Observable<Payslip> {
    return this.http.get<Payslip>(`${this.baseUrl}/payroll/payslips/${payslipId}`);
  }

  getMyPayslips(): Observable<Payslip[]> {
    return this.http.get<Payslip[]>(`${this.baseUrl}/payroll/my-payslips`);
  }

  // -------------------------------------------------------------
  // MODULE 9: Payroll Reports
  // -------------------------------------------------------------
  getSummaryReport(monthYear?: string): Observable<PayrollSummary> {
    let params = new HttpParams();
    if (monthYear) params = params.set('month_year', monthYear);
    return this.http.get<PayrollSummary>(`${this.baseUrl}/payroll/reports/summary`, { params });
  }

  getEmployeeSalaryHistory(employeeId: number): Observable<Payslip[]> {
    return this.http.get<Payslip[]>(`${this.baseUrl}/payroll/reports/employee-history/${employeeId}`);
  }
}
