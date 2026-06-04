import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AppData {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  fetchData(): Observable<AppData> {
    return of({ message: 'Hello from DataService' }).pipe(delay(0));
  }
}
