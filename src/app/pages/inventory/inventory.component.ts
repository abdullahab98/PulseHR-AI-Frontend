import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { InventoryAsset } from '../../models/api.models';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent implements OnInit {
  assets: InventoryAsset[] = [];
  loading = true;
  showModal = false;

  newAsset = {
    name: '',
    category: 'HARDWARE',
    serial_number: '',
    status: 'AVAILABLE'
  };

  constructor(private apiService: InventoryService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getInventoryAssets().subscribe({
      next: (data) => {
        this.assets = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  createAsset(): void {
    if (!this.newAsset.name) return;
    this.apiService.createInventoryAsset(this.newAsset).subscribe({
      next: () => {
        this.showModal = false;
        this.newAsset = { name: '', category: 'HARDWARE', serial_number: '', status: 'AVAILABLE' };
        this.loadData();
      }
    });
  }
}
