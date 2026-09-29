import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { AiAssistantService } from '../../services/ai-assistant.service';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  actionData?: any;
}

@Component({
  selector: 'app-ai-assistant-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant-drawer.component.html'
})
export class AIAssistantDrawerComponent implements OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @ViewChild('chatContainer') private chatContainer?: ElementRef<HTMLDivElement>;

  userQuery = '';
  isLoading = false;
  loadingStatus = 'Thinking...';
  private loadingInterval: any = null;
  messages: ChatMessage[] = [];

  quickChips = [
    '📊 Office Summary',
    '🚀 Delayed Projects',
    '👥 Who is overloaded?',
    '📝 Draft Leave Email',
    '💡 Workplace Tips',
    '🤖 What can you do?'
  ];

  constructor(
    private aiAssistantService: AiAssistantService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnDestroy(): void {
    this.stopLoading();
  }

  selectChip(chipText: string) {
    this.userQuery = chipText;
    this.sendQuery();
  }

  clearChat() {
    this.messages = [];
  }

  renderMarkdown(text: string): SafeHtml {
    try {
      const parsed = marked.parse(text || '') as string;
      return this.sanitizer.bypassSecurityTrustHtml(parsed);
    } catch {
      return text;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch {
      // Ignore scroll errors
    }
  }

  private startLoading(): void {
    this.isLoading = true;
    this.loadingStatus = 'Analyzing query...';
    let step = 0;
    const stages = [
      'Checking live office metrics...',
      'Connecting to Gemini AI...',
      'Generating response...'
    ];
    this.stopLoadingInterval();
    this.loadingInterval = setInterval(() => {
      if (step < stages.length) {
        this.loadingStatus = stages[step];
        step++;
      }
    }, 1800);
  }

  private stopLoading(): void {
    this.isLoading = false;
    this.stopLoadingInterval();
  }

  private stopLoadingInterval(): void {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }
  }

  sendQuery() {
    if (!this.userQuery.trim() || this.isLoading) return;

    const query = this.userQuery.trim();
    this.messages.push({ sender: 'user', text: query, timestamp: new Date() });
    
    // Recent conversation history for multi-turn dialogue
    const historyPayload = this.messages.slice(-6).map(m => ({
      sender: m.sender,
      text: m.text
    }));

    this.userQuery = '';
    this.startLoading();
    setTimeout(() => this.scrollToBottom(), 50);

    this.aiAssistantService.queryAIAssistant(query, historyPayload).subscribe({
      next: (res) => {
        this.stopLoading();
        this.messages.push({
          sender: 'ai',
          text: res.answer,
          timestamp: new Date(),
          actionData: res.data
        });
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {
        this.stopLoading();
        this.messages.push({
          sender: 'ai',
          text: 'Sorry, I encountered an issue processing your query. Please try again.',
          timestamp: new Date()
        });
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }
}
