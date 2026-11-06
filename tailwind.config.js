/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        handwriting: ['"Comic Sans MS"', '"Kaiti SC"', 'KaiTi', 'cursive'],
        serif: ['Georgia', '"Songti SC"', 'serif'],
        mono: ['ui-monospace', '"SFMono-Regular"', 'Consolas', 'monospace'],
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
