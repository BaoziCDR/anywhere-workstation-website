import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import PromoCard from './components/PromoCard.vue'
import SiteLink from './components/SiteLink.vue'
import './custom.css'

// 推广位挂在默认主题插槽上：宽屏显示在右侧大纲下方，
// 右侧栏隐藏时（窄屏、手机）改为显示在正文末尾。
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('SiteLink', SiteLink)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-ads-before': () => h(PromoCard, { placement: 'aside' }),
      'doc-footer-before': () => h(PromoCard, { placement: 'footer' }),
    })
  },
}
