import { createApp } from 'vue'
import { SDK } from '@myback/sdk'
import App from './App.vue'
import bootstrap from './bootstrap'

SDK.init({
  API_TOKEN: 'YOUR_ADMIN_API_KEY',
  DATABASE: 'YOUR_DATABASE_ID',
  STORAGE: 'YOUR_STORAGE_ID',
})

bootstrap().then(() => {
  createApp(App).mount('#app')
})
