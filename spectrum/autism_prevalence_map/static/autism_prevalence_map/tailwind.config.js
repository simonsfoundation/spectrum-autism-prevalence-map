/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './ts/**/*.ts',
        '../svg/*.svg',
        '../../templates/**/*.html',
    ],
    theme: {
        fontSize: {
            'xs': ['0.5rem', { // 8px
                lineHeight: '0.75rem',
                letterSpacing: '0.16em',
            }],
            '1xs': ['0.75rem', { // 10px
                lineHeight: '0.75rem',
                letterSpacing: '0.16em',
            }],
            '2xs': ['0.75rem', { // 12px
                lineHeight: '0.875rem',
                letterSpacing: '0.16em',
            }],
            'sm': ['0.875rem', { // 14px
                lineHeight: '1.375rem',
                letterSpacing: '0.16em',
            }],
        },
        extend: {
            fontFamily: {
                'sans': ['GothiaSans', 'sans-serif'],
                'serif': ['GothiaSerif', 'serif'],
                'serif-text': ['GothiaSerifText', 'serif'],
            },
            borderRadius: {
                'sm': '4px',
                'sm-l': '4px 0 0 4px',
                'sm-r': '0 4px 4px 0',
            },
            letterSpacing: {
            },
            lineHeight: {
            },
            borderWidth: {
                '1': '1px',
                '0.5': '0.5px',
            },
            screens: {
            },
            spacing: {
                '0.25': '0.063rem', // 1px
                '0.5': '0.125rem', // 2px
                '0.75': '0.188rem', // 3px
                '1.25': '0.3125rem', // 5px
                '1.75': '0.4375rem', // 7px
                '2.5': '0.625rem', // 10px
                '2.75': '0.688rem', // 11px
                '3.5': '0.875rem', // 14px
                '3.75': '0.938rem', // 15px
                '4.5': '1.125rem', // 18px
                '5.2': '1.313rem', // 21px
                '5.5': '1.375rem', // 22px
                '6.5': '1.625rem', // 26px
                '8.5': '2.125rem', // 34px
                '10.5': '2.625rem', // 42px
                '14.5': '3.625rem', // 58px
                '63.5': '15.875rem', // 254px
                '207.5': '51.875rem', // 830px
            },
            colors: {
                'red': '#910E1C',
                'blue': '#0B6BC3',
                'navy': '#003049',
                'med-navy': '#2E5367',
                'light-navy-2': '#DFE8EC',
                'tan': '#FEF9EE',
                'dark-gray': '#2D2D2D',
                'light-gray': '#F4F5F6',
            },
            backgroundImage: {
                'select-arrow': "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 14 8%22 fill=%22none%22%3E%3Cpath d=%22M1.707 0.293a1 1 0 00-1.414 1.414L6.293 7.707a1 1 0 001.414 0l6-6A1 1 0 0012.293.293L7 5.586 1.707.293z%22 fill=%22%232E5367%22/%3E%3C/svg%3E')",
            },
            backgroundSize: {
                'arrow-sm': '14px 9px'
            },
            backgroundPosition: {
                'right-4': 'calc(100% - 1rem) center',
            },
        }
    },
    plugins: [
    ],
    safelist: [
        'ui-slider',
        'ui-slider-handle',
        'ui-slider-range',
        'ui-state-focus',
    ],
}
