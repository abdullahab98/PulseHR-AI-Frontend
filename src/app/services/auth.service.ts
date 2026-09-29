import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { UserRole, PanelId, PanelPermissionsMap } from '../models/api.models';
import { environment } from '../../environments/environment';

export interface AuthState {
  token: string | null;
  userId: number | null;
  email: string | null;
  role: UserRole | null;
  employeeId: number | null;
  firstName: string | null;
  lastName: string | null;
  designationName: string | null;
  allowedPanels: (PanelId | string)[];
  customPermissions: Record<string, any>;
  panelPermissions: PanelPermissionsMap;
  dataScope: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  public currentUser = signal<AuthState>({
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null,
    email: localStorage.getItem('email'),
    role: localStorage.getItem('role') as UserRole | null,
    employeeId: localStorage.getItem('employeeId') ? Number(localStorage.getItem('employeeId')) : null,
    firstName: localStorage.getItem('firstName'),
    lastName: localStorage.getItem('lastName'),
    designationName: localStorage.getItem('designationName'),
    allowedPanels: localStorage.getItem('allowedPanels') ? JSON.parse(localStorage.getItem('allowedPanels')!) : [],
    customPermissions: localStorage.getItem('customPermissions') ? JSON.parse(localStorage.getItem('customPermissions')!) : {},
    panelPermissions: localStorage.getItem('panelPermissions') ? JSON.parse(localStorage.getItem('panelPermissions')!) : {},
    dataScope: localStorage.getItem('dataScope') || 'OWN'
  });

  constructor(private http: HttpClient, private router: Router) {
    if (this.currentUser().token) {
      this.refreshCurrentUser().subscribe({
        error: () => {}
      });
    }
  }

  refreshCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      tap(res => {
        const panels = res.allowed_panels || [];
        const perms = res.custom_permissions || {};
        const panelPerms = res.panel_permissions || {};
        const desigName = res.designation_name || null;
        const scope = res.data_scope || 'OWN';

        const emp = res.employee;
        const firstName = emp ? emp.first_name : (this.currentUser().firstName || '');
        const lastName = emp ? emp.last_name : (this.currentUser().lastName || '');
        const employeeId = emp ? emp.id : this.currentUser().employeeId;

        localStorage.setItem('email', res.email);
        localStorage.setItem('role', res.role);
        if (employeeId) localStorage.setItem('employeeId', employeeId.toString());
        if (firstName) localStorage.setItem('firstName', firstName);
        if (lastName) localStorage.setItem('lastName', lastName);
        if (desigName) localStorage.setItem('designationName', desigName);
        localStorage.setItem('allowedPanels', JSON.stringify(panels));
        localStorage.setItem('customPermissions', JSON.stringify(perms));
        localStorage.setItem('panelPermissions', JSON.stringify(panelPerms));
        localStorage.setItem('dataScope', scope);

        this.currentUser.update(state => ({
          ...state,
          email: res.email,
          role: res.role,
          employeeId: employeeId,
          firstName: firstName,
          lastName: lastName,
          designationName: desigName,
          allowedPanels: panels,
          customPermissions: perms,
          panelPermissions: panelPerms,
          dataScope: scope
        }));
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        const panels = res.allowed_panels || [];
        const perms = res.custom_permissions || {};
        const panelPerms = res.panel_permissions || {};
        const desigName = res.designation_name || null;
        const scope = res.data_scope || 'OWN';

        localStorage.setItem('token', res.access_token);
        localStorage.setItem('userId', res.user_id);
        localStorage.setItem('email', res.email);
        localStorage.setItem('role', res.role);
        if (res.employee_id) localStorage.setItem('employeeId', res.employee_id);
        if (res.first_name) localStorage.setItem('firstName', res.first_name);
        if (res.last_name) localStorage.setItem('lastName', res.last_name);
        if (desigName) localStorage.setItem('designationName', desigName);
        localStorage.setItem('allowedPanels', JSON.stringify(panels));
        localStorage.setItem('customPermissions', JSON.stringify(perms));
        localStorage.setItem('panelPermissions', JSON.stringify(panelPerms));
        localStorage.setItem('dataScope', scope);

        this.currentUser.set({
          token: res.access_token,
          userId: res.user_id,
          email: res.email,
          role: res.role,
          employeeId: res.employee_id,
          firstName: res.first_name,
          lastName: res.last_name,
          designationName: desigName,
          allowedPanels: panels,
          customPermissions: perms,
          panelPermissions: panelPerms,
          dataScope: scope
        });
      })
    );
  }

  logout() {
    localStorage.clear();
    this.currentUser.set({
      token: null,
      userId: null,
      email: null,
      role: null,
      employeeId: null,
      firstName: null,
      lastName: null,
      designationName: null,
      allowedPanels: [],
      customPermissions: {},
      panelPermissions: {},
      dataScope: 'OWN'
    });
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser().token;
  }

  isSuperAdmin(): boolean {
    return this.currentUser().role === 'SUPER_ADMIN';
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const role = this.currentUser().role;
    return role ? allowedRoles.includes(role) : false;
  }

  /**
   * Check if the user has permission to perform a specific action (view, create, edit, delete) on a panel.
   */
  hasAction(panel: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean {
    if (this.isSuperAdmin()) return true;

    const panelPerms = this.currentUser().panelPermissions || {};
    const normalizedKey = panel.toLowerCase().trim();
    const underscoreKey = normalizedKey.replace(/-/g, '_');
    const hyphenKey = normalizedKey.replace(/_/g, '-');

    // 1. Direct designation permission match
    const entry = panelPerms[normalizedKey] || 
                  panelPerms[underscoreKey] || 
                  panelPerms[hyphenKey] || 
                  panelPerms[panel] || 
                  panelPerms[panel.toUpperCase()];
    if (entry && typeof entry[action] === 'boolean') {
      return entry[action];
    }

    // 2. Fallback for view
    if (action === 'view') {
      // Sub-module fallback to parent panel
      if (underscoreKey.startsWith('attendance_') && panelPerms['attendance']?.view) {
        return true;
      }
      if (underscoreKey.startsWith('leave_') && (panelPerms['leaves']?.view || panelPerms['leave']?.view)) {
        return true;
      }
      if (underscoreKey.startsWith('payroll_') && panelPerms['payroll']?.view) {
        return true;
      }

      const allowed = this.currentUser().allowedPanels || [];
      const normalizedPanels = allowed.map(p => String(p).toLowerCase());
      return normalizedPanels.includes(normalizedKey) ||
             normalizedPanels.includes(underscoreKey) ||
             normalizedPanels.includes(hyphenKey) ||
             allowed.includes(panel as any) ||
             allowed.includes(panel.toUpperCase() as any);
    }

    // 3. Fallback for management actions (create, edit, delete) when designation matrix is not explicitly configured
    const role = this.currentUser().role;
    return role === 'SUPER_ADMIN' || role === 'DEPARTMENT_HEAD' || role === 'MANAGER';
  }

  canView(panel: string): boolean {
    return this.hasAction(panel, 'view');
  }

  canCreate(panel: string): boolean {
    return this.hasAction(panel, 'create');
  }

  canEdit(panel: string): boolean {
    return this.hasAction(panel, 'edit');
  }

  canDelete(panel: string): boolean {
    return this.hasAction(panel, 'delete');
  }

  hasPanelAccess(panelId: PanelId | string): boolean {
    return this.canView(panelId as string);
  }

  hasPermission(permKey: string): boolean {
    if (this.isSuperAdmin()) return true;
    const perms = this.currentUser().customPermissions;
    return perms ? !!perms[permKey] : false;
  }

  getToken(): string | null {
    return this.currentUser().token;
  }
}
