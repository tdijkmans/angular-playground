import { Component, computed, input } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  host: {
    '[class]': '"avatar size-" + size()',
    '[class.is-square]': 'square()',
    '[style.--avatar-fg]': 'color()?.[0]',
    '[style.--avatar-bg]': 'color()?.[1]',
    role: 'img',
    '[attr.aria-label]': 'name()',
  },
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly color = input<[string, string] | undefined>(undefined);
  readonly size = input<AvatarSize>('md');
  readonly square = input<boolean>(false);

  protected readonly initials = computed(() => {
    const raw = this.name();
    if (!raw?.trim()) return '?';
    const parts = raw.split(',').map((p) => p.trim());
    const surname = parts[0]?.[0]?.toUpperCase() ?? '';
    const first = parts[1]?.[0]?.toUpperCase() ?? '';
    return surname + first || surname || '?';
  });
}
