import { Component, computed, input } from '@angular/core';

import {
  AvatarColorTuple,
  AvatarComponent,
  AvatarPresets,
  AvatarSize,
} from './avatar';

/** Describes a single avatar entry inside a group. */
export interface AvatarItem {
  /** 1–3 character initials string. */
  initials: string;
  /** When false, initials are kept as-is. Defaults to true. */
  capitalize?: boolean;
  /** Named colour preset. */
  preset?: string;
  /** Explicit [foreground, background] colour pair — overrides any preset. */
  color?: AvatarColorTuple;
  /** Full accessible label (e.g. person's full name). */
  label?: string;
}

@Component({
  selector: 'app-avatar-group',
  standalone: true,
  imports: [AvatarComponent],
  templateUrl: './avatar-group.html',
  styleUrl: './avatar-group.scss',
  
  host: {
    role: 'group',
    '[attr.aria-label]': 'label()',
  },
})
export class AvatarGroupComponent {
  /** The full list of avatars to represent. */
  readonly items = input.required<AvatarItem[]>();

  /**
   * Maximum number of individual avatars to show before collapsing the
   * remainder into the overflow badge. Defaults to 3.
   */
  readonly max = input<number>(3);

  readonly size = input<AvatarSize>('md');

  readonly square = input<boolean>(false);

  /**
   * Custom preset map forwarded to every child avatar.
   * Overrides built-in presets when a matching key is found.
   */
  readonly customPresets = input<AvatarPresets | undefined>(undefined);

  /** Accessible label for the whole group (e.g. "Project team"). */
  readonly label = input<string>('Avatar group');

  protected readonly visibleItems = computed(() =>
    this.items().slice(0, this.max()),
  );

  protected readonly overflowCount = computed(() =>
    Math.max(0, this.items().length - this.max()),
  );

  protected readonly overflowLabel = computed(
    () => `and ${this.overflowCount()} more`,
  );
}
