import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QaService } from '../../services/qa.service';
import { QABugReport, Project } from '../../models/api.models';

@Component({
  selector: 'app-qa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qa.component.html'
})
export class QaComponent implements OnInit {
  bugs: QABugReport[] = [];
  projects: Project[] = [];
  loading = true;
  showModal = false;

  newBug = {
    project_id: 1,
    title: '',
    description: '',
    severity: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  };

  constructor(private apiService: QaService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getBugs().subscribe({
      next: (data) => {
        this.bugs = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
    this.apiService.getProjects().subscribe({
      next: (projs) => this.projects = projs
    });
  }

  createBug(): void {
    if (!this.newBug.title) return;
    this.apiService.createBug(this.newBug).subscribe({
      next: () => {
        this.showModal = false;
        this.newBug = { project_id: 1, title: '', description: '', severity: 'MEDIUM' };
        this.loadData();
      }
    });
  }

  updateBugStatus(bugId: number, status: string): void {
    this.apiService.updateBugStatus(bugId, status).subscribe({
      next: () => this.loadData()
    });
  }
}
