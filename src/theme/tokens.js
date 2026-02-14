// Light theme colors
export const lightTheme = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#EC4899',
  background: '#F8FAFC',
  backgroundGradient1: '#EEF2FF',
  backgroundGradient2: '#FCE7F3',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  shadow: '#00000015',
  accent: '#8B5CF6',
  accentLight: '#EDE9FE',
};

// Dark theme colors
export const darkTheme = {
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  secondary: '#F472B6',
  background: '#0F172A',
  backgroundGradient1: '#1E1B4B',
  backgroundGradient2: '#831843',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  danger: '#F87171',
  dangerLight: '#7F1D1D',
  info: '#60A5FA',
  infoLight: '#1E3A8A',
  shadow: '#00000040',
  accent: '#A78BFA',
  accentLight: '#4C1D95',
};

// Simple function to get current theme
export const getTheme = (mode) => {
  if (mode === 'dark') {
    return darkTheme;
  }
  return lightTheme;
};
