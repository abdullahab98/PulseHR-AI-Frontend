import { Component, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { PanelId } from '../../models/api.models';
import { environment } from '../../../environments/environment';
import { MenuItem, SIDEBAR_MENU_ITEMS } from './sidebar-menu.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  appVersion = environment.version;
  showMenu = false;

  // Dynamic menu items loaded from TypeScript configuration
  menuItems: MenuItem[] = SIDEBAR_MENU_ITEMS;

  // Set of currently expanded menu IDs
  expandedItemIds = new Set<string>(['hr', 'attendance', 'leave']);

  userRole = computed(() => this.authService.currentUser().role || 'EMPLOYEE');
  userName = computed(() => {
    const user = this.authService.currentUser();
    return user.firstName ? `${user.firstName} ${user.lastName}` : 'User';
  });
  userEmail = computed(() => this.authService.currentUser().email || '');

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    public router: Router,
    private sanitizer: DomSanitizer
  ) {}

  // Check if an item is currently expanded
  isItemExpanded(item: MenuItem): boolean {
    return this.expandedItemIds.has(item.id);
  }

  // Toggle item expansion
  toggleItemExpand(item: MenuItem, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.expandedItemIds.has(item.id)) {
      this.expandedItemIds.delete(item.id);
    } else {
      this.expandedItemIds.add(item.id);
    }
  }

  // Check if an item or any of its children are currently active based on route
  isItemActive(item: MenuItem): boolean {
    if (item.link && item.link !== '' && this.router.url === item.link) {
      return true;
    }
    const children = item.child || item.Child || [];
    return children.some(c => c.link && this.router.url.startsWith(c.link));
  }

  // Check if an item has visible children based on permissions
  hasVisibleChildren(item: MenuItem): boolean {
    const children = item.child || item.Child || [];
    return children.some(c => this.canAccessItem(c));
  }

  // Check if the current user has access to a specific menu item
  canAccessItem(item: MenuItem): boolean {
    if (!item) return false;

    // Super Admin has full visibility
    if (this.authService.isSuperAdmin()) return true;

    // If an item is a parent with children, show it if any of its children are visible
    const children = item.child || item.Child || [];
    if (children.length > 0 && this.hasVisibleChildren(item)) {
      return true;
    }

    const access = item.hasAccess;

    if (access === undefined || access === true) {
      return true;
    }
    if (access === false) {
      return false;
    }
    if (typeof access === 'function') {
      return (access as any)(this.authService);
    }
    if (access === 'SUPER_ADMIN') {
      return this.authService.isSuperAdmin();
    }
    if (access === 'HR' || access === 'HR_OR_ADMIN') {
      return this.authService.canView('HR') || this.isHROrAdmin();
    }

    // Check specific panel permission (or HR fallback for HR sub-panels)
    const isHrSubPanel = ['offices', 'ranks', 'designations', 'employees', 'create_employee', 'employee_organogram'].includes(access as string);
    if (isHrSubPanel && this.isHROrAdmin()) {
      return true;
    }

    return this.authService.canView(access as string);
  }

  // Determine whether to display a section header above this item
  shouldShowSection(item: MenuItem): boolean {
    if (!item.section) return false;
    // Find the first accessible item that belongs to this section
    const firstAccessible = this.menuItems.find(
      m => m.section === item.section && this.canAccessItem(m)
    );
    return firstAccessible?.id === item.id;
  }

  // Safe SVG HTML sanitizer
  safeSvg(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  // Check if icon string is an SVG element
  isSvg(icon: string): boolean {
    return typeof icon === 'string' && icon.trim().startsWith('<svg');
  }

  // --- Profile & Menu Helpers ---
  toggleMenu(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  closeMenu(): void {
    this.showMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-menu-container')) {
      this.closeMenu();
    }
  }

  goToProfile(): void {
    this.closeMenu();
    this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    this.closeMenu();
    this.router.navigate(['/profile'], { queryParams: { tab: 'security' } });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkTheme(): boolean {
    return this.themeService.isDark();
  }

  canAccess(panelId: PanelId | string): boolean {
    return this.authService.canView(panelId as string);
  }

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  isHROrAdmin(): boolean {
    const role = this.authService.currentUser().role;
    return (
      role === 'SUPER_ADMIN' ||
      role === 'DEPARTMENT_HEAD' ||
      role === 'MANAGER' ||
      this.authService.canView('offices') ||
      this.authService.canView('ranks') ||
      this.authService.canView('designations') ||
      this.authService.canView('HR')
    );
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
  }
}
