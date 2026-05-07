/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'yt-black': '#0f0f0f',
        'yt-grey': '#f9f9f9',
        'yt-border': '#e5e5e5',
        'yt-red': '#ff0000',
        'yt-blue': '#065fd4',
        'yt-text': '#0f0f0f',
        'yt-text-dim': '#606060',
        'toxic': '#d93025',
        'positive': '#2ba640',
        'neutral': '#606060',
        'pending': '#f39c12',
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
