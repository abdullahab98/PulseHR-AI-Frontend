import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AIAssistantDrawerComponent } from './components/ai-assistant-drawer/ai-assistant-drawer.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    NavbarComponent,
    AIAssistantDrawerComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  isAIDrawerOpen = false;

  constructor(public router: Router, public authService: AuthService) {}

  isLoginPage(): boolean {
    return this.router.url.includes('/login') || !this.authService.isAuthenticated();
  }
}
