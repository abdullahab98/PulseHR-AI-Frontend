import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfficeService } from '../../services/office.service';
import { AuthService } from '../../services/auth.service';
import { Office } from '../../models/api.models';

@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offices.component.html'
})
export class OfficesComponent implements OnInit {
  offices: Office[] = [];
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;

  showAddModal = false;
  showEditModal = false;
  showDetailsModal = false;
  selectedOffice: Office | null = null;
  submitting = false;

  newOffice = {
    name: '',
    establishment: '',
    description: '',
    mission: '',
    vision: ''
  };

  editOfficeData = {
    id: 0,
    name: '',
    establishment: '',
    description: '',
    mission: '',
    vision: ''
  };

  get currentUser() { return this.auth.currentUser(); }
  get canCreate(): boolean { return this.auth.canCreate('offices'); }
  get canEdit(): boolean { return this.auth.canEdit('offices'); }
  get canDelete(): boolean { return this.auth.canDelete('offices'); }
  get canManage(): boolean { return this.canCreate || this.canEdit || this.canDelete; }

  constructor(private api: OfficeService, private auth: AuthService) {}

  ngOnInit() {
    this.loadOffices();
  }

  loadOffices() {
    this.loading = true;
    this.api.getOffices().subscribe({
      next: (data) => { this.offices = data; this.loading = false; },
      error: () => { this.error = 'Failed to load offices'; this.loading = false; }
    });
  }

  openAddModal() {
    this.newOffice = { name: '', establishment: '', description: '', mission: '', vision: '' };
    this.showAddModal = true;
  }

  submitAddOffice() {
    if (!this.newOffice.name.trim()) return;
    this.submitting = true;
    this.api.createOffice({
      name: this.newOffice.name,
      establishment: this.newOffice.establishment || undefined,
      description: this.newOffice.description || undefined,
      mission: this.newOffice.mission || undefined,
      vision: this.newOffice.vision || undefined
    }).subscribe({
      next: () => {
        this.showAddModal = false;
        this.submitting = false;
        this.successMessage = 'Office created successfully!';
        this.loadOffices();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to create office';
        this.submitting = false;
        setTimeout(() => this.error = null, 4000);
      }
    });
  }

  openEditModal(office: Office) {
    this.editOfficeData = {
      id: office.id,
      name: office.name,
      establishment: office.establishment || '',
      description: office.description || '',
      mission: office.mission || '',
      vision: office.vision || ''
    };
    this.showEditModal = true;
  }

  submitEditOffice() {
    if (!this.editOfficeData.name.trim()) return;
    this.submitting = true;
    this.api.updateOffice(this.editOfficeData.id, {
      name: this.editOfficeData.name,
      establishment: this.editOfficeData.establishment || undefined,
      description: this.editOfficeData.description || undefined,
      mission: this.editOfficeData.mission || undefined,
      vision: this.editOfficeData.vision || undefined
    }).subscribe({
      next: () => {
        this.showEditModal = false;
        this.submitting = false;
        this.successMessage = 'Office updated successfully!';
        this.loadOffices();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to update office';
        this.submitting = false;
        setTimeout(() => this.error = null, 4000);
      }
    });
  }

  viewDetails(office: Office) {
    this.selectedOffice = office;
    this.showDetailsModal = true;
  }

  deleteOffice(office: Office) {
    if (!confirm(`Delete "${office.name}"? This cannot be undone.`)) return;
    this.api.deleteOffice(office.id).subscribe({
      next: () => {
        this.successMessage = 'Office deleted.';
        this.loadOffices();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to delete office';
        setTimeout(() => this.error = null, 4000);
      }
    });
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDetailsModal = false;
    this.selectedOffice = null;
  }
}
