import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JobListing } from '../models/job-listing.model';
import { COMPANIES } from '../constants/companies';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent {
  jobListings: JobListing[] = COMPANIES;

  newCompanyName = '';
  newCompanyLink = '';

  get activeJobsCount(): number {
    return this.jobListings.filter(job => job.link).length;
  }

  get comingSoonCount(): number {
    return this.jobListings.filter(job => !job.link).length;
  }

  addCompany(): void {
    const name = this.newCompanyName.trim();
    const link = this.newCompanyLink.trim();
    if (!name || !link) return;
    this.jobListings.push({ companyName: name, link });
    this.newCompanyName = '';
    this.newCompanyLink = '';
  }
}
