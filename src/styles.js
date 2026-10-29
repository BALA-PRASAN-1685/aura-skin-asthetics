// Small helper that reproduces the inline text styles used in the original page.
export const txt = (color, size, weight = 400) => ({
  color,
  fontWeight: weight,
  fontStyle: 'normal',
  fontSize: `${size}px`,
});

export const INK = 'rgb(16, 42, 52)';
export const WHITE = 'rgb(255, 255, 255)';
export const TEAL = 'rgb(8, 125, 134)';
export const MUTED = 'rgb(83, 102, 107)';
