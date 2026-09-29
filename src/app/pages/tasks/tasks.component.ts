import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { TaskItem, TaskRecommendationItem } from '../../models/api.models';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html'
})
export class TasksComponent implements OnInit {
  tasks: TaskItem[] = [];
  showRecommendModal = false;
  skillsInput = 'Python, Machine Learning, FastAPI';
  isRecommending = false;
  recommendations: TaskRecommendationItem[] = [];

  constructor(private apiService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.apiService.getTasks().subscribe(t => this.tasks = t);
  }

  getTasksByStatus(statusStr: string): TaskItem[] {
    return this.tasks.filter(t => t.status === statusStr);
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'URGENT': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MEDIUM': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  }

  openRecommendModal() {
    this.showRecommendModal = true;
    this.getRecommendations();
  }

  getRecommendations() {
    this.isRecommending = true;
    const skillsList = this.skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    this.apiService.recommendTaskAssignees(skillsList).subscribe({
      next: (res) => {
        this.recommendations = res.recommendations;
        this.isRecommending = false;
      },
      error: () => this.isRecommending = false
    });
  }
}
