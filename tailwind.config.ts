import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        darkest: '#15170D',
        forest:  '#5A653B',
        sage:    '#C0CE83',
        cream:   '#FCFFEB',
      },
      fontFamily: {
        'serif-light':  ['Thmanya-serif-Light', 'Georgia', 'serif'],
        'serif-bold':   ['Thmanya-serif-Bold', 'Georgia', 'serif'],
        'sans-light':   ['Thmanya-sans-Light', 'system-ui', 'sans-serif'],
        'sans-medium':  ['Thmanya-sans-Medium', 'system-ui', 'sans-serif'],
        'sans-bold':    ['Thmanya-sans-Bold', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
