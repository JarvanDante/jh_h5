import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

// Vant 样式
import 'vant/lib/index.css'
// 全局样式
import './styles/index.scss'

// 在桌面端使用时，可以使用 touch-emulator 模拟移动端 touch 事件
import '@vant/touch-emulator'

if (import.meta.env.VITE_ENABLE_VCONSOLE === '1') {
  import('vconsole')
    .then(({ default: VConsole }) => {
      new VConsole()
      console.log('[debug] vConsole enabled')
    })
    .catch((err) => {
      console.error('[debug] failed to load vConsole', err)
    })
}

const app = createApp(App)

// Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')
