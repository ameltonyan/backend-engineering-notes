export type ReadingTheme = 'dark' | 'light' | 'paper' | 'sepia'
export type ReaderFontSize = 'small' | 'standard' | 'large'

export const themeOptions: Array<{ value: ReadingTheme; label: string; icon: string }> = [
  { value: 'light', label: 'Light', icon: '☀' },
  { value: 'dark', label: 'Dark', icon: '☾' },
  { value: 'paper', label: 'Paper', icon: '◍' },
  { value: 'sepia', label: 'Sepia', icon: '◒' },
]

export const fontSizeOptions: Array<{ value: ReaderFontSize; label: string; icon: string }> = [
  { value: 'small', label: 'Small text', icon: 'A−' },
  { value: 'standard', label: 'Standard text', icon: 'A' },
  { value: 'large', label: 'Large text', icon: 'A+' },
]
