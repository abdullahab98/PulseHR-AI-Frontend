import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Employee, Department, UserRole, Office, Rank, Designation } from '../../models/api.models';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './employees.component.html'
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  departments: Department[] = [];
  offices: Office[] = [];
  ranks: Rank[] = [];
  designations: Designation[] = [];
  loading = true;

  // Filter States
  searchQuery = '';
  selectedDepartmentId: number | 'ALL' = 'ALL';
  selectedRole: string = 'ALL';
  viewMode: 'cards' | 'table' = 'cards';

  // Modals
  showAddModal = false;
  showEditModal = false;
  showDetailsModal = false;
  selectedEmployee: Employee | null = null;

  // Form Models
  newEmployee = {
    employee_code: '',
    first_name: '',
    last_name: '',
    designation: '',
    designation_id: null as number | null,
    office_id: null as number | null,
    rank_id: null as number | null,
    department_id: 1,
    salary: 50000,
    skillsString: 'Angular, Python, SQL',
    emergency_name: '',
    emergency_relation: 'Spouse',
    emergency_phone: ''
  };

  editEmployeeData = {
    id: 0,
    first_name: '',
    last_name: '',
    designation: '',
    designation_id: null as number | null,
    office_id: null as number | null,
    rank_id: null as number | null,
    department_id: 1,
    salary: 0,
    skillsString: '',
    emergency_name: '',
    emergency_relation: '',
    emergency_phone: ''
  };

  get canCreate(): boolean {
    return this.authService.canCreate('employees');
  }

  get canEdit(): boolean {
    return this.authService.canEdit('employees');
  }

  get canDelete(): boolean {
    return this.authService.canDelete('employees');
  }

  rolesList = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'SUPER_ADMIN', label: '👑 Super Admin' },
    { value: 'DEPARTMENT_HEAD', label: '👩‍💼 Department Head' },
    { value: 'MANAGER', label: '📁 Manager' },
    { value: 'TEAM_LEADER', label: '💻 Team Leader' },
    { value: 'EMPLOYEE', label: '🧑‍💻 Employee' },
    { value: 'SPECIAL_USER', label: '🔍 Special User' }
  ];

  constructor(
    private apiService: EmployeeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getEmployees().subscribe({
      next: (emps) => {
        this.employees = emps;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.apiService.getDepartments().subscribe({
      next: (depts) => this.departments = depts
    });

    this.apiService.getOffices().subscribe({
      next: (offices) => this.offices = offices
    });

    this.apiService.getRanks().subscribe({
      next: (ranks) => this.ranks = ranks
    });

    this.apiService.getDesignations().subscribe({
      next: (desigs) => this.designations = desigs
    });
  }

  isAuthorizedToView(): boolean {
    return this.authService.canView('employees') || this.authService.hasRole(['SUPER_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'TEAM_LEADER']);
  }

  isManagementUser(): boolean {
    return this.authService.isSuperAdmin() || this.authService.hasRole(['DEPARTMENT_HEAD', 'MANAGER']);
  }

  onDesignationChange(type: 'new' | 'edit'): void {
    const target = type === 'new' ? this.newEmployee : this.editEmployeeData;
    if (target.designation_id) {
      const d = this.designations.find(des => des.id === Number(target.designation_id));
      if (d) {
        target.designation = d.name;
        if (d.office_id) target.office_id = d.office_id;
        if (d.rank_id) target.rank_id = d.rank_id;
      }
    }
  }

  get filteredEmployees(): Employee[] {
    return this.employees.filter(emp => {
      // Text Search
      const search = this.searchQuery.trim().toLowerCase();
      const matchesSearch = !search || 
        emp.first_name.toLowerCase().includes(search) ||
        emp.last_name.toLowerCase().includes(search) ||
        emp.employee_code.toLowerCase().includes(search) ||
        (emp.email && emp.email.toLowerCase().includes(search)) ||
        emp.designation.toLowerCase().includes(search) ||
        (emp.department_name && emp.department_name.toLowerCase().includes(search)) ||
        (emp.skills && emp.skills.some(s => s.toLowerCase().includes(search)));

      // Department Filter
      const matchesDept = this.selectedDepartmentId === 'ALL' || emp.department_id === Number(this.selectedDepartmentId);

      // Role Filter
      const matchesRole = this.selectedRole === 'ALL' || emp.role === this.selectedRole;

      return matchesSearch && matchesDept && matchesRole;
    });
  }

  get totalPayroll(): number {
    return this.filteredEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
  }

  get highLevelCount(): number {
    return this.employees.filter(e => e.role && ['SUPER_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER'].includes(e.role)).length;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedDepartmentId = 'ALL';
    this.selectedRole = 'ALL';
  }

  openDetails(emp: Employee): void {
    this.selectedEmployee = emp;
    this.showDetailsModal = true;
  }

  openEdit(emp: Employee, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.selectedEmployee = emp;
    this.editEmployeeData = {
      id: emp.id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      designation: emp.designation,
      designation_id: emp.designation_id || null,
      office_id: emp.office_id || null,
      rank_id: emp.rank_id || null,
      department_id: emp.department_id || 1,
      salary: emp.salary,
      skillsString: emp.skills ? emp.skills.join(', ') : '',
      emergency_name: emp.emergency_contact?.['name'] || '',
      emergency_relation: emp.emergency_contact?.['relation'] || 'Spouse',
      emergency_phone: emp.emergency_contact?.['phone'] || ''
    };
    this.showEditModal = true;
  }

  saveEdit(): void {
    if (!this.editEmployeeData.first_name || !this.editEmployeeData.last_name) return;

    const skills = this.editEmployeeData.skillsString.split(',').map(s => s.trim()).filter(Boolean);
    const payload: Partial<Employee> = {
      first_name: this.editEmployeeData.first_name,
      last_name: this.editEmployeeData.last_name,
      designation: this.editEmployeeData.designation,
      designation_id: this.editEmployeeData.designation_id ? Number(this.editEmployeeData.designation_id) : undefined,
      office_id: this.editEmployeeData.office_id ? Number(this.editEmployeeData.office_id) : undefined,
      rank_id: this.editEmployeeData.rank_id ? Number(this.editEmployeeData.rank_id) : undefined,
      department_id: Number(this.editEmployeeData.department_id),
      salary: Number(this.editEmployeeData.salary),
      skills: skills,
      emergency_contact: {
        name: this.editEmployeeData.emergency_name,
        relation: this.editEmployeeData.emergency_relation,
        phone: this.editEmployeeData.emergency_phone
      }
    };

    this.apiService.updateEmployee(this.editEmployeeData.id, payload).subscribe({
      next: () => {
        this.showEditModal = false;
        this.loadData();
      }
    });
  }

  createEmployee(): void {
    if (!this.newEmployee.first_name || !this.newEmployee.employee_code) return;

    const skills = this.newEmployee.skillsString.split(',').map(s => s.trim()).filter(Boolean);
    const payload: any = {
      employee_code: this.newEmployee.employee_code,
      first_name: this.newEmployee.first_name,
      last_name: this.newEmployee.last_name,
      designation: this.newEmployee.designation,
      designation_id: this.newEmployee.designation_id ? Number(this.newEmployee.designation_id) : undefined,
      office_id: this.newEmployee.office_id ? Number(this.newEmployee.office_id) : undefined,
      rank_id: this.newEmployee.rank_id ? Number(this.newEmployee.rank_id) : undefined,
      department_id: Number(this.newEmployee.department_id),
      salary: Number(this.newEmployee.salary),
      skills: skills,
      emergency_contact: {
        name: this.newEmployee.emergency_name,
        relation: this.newEmployee.emergency_relation,
        phone: this.newEmployee.emergency_phone
      }
    };

    this.apiService.createEmployee(payload).subscribe({
      next: () => {
        this.showAddModal = false;
        this.newEmployee = {
          employee_code: '',
          first_name: '',
          last_name: '',
          designation: '',
          designation_id: null,
          office_id: null,
          rank_id: null,
          department_id: 1,
          salary: 50000,
          skillsString: 'Angular, Python, SQL',
          emergency_name: '',
          emergency_relation: 'Spouse',
          emergency_phone: ''
        };
        this.loadData();
      }
    });
  }

  deleteEmployee(id: number, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (confirm('Are you sure you want to deactivate and remove this staff member?')) {
      this.apiService.deleteEmployee(id).subscribe({
        next: () => this.loadData()
      });
    }
  }
}
