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
                'blue': '#0B6BC3',
                'navy': '#003049',
                'med-navy': '#2E5367',
                'light-navy-2': '#DFE8EC',
                'tan': '#FEF9EE',
                'dark-tan': '#cac8c1',
                'dark-gray': '#2D2D2D',
                'med-gray': '#CCC',
                'light-gray': '#F4F5F6 ',
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
