import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  standalone: true
})
export class RelativeTimePipe implements PipeTransform {
  
  private readonly relativeTimeFormat = new Intl.RelativeTimeFormat('nl', {
    numeric: 'auto',
    style: 'long'
  });

  transform(value: Date | string | number): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      return '';
    }

    const diffInMs = date.getTime() - now.getTime();
    const diffInSeconds = Math.round(diffInMs / 1000);
    const diffInMinutes = Math.round(diffInMs / (1000 * 60));
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.round(diffInMs / (1000 * 60 * 60 * 24 * 7));
    const diffInMonths = Math.round(diffInMs / (1000 * 60 * 60 * 24 * 30));
    const diffInYears = Math.round(diffInMs / (1000 * 60 * 60 * 24 * 365));

    // Choose the most appropriate unit based on the time difference
    if (Math.abs(diffInYears) >= 1) {
      return this.relativeTimeFormat.format(diffInYears, 'year');
    } else if (Math.abs(diffInMonths) >= 1) {
      return this.relativeTimeFormat.format(diffInMonths, 'month');
    } else if (Math.abs(diffInWeeks) >= 1) {
      return this.relativeTimeFormat.format(diffInWeeks, 'week');
    } else if (Math.abs(diffInDays) >= 1) {
      return this.relativeTimeFormat.format(diffInDays, 'day');
    } else if (Math.abs(diffInHours) >= 1) {
      return this.relativeTimeFormat.format(diffInHours, 'hour');
    } else if (Math.abs(diffInMinutes) >= 1) {
      return this.relativeTimeFormat.format(diffInMinutes, 'minute');
    } else {
      return this.relativeTimeFormat.format(diffInSeconds, 'second');
    }
  }
}