/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './ts/**/*.ts',
        '../svg/*.svg',
        '../../templates/**/*.html',
    ],
    theme: {
        fontSize: {
        },
        extend: {
            fontFamily: {
                'sans': ['GothiaSans', 'sans-serif'],
                'serif': ['GothiaSerif', 'serif'],
                'serif-text': ['GothiaSerifText', 'serif'],
            },
            borderRadius: {
            },
            letterSpacing: {
            },
            lineHeight: {
            },
            borderWidth: {
            },
            screens: {
            },
            spacing: {
            },
            colors: {
                'red': '#910E1C',
                'navy': '#003049',
                'tan': '#FEF9EE',
                'med-navy': '#2E5367',
                'light-navy-2': '#DFE8EC',
                'dark-gray': '#2D2D2D',
                'light-gray': '#F4F5F6 ',
                'blue': '#0B6BC3',
            },

        }
    },
    plugins: [
    ],
    safelist: [
    ],
}
