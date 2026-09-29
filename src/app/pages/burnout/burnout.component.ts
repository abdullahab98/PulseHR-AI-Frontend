import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BurnoutService } from '../../services/burnout.service';
import { BurnoutAnalysisItem, BurnoutSummary } from '../../models/api.models';

@Component({
  selector: 'app-burnout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './burnout.component.html'
})
export class BurnoutComponent implements OnInit {
  loading: boolean = false;
  generatingId: number | null = null;
  summary: BurnoutSummary | null = null;
  burnoutItems: BurnoutAnalysisItem[] = [];

  // Filters & Search
  selectedRiskFilter: string = 'ALL';
  selectedDepartment: string = 'ALL';
  searchQuery: string = '';
  sortBy: string = 'RISK_DESC';

  // Selected Employee for Detailed Psychological Audit Modal
  selectedEmployee: BurnoutAnalysisItem | null = null;

  constructor(private burnoutService: BurnoutService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    this.burnoutService.getBurnoutSummary().subscribe({
      next: (s) => this.summary = s,
      error: () => {}
    });

    this.burnoutService.getBurnoutAnalytics().subscribe({
      next: (items) => {
        this.burnoutItems = items;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get departments(): string[] {
    const set = new Set<string>();
    this.burnoutItems.forEach(i => {
      if (i.department_name) set.add(i.department_name);
    });
    return Array.from(set);
  }

  get filteredItems(): BurnoutAnalysisItem[] {
    let list = this.burnoutItems;

    // Filter by Risk
    if (this.selectedRiskFilter !== 'ALL') {
      list = list.filter(i => i.risk_level === this.selectedRiskFilter);
    }

    // Filter by Department
    if (this.selectedDepartment !== 'ALL') {
      list = list.filter(i => i.department_name === this.selectedDepartment);
    }

    // Search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(i =>
        i.employee_name.toLowerCase().includes(q) ||
        (i.department_name && i.department_name.toLowerCase().includes(q)) ||
        (i.designation && i.designation.toLowerCase().includes(q)) ||
        (i.health_status && i.health_status.toLowerCase().includes(q))
      );
    }

    // Sort
    return list.sort((a, b) => {
      if (this.sortBy === 'RISK_DESC') return b.burnout_score - a.burnout_score;
      if (this.sortBy === 'RISK_ASC') return a.burnout_score - b.burnout_score;
      if (this.sortBy === 'OVERTIME_DESC') return b.overtime_hours_month - a.overtime_hours_month;
      if (this.sortBy === 'WLB_ASC') return a.work_life_balance_score - b.work_life_balance_score;
      return 0;
    });
  }

  generateLiveAIReport(item: BurnoutAnalysisItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.generatingId = item.employee_id;

    this.burnoutService.generateEmployeeBurnoutReport(item.employee_id).subscribe({
      next: (updated) => {
        this.generatingId = null;
        // Update in list
        const index = this.burnoutItems.findIndex(i => i.employee_id === updated.employee_id);
        if (index !== -1) {
          this.burnoutItems[index] = updated;
        }
        // If modal open for this employee, update view
        if (this.selectedEmployee && this.selectedEmployee.employee_id === updated.employee_id) {
          this.selectedEmployee = updated;
        }
      },
      error: (err) => {
        this.generatingId = null;
        alert(err.error?.detail || 'Failed to synthesize AI report');
      }
    });
  }

  openAuditModal(item: BurnoutAnalysisItem): void {
    this.selectedEmployee = item;
  }

  closeAuditModal(): void {
    this.selectedEmployee = null;
  }

  printReport(): void {
    window.print();
  }
}
