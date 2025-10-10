// tokens.ts
export const tokens = {
  colors: {
    // 🔵 Primary
    'primary-0': '#f0f5ff',
    'primary-50': '#eef6ff',
    'primary-100': '#d9eaff',
    'primary-200': '#b0d4ff',
    'primary-300': '#84baff',
    'primary-400': '#569eff',
    'primary-500': '#2a7fff', // base
    'primary-600': '#1b63d9',
    'primary-700': '#124ab3',
    'primary-800': '#0a328c',
    'primary-900': '#051f66',

    // 🟠 Secondary
    'secondary-0': '#fff4e6',
    'secondary-50': '#fff7e6',
    'secondary-100': '#ffe7b3',
    'secondary-200': '#ffd380',
    'secondary-300': '#ffb84d',
    'secondary-400': '#ff9f26',
    'secondary-500': '#ff8800', // base
    'secondary-600': '#cc6a00',
    'secondary-700': '#994f00',
    'secondary-800': '#663500',
    'secondary-900': '#331a00',

    // ⚪ Neutral
    'neutral-0': '#ffffff',
    'neutral-50': '#f9fafb',
    'neutral-100': '#f3f4f6',
    'neutral-200': '#e5e7eb',
    'neutral-300': '#d1d5db',
    'neutral-400': '#9ca3af',
    'neutral-500': '#6b7280',
    'neutral-600': '#4b5563',
    'neutral-700': '#374151',
    'neutral-800': '#1f2937',
    'neutral-900': '#111827',
    success: '#16a34a',
    warning: '#eab308',
    error: '#dc2626',
    info: '#2563eb',
  },

  typography: {
    fontFamily: {
      base: "'Inter', sans-serif",
      heading: "'Poppins', sans-serif",
      mono: "'Fira Code', monospace",
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
  },

  radii: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },

  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type ColorSemanticToken = 'primary' | 'secondary' | 'neutral';
export type ColorShadeToken =
  | '0'
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';
export type ColorToken = `${ColorSemanticToken}-${ColorShadeToken}`;

// You can add more token types as needed, e.g., FontSizeToken, SpacingToken, etc.
