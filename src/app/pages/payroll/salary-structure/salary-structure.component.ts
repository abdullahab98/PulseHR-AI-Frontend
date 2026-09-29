import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PayrollService } from '../../../services/payroll.service';
import { SalaryStructure } from '../../../models/api.models';

@Component({
  selector: 'app-salary-structure',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './salary-structure.component.html'
})
export class SalaryStructureComponent implements OnInit {
  loading: boolean = false;
  salaryStructures: SalaryStructure[] = [];
  searchQuery: string = '';

  showEditModal: boolean = false;
  editingStructure: Partial<SalaryStructure> = {};

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadStructures();
  }

  loadStructures(): void {
    this.loading = true;
    this.payrollService.getSalaryStructures().subscribe({
      next: (data) => {
        this.salaryStructures = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get filteredStructures(): SalaryStructure[] {
    if (!this.searchQuery) return this.salaryStructures;
    const q = this.searchQuery.toLowerCase();
    return this.salaryStructures.filter(s =>
      (s.employee_name && s.employee_name.toLowerCase().includes(q)) ||
      (s.department_name && s.department_name.toLowerCase().includes(q)) ||
      (s.designation && s.designation.toLowerCase().includes(q))
    );
  }

  openEditModal(structure: SalaryStructure): void {
    this.editingStructure = { ...structure };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveStructure(): void {
    if (!this.editingStructure.basic_salary) {
      alert('Please enter a valid Basic Salary');
      return;
    }
    this.payrollService.saveSalaryStructure(this.editingStructure).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadStructures();
      },
      error: (err) => alert(err.error?.detail || 'Failed to update salary structure')
    });
  }
}
