/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './ts/**/*.ts',
        '../svg/*.svg',
        '../../templates/**/*.html',
    ],
    theme: {
        fontSize: {
            '1xs': ['0.688rem', { // 11px
                lineHeight: '120%',
                letterSpacing: '0.16em',
            }],
            '2xs': ['0.75rem', { // 12px
                lineHeight: '120%',
                letterSpacing: '0.16em',
            }],
            '3xs': ['0.8125rem', { // 13px
                lineHeight: '0.975rem',
                letterSpacing: '0.02em',
            }],
            'sm': ['0.875rem', { // 14px
                lineHeight: '1.25rem',
                letterSpacing: '0.12em',
            }],
            '1sm': ['1rem', { // 16px
                lineHeight: '1.6rem',
                letterSpacing: '0.01em',
            }],
            '2sm': ['1.125rem', { // 18px
                lineHeight: '1.8rem',
                letterSpacing: '0.02em',
            }],
            '3sm': ['1.25rem', { // 20px
                lineHeight: '1.5rem',
                letterSpacing: '0.01em',
            }],
            '1md': ['1.438rem', { // 23px
                lineHeight: '100%',
                letterSpacing: '0.06em',
            }],
            '1.5md': ['1.4375rem', { // 24px
                lineHeight: '1.725rem',
                letterSpacing: '0.03em',
            }],
            '2md': ['1.625rem', { // 26px
                lineHeight: '1.95rem',
                letterSpacing: '0.01em',
            }],
            '4md': ['1.813rem', { // 29px
                lineHeight: '1.813rem',
                letterSpacing: '0em'
            }],
            'lg': ['1.9375rem', { // 31px
                lineHeight: '120%',
                letterSpacing: '0.116em',
            }],
            '3lg': ['2.4375rem', { // 39px
                lineHeight: '100%',
                letterSpacing: '0em',
            }],
            'xl': ['3rem', { // 48px
                lineHeight: '100%',
                letterSpacing: '0em',
            }],
        },
        extend: {
            fontFamily: {
                'sans': ['GothiaSans', 'sans-serif'],
                'serif': ['GothiaSerif', 'serif'],
                'serif-text': ['GothiaSerifText', 'serif'],
            },
            borderRadius: {
                '3.5': '0.875rem', // 14px
            },
            letterSpacing: {
                'normal-md': '0.016em', // 0.26px
                'normal-lg': '0.02em', // 0.32px
                'widest-sm': '0.14em', // 1.92px
                'extra-wide': '0.16em', // 2.56px
            },
            lineHeight: {
                '5.5': '1.375rem',
            },
            borderWidth: {
            },
            screens: {
            },
            spacing: {
                '1.2': '0.3rem', // 4.8px
                '1.5': '0.375rem', // 6px
                '3.5': '0.875rem', // 14px
                '4': '1rem', // 16px
                '4.5': '1.125rem', // 18px
                '4.7': '1.188rem', // 19px
                '10': '2.5rem', // 40px
                '17.5' : '4.375rem', // 70px
                '62' : '15.5rem', // 248px
                '73': '18.25rem', // 292px
                '400': '100rem', // 1600px
            },
            maxWidth: {
                'container': '103rem',
                'logo': '13.55rem'
            },
            colors: {
                'red': '#910E1C',
                'blue': '#0B6BC3',
                'navy': '#003049',
                'med-navy': '#2E5367',
                'light-navy-3': '#6c8291',
                'light-navy-2': '#DFE8EC',
                'tan': '#FEF9EE',
                'dark-gray': '#2D2D2D',
                'light-gray': '#F4F5F6',
                'black': '#000',
                'white': '#FFF',
                'dark-brown': '#585248',
                'light-red': '#E0888F',
            },
            flex: {
                'search': '0.95 1 0%'
            },
        }
    },
    plugins: [
    ],
    safelist: [
    ],
}
