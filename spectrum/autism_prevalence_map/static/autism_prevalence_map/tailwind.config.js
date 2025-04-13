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
            '1xs2': ['0.625rem', { // 10px
                lineHeight: '100%',
                letterSpacing: '0.01em',
            }],
            '1xs3': ['0.688rem', { // 11px
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
            'sm1': ['0.938rem', { // 15px
                lineHeight: '100%',
                letterSpacing: '0.01em',
            }],
            'sm2': ['0.875rem', { // 14px
                lineHeight: '100%',
                letterSpacing: '0.01em',
            }],
            'sm3': ['0.938rem', { // 15px
                lineHeight: '100%',
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
            'lg2': ['1.9375rem', { // 31px
                lineHeight: '100%',
            }],
            '3lg': ['2.4375rem', { // 39px
                lineHeight: '100%',
                letterSpacing: '0em',
            }],
            'xl': ['3rem', { // 48px
                lineHeight: '100%',
                letterSpacing: '0em',
            }],
            '3.5': '0.875rem', // 14px
            '4': '1rem', // 16px
            '5': '1.25rem', // 20px
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
                'sm-t': '0.25rem 0.25rem 0 0', // 4px
                'sm-b': '0 0 0.25rem 0.25rem', // 4px
                'sm2-b': '0 0 0.5rem 0.5rem', // 8px
                'md': '0.5rem', // 9px
                'lg': '0.75rem', // 12px
                'xl': '0.875rem', // 14px
                'circle': '50%',
            },
            letterSpacing: {
                '1': '0.01em', // 1%
                '2': '0.02em', // 2%
                '4': '0.04em', // 4%
                'normal-md': '0.016em', // 0.26px
                'normal-lg': '0.02em', // 0.32px
                'widest-sm': '0.14em', // 1.92px
                'extra-wide': '0.16em', // 2.56px
            },
            lineHeight: {
                '4.25': '1.063rem', // 17px
                '4.5': '1.125rem', // 18px
                '4.8': '1.2rem',
                '5.5': '1.375rem', // 22px
                '6.25': '1.563rem', // 25px
                '7.2': '1.788rem', // 28.6px
                '100': '100%', // 100%
            },
            borderWidth: {
                '0.125': '0.5px',
                '0.3125': '1.25px',
                '1': '0.25rem',
                '1.5': '0.375rem', // 6px
                '3': '0.75rem', // 12px
            },
            height: {
                'filters': '5.875rem', // 94px
                'map': '28.375rem', // 454px
                'map-lg': '30.125rem',  // 482px
                'map-xl': '39rem',  // 624px
                'card-xl': '42.25rem', // 676px
                'map-expand': '33.063rem', // 529px
                'map-lg-expand': '34.813rem',  // 557px
                'map-xl-expand': '43.688rem',  // 699px
                'card-xl-expand': '46.938rem', // 751px
                'timeline': '11.75rem', // 188px
                'brush': '11.313rem', // 181px
                'switchout': '1.5rem', // 24px
                'switchin': '0.875rem', // 14px
                'arrow': '0.5rem', // 8px
                'arrow2': '6.5px', // 6.5px
                'expand': '2.25rem', // 36px
                'zoom': '2.375rem', // 38px
            },
            width: {
                'search': '15.5rem', // 248px
                'arrow': '0.75rem', // 12px
                'arrow2': '0.813rem', // 13px
                'switchin': '0.875rem', // 14px
                'zoomcontrol': '2.25rem', // 36px
                'switchout': '2.75rem', // 44px
                'filter': '10.813rem', // 173px
                'button': '12rem', // 192px
                'filterwide': '15.375rem', // 246px
                'help': '27.625rem', // 442px
                'timeline': '48.125rem', // 770px
                'timeline-lg': '57.188rem', // 915px
                'timeline-xl': '77.25rem', // 1236px
                'learn': '8.75rem', // 140px
                'filter': '10.813rem', // 173px
                'button': '12rem', // 192px
                'filterwide': '15.375rem', // 246px
                'info': '18rem', // 288px
                'mean-popup': '23.6875rem', //379px
                'mean-popup-note': '26.5rem', //424px
                'buttons': '25rem', // 400px
                'listcard': '25.5rem', // 408px
                'map': '51.625rem', // 826px
                'map-lg': '55.75rem',  // 892px
                'map-xl': '72.125rem',  // 1154px
                'map-expand': '61.188rem', // 979px
                'map-lg-expand': '64.438rem',  // 1031px
                'map-xl-expand': '80.875rem',  // 1294px
            },
            minWidth: {
                'toggle': '3.438rem', // 55px
                'td1': '6.25rem', // 100px
                'td2': '13.625rem', // 198px
                'td3': '9.3125rem', // 149px
                'td4': '17.625rem', // 282px
                'td16': '14.0625rem', // 225px
            },
            maxHeight: {
                'info1': 'calc(100% - 52px)', // height of the info card minus the sticky button wrapper at the bottom with 1 link
                'info2': 'calc(100% - 79px)', // height of the info card minus the sticky button wrapper at the bottom with 2 links
                'info3': 'calc(100% - 106px)', // height of the info card minus the sticky button wrapper at the bottom with 3 links
                'info4': 'calc(100% - 133px)', // height of the info card minus the sticky button wrapper at the bottom with 4 links
            },
            maxWidth: {
                'tooltip': '11.625rem', // 186px
                'welcome': '16.5rem', // 264px
                'logo': '13.55rem', // 216.8px
                'container': '103rem', // 1648px
            },
            spacing: {
                '0.125': '0.031rem', // 0.5px
                '0.25': '0.063rem', // 1px
                '0.5': '0.125rem', // 2px
                '0.75': '0.188rem', // 3px
                '1.2': '0.3rem', // 4.8px
                '1.25': '0.3125rem', // 5px
                '1.5': '0.375rem', // 6px
                '1.75': '0.4375rem', // 7px
                '2': '0.5rem', // 8px
                '2.25': '0.563rem', // 9px
                '2.4': '0.594rem', // 9.5px
                '2.5': '0.625rem', // 10px
                '2.75': '0.688rem', // 11px
                '3': '0.75rem', // 12px
                '3.25': '0.813rem', // 13px
                '3.5': '0.875rem', // 14px
                '3.75': '0.938rem', // 15px
                '4': '1rem', // 16px
                '4.5': '1.125rem', // 18px
                '4.7': '1.188rem', // 19px
                '5': '1.25rem', // 20px
                '5.2': '1.313rem', // 21px
                '5.5': '1.375rem', // 22px
                '5.75': '1.438rem', // 23px
                '6': '1.5rem', // 24px
                '6.5': '1.625rem', // 26px
                '7.5': '1.875rem', // 30px
                '8': '2rem', // 32px
                '8.25': '2.063rem', // 33px
                '8.5': '2.125rem', // 34px
                '8.75': '2.188rem', // 35px
                '9': '2.25rem', // 36px
                '10': '2.5rem', // 40px
                '10.5': '2.625rem', // 42px
                '11.5': '2.875rem', // 46px
                '12.5': '3.125rem', // 50px
                '13': '3.25rem', // 52px
                '13.75': '3.438rem', // 55px
                '14': '3.5rem', // 56px
                '14.5': '3.625rem', // 58px
                '15': '3.75rem', // 60px
                '16': '4rem', // 64px
                '17.5': '4.375rem', // 70px
                '17.7': '4.625rem', //74px
                '23': '5.75rem', // 92px
                '24' : '6rem', // 96px
                '25.5' : '6.375rem', // 102px
                '38.75' : '9.6875rem', // 155px
                '46.5' : '11.625rem', // 186px
                '62' : '15.5rem', // 248px
                '63.5': '15.875rem', // 254px
                '73': '18.25rem', // 292px
                '159': '39.75rem', // 636px
                '207.5': '51.875rem', // 830px
                '400': '100rem', // 1600px
                '12/25': '48%',
            },
            colors: {
                'red': '#910E1C',
                'med-red': '#D14D57',
                'blue': '#0B6BC3',
                'navy': '#003049',
                'med-navy': '#2E5367',
                'light-navy-3': '#6c8291',
                'light-navy-2': '#DFE8EC',
                'tan': '#FEF9EE',
                'med-tan': '#F4EEDF',
                'dark-tan': '#CAC6BC',
                'dark-gray': '#2D2D2D',
                'dark-gray2': '#585248',
                'med-gray': '#CCC',
                'light-gray': '#F4F5F6',
                'light-gray2': '#BFCBD1',
                'light-gray3': '#D7DFE4',
                'light-gray4': '#4D4C49',
                'black': '#000',
                'white': '#FFF',
                'white2': '#FFFDF9',                
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
                'info': '0px 0px 4px 0px rgba(97, 97, 97, 0.25)',
                'mean-popup': '0px 2px 4px 0px rgba(88, 82, 72, 0.20)',
            },
            translate: {
                'neg1': '-0.063rem',
            },
            translate: {
                'neg2': '-0.125rem',
                '20': '1.25rem',
            },
            rotate: {
                '180': '180deg',
            },
            strokeDash: {
                '5': '5',
            },
            screens: {
                'lg': '90rem',
                'xl': '108rem',
            },
        }
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.stroke-dash-5': {
                    'stroke-dasharray': '5',
                },
            });
        },
    ],
    safelist: [
        'tooltip',
        'tooltip-inner',
        'arrow',
        'arrow:before',
        'arrow:after',
        'fill-dark-tan',
        'fill-none',
        'fill-navy',
        'stroke-dark-tan',
        'stroke-tan',
        'stroke-[0.5px]',
        'ui-slider',
        'ui-slider-handle',
        'ui-slider-range',
        'ui-state-focus',
        'max-h-info1',
        'max-h-info2',
        'max-h-info3',
        'max-h-info4',
    ],
}
