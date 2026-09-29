import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';
import { Department, Office, Rank, Designation } from '../../../models/api.models';

@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-employee.component.html'
})
export class CreateEmployeeComponent implements OnInit {
  departments: Department[] = [];
  offices: Office[] = [];
  ranks: Rank[] = [];
  designations: Designation[] = [];
  
  loadingOptions = true;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  createdEmployeeId: number | null = null;

  // New Employee Form Data
  employeeData = {
    employee_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    personal_email: '',
    department_id: null as number | null,
    office_id: null as number | null,
    rank_id: null as number | null,
    designation_id: null as number | null,
    designation: '',
    salary: 50000,
    hire_date: new Date().toISOString().split('T')[0],
    bio: '',
    skillsString: 'Angular, TypeScript, Python',
    emergency_name: '',
    emergency_relation: 'Spouse',
    emergency_phone: '',
    address_street: '',
    address_city: '',
    address_country: ''
  };

  relationOptions = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];

  constructor(
    private apiService: EmployeeService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generateSuggestedCode();
    this.loadDropdownData();
  }

  generateSuggestedCode(): void {
    const randomNum = Math.floor(100 + Math.random() * 900);
    this.employeeData.employee_code = `EMP-${randomNum}`;
  }

  loadDropdownData(): void {
    this.loadingOptions = true;
    let pending = 4;

    const checkComplete = () => {
      pending--;
      if (pending <= 0) {
        this.loadingOptions = false;
      }
    };

    this.apiService.getDepartments().subscribe({
      next: (depts) => {
        this.departments = depts;
        if (depts.length > 0 && !this.employeeData.department_id) {
          this.employeeData.department_id = depts[0].id;
        }
        checkComplete();
      },
      error: () => checkComplete()
    });

    this.apiService.getOffices().subscribe({
      next: (offices) => {
        this.offices = offices;
        if (offices.length > 0 && !this.employeeData.office_id) {
          this.employeeData.office_id = offices[0].id;
        }
        checkComplete();
      },
      error: () => checkComplete()
    });

    this.apiService.getRanks().subscribe({
      next: (ranks) => {
        this.ranks = ranks;
        if (ranks.length > 0 && !this.employeeData.rank_id) {
          this.employeeData.rank_id = ranks[0].id;
        }
        checkComplete();
      },
      error: () => checkComplete()
    });

    this.apiService.getDesignations().subscribe({
      next: (desigs) => {
        this.designations = desigs;
        if (desigs.length > 0 && !this.employeeData.designation_id) {
          this.employeeData.designation_id = desigs[0].id;
          this.onDesignationChange();
        }
        checkComplete();
      },
      error: () => checkComplete()
    });
  }

  onDesignationChange(): void {
    if (this.employeeData.designation_id) {
      const selected = this.designations.find(d => d.id === Number(this.employeeData.designation_id));
      if (selected) {
        this.employeeData.designation = selected.name;
        if (selected.office_id) this.employeeData.office_id = selected.office_id;
        if (selected.rank_id) this.employeeData.rank_id = selected.rank_id;
      }
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.employeeData.employee_code.trim()) {
      this.errorMessage = 'Employee Code is required.';
      return;
    }
    if (!this.employeeData.first_name.trim() || !this.employeeData.last_name.trim()) {
      this.errorMessage = 'First Name and Last Name are required.';
      return;
    }

    this.isSubmitting = true;

    const skills = this.employeeData.skillsString
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const address_info: Record<string, string> = {};
    if (this.employeeData.address_street) address_info['street'] = this.employeeData.address_street;
    if (this.employeeData.address_city) address_info['city'] = this.employeeData.address_city;
    if (this.employeeData.address_country) address_info['country'] = this.employeeData.address_country;

    const emergency_contact: Record<string, string> = {};
    if (this.employeeData.emergency_name) emergency_contact['name'] = this.employeeData.emergency_name;
    if (this.employeeData.emergency_relation) emergency_contact['relation'] = this.employeeData.emergency_relation;
    if (this.employeeData.emergency_phone) emergency_contact['phone'] = this.employeeData.emergency_phone;

    const payload: any = {
      employee_code: this.employeeData.employee_code.trim(),
      first_name: this.employeeData.first_name.trim(),
      last_name: this.employeeData.last_name.trim(),
      phone: this.employeeData.phone ? this.employeeData.phone.trim() : undefined,
      personal_email: this.employeeData.personal_email ? this.employeeData.personal_email.trim() : undefined,
      department_id: this.employeeData.department_id ? Number(this.employeeData.department_id) : undefined,
      office_id: this.employeeData.office_id ? Number(this.employeeData.office_id) : undefined,
      rank_id: this.employeeData.rank_id ? Number(this.employeeData.rank_id) : undefined,
      designation_id: this.employeeData.designation_id ? Number(this.employeeData.designation_id) : undefined,
      designation: this.employeeData.designation || 'Employee',
      salary: Number(this.employeeData.salary) || 0,
      hire_date: this.employeeData.hire_date || new Date().toISOString().split('T')[0],
      bio: this.employeeData.bio ? this.employeeData.bio.trim() : '',
      skills: skills,
      emergency_contact: emergency_contact,
      address_info: address_info
    };

    this.apiService.createEmployee(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.createdEmployeeId = res.id;
        this.successMessage = `Employee ${res.first_name} ${res.last_name} (${res.employee_code}) created successfully!`;
      },
      error: (err) => {
        this.isSubmitting = false;
        const detail = err.error?.detail;
        this.errorMessage = typeof detail === 'string' ? detail : 'Failed to create employee. Please verify details.';
      }
    });
  }

  resetForm(): void {
    this.createdEmployeeId = null;
    this.successMessage = '';
    this.errorMessage = '';
    this.generateSuggestedCode();
    this.employeeData.first_name = '';
    this.employeeData.last_name = '';
    this.employeeData.phone = '';
    this.employeeData.personal_email = '';
    this.employeeData.bio = '';
    this.employeeData.emergency_name = '';
    this.employeeData.emergency_phone = '';
    this.employeeData.address_street = '';
    this.employeeData.address_city = '';
    this.employeeData.address_country = '';
  }

  navigateToList(): void {
    this.router.navigate(['/employees']);
  }

  navigateToOrganogram(): void {
    this.router.navigate(['/employees/organogram']);
  }
}
