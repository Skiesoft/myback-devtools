import { createApp } from 'vue'
import { SDK } from '@myback/sdk'
import App from './App.vue'

import './assets/app.css'

declare global {
  interface Window {
    API_KEY: string
    ENDPOINT: string
    VERSION: string
    DATABASE: string
  }
}

SDK.init({
  API_KEY: window.API_KEY ?? 'DEVELOPMENT',
  ENDPOINT: window.ENDPOINT ?? 'http://localhost:3000',
  VERSION: window.VERSION ?? 'v1',
  DATABASE: window.DATABASE ?? 'default'
})

createApp(App).mount('#app')
