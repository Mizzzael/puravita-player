const { black, white, gray } = require('tailwindcss/colors');

const sans = ['Effra', 'sans-serif'];

module.exports = {
    purge: [],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {},
        fontFamily: {
            sans,
            mono: sans,
            display: sans,
            body: sans,
        },
        colors: {
            black,
            white,
            gray,
            transparent: 'transparent',
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
