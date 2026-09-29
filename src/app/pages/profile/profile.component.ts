import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { DesignationService } from '../../services/designation.service';
import { Employee, AddressItem, FamilyInfo, Designation } from '../../models/api.models';

export type ProfileTab = 'overview' | 'designation' | 'contact' | 'addresses' | 'parents' | 'employment' | 'security';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  employeeId: number | null = null;
  employee: Employee | null = null;
  isSelf = true;
  loading = true;
  saving = false;
  isEditing = false;
  activeTab: ProfileTab = 'overview';

  // Alerts
  successMessage = '';
  errorMessage = '';

  // Designation Management (HR & Super Admin)
  availableDesignations: Designation[] = [];
  selectedDesignationId: number | null = null;
  designationSaving = false;
  designationMessage = '';
  designationError = '';
  showRemoveConfirm = false;

  // Password Change Model
  passwordModel = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordSuccess = '';
  passwordError = '';
  passwordLoading = false;

  // Editable form state
  editForm: {
    first_name: string;
    last_name: string;
    phone: string;
    personal_email: string;
    bio: string;
    emergency_name: string;
    emergency_relation: string;
    emergency_phone: string;
    presentAddress: AddressItem;
    permanentAddress: AddressItem;
    family: FamilyInfo;
    skillsString: string;
  } = {
    first_name: '',
    last_name: '',
    phone: '',
    personal_email: '',
    bio: '',
    emergency_name: '',
    emergency_relation: '',
    emergency_phone: '',
    presentAddress: {},
    permanentAddress: {},
    family: {},
    skillsString: ''
  };

  tabs: Array<{ id: ProfileTab; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'designation', label: 'Designation & Org', icon: '🎖️' },
    { id: 'contact', label: 'Contact Details', icon: '📞' },
    { id: 'addresses', label: 'Addresses', icon: '🏠' },
    { id: 'parents', label: 'Parents & Family', icon: '👨‍👩‍👧' },
    { id: 'employment', label: 'Employment & Skills', icon: '💼' },
    { id: 'security', label: 'Security & Access', icon: '🔒' }
  ];

  constructor(
    private route: ActivatedRoute,
    private apiService: ProfileService,
    private designationService: DesignationService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDesignations();

    this.route.params.subscribe(params => {
      const idParam = params['id'];
      this.employeeId = idParam ? Number(idParam) : null;
      this.loadProfile();
    });

    this.route.queryParams.subscribe(q => {
      if (q['tab'] && this.tabs.some(t => t.id === q['tab'])) {
        this.activeTab = q['tab'] as ProfileTab;
      }
    });
  }

  loadDesignations(): void {
    this.designationService.getDesignations().subscribe({
      next: (list) => {
        this.availableDesignations = list;
      },
      error: (err) => console.error('Failed to load designations list', err)
    });
  }

  setTab(tab: ProfileTab): void {
    this.activeTab = tab;
    this.clearAlerts();
  }

  loadProfile(): void {
    this.loading = true;
    this.clearAlerts();

    const currentUser = this.authService.currentUser();

    if (this.employeeId) {
      // Viewing a specific employee
      this.apiService.getEmployee(this.employeeId).subscribe({
        next: (emp) => {
          this.employee = emp;
          this.isSelf = (emp.user_id === currentUser.userId || emp.id === currentUser.employeeId);
          this.selectedDesignationId = emp.designation_id || null;
          this.populateEditForm(emp);
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.detail || 'Failed to load employee profile.';
          this.loading = false;
        }
      });
    } else {
      // Viewing own profile
      this.isSelf = true;
      this.apiService.getMyProfile().subscribe({
        next: (emp) => {
          this.employee = emp;
          this.selectedDesignationId = emp.designation_id || null;
          this.populateEditForm(emp);
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.detail || 'Failed to load user profile.';
          this.loading = false;
        }
      });
    }
  }

  populateEditForm(emp: Employee): void {
    const addr = emp.address_info || {};
    const fam = emp.family_info || {};
    const emg = emp.emergency_contact || {};

    this.editForm = {
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      phone: emp.phone || '',
      personal_email: emp.personal_email || '',
      bio: emp.bio || '',
      emergency_name: emg['name'] || '',
      emergency_relation: emg['relation'] || 'Spouse',
      emergency_phone: emg['phone'] || '',
      presentAddress: addr.present ? { ...addr.present } : {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Bangladesh'
      },
      permanentAddress: addr.permanent ? { ...addr.permanent } : {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Bangladesh'
      },
      family: {
        father_name: fam.father_name || '',
        mother_name: fam.mother_name || '',
        spouse_name: fam.spouse_name || '',
        marital_status: fam.marital_status || 'Single',
        dependents: fam.dependents || '',
        emergency_family_phone: fam.emergency_family_phone || ''
      },
      skillsString: emp.skills ? emp.skills.join(', ') : ''
    };
  }

  toggleEdit(): void {
    if (this.isEditing) {
      // Cancel edits
      if (this.employee) this.populateEditForm(this.employee);
      this.isEditing = false;
    } else {
      this.isEditing = true;
    }
  }

  saveProfile(): void {
    if (!this.employee) return;
    this.saving = true;
    this.clearAlerts();

    const skills = this.editForm.skillsString.split(',').map(s => s.trim()).filter(Boolean);

    const payload: Partial<Employee> = {
      first_name: this.editForm.first_name,
      last_name: this.editForm.last_name,
      phone: this.editForm.phone,
      personal_email: this.editForm.personal_email,
      bio: this.editForm.bio,
      skills: skills,
      emergency_contact: {
        name: this.editForm.emergency_name,
        relation: this.editForm.emergency_relation,
        phone: this.editForm.emergency_phone
      },
      address_info: {
        present: this.editForm.presentAddress,
        permanent: this.editForm.permanentAddress
      },
      family_info: this.editForm.family
    };

    const updateObs = this.isSelf
      ? this.apiService.updateMyProfile(payload)
      : this.apiService.updateEmployee(this.employee.id, payload);

    updateObs.subscribe({
      next: (updated) => {
        this.employee = updated;
        this.populateEditForm(updated);
        this.saving = false;
        this.isEditing = false;
        this.successMessage = 'Profile information updated successfully!';
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.detail || 'Failed to save profile changes.';
      }
    });
  }

  changePassword(): void {
    if (this.passwordModel.newPassword !== this.passwordModel.confirmPassword) {
      this.passwordError = 'New password and confirmation password do not match.';
      return;
    }
    if (this.passwordModel.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters.';
      return;
    }

    this.passwordLoading = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    this.apiService.changeMyPassword(this.passwordModel.currentPassword, this.passwordModel.newPassword).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Password updated successfully! Please use your new password next time.';
        this.passwordModel = { currentPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => {
        this.passwordLoading = false;
        this.passwordError = err.error?.detail || 'Failed to change password. Please check your current password.';
      }
    });
  }

  clearAlerts(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.passwordSuccess = '';
    this.passwordError = '';
  }


  canEditProfile(): boolean {
    return this.isSelf || this.authService.isSuperAdmin() || this.authService.hasRole(['DEPARTMENT_HEAD', 'MANAGER']);
  }

  get isHROrAdmin(): boolean {
    const role = this.authService.currentUser().role;
    return (
      role === 'SUPER_ADMIN' ||
      role === 'DEPARTMENT_HEAD' ||
      role === 'MANAGER' ||
      this.authService.canEdit('HR') ||
      this.authService.canEdit('designations')
    );
  }

  assignDesignation(): void {
    if (!this.employee || !this.selectedDesignationId) return;
    this.designationSaving = true;
    this.designationMessage = '';
    this.designationError = '';

    this.apiService.assignDesignation(this.employee.id, Number(this.selectedDesignationId)).subscribe({
      next: (updated) => {
        this.employee = updated;
        this.selectedDesignationId = updated.designation_id || null;
        this.designationSaving = false;
        this.designationMessage = `Successfully assigned designation "${updated.designation_name || updated.designation}"!`;
        setTimeout(() => this.designationMessage = '', 5000);
      },
      error: (err) => {
        this.designationSaving = false;
        this.designationError = err.error?.detail || 'Failed to assign designation.';
      }
    });
  }

  removeDesignation(): void {
    if (!this.employee) return;
    this.designationSaving = true;
    this.designationMessage = '';
    this.designationError = '';

    this.apiService.removeDesignation(this.employee.id).subscribe({
      next: (updated) => {
        this.employee = updated;
        this.selectedDesignationId = null;
        this.showRemoveConfirm = false;
        this.designationSaving = false;
        this.designationMessage = 'Designation successfully removed from employee profile.';
        setTimeout(() => this.designationMessage = '', 5000);
      },
      error: (err) => {
        this.designationSaving = false;
        this.showRemoveConfirm = false;
        this.designationError = err.error?.detail || 'Failed to remove designation.';
      }
    });
  }
}
