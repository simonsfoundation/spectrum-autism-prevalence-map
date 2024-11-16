/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        '/ts/**/*.ts',
        '../../templates/autism_prevalence/*.html'
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
            },

        }
    },
    plugins: [
    ],
    safelist: [
    ],
}
