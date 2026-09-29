import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../services/leave.service';
import { DesignationChain, Designation } from '../../../models/api.models';

@Component({
  selector: 'app-designation-chain',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './designation-chain.component.html'
})
export class DesignationChainComponent implements OnInit {
  chains: DesignationChain[] = [];
  designations: Designation[] = [];
  isLoading: boolean = false;
  showAddModal: boolean = false;
  isSaving: boolean = false;

  newChain = {
    designation_id: 0,
    approver_designation_id: 0,
    level: 1,
    auto_approve_days: 3,
    notes: ''
  };

  constructor(private apiService: LeaveService) {}

  ngOnInit() {
    this.loadChains();
    this.loadDesignations();
  }

  loadChains() {
    this.isLoading = true;
    this.apiService.getDesignationChains().subscribe({
      next: (data) => {
        this.chains = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load designation chains', err);
        this.isLoading = false;
      }
    });
  }

  loadDesignations() {
    this.apiService.getDesignations().subscribe({
      next: (data) => {
        this.designations = data;
        if (data.length > 0) {
          this.newChain.designation_id = data[0].id;
          this.newChain.approver_designation_id = data.length > 1 ? data[1].id : data[0].id;
        }
      },
      error: (err) => console.error('Failed to load designations', err)
    });
  }

  openAddModal() {
    if (this.designations.length > 0) {
      this.newChain = {
        designation_id: this.designations[0].id,
        approver_designation_id: this.designations.length > 1 ? this.designations[1].id : this.designations[0].id,
        level: 1,
        auto_approve_days: 3,
        notes: ''
      };
    }
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveChain() {
    if (!this.newChain.designation_id || !this.newChain.approver_designation_id) {
      alert('Please select both applicant and approver designations.');
      return;
    }

    this.isSaving = true;
    this.apiService.createDesignationChain({
      designation_id: Number(this.newChain.designation_id),
      approver_designation_id: Number(this.newChain.approver_designation_id),
      level: Number(this.newChain.level),
      auto_approve_days: Number(this.newChain.auto_approve_days),
      notes: this.newChain.notes
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAddModal = false;
        this.loadChains();
      },
      error: (err) => {
        this.isSaving = false;
        alert(err.error?.detail || 'Failed to create designation chain');
      }
    });
  }

  deleteChain(id: number) {
    if (!confirm('Are you sure you want to remove this approval rule?')) {
      return;
    }

    this.apiService.deleteDesignationChain(id).subscribe({
      next: () => this.loadChains(),
      error: (err) => alert(err.error?.detail || 'Failed to delete approval rule')
    });
  }
}
