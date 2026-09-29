import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RankService } from '../../services/rank.service';
import { AuthService } from '../../services/auth.service';
import { Rank } from '../../models/api.models';

@Component({
  selector: 'app-ranks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ranks.component.html'
})
export class RanksComponent implements OnInit {
  ranks: Rank[] = [];
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;

  showAddModal = false;
  showEditModal = false;
  submitting = false;

  newRankName = '';
  editRankData = { id: 0, name: '' };

  get currentUser() { return this.auth.currentUser(); }
  get canCreate(): boolean { return this.auth.canCreate('ranks'); }
  get canEdit(): boolean { return this.auth.canEdit('ranks'); }
  get canDelete(): boolean { return this.auth.canDelete('ranks'); }
  get canManage(): boolean { return this.canCreate || this.canEdit || this.canDelete; }

  constructor(private api: RankService, private auth: AuthService) {}

  ngOnInit() {
    this.loadRanks();
  }

  loadRanks() {
    this.loading = true;
    this.api.getRanks().subscribe({
      next: (data) => { this.ranks = data; this.loading = false; },
      error: () => { this.error = 'Failed to load ranks'; this.loading = false; }
    });
  }

  openAddModal() {
    this.newRankName = '';
    this.showAddModal = true;
  }

  submitAddRank() {
    if (!this.newRankName.trim()) return;
    this.submitting = true;
    this.api.createRank({ name: this.newRankName }).subscribe({
      next: () => {
        this.showAddModal = false;
        this.submitting = false;
        this.successMessage = 'Rank created successfully!';
        this.loadRanks();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to create rank';
        this.submitting = false;
        setTimeout(() => this.error = null, 4000);
      }
    });
  }

  openEditModal(rank: Rank) {
    this.editRankData = { id: rank.id, name: rank.name };
    this.showEditModal = true;
  }

  submitEditRank() {
    if (!this.editRankData.name.trim()) return;
    this.submitting = true;
    this.api.updateRank(this.editRankData.id, { name: this.editRankData.name }).subscribe({
      next: () => {
        this.showEditModal = false;
        this.submitting = false;
        this.successMessage = 'Rank updated successfully!';
        this.loadRanks();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to update rank';
        this.submitting = false;
        setTimeout(() => this.error = null, 4000);
      }
    });
  }

  deleteRank(rank: Rank) {
    if (!confirm(`Delete rank "${rank.name}"? This cannot be undone.`)) return;
    this.api.deleteRank(rank.id).subscribe({
      next: () => {
        this.successMessage = 'Rank deleted.';
        this.loadRanks();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to delete rank';
        setTimeout(() => this.error = null, 4000);
      }
    });
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
  }
}
