/** @type {import('tailwindcss').Config} */
const config = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#74EED8",
                secondary: "#35A893",
            },
        },
    },
    plugins: [],
};

export default config;
