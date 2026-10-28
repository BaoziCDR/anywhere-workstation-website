import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'AnyWhere WorkStation',
  description: 'AnyWhere WorkStation 使用手册',
  // 手册挂在官网的 /docs/ 下，构建产物直接输出到合并目录
  base: '/docs/',
  outDir: '../dist/docs',
  cleanUrls: true,
  lastUpdated: true,
  // head 里的地址不会自动加 base
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/logo.svg' }]],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: '使用手册',

    nav: [
      { text: '快速上手', link: '/guide/getting-started' },
      { text: '功能', link: '/features/files' },
      { text: '维护', link: '/maintenance/upgrade' },
      { text: '常见问题', link: '/faq' },
      // 普通导航链接会被加上 base，回官网用自定义组件
      { component: 'SiteLink', props: { text: '官网', href: '/' } },
    ],

    sidebar: [
      {
        text: '开始',
        items: [
          { text: '快速上手', link: '/guide/getting-started' },
          { text: '激活与授权', link: '/guide/activation' },
        ],
      },
      {
        text: '日常使用',
        items: [
          { text: '文件传输', link: '/features/files' },
          { text: '共享目录', link: '/features/shares' },
          { text: '终端与快捷键', link: '/features/terminal' },
          { text: '网络与时区', link: '/features/network' },
        ],
      },
      {
        text: '维护与恢复',
        items: [
          { text: '组件更新', link: '/maintenance/upgrade' },
          { text: '后台与退出', link: '/maintenance/background' },
        ],
      },
      { text: '常见问题', link: '/faq' },
    ],

    search: {
      provider: 'local',
      options: {
        // 默认按空格分词，中文连续文本搜不到。中文按相邻两字切分（二元组），
        // 构建索引（Node）和浏览器查询得到相同结果；Intl.Segmenter 两端词典不同，会对不上。
        miniSearch: {
          options: {
            tokenize: (text: string) => {
              const tokens: string[] = []
              for (const run of text.match(/\p{Script=Han}+|[\p{L}\p{N}_]+/gu) ?? []) {
                if (!/\p{Script=Han}/u.test(run) || run.length === 1) {
                  tokens.push(run)
                  continue
                }
                for (let i = 0; i < run.length - 1; i++) tokens.push(run.slice(i, i + 2))
              }
              return tokens
            },
          },
          searchOptions: { combineWith: 'AND' },
        },
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '没有找到相关结果',
            resetButtonTitle: '清除',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: { text: '最后更新' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色',
    darkModeSwitchTitle: '切换到深色',
  },
})
