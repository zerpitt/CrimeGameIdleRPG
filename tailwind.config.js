/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Theme Colors from Spec
                void: '#0B0C10',
                surface: '#161A22',
                primaryText: '#E6E8EC',
                money: '#1ED760', // Green
                risk: '#D72638',  // Red
                gold: '#F5C542',  // Legendary/Prestige
                neutral: '#3A3F55',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
