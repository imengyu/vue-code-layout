import DefaultTheme from 'vitepress/theme';
import MySandbox from './MySandbox.vue';
import { Sandbox } from 'vitepress-plugin-sandpack';
import 'vitepress-plugin-sandpack/dist/style.css';

export default {
  ...DefaultTheme,
  async enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx);
    if (!import.meta.env.SSR) {
      const plugin = await import('../../../library')
      ctx.app.use(plugin.default)
    }
    ctx.app.component('Sandbox', Sandbox);
    ctx.app.component('MySandbox', MySandbox);
  },
}