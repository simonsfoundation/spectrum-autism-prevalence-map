/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './ts/**/*.ts',
        '../svg/*.svg',
        '../../templates/**/*.html',
    ],
    theme: {
        fontSize: {
            'md': ['1.438rem', { // 23px
                lineHeight: '1.70625rem',
                letterSpacing: '0.06em',
            }]
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
                '10': '2.5rem',
                '5': '1.25rem',
                '4': '1rem',
            },
            maxWidth: {
                'container': '91.25rem',
                'logo': '13.625rem'
            },
            colors: {
                'red': '#910E1C',
                'blue': '#0B6BC3',
                'navy': '#003049',
                'med-navy': '#2E5367',
                'light-navy-2': '#DFE8EC',
                'tan': '#FEF9EE',
                'dark-gray': '#2D2D2D',
                'light-gray': '#F4F5F6 ',
            }
        }
    },
    plugins: [
    ],
    safelist: [
    ],
}
