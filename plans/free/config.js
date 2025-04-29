export const CONFIG = {
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbxKk2ihdfSzAD5qt6cMHmTRHhEyncyfK3Qlmu4ncc2NHuOigltcG837_gNxfbdjg2lE/exec', // date 2025-4-29 time 12:32am
    emailRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // RFC 5322 compliant email regex
    linkRegex: /^[a-zA-Z0-9_-]{3,15}$/, // linkRegex: 3 to 15 characters, letters, numbers, underscores, and '-' no spaces no points no spacial characters 
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