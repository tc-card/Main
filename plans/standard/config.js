export const CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  googleScriptUrl: 'https://script.google.com/macros/s/AKfycbyXH5T3u-p8HAHJa3Ti82FbWZiU0-KRUAGR3QGsBSOTUUqUEW8rxbNCvoZMy8YfYmeY/exec',
  maxSocialLinks: 10,
  defaultProfileImage: '/Assets/150.png',
};

export const stylePresets = {
  // Dark Professional Colors
  minimal: { background: '#18181b' },
  black: { background: '#09090b' },
  navy: { background: '#020617' },
  forest: { background: '#022c22' },
  wine: { background: '#450a0a' },

  // Lighter color themes
  clouds: { background: '#0ea5e9' },
  Pink: { background: '#9b0055' },
  SkyBlue: { background: '#2563eb' },
  paleRed: { background: '#f00f4d' },

  // Professional Gradients
  corporateGradient: { background: 'linear-gradient(145deg, rgb(9, 9, 11), rgb(24, 24, 27), rgb(9, 9, 11))' },
  oceanGradient: { background: 'linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))' },
  forestGradient: { background: 'linear-gradient(145deg, rgb(2, 44, 34), rgb(6, 78, 59), rgb(2, 44, 34))' },
  burgundyGradient: { background: 'linear-gradient(145deg, rgb(69, 10, 10), rgb(127, 29, 29), rgb(69, 10, 10))' }
};