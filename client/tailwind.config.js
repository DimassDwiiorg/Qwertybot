/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        claude: {
          bg: {
            light: '#FAF9F5',
            dark: '#18181B'
          },
          card: {
            light: '#FFFFFF',
            dark: '#27272A'
          },
          hover: {
            light: '#F3F2EC',
            dark: '#323238'
          },
          border: {
            light: '#E5E3DB',
            dark: '#3F3F46'
          },
          text: {
            primary: {
              light: '#23201D',
              dark: '#F4F4F5'
            },
            secondary: {
              light: '#65605B',
              dark: '#A1A1AA'
            }
          },
          coral: {
            DEFAULT: '#D97706',
            hover: '#B45309',
            light: '#FEF3C7',
            clay: '#DA7756'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
