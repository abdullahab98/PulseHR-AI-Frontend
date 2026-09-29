import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  appVersion = environment.version;
  isProduction = environment.production;
  email = 'ceo@office.ai';
  password = 'password123';
  showPassword = false;
  rememberMe = true;
  isLoading = false;
  errorMessage = '';

  demoAccounts = [
    { label: '👑 Super Admin', email: 'ceo@office.ai', role: 'Super Admin' },
    { label: '👩‍💼 HR Head', email: 'hrhead@office.ai', role: 'Dept Head' },
    { label: '📁 Project Mgr', email: 'pm@office.ai', role: 'Manager' },
    { label: '💻 Team Leader', email: 'devlead@office.ai', role: 'Team Lead' },
    { label: '🧑‍💻 Developer', email: 'developer@office.ai', role: 'Employee' },
    { label: '🔍 Auditor', email: 'auditor@office.ai', role: 'Special User' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.email || !this.password) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || 'Invalid login credentials';
      }
    });
  }

  quickLogin(demoEmail: string) {
    this.email = demoEmail;
    this.password = 'password123';
    this.onLogin();
  }
}
