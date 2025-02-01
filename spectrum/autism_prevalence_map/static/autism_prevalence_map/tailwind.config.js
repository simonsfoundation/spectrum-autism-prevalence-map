/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './ts/**/*.ts',
        '../svg/*.svg',
        '../../templates/**/*.html',
    ],
    theme: {
        fontSize: {
            'sm0': ['0.75rem', { // 12px
                letterSpacing: '0.04em',
            }],
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
                '1': '0.25rem', // 4px
                '3.5': '0.875rem', // 14px
            },
            letterSpacing: {
            },
            lineHeight: {
            },
            borderWidth: {
                '1.5': '0.375rem', // 6px
            },
            screens: {
            },
            height: {
                'main': 'calc(100vh - 4.375rem)', // 100% - 70px
                'filters': '5.875rem', // 94px
                'map': 'calc(100vh - 23.875rem)', // 100% - 382px
                'timeline': '11.75rem', // 188px
                'arrow': '0.5rem', // 8px
                'arrow2': '6.5px', // 6.5px
            },
            width: {
                'search': '15.5rem', // 248px
                'arrow': '0.75rem', // 12px
                'arrow2': '0.813rem', // 13px
            },
            spacing: {
                '17.5': '4.375rem', // 70px
                '6.5': '1.625rem', // 26px
                '4.7': '1.188rem', // 19px
                '4.5': '1.125rem', // 18px
                '3.5': '0.875rem', // 14px
                '2.8': '0.6875rem', // 11px
                '1.5': '0.375rem', // 6px
                '1.2': '0.3rem', // 4.8px
            },
            maxWidth: {
                'container': '103rem', // 1648px
                'logo': '13.55rem', // 216.8px
                'tooltip': '11.625rem', // 186px
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
                'dark-gray2': '#585248',
                'med-gray': '#CCC',
                'light-gray': '#F4F5F6',
                'light-gray2': '#BFCBD1',
                'black': '#000',
                'white': '#FFF',
            },
            flex: {
                'search': '0.95 1 0%',
            },
            content: {
                'empty': '""', 
            },
            zIndex: {
                '1': '1',
                '2': '2',
            }
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
        'stroke-[0.5px]',
    ],
}
