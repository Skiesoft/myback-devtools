import { createApp } from 'vue'
import { SDK } from '@myback/sdk'
import App from './App.vue'
import bootstrap from './bootstrap'

SDK.init()

bootstrap().then(() => {
  createApp(App).mount('#app')
})
