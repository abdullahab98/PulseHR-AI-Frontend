import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { ReportService } from '../../services/report.service';
import { Department, ReportGenerationResponse } from '../../models/api.models';

declare var html2pdf: any;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {
  reportType: string = 'WEEKLY';
  datePreset: string = 'LAST_7_DAYS';
  startDate: string = '';
  endDate: string = '';
  selectedDepartmentId: number | null = null;
  focusArea: string = '';

  departments: Department[] = [];
  isGenerating: boolean = false;
  isExportingPdf: boolean = false;
  generatedReport: ReportGenerationResponse | null = null;
  renderedHtml: SafeHtml = '';
  errorMsg: string | null = null;
  dossierRefNumber: string = '';

  constructor(
    private reportService: ReportService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.applyDatePreset('LAST_7_DAYS');
    this.loadDepartments();
    this.generateReport();
  }

  loadDepartments(): void {
    this.reportService.getDepartments().subscribe({
      next: (depts) => this.departments = depts,
      error: () => {}
    });
  }

  applyDatePreset(preset: string): void {
    this.datePreset = preset;
    const now = new Date();
    const end = new Date(now);

    let start = new Date(now);
    if (preset === 'TODAY') {
      // today
    } else if (preset === 'LAST_7_DAYS') {
      start.setDate(now.getDate() - 7);
    } else if (preset === 'LAST_30_DAYS') {
      start.setDate(now.getDate() - 30);
    } else if (preset === 'THIS_MONTH') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === 'LAST_90_DAYS') {
      start.setDate(now.getDate() - 90);
    }

    this.endDate = this.formatDate(end);
    this.startDate = this.formatDate(start);
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  generateReport(): void {
    this.isGenerating = true;
    this.errorMsg = null;

    this.reportService.generateAIReport(
      this.reportType,
      this.startDate,
      this.endDate,
      this.selectedDepartmentId,
      this.focusArea
    ).subscribe({
      next: (res) => {
        this.generatedReport = res;
        this.dossierRefNumber = `REF-${res.report_type}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
        this.renderMarkdown(res.markdown_content);
        this.isGenerating = false;
      },
      error: (err) => {
        this.isGenerating = false;
        this.errorMsg = err.error?.detail || 'Failed to synthesize AI operations report. Please try again.';
      }
    });
  }

  private cleanLatexSymbols(text: string): string {
    if (!text) return '';
    return text
      .replace(/\$\\ge\s*([^$]*)\$/g, '≥ $1')
      .replace(/\\ge\b/g, '≥')
      .replace(/\$\\le\s*([^$]*)\$/g, '≤ $1')
      .replace(/\\le\b/g, '≤')
      .replace(/\$\\gt\s*([^$]*)\$/g, '> $1')
      .replace(/\\gt\b/g, '>')
      .replace(/\$\\lt\s*([^$]*)\$/g, '< $1')
      .replace(/\\lt\b/g, '<')
      .replace(/\$\\approx\s*([^$]*)\$/g, '≈ $1')
      .replace(/\\approx\b/g, '≈')
      .replace(/\$\\times\s*([^$]*)\$/g, '× $1')
      .replace(/\\times\b/g, '×')
      .replace(/\$([<>=!~+\-0-9.%/a-zA-Z\s]+)\$/g, '$1')
      .replace(/\\%/g, '%');
  }

  private renderMarkdown(content: string): void {
    if (!content) {
      this.renderedHtml = '';
      return;
    }
    try {
      const cleaned = this.cleanLatexSymbols(content);
      const parsed = marked.parse(cleaned) as string;
      this.renderedHtml = this.sanitizer.bypassSecurityTrustHtml(parsed);
    } catch (e) {
      this.renderedHtml = this.sanitizer.bypassSecurityTrustHtml(`<pre>${content}</pre>`);
    }
  }

  async downloadPdfReport(): Promise<void> {
    if (!this.generatedReport || this.isExportingPdf) return;
    this.isExportingPdf = true;

    try {
      // Dynamic import to support SSR and client-only execution
      const html2pdfModule = await import('html2pdf.js');
      const html2pdfFn = html2pdfModule.default || html2pdfModule;
      const element = document.getElementById('printable-executive-report');

      if (!element) {
        this.isExportingPdf = false;
        window.print();
        return;
      }

      const filename = `Executive_Operations_Report_${this.generatedReport.report_type}_${this.startDate}_to_${this.endDate}.pdf`;

      const opt: any = {
        margin: [10, 10, 10, 10], // 10mm margins
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
      };

      await html2pdfFn().set(opt).from(element).save();
      this.isExportingPdf = false;
    } catch (err) {
      console.warn('html2pdf client generation failed, falling back to browser print PDF:', err);
      this.isExportingPdf = false;
      window.print();
    }
  }

  printReport(): void {
    window.print();
  }
}
