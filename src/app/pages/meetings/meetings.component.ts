import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeetingService } from '../../services/meeting.service';
import { Meeting } from '../../models/api.models';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meetings.component.html'
})
export class MeetingsComponent implements OnInit {
  meetings: Meeting[] = [];
  isGenerating = false;
  newMeeting = {
    title: '',
    raw_notes: ''
  };

  constructor(private apiService: MeetingService) {}

  ngOnInit() {
    this.loadMeetings();
  }

  loadMeetings() {
    this.apiService.getMeetings().subscribe(m => this.meetings = m);
  }

  generateMOM() {
    if (!this.newMeeting.title || !this.newMeeting.raw_notes) return;
    this.isGenerating = true;

    this.apiService.scheduleMeeting({
      title: this.newMeeting.title,
      organizer_id: 1,
      scheduled_time: new Date().toISOString(),
      duration_mins: 45,
      raw_notes: this.newMeeting.raw_notes
    }).subscribe({
      next: () => {
        this.isGenerating = false;
        this.newMeeting.title = '';
        this.newMeeting.raw_notes = '';
        this.loadMeetings();
      },
      error: () => this.isGenerating = false
    });
  }
}
