/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './ts/**/*.ts',
        '../svg/*.svg',
        '../../templates/**/*.html',
    ],
    theme: {
        fontSize: {
            'sm': ['0.75rem', { // 12px
                lineHeight: '120%',
                letterSpacing: '0.16em',
            }],
            'sm2': ['0.688rem', { // 11px
                lineHeight: '120%',
                letterSpacing: '0.16em',
            }],
            'md1': ['1.438rem', { // 23px
                lineHeight: '100%',
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
                '3.5': '0.875rem', // 14px
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
                '62' : '15.5rem', // 248px
                '17.5' : '4.375rem', // 70px
                '10': '2.5rem', // 40px
                '4.7': '1.188rem', // 19px
                '4.5': '1.125rem', // 18px
                '3.5': '0.875rem', // 14px
                '1.5': '0.375rem', // 6px
                '1.2': '0.3rem', // 4.8px
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
                'dark-tan': '#cac8c1',
                'dark-gray': '#2D2D2D',
                'med-gray': '#CCC',
                'light-gray': '#F4F5F6',
                'black': '#000',
                'white': '#FFF'
            },
            flex: {
                'search': '0.95 1 0%'
            },
        }
    },
    plugins: [
    ],
    safelist: [
        'tooltip',
        'tooltip-inner',
        'arrow',
        'arrow:before',
        'arrow:after',
        'fill-dark-tan',
        'fill-none',
        'stroke-dark-tan',
        'stroke-tan',
        'stroke-[0.5px]'
    ],
}
