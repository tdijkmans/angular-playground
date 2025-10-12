export interface FocusEntry {
  id: string;
  el: HTMLElement;
  group?: string;
  order?: number; // For 1D navigation
  row?: number; // For 2D navigation
  col?: number; // For 2D navigation
}
