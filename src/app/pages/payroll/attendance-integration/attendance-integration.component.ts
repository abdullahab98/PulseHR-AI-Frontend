import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PayrollService } from '../../../services/payroll.service';
import { AttendanceIntegrationSummary } from '../../../models/api.models';

@Component({
  selector: 'app-attendance-integration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance-integration.component.html'
})
export class AttendanceIntegrationComponent implements OnInit {
  loading: boolean = false;
  selectedMonth: string = '2026-09';
  attendanceSummary: AttendanceIntegrationSummary | null = null;

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.payrollService.getAttendanceSummary(this.selectedMonth).subscribe({
      next: (data) => {
        this.attendanceSummary = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onMonthChange(): void {
    this.loadData();
  }
}
