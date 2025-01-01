export const CONFIG = {
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'gif'],
    googleScriptUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL'
};

export const stylePresets = {
    minimal: {
        background: '#000000',
        customClasses: 'bg-black'
    },
    gradient: {
        background: 'linear-gradient(to bottom right,rgb(44, 50, 59),rgb(0, 0, 0), rgb(44, 50, 59)',
        customClasses: 'bg-gradient-to-r from-gray-500 via-black to-gray-500'
    },
    nature: {
        background: "url('./Assets/nature-bg.jpg')",
        customClasses: 'bg-cover bg-center'
    },
    geometric: {
        background: "url('./Assets/geometric-bg.svg')",
        customClasses: 'bg-cover'
    }
};