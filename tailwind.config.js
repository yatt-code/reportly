/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Include pages if using Pages Router
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Include app directory
  ],
  theme: {
    extend: {
      // Add custom theme extensions here
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
      // Add any Tailwind plugins here (e.g., @tailwindcss/typography, @tailwindcss/forms)
      require('@tailwindcss/typography'), // Example: Add typography plugin
  ],
}