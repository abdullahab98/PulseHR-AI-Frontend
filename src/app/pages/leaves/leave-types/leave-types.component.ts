import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../services/leave.service';
import { LeaveTypeConfig } from '../../../models/api.models';

@Component({
  selector: 'app-leave-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-types.component.html'
})
export class LeaveTypesComponent implements OnInit {
  leaveTypes: LeaveTypeConfig[] = [];
  isLoading: boolean = false;
  showCreateModal: boolean = false;
  isSaving: boolean = false;

  newType: Partial<LeaveTypeConfig> = {
    code: '',
    name: '',
    description: '',
    days_allowed: 14,
    is_paid: true,
    carry_forward: false,
    requires_attachment: false,
    is_active: true
  };

  constructor(private apiService: LeaveService) {}

  ngOnInit() {
    this.loadLeaveTypes();
  }

  loadLeaveTypes() {
    this.isLoading = true;
    this.apiService.getLeaveTypes().subscribe({
      next: (data) => {
        this.leaveTypes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load leave types', err);
        this.isLoading = false;
      }
    });
  }

  get totalTypesCount(): number {
    return this.leaveTypes.length;
  }

  get paidTypesCount(): number {
    return this.leaveTypes.filter(t => t.is_paid).length;
  }

  get activeTypesCount(): number {
    return this.leaveTypes.filter(t => t.is_active).length;
  }

  openCreateModal() {
    this.newType = {
      code: '',
      name: '',
      description: '',
      days_allowed: 14,
      is_paid: true,
      carry_forward: false,
      requires_attachment: false,
      is_active: true
    };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  saveLeaveType() {
    if (!this.newType.code?.trim() || !this.newType.name?.trim()) {
      alert('Please provide both Leave Type Code and Name.');
      return;
    }

    this.newType.code = this.newType.code.trim().toUpperCase().replace(/\s+/g, '_');

    this.isSaving = true;
    this.apiService.createLeaveType(this.newType).subscribe({
      next: () => {
        this.isSaving = false;
        this.showCreateModal = false;
        this.loadLeaveTypes();
      },
      error: (err) => {
        this.isSaving = false;
        alert(err.error?.detail || 'Failed to create leave type');
      }
    });
  }

  toggleActive(type: LeaveTypeConfig) {
    const updated = { ...type, is_active: !type.is_active };
    this.apiService.updateLeaveType(type.id, updated).subscribe({
      next: () => this.loadLeaveTypes(),
      error: (err) => alert(err.error?.detail || 'Failed to update leave type status')
    });
  }

  getTypeBadgeClass(code: string): string {
    switch (code) {
      case 'ANNUAL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CASUAL':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'SICK':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PARENTAL':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'UNPAID':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }
}
