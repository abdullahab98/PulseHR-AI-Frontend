import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService } from '../../services/audit-log.service';
import { AuditLog } from '../../models/api.models';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-logs.component.html'
})
export class AuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];

  constructor(private apiService: AuditLogService) {}

  ngOnInit() {
    this.apiService.getAuditLogs().subscribe(l => this.logs = l);
  }
}
