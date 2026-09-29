import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DesignationService } from '../../services/designation.service';
import { AuthService } from '../../services/auth.service';
import {
  Designation, Office, Rank, SystemPanelMeta,
  PanelPermissionsMap, PanelPermissionAction
} from '../../models/api.models';

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './designations.component.html'
})
export class DesignationsComponent implements OnInit {
  designations: Designation[] = [];
  offices: Office[] = [];
  ranks: Rank[] = [];
  panels: SystemPanelMeta[] = [];

  loading = true;
  error: string | null = null;
  successMessage: string | null = null;
  submitting = false;

  // Filters & Views
  searchQuery = '';
  selectedOfficeId: number | 'ALL' = 'ALL';
  selectedRankId: number | 'ALL' = 'ALL';
  viewMode: 'cards' | 'table' = 'cards';

  // Modal State
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  showDeleteModal = false;
  deletingDesignation: Designation | null = null;

  // Form Data
  formData = {
    name: '',
    office_id: null as number | null,
    rank_id: null as number | null,
    description: '',
    permissions: {} as PanelPermissionsMap
  };

  get canCreate(): boolean {
    return this.auth.canCreate('designations');
  }

  get canEdit(): boolean {
    return this.auth.canEdit('designations');
  }

  get canDelete(): boolean {
    return this.auth.canDelete('designations');
  }

  constructor(
    private api: DesignationService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    this.error = null;

    // Fetch panels meta
    this.api.getSystemPanels().subscribe({
      next: (panels) => {
        this.panels = panels;
      },
      error: () => {
        // Fallback default panels if error
        this.panels = [
          { id: 'dashboard', name: 'Dashboard', category: 'Executive & Strategy', icon: '🏠' },
          { id: 'reports', name: 'AI Analytics & Reports', category: 'Executive & Strategy', icon: '📊' },

          { id: 'offices', name: 'Office', category: 'HR Management', icon: '🏢' },
          { id: 'ranks', name: 'Rank', category: 'HR Management', icon: '⭐' },
          { id: 'designations', name: 'Designation', category: 'HR Management', icon: '🎖️' },
          { id: 'employees', name: 'Employees', category: 'HR Management', icon: '👥' },
          { id: 'create_employee', name: 'Create Employee', category: 'HR Management', icon: '➕' },
          { id: 'employee_organogram', name: 'Employee Organogram', category: 'HR Management', icon: '🌳' },

          { id: 'attendance', name: 'Attendance Application List', category: 'Attendance Management', icon: '📋' },
          { id: 'attendance_report', name: 'Attendance Report', category: 'Attendance Management', icon: '📊' },
          { id: 'attendance_time_slots', name: 'Attendance Time Slot', category: 'Attendance Management', icon: '🕒' },
          { id: 'attendance_apply_slot', name: 'Apply for New Time Slot', category: 'Attendance Management', icon: '📝' },
          { id: 'attendance_weekend_setup', name: 'Weekend Setup', category: 'Attendance Management', icon: '🗓️' },

          { id: 'leaves', name: 'Leave', category: 'Leave Management', icon: '🏖️' },
          { id: 'leave_applications', name: 'Leave Application', category: 'Leave Management', icon: '⚖️' },
          { id: 'leave_employee_report', name: 'Employee Leave Report', category: 'Leave Management', icon: '📑' },
          { id: 'leave_designation_chain', name: "Designation Chain", category: 'Leave Management', icon: '🔗' },
          { id: 'leave_types', name: 'Leave Type', category: 'Leave Management', icon: '🏷️' },

          { id: 'projects', name: 'Projects & Milestones', category: 'Engineering & QA', icon: '📋' },
          { id: 'tasks', name: 'Tasks & Sprint Board', category: 'Engineering & QA', icon: '💻' },
          { id: 'qa', name: 'QA & Bug Tracking', category: 'Engineering & QA', icon: '🧪' },

          { id: 'finance', name: 'Finance & Expenses', category: 'Enterprise Ops', icon: '💰' },
          { id: 'it_support', name: 'IT Support Desk', category: 'Enterprise Ops', icon: '🛠️' },
          { id: 'inventory', name: 'Inventory & Assets', category: 'Enterprise Ops', icon: '📦' },

          { id: 'payroll', name: 'Payroll Overview', category: 'Payroll Management', icon: '📊' },
          { id: 'payroll_structure', name: 'Salary Structure', category: 'Payroll Management', icon: '💼' },
          { id: 'payroll_attendance', name: 'Attendance Integration', category: 'Payroll Management', icon: '⏱️' },
          { id: 'payroll_allowances', name: 'Allowances & Bonuses', category: 'Payroll Management', icon: '🎁' },
          { id: 'payroll_deductions', name: 'Deduction Rules', category: 'Payroll Management', icon: '✂️' },
          { id: 'payroll_processing', name: 'Monthly Processing', category: 'Payroll Management', icon: '⚙️' },
          { id: 'payroll_disbursement', name: 'Salary Disbursement', category: 'Payroll Management', icon: '💳' },
          { id: 'payroll_payslips', name: 'Payslip Management', category: 'Payroll Management', icon: '📄' },
          { id: 'payroll_reports', name: 'Payroll Reports', category: 'Payroll Management', icon: '📈' },

          { id: 'meetings', name: 'Meetings & AI Summaries', category: 'Collaboration & Sales', icon: '📅' },
          { id: 'documents', name: 'Document Repository', category: 'Collaboration & Sales', icon: '📄' },
          { id: 'sales', name: 'Sales & CRM Leads', category: 'Collaboration & Sales', icon: '📢' },

          { id: 'burnout', name: 'Burnout Radar', category: 'AI Health & Burnout', icon: '🔥' },

          { id: 'permissions', name: 'Permission Control', category: 'Governance', icon: '🔐' },
          { id: 'audit_logs', name: 'Audit & Compliance', category: 'Governance', icon: '🛡️' }
        ];
      }
    });

    // Fetch Offices
    this.api.getOffices().subscribe({
      next: (offices) => (this.offices = offices)
    });

    // Fetch Ranks
    this.api.getRanks().subscribe({
      next: (ranks) => (this.ranks = ranks)
    });

    // Fetch Designations
    this.loadDesignations();
  }

  loadDesignations(): void {
    this.loading = true;
    this.api.getDesignations().subscribe({
      next: (data) => {
        this.designations = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load designations: ' + (err.error?.detail || err.message);
        this.loading = false;
      }
    });
  }

  get filteredDesignations(): Designation[] {
    return this.designations.filter((d) => {
      const matchesSearch =
        !this.searchQuery ||
        d.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (d.office_name && d.office_name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (d.rank_name && d.rank_name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (d.description && d.description.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesOffice =
        this.selectedOfficeId === 'ALL' ||
        d.office_id === Number(this.selectedOfficeId);

      const matchesRank =
        this.selectedRankId === 'ALL' ||
        d.rank_id === Number(this.selectedRankId);

      return matchesSearch && matchesOffice && matchesRank;
    });
  }

  get categories(): string[] {
    const set = new Set<string>();
    this.panels.forEach((p) => set.add(p.category));
    return Array.from(set);
  }

  getPanelsForCategory(category: string): SystemPanelMeta[] {
    return this.panels.filter((p) => p.category === category);
  }

  // --- Modal Openers ---
  openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formData = {
      name: '',
      office_id: this.offices.length > 0 ? this.offices[0].id : null,
      rank_id: this.ranks.length > 0 ? this.ranks[0].id : null,
      description: '',
      permissions: {}
    };

    // Initialize default permissions for all panels
    this.panels.forEach((p) => {
      this.formData.permissions[p.id] = {
        view: false,
        create: false,
        edit: false,
        delete: false
      };
    });

    this.showModal = true;
    this.error = null;
  }

  openEditModal(desig: Designation): void {
    this.isEditing = true;
    this.editingId = desig.id;

    // Deep copy permissions
    const permsCopy: PanelPermissionsMap = {};
    this.panels.forEach((p) => {
      const existing = desig.permissions ? desig.permissions[p.id] : null;
      permsCopy[p.id] = {
        view: existing ? !!existing.view : false,
        create: existing ? !!existing.create : false,
        edit: existing ? !!existing.edit : false,
        delete: existing ? !!existing.delete : false
      };
    });

    this.formData = {
      name: desig.name,
      office_id: desig.office_id != null ? Number(desig.office_id) : null,
      rank_id: desig.rank_id != null ? Number(desig.rank_id) : null,
      description: desig.description || '',
      permissions: permsCopy
    };

    this.showModal = true;
    this.error = null;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = null;
  }

  // --- Permission Matrix Helpers ---
  getPermission(panelId: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean {
    if (!this.formData.permissions[panelId]) {
      this.formData.permissions[panelId] = {
        view: false,
        create: false,
        edit: false,
        delete: false
      };
    }
    return this.formData.permissions[panelId][action];
  }

  togglePermission(panelId: string, action: 'view' | 'create' | 'edit' | 'delete'): void {
    if (!this.formData.permissions[panelId]) {
      this.formData.permissions[panelId] = {
        view: false,
        create: false,
        edit: false,
        delete: false
      };
    }

    const currentVal = this.formData.permissions[panelId][action];
    const newVal = !currentVal;
    this.formData.permissions[panelId][action] = newVal;

    // Smart auto-validation rule:
    // If setting create, edit, or delete to true, automatically turn view on
    if (action !== 'view' && newVal) {
      this.formData.permissions[panelId].view = true;
    }

    // If turning view off, automatically turn off create, edit, and delete
    if (action === 'view' && !newVal) {
      this.formData.permissions[panelId].create = false;
      this.formData.permissions[panelId].edit = false;
      this.formData.permissions[panelId].delete = false;
    }
  }

  togglePanelRow(panelId: string): void {
    const row = this.formData.permissions[panelId];
    const hasAny = row && (row.view || row.create || row.edit || row.delete);
    if (hasAny) {
      this.formData.permissions[panelId] = { view: false, create: false, edit: false, delete: false };
    } else {
      this.formData.permissions[panelId] = { view: true, create: true, edit: true, delete: true };
    }
  }

  grantAllPermissions(): void {
    this.panels.forEach((p) => {
      this.formData.permissions[p.id] = { view: true, create: true, edit: true, delete: true };
    });
  }

  viewOnlyAllPermissions(): void {
    this.panels.forEach((p) => {
      this.formData.permissions[p.id] = { view: true, create: false, edit: false, delete: false };
    });
  }

  clearAllPermissions(): void {
    this.panels.forEach((p) => {
      this.formData.permissions[p.id] = { view: false, create: false, edit: false, delete: false };
    });
  }

  // --- Save / Submit ---
  saveDesignation(): void {
    if (!this.formData.name.trim()) {
      this.error = 'Designation name is required';
      return;
    }

    this.submitting = true;
    this.error = null;

    const payload = {
      name: this.formData.name.trim(),
      office_id: this.formData.office_id ? Number(this.formData.office_id) : null,
      rank_id: this.formData.rank_id ? Number(this.formData.rank_id) : null,
      description: this.formData.description.trim() || null,
      permissions: this.formData.permissions
    };

    if (this.isEditing && this.editingId) {
      this.api.updateDesignation(this.editingId, payload).subscribe({
        next: (updated) => {
          this.submitting = false;
          this.closeModal();
          this.successMessage = `Designation "${updated.name}" updated successfully!`;
          this.loadDesignations();
          setTimeout(() => (this.successMessage = null), 4000);
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.detail || 'Failed to update designation';
        }
      });
    } else {
      this.api.createDesignation(payload).subscribe({
        next: (created) => {
          this.submitting = false;
          this.closeModal();
          this.successMessage = `Designation "${created.name}" created successfully!`;
          this.loadDesignations();
          setTimeout(() => (this.successMessage = null), 4000);
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.detail || 'Failed to create designation';
        }
      });
    }
  }

  // --- Delete Handling ---
  confirmDelete(desig: Designation): void {
    this.deletingDesignation = desig;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.deletingDesignation = null;
    this.showDeleteModal = false;
  }

  executeDelete(): void {
    if (!this.deletingDesignation) return;

    this.submitting = true;
    const name = this.deletingDesignation.name;
    this.api.deleteDesignation(this.deletingDesignation.id).subscribe({
      next: () => {
        this.submitting = false;
        this.showDeleteModal = false;
        this.deletingDesignation = null;
        this.successMessage = `Designation "${name}" deleted successfully`;
        this.loadDesignations();
        setTimeout(() => (this.successMessage = null), 4000);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.detail || 'Failed to delete designation';
      }
    });
  }

  // --- Stats Helpers ---
  getActivePermissionsCount(desig: Designation): { panels: number; actions: number } {
    let panelsCount = 0;
    let actionsCount = 0;
    if (desig.permissions) {
      Object.values(desig.permissions).forEach((p: any) => {
        if (p) {
          if (p.view) panelsCount++;
          if (p.create) actionsCount++;
          if (p.edit) actionsCount++;
          if (p.delete) actionsCount++;
        }
      });
    }
    return { panels: panelsCount, actions: actionsCount };
  }

  getActivePanels(desig: Designation): SystemPanelMeta[] {
    if (!desig.permissions) return [];
    return this.panels.filter((p) => {
      const perm = desig.permissions ? desig.permissions[p.id] : null;
      return perm && (perm.view || perm.create || perm.edit || perm.delete);
    });
  }
}
