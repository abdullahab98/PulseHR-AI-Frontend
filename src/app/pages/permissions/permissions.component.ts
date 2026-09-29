import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../services/permission.service';
import { UserPermissionItem, PanelId } from '../../models/api.models';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permissions.component.html'
})
export class PermissionsComponent implements OnInit {
  users: UserPermissionItem[] = [];
  selectedUser: UserPermissionItem | null = null;
  loading = true;
  saving = false;
  successMessage = '';

  allPanels: { id: PanelId; label: string; icon: string; category: string }[] = [
    { id: 'EXECUTIVE', label: 'Executive Panel', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z', category: 'Executive' },
    { id: 'HR', label: 'HR & Personnel', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1', category: 'HR' },
    { id: 'PROJECTS', label: 'Projects & Milestones', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5', category: 'Projects' },
    { id: 'DEVELOPMENT', label: 'Software Development', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10', category: 'Development' },
    { id: 'QA', label: 'QA & Bug Tracking', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856', category: 'QA' },
    { id: 'DESIGN', label: 'UI/UX Design', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12', category: 'Design' },
    { id: 'FINANCE', label: 'Finance & Accounts', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895', category: 'Finance' },
    { id: 'IT_SUPPORT', label: 'IT Support Desk', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536', category: 'IT' },
    { id: 'SALES', label: 'Sales & Marketing', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', category: 'Sales' },
    { id: 'INVENTORY', label: 'Inventory & Assets', icon: 'M20 7l-8-4-8 4m16 0l-8 4', category: 'Inventory' },
    { id: 'MEETINGS', label: 'Meetings & AI Summaries', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618', category: 'Collaboration' },
    { id: 'DOCUMENTS', label: 'Document Repository', icon: 'M7 21h10a2 2 0 002-2V9.414', category: 'Collaboration' }
  ];

  permissionFlags = [
    { key: 'can_create_projects', label: 'Create & Manage Projects' },
    { key: 'can_delete_projects', label: 'Delete Projects' },
    { key: 'can_approve_leaves', label: 'Approve / Reject Leave Requests' },
    { key: 'can_view_payroll', label: 'View Confidential Financial Payroll' },
    { key: 'can_manage_bugs', label: 'Close & Reassign QA Bug Reports' },
    { key: 'can_upload_documents', label: 'Upload Restricted Enterprise Documents' },
    { key: 'can_export_reports', label: 'Generate & Export AI Strategic Reports' }
  ];

  constructor(private apiService: PermissionService) {}

  ngOnInit(): void {
    this.loadUserPermissions();
  }

  loadUserPermissions(): void {
    this.loading = true;
    this.apiService.getAllUserPermissions().subscribe({
      next: (data) => {
        this.users = data;
        if (this.users.length > 0) {
          this.selectUser(this.users[0]);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load user permissions', err);
        this.loading = false;
      }
    });
  }

  selectUser(user: UserPermissionItem): void {
    // Clone object to avoid direct mutations
    this.selectedUser = JSON.parse(JSON.stringify(user));
    if (!this.selectedUser!.allowed_panels) {
      this.selectedUser!.allowed_panels = [];
    }
    if (!this.selectedUser!.custom_permissions) {
      this.selectedUser!.custom_permissions = {};
    }
  }

  isPanelAllowed(panelId: PanelId): boolean {
    return this.selectedUser?.allowed_panels.includes(panelId) || false;
  }

  togglePanel(panelId: PanelId): void {
    if (!this.selectedUser) return;
    const index = this.selectedUser.allowed_panels.indexOf(panelId);
    if (index > -1) {
      this.selectedUser.allowed_panels.splice(index, 1);
    } else {
      this.selectedUser.allowed_panels.push(panelId);
    }
  }

  isPermissionEnabled(key: string): boolean {
    return !!this.selectedUser?.custom_permissions[key];
  }

  togglePermission(key: string): void {
    if (!this.selectedUser) return;
    this.selectedUser.custom_permissions[key] = !this.selectedUser.custom_permissions[key];
  }

  savePermissions(): void {
    if (!this.selectedUser) return;
    this.saving = true;
    this.successMessage = '';

    const payload = {
      allowed_panels: this.selectedUser.allowed_panels,
      custom_permissions: this.selectedUser.custom_permissions,
      data_scope: this.selectedUser.data_scope
    };

    this.apiService.updateUserPermissions(this.selectedUser.id, payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.successMessage = `Permissions for ${this.selectedUser?.employee_name || this.selectedUser?.email} updated successfully!`;
        // Update local list item
        const idx = this.users.findIndex(u => u.id === this.selectedUser?.id);
        if (idx > -1) {
          this.users[idx] = JSON.parse(JSON.stringify(this.selectedUser));
        }
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        console.error('Failed to save permissions', err);
        this.saving = false;
      }
    });
  }
}
