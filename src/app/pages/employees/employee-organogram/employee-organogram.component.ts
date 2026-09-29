import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';
import { Employee, Department, Office, Rank, Designation } from '../../../models/api.models';

export interface OrganogramNode {
  employee: Employee;
  children?: OrganogramNode[];
  level: number;
}

export interface DepartmentGroup {
  department: Department;
  head: Employee | null;
  members: Employee[];
}

export interface OfficeGroup {
  office: Office;
  employees: Employee[];
}

@Component({
  selector: 'app-employee-organogram',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './employee-organogram.component.html'
})
export class EmployeeOrganogramComponent implements OnInit {
  employees: Employee[] = [];
  departments: Department[] = [];
  offices: Office[] = [];
  ranks: Rank[] = [];
  designations: Designation[] = [];

  isLoading = true;
  searchQuery = '';
  selectedDeptId: number | 'ALL' = 'ALL';
  selectedOfficeId: number | 'ALL' = 'ALL';
  viewMode: 'hierarchy' | 'department' | 'office' = 'hierarchy';

  selectedEmployee: Employee | null = null;
  showDetailsDrawer = false;

  constructor(
    private apiService: EmployeeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrganogramData();
  }

  loadOrganogramData(): void {
    this.isLoading = true;
    let pending = 5;

    const checkComplete = () => {
      pending--;
      if (pending <= 0) {
        this.isLoading = false;
      }
    };

    this.apiService.getEmployees().subscribe({
      next: (emps) => {
        this.employees = emps;
        checkComplete();
      },
      error: () => checkComplete()
    });

    this.apiService.getDepartments().subscribe({
      next: (depts) => {
        this.departments = depts;
        checkComplete();
      },
      error: () => checkComplete()
    });

    this.apiService.getOffices().subscribe({
      next: (offices) => {
        this.offices = offices;
        checkComplete();
      },
      error: () => checkComplete()
    });

    this.apiService.getRanks().subscribe({
      next: (ranks) => {
        this.ranks = ranks;
        checkComplete();
      },
      error: () => checkComplete()
    });

    this.apiService.getDesignations().subscribe({
      next: (desigs) => {
        this.designations = desigs;
        checkComplete();
      },
      error: () => checkComplete()
    });
  }

  get filteredEmployees(): Employee[] {
    return this.employees.filter((emp) => {
      const q = this.searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        emp.first_name.toLowerCase().includes(q) ||
        emp.last_name.toLowerCase().includes(q) ||
        emp.employee_code.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        (emp.department_name && emp.department_name.toLowerCase().includes(q)) ||
        (emp.office_name && emp.office_name.toLowerCase().includes(q));

      const matchesDept =
        this.selectedDeptId === 'ALL' || emp.department_id === Number(this.selectedDeptId);

      const matchesOffice =
        this.selectedOfficeId === 'ALL' || emp.office_id === Number(this.selectedOfficeId);

      return matchesSearch && matchesDept && matchesOffice;
    });
  }

  // Grouping into organizational tiers
  get executiveTier(): Employee[] {
    return this.filteredEmployees.filter(e => 
      e.role === 'SUPER_ADMIN' || 
      /director|ceo|cto|cfo|coo|president|vp|chief/i.test(e.designation)
    );
  }

  get managementTier(): Employee[] {
    return this.filteredEmployees.filter(e => 
      !this.executiveTier.includes(e) &&
      (e.role === 'DEPARTMENT_HEAD' || e.role === 'MANAGER' || /head|manager|lead/i.test(e.designation))
    );
  }

  get seniorStaffTier(): Employee[] {
    return this.filteredEmployees.filter(e => 
      !this.executiveTier.includes(e) &&
      !this.managementTier.includes(e) &&
      (e.role === 'TEAM_LEADER' || /senior|sr\.|principal|architect/i.test(e.designation))
    );
  }

  get operationalStaffTier(): Employee[] {
    return this.filteredEmployees.filter(e => 
      !this.executiveTier.includes(e) &&
      !this.managementTier.includes(e) &&
      !this.seniorStaffTier.includes(e)
    );
  }

  // Department-grouped organogram
  get departmentGroups(): DepartmentGroup[] {
    return this.departments.map(dept => {
      const deptEmployees = this.filteredEmployees.filter(e => e.department_id === dept.id);
      const head = deptEmployees.find(e => 
        e.role === 'DEPARTMENT_HEAD' || 
        /head|director|manager/i.test(e.designation)
      ) || (deptEmployees.length > 0 ? deptEmployees[0] : null);

      const members = deptEmployees.filter(e => e !== head);

      return {
        department: dept,
        head,
        members
      };
    }).filter(g => g.head !== null || g.members.length > 0);
  }

  // Office-grouped organogram
  get officeGroups(): OfficeGroup[] {
    return this.offices.map(office => {
      const officeEmployees = this.filteredEmployees.filter(e => e.office_id === office.id);
      return {
        office,
        employees: officeEmployees
      };
    }).filter(g => g.employees.length > 0);
  }

  get totalEmployeesCount(): number {
    return this.employees.length;
  }

  get leadershipCount(): number {
    return this.employees.filter(e => 
      ['SUPER_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER'].includes(e.role || '')
    ).length;
  }

  openEmployeeDetails(emp: Employee): void {
    this.selectedEmployee = emp;
    this.showDetailsDrawer = true;
  }

  closeDetails(): void {
    this.showDetailsDrawer = false;
    this.selectedEmployee = null;
  }

  getAvatar(emp: Employee): string {
    const seed = emp.id || 1;
    return `https://images.unsplash.com/photo-${1534528741775 + (seed % 100)}?w=120&auto=format&fit=crop&q=80`;
  }

  getRoleBadgeClass(role?: string): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'DEPARTMENT_HEAD':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'MANAGER':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'TEAM_LEADER':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  }
}
