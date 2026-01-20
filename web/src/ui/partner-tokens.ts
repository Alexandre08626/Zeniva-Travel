/**
 * Premium Partner Dashboard Design Tokens
 * Marketplace-grade design system (Airbnb/Stripe/Notion-quality)
 */

export const PARTNER_TOKENS = {
  // Layout
  maxWidth: '1280px',
  gridCols: 12,
  
  // Spacing scale (4px base)
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '40px',
    '3xl': '48px',
  },
  
  // Border radius
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  
  // Shadows
  shadow: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  
  // Typography
  text: {
    h1: { size: '28px', weight: '600', lineHeight: '1.2' },
    h2: { size: '20px', weight: '600', lineHeight: '1.3' },
    h3: { size: '16px', weight: '600', lineHeight: '1.4' },
    body: { size: '14px', weight: '400', lineHeight: '1.5' },
    bodyLarge: { size: '16px', weight: '400', lineHeight: '1.5' },
    small: { size: '12px', weight: '400', lineHeight: '1.4' },
    tiny: { size: '11px', weight: '400', lineHeight: '1.4' },
  },
  
  // Colors
  colors: {
    // Brand
    primary: '#10B981', // Emerald-600
    primaryHover: '#059669', // Emerald-700
    primaryLight: '#D1FAE5', // Emerald-100
    
    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Neutrals
    text: {
      primary: '#111827', // Gray-900
      secondary: '#6B7280', // Gray-500
      muted: '#9CA3AF', // Gray-400
      disabled: '#D1D5DB', // Gray-300
    },
    
    bg: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB', // Gray-50
      tertiary: '#F3F4F6', // Gray-100
      hover: '#F9FAFB',
    },
    
    border: {
      default: '#E5E7EB', // Gray-200
      hover: '#D1D5DB', // Gray-300
      focus: '#10B981',
    },
  },
  
  // Transitions
  transition: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
} as const;

// Tailwind class helpers
export const PARTNER_CLASSES = {
  card: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200',
  cardPadding: 'p-6',
  button: {
    primary: 'px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 shadow-sm',
    secondary: 'px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200',
    ghost: 'px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200',
  },
  badge: {
    success: 'px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md',
    warning: 'px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-md',
    error: 'px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-md',
    info: 'px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md',
    neutral: 'px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md',
  },
} as const;
