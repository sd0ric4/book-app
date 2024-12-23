// types/theme.ts
export type Theme = 'light' | 'dark' | 'eyecare' | 'system' | 'newyear'; // 添加新年主题

export interface ThemeStyle {
  background: string;
  text: string;
  subtext: string;
  card: string;
  border: string;
  hover: string;
  button: string;
  activeButton: string;
}

export interface ThemeStyles {
  [key: string]: ThemeStyle;
}
