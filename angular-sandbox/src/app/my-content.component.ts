import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';

@Component({
    selector: 'app-my-content',
    template: `
    <div *ngIf="data$ | async as data; else loading">
      <h2>Post #{{ data.id }}</h2>
      <h3>{{ data.title }}</h3>
      <p>{{ data.body }}</p>
      <div style="margin-top: 1em;">
        <button (click)="changeId(data.id - 1)" [disabled]="data.id <= 1">Previous</button>
        <button (click)="changeId(data.id + 1)">Next</button>
      </div>
    </div>
    <ng-template #loading>Loading...</ng-template>
  `,
    imports: [CommonModule],
})
export class MyContentComponent implements OnInit {
    data$!: Observable<any>;
    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    ngOnInit() {
        this.data$ = this.route.queryParams.pipe(
            switchMap(params => {
                const id = +params['id'] || 1;
                return this.http.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
            })
        );
    }

    changeId(newId: number) {
        this.router.navigate([], {
            queryParams: { id: newId },
            queryParamsHandling: 'merge',
        });
    }
}
