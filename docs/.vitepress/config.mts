import { defineConfig } from 'vitepress';
import { renderSandbox } from 'vitepress-plugin-sandpack';
import MarkdownPreview, { } from 'vite-plugin-markdown-preview'
import container from 'markdown-it-container';
import { resolve } from 'path';

export default defineConfig({
  base: '/vue-code-layout-docs/',
  lang: 'zh-CN',
  title: 'vue-code-layout',
  description: 'Vue 仿 VSCode 布局组件',
  locales: {
    root: {
      label: '中文',
      lang: 'zh',
    },
    en: {
      label: 'English',
      lang: 'en', 
      description: 'A layout component like VSCode.',  
      themeConfig: {
        socialLinks: [
          { icon: 'github', link: 'https://github.com/imengyu/vue-code-layout' },
        ],
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2024 imengyu.top'
        },
        nav: [
          { text: 'Guide', link: '/en/guide/start' },
          { text: 'API Reference', link: '/en/api/CodeLayout' },
          { text: 'Changelog', link: '/change/index' },
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Start',
              items: [
                { text: 'Start', link: '/en/guide/start' },
                { text: 'Install', link: '/en/guide/install' },
                { text: 'Introduce', link: '/en/guide/useage' },
                { text: 'I18n', link: '/en/guide/i18n' },
              ]
            },
            {
              text: 'Component',
              items: [
                { text: 'CodeLayout', link: '/en/guide/code-layout' },
                { text: 'SplitLayout', link: '/en/guide/split-layout' },
              ]
            },
            {
              text: 'Customize',
              items: [
                { text: 'Customize', link: '/en/guide/customize' },
              ]
            },
          ],
          '/en/api/': [
            { text: 'CodeLayout', link: '/en/api/CodeLayout' },
            { text: 'SplitLayout', link: '/en/api/SplitLayout' },
            { text: 'SplitN', link: '/en/api/SplitN' },
            { text: 'SplitTabItem', link: '/en/api/SplitTabItem' },
            { text: 'CodeLayoutActionsRender', link: '/en/api/CodeLayoutActionsRender' },
            { text: 'CodeLayoutCustomizeLayout', link: '/en/api/CodeLayoutCustomizeLayout' },
            { text: 'OverflowCollapseList', link: '/en/api/OverflowCollapseList' },
          ]
        }
      }
    },
  },
  themeConfig: {
    socialLinks: [
      { 
        icon: {
          svg: '<svg role="img" viewBox="0 0 1024 1024"><path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z"/></svg>'
        },
        link: 'https://gitee.com/imengyu/vue-code-layout'
      },
      { icon: 'github', link: 'https://github.com/imengyu/vue-code-layout' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 imengyu.top'
    },
    nav: [
      { text: '教程', link: '/guide/install' },
      { text: 'API 参考', link: '/api/CodeLayout' },
      { text: '更新日志', link: '/change/index' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '起步',
          items: [
            { text: '开始之前', link: '/guide/start' },
            { text: '安装', link: '/guide/install' },
            { text: '介绍', link: '/guide/useage' },
            { text: '国际化', link: '/guide/i18n' },
          ]
        },
        {
          text: '组件',
          items: [
            { text: 'CodeLayout', link: '/guide/code-layout' },
            { text: 'SplitLayout', link: '/guide/split-layout' },
          ]
        },
        {
          text: '美化与自定义',
          items: [
            { text: '自定义样式', link: '/guide/customize' },
          ]
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'CodeLayout', link: '/api/CodeLayout' },
            { text: 'SplitLayout', link: '/api/SplitLayout' },
            { text: 'SplitN', link: '/api/SplitN' },
            { text: 'SplitTabItem', link: '/api/SplitTabItem' },
            { text: 'CodeLayoutActionsRender', link: '/api/CodeLayoutActionsRender' },
            { text: 'CodeLayoutCustomizeLayout', link: '/api/CodeLayoutCustomizeLayout' },
            { text: 'OverflowCollapseList', link: '/api/OverflowCollapseList' },
          ]
        },
      ]
    },
    search: {
      provider: 'local'
    },
  },  
  vite: {
    plugins: [ MarkdownPreview() as any ],
    ssr: {
      noExternal: [
        '@imengyu/vue-scroll-rect',
        '@imengyu/vue3-context-menu',
        'vue',
      ]
    },
    resolve: {
      alias: {
        'vue-code-layout': resolve(__dirname, '../../library')
      },
    },
  },
  markdown: {
    config(md) {
      md
        // the second parameter is html tag name
        .use(container, 'sandbox', {
          render (tokens, idx) {
            return renderSandbox(tokens, idx, 'sandbox');
          },
        })
        .use(container, 'my-sandbox', {
          render (tokens, idx) {
            return renderSandbox(tokens, idx, 'my-sandbox');
          },
        })
    },
  },
});