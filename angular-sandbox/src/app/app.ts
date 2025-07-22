import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RelativeTimePipe } from './pipes/relative-time.pipe';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RelativeTimePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App  {
  protected title = 'angular-sandbox';

  // Demo dates for the relative time pipe
  protected now = new Date();
  protected oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  protected thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  protected fifteenMinutesFromNow = new Date(Date.now() + 15 * 60 * 1000);
  protected tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  protected lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  protected nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}
