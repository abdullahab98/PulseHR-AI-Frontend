import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PayrollService } from '../../../services/payroll.service';
import { AllowanceConfig, BonusConfig } from '../../../models/api.models';

@Component({
  selector: 'app-allowances-bonuses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './allowances-bonuses.component.html'
})
export class AllowancesBonusesComponent implements OnInit {
  loading: boolean = false;
  allowanceConfigs: AllowanceConfig[] = [];
  bonusConfigs: BonusConfig[] = [];

  showAddAllowanceModal: boolean = false;
  newAllowance: Partial<AllowanceConfig> = {
    name: '',
    allowance_type: 'FIXED',
    value: 1000,
    is_taxable: true,
    applies_to: 'ALL',
    is_active: true,
    description: ''
  };

  showAddBonusModal: boolean = false;
  newBonus: Partial<BonusConfig> = {
    title: '',
    bonus_type: 'FESTIVAL',
    calculation_type: 'PERCENTAGE',
    value: 100,
    effective_month: 'ALL',
    is_active: true,
    description: ''
  };

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.loading = true;
    this.payrollService.getAllowanceConfigs().subscribe({
      next: (data) => {
        this.allowanceConfigs = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.payrollService.getBonusConfigs().subscribe({
      next: (data) => this.bonusConfigs = data
    });
  }

  openAddAllowance(): void {
    this.newAllowance = {
      name: '',
      allowance_type: 'FIXED',
      value: 1000,
      is_taxable: true,
      applies_to: 'ALL',
      is_active: true,
      description: ''
    };
    this.showAddAllowanceModal = true;
  }

  closeAddAllowance(): void {
    this.showAddAllowanceModal = false;
  }

  saveAllowance(): void {
    if (!this.newAllowance.name || !this.newAllowance.value) {
      alert('Please fill out the allowance name and value');
      return;
    }
    this.payrollService.createAllowanceConfig(this.newAllowance).subscribe({
      next: () => {
        this.closeAddAllowance();
        this.loadConfigs();
      },
      error: (err) => alert(err.error?.detail || 'Failed to save allowance')
    });
  }

  deleteAllowance(id: number): void {
    if (!confirm('Are you sure you want to delete this allowance configuration?')) return;
    this.payrollService.deleteAllowanceConfig(id).subscribe({
      next: () => this.loadConfigs()
    });
  }

  openAddBonus(): void {
    this.newBonus = {
      title: '',
      bonus_type: 'FESTIVAL',
      calculation_type: 'PERCENTAGE',
      value: 100,
      effective_month: 'ALL',
      is_active: true,
      description: ''
    };
    this.showAddBonusModal = true;
  }

  closeAddBonus(): void {
    this.showAddBonusModal = false;
  }

  saveBonus(): void {
    if (!this.newBonus.title || !this.newBonus.value) {
      alert('Please fill out the bonus title and value');
      return;
    }
    this.payrollService.createBonusConfig(this.newBonus).subscribe({
      next: () => {
        this.closeAddBonus();
        this.loadConfigs();
      },
      error: (err) => alert(err.error?.detail || 'Failed to save bonus')
    });
  }

  deleteBonus(id: number): void {
    if (!confirm('Are you sure you want to delete this bonus configuration?')) return;
    this.payrollService.deleteBonusConfig(id).subscribe({
      next: () => this.loadConfigs()
    });
  }
}
