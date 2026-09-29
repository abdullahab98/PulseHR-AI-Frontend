import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { DocumentRecord } from '../../models/api.models';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html'
})
export class DocumentsComponent implements OnInit {
  docs: DocumentRecord[] = [];
  loading = true;
  showModal = false;

  newDoc = {
    title: '',
    category: 'POLICIES',
    file_name: '',
    confidentiality_level: 'INTERNAL' as 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED'
  };

  constructor(private apiService: DocumentService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getDocuments().subscribe({
      next: (data) => {
        this.docs = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  uploadDoc(): void {
    if (!this.newDoc.title) return;
    this.newDoc.file_name = this.newDoc.title.toLowerCase().replace(/\s+/g, '_') + '.pdf';
    this.apiService.uploadDocument(this.newDoc).subscribe({
      next: () => {
        this.showModal = false;
        this.newDoc = { title: '', category: 'POLICIES', file_name: '', confidentiality_level: 'INTERNAL' };
        this.loadData();
      }
    });
  }
}
