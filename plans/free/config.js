export const CONFIG = {
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwRxInczvswsSFabK0GeGo5xzfTy6Ay1zfhkLSJWsZQ0bMtx7gBHiP-7aRgKjGnkn6Z/exec', // date 2026-11-15
    emailRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    linkRegex: /^[a-zA-Z][a-zA-Z0-9-]{2,14}$/, // 3-15 chars total: 1 letter + 2-14 more chars
};

export const stylePresets = {
    // Professional Gradients
    corporateGradient: {
        background: 'linear-gradient(145deg, rgb(9, 9, 11), rgb(24, 24, 27), rgb(9, 9, 11))'
    },
    oceanGradient: {
        background: 'linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))'
    }
};