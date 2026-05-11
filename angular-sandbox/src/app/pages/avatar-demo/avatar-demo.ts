import { Component } from '@angular/core';

import { AvatarComponent } from '../../components/avatar/avatar';

@Component({
  selector: 'app-avatar-demo',
  standalone: true,
  imports: [AvatarComponent],
  templateUrl: './avatar-demo.html',
  styleUrl: './avatar-demo.scss',
})
export class AvatarDemoComponent {}
