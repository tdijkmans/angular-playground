import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ComponentPortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';

@Component({
    selector: 'app-my-content',
    template: `
        <span> {{ data.zaakId }}</span>
        <div *ngIf="post$ | async as data; else loading">
            <h2>Post #{{ data.id }}</h2>
            <h3>{{ data.title }}</h3>
            <p>{{ data.body }}</p>
        </div>
        <ng-template #loading>Loading...</ng-template>
  `,
    imports: [CommonModule],
})
export class MyContentComponent {
    private http = inject(HttpClient);
    public data = inject(DIALOG_DATA) as { portal: ComponentPortal<any>, width: string, zaakId: string };
    post$ = this.http.get<any>(`https://jsonplaceholder.typicode.com/posts/${this.data.zaakId}`);

}
