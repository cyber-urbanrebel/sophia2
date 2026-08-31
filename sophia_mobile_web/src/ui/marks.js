/** Subtle marks used instead of cartoon face / fire emojis. */
export const MOOD_MARKS = [
  { value: 1, mark: '○', label: 'Hard' },
  { value: 2, mark: '◔', label: 'Low' },
  { value: 3, mark: '◑', label: 'Steady' },
  { value: 4, mark: '◕', label: 'Good' },
  { value: 5, mark: '●', label: 'Bright' },
];

export const moodMark = (value) =>
  MOOD_MARKS.find((item) => item.value === value)?.mark || '○';

export const moodLabel = (value) =>
  MOOD_MARKS.find((item) => item.value === value)?.label || '';
