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
            '1xs': ['0.625rem', { // 10px
                lineHeight: '0.75rem',
                letterSpacing: '0.16em',
            }],
            '1xs2': ['0.688rem', { // 11px
                lineHeight: '120%',
                letterSpacing: '0.16em',
            }],
            '2xs': ['0.75rem', { // 12px
                lineHeight: '0.875rem',
                letterSpacing: '0.16em',
            }],
            '2xs2': ['0.75rem', { // 12px
                lineHeight: '120%',
                letterSpacing: '0.04em',
            }],
            '3xs': ['0.8125rem', { // 13px
                lineHeight: '0.975rem',
                letterSpacing: '0.02em',
            }],
            'sm': ['0.875rem', { // 14px
                lineHeight: '1.375rem',
                letterSpacing: '0.16em',
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
            '1.5md': ['1.5rem', { // 24px
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
                'sm': '0.25rem', // 4px
                'sm-l': '0.25rem 0 0 0.25rem', // 4px
                'sm-r': '0 0.25rem 0.25rem 0', // 4px
                'lg': '0.875rem', // 14px
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
                '0.5': '0.5px',
                '1': '1px',
                '6.5': '0.375rem', // 6px
            },
            screens: {
            },
            height: {
                'filters': '5.875rem', // 94px
                'map': '28.375rem', // 454px
                'map-lg': '30.125rem',  // 482px
                'map-xl': '39rem',  // 624px
                'timeline': '11.75rem', // 188px
                'arrow': '0.5rem', // 8px
                'arrow2': '6.5px', // 6.5px
            },
            width: {
                'search': '15.5rem', // 248px
                'arrow': '0.75rem', // 12px
                'arrow2': '0.813rem', // 13px
                'filter': '10.813rem', // 173px
                'filterwide': '15.375rem', // 246px
                'map': '51.625rem', // 826px
                'map-lg': '55.75rem',  // 892px
                'map-xl': '72.125rem',  // 1154px
            },
            spacing: {
                '0.25': '0.063rem', // 1px
                '0.5': '0.125rem', // 2px
                '0.75': '0.188rem', // 3px
                '1.2': '0.3rem', // 4.8px
                '1.25': '0.3125rem', // 5px
                '1.5': '0.375rem', // 6px
                '1.75': '0.4375rem', // 7px
                '2.5': '0.625rem', // 10px
                '2.75': '0.688rem', // 11px
                '3.5': '0.875rem', // 14px
                '3.75': '0.938rem', // 15px
                '4': '1rem', // 16px
                '4.5': '1.125rem', // 18px
                '4.7': '1.188rem', // 19px
                '5.2': '1.313rem', // 21px
                '5.5': '1.375rem', // 22px
                '6.5': '1.625rem', // 26px
                '8.5': '2.125rem', // 34px
                '10': '2.5rem', // 40px
                '10.5': '2.625rem', // 42px
                '14.5': '3.625rem', // 58px
                '17.5': '4.375rem', // 70px
                '62' : '15.5rem', // 248px
                '63.5': '15.875rem', // 254px
                '73': '18.25rem', // 292px
                '159': '39.75rem', // 636px
                '207.5': '51.875rem', // 830px
                '400': '100rem', // 1600px 
            },
            maxWidth: {
                'tooltip': '11.625rem', // 186px
                'logo': '13.55rem', // 216.8px
                'container': '103rem', // 1648px
            },
            colors: {
                'red': '#910E1C',
                'blue': '#0B6BC3',
                'navy': '#003049',
                'med-navy': '#2E5367',
                'light-navy-3': '#6c8291',
                'light-navy-2': '#DFE8EC',
                'tan': '#FEF9EE',
                'dark-tan': '#CAC6BC',
                'dark-gray': '#2D2D2D',
                'dark-gray2': '#585248',
                'med-gray': '#CCC',
                'light-gray': '#F4F5F6',
                'light-gray2': '#BFCBD1',
                'black': '#000',
                'white': '#FFF',
                'light-red': '#E0888F',
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
            flex: {
                'search': '0.95 1 0%',
            },
            content: {
                'empty': '""', 
            },
            zIndex: {
                '1': '1',
                '2': '2',
            },
            boxShadow: {
                'tooltip': '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
            },
            screens: {
                'lg': '1440px',
                'xl': '1728px',
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
        'stroke-[0.5px]',
        'ui-slider',
        'ui-slider-handle',
        'ui-slider-range',
        'ui-state-focus',
    ],
}
