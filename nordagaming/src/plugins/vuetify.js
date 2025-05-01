/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: localStorage.getItem('theme') || 'lightTheme',
    themes: {
      lightTheme: {
        dark: false,
        colors: {
          background: '#FFFFFF',
          primary: '#1976D2',
          secondary: '#424242',
        },
      },
      darkTheme: {
        dark: true,
        colors: {
          background: '#121212',
          primary: '#BB86FC',
          secondary: '#03DAC6',
        },
      },
    },
  },
})
