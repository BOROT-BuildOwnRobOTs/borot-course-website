/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 PostCSS plugin — must come before autoprefixer
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}

export default config
