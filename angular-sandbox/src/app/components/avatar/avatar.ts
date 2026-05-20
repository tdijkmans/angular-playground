import { Component, computed, input } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** A [foreground, background] colour pair. */
export type AvatarColorTuple = [string, string];

/** A named map of colour presets. */
export type AvatarPresets = Record<string, AvatarColorTuple>;

/** Ten built-in named colour presets. */
export const AVATAR_BUILT_IN_PRESETS: AvatarPresets = {
  violet:  ['#ffffff', '#7c3aed'],
  emerald: ['#ffffff', '#059669'],
  rose:    ['#ffffff', '#e11d48'],
  amber:   ['#1e293b', '#f59e0b'],
  sky:     ['#ffffff', '#0284c7'],
  pink:    ['#ffffff', '#db2777'],
  orange:  ['#ffffff', '#ea580c'],
  teal:    ['#ffffff', '#0d9488'],
  indigo:  ['#ffffff', '#4f46e5'],
  slate:   ['#ffffff', '#475569'],
};

/**
 * Resolve the colour for an avatar in priority order:
 * 1. Explicit `color` tuple
 * 2. Named `preset` from merged presets (custom overrides built-in)
 * 3. Deterministic pick derived from `initials` (stable identity)
 */
export function resolveAvatarColor(
  initials: string,
  color?: AvatarColorTuple,
  preset?: string,
  customPresets?: AvatarPresets,
): AvatarColorTuple {
  if (color) return color;

  const merged: AvatarPresets = { ...AVATAR_BUILT_IN_PRESETS, ...(customPresets ?? {}) };

  if (preset && merged[preset]) return merged[preset];

  const keys = Object.keys(merged);
  let hash = 0;
  for (const ch of initials) hash = (hash * 31 + ch.charCodeAt(0)) % keys.length;
  return merged[keys[hash]];
}

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  host: {
    '[class]': '"avatar size-" + size()',
    '[class.is-square]': 'square()',
    '[style.--avatar-fg]': 'resolvedColor()[0]',
    '[style.--avatar-bg]': 'resolvedColor()[1]',
    role: 'img',
    '[attr.aria-label]': 'label() || displayInitials()',
    '[attr.title]': 'label() || displayInitials()',
  },
})
export class AvatarComponent {
  /**
   * 1–3 character initials string to display.
   * Strings longer than 3 characters are silently truncated to 3.
   */
  readonly initials = input.required<string>();

  /** When true (default), initials are rendered as uppercase. */
  readonly capitalize = input<boolean>(true);

  /** Name of a built-in or custom preset to use as the colour scheme. */
  readonly preset = input<string | undefined>(undefined);

  /** Explicit [foreground, background] colour pair — overrides any preset. */
  readonly color = input<AvatarColorTuple | undefined>(undefined);

  /**
   * Custom preset map that extends (and overrides) the built-in presets.
   * Useful when a group of avatars shares a consistent custom palette.
   */
  readonly customPresets = input<AvatarPresets | undefined>(undefined);

  readonly size = input<AvatarSize>('md');

  readonly square = input<boolean>(false);

  /**
   * Accessible label for the avatar (e.g. the person's full name).
   * Falls back to `displayInitials` when omitted.
   */
  readonly label = input<string | undefined>(undefined);

  protected readonly displayInitials = computed(() => {
    const raw = this.initials().slice(0, 3);
    return this.capitalize() ? raw.toUpperCase() : raw;
  });

  protected readonly resolvedColor = computed((): AvatarColorTuple =>
    resolveAvatarColor(
      this.initials(),
      this.color(),
      this.preset(),
      this.customPresets(),
    ),
  );
}
