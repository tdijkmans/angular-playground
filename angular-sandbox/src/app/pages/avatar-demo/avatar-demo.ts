import { Component } from '@angular/core';

import { AVATAR_BUILT_IN_PRESETS, AvatarPresets } from '../../components/avatar/avatar';
import { AvatarComponent } from '../../components/avatar/avatar';
import { AvatarGroupComponent, AvatarItem } from '../../components/avatar/avatar-group';

const TEAM: AvatarItem[] = [
  { initials: 'ED', label: 'Edsger Dijkstra' },
  { initials: 'GH', label: 'Grace Hopper' },
  { initials: 'AT', label: 'Alan Turing' },
  { initials: 'AL', label: 'Ada Lovelace' },
  { initials: 'CB', label: 'Charles Babbage' },
  { initials: 'DK', label: 'Donald Knuth' },
  { initials: 'BL', label: 'Barbara Liskov' },
  { initials: 'NW', label: 'Niklaus Wirth' },
];

@Component({
  selector: 'app-avatar-demo',
  standalone: true,
  imports: [AvatarComponent, AvatarGroupComponent],
  templateUrl: './avatar-demo.html',
  styleUrl: './avatar-demo.scss',
})
export class AvatarDemoComponent {
  protected readonly presetNames = Object.keys(AVATAR_BUILT_IN_PRESETS);

  protected readonly team = TEAM;

  protected readonly customPresets: AvatarPresets = {
    brand:   ['#ffffff', '#6d28d9'],
    success: ['#ffffff', '#15803d'],
    danger:  ['#ffffff', '#b91c1c'],
  };

  protected readonly customPresetTeam: AvatarItem[] = [
    { initials: 'AA', preset: 'brand',   label: 'Alice A' },
    { initials: 'BB', preset: 'success', label: 'Bob B' },
    { initials: 'CC', preset: 'danger',  label: 'Carol C' },
    { initials: 'DD', preset: 'brand',   label: 'David D' },
    { initials: 'EE', preset: 'success', label: 'Eve E' },
  ];
}

