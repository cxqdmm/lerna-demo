/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 自定义颜色
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      // 自定义字体
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // 自定义间距
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      // 自定义断点
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [
    // 可以添加更多插件，如：
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};
