import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, BreadcrumbComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
