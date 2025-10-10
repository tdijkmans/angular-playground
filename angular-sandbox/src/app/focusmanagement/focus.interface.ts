// focus.interface.ts (Implicit or created)
export interface FocusEntry {
  id: string;
  el: HTMLElement;
  group?: string;
  // 1D Properties (used by FocusDirective)
  order: number;
  // 2D Properties (used by Focus2DDirective)
  row: number;
  col: number;
}
