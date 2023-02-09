import { createApp } from 'vue'
import { SDK } from '@myback/sdk'
import App from './App.vue'

declare global {
  interface Window {
    API_TOKEN: string
    ENDPOINT: string
    VERSION: string
    DATABASE: string
  }
}

SDK.init({
  API_TOKEN: window.API_TOKEN ?? 'DEVELOPMENT',
  ENDPOINT: window.ENDPOINT ?? 'http://localhost:3000',
  VERSION: 'v1',
  DATABASE: window.DATABASE ?? 'default'
})

createApp(App).mount('#app')
