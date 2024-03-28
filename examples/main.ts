import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor'

createApp(App)
  .use(router)
  .use(VueMonacoEditorPlugin, {
    paths: {
      // The recommended CDN config
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
    },
  })
  .mount('#app')
