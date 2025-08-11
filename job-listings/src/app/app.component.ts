import { Component } from '@angular/core';
import { JobsComponent } from './jobs/jobs.component';
import { COMPANIES } from './constants/companies';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JobsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'job-listings';
  jobListings = COMPANIES;
}
