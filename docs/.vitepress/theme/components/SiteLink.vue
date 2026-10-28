<script setup lang="ts">
// 导航里回官网的链接。带 target 属性，VitePress 路由不会拦截，
// 也不会像普通导航链接那样被加上 /docs/ 前缀。
defineProps<{ text: string; href: string; screenMenu?: boolean }>()
</script>

<template>
  <a :class="screenMenu ? 'site-link--screen' : 'site-link'" :href="href" target="_self">{{ text }}</a>
</template>

<style scoped>
.site-link {
  display: flex;
  align-items: center;
  padding: 0 12px;
  line-height: var(--vp-nav-height);
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.site-link--screen {
  display: block;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 12px 0 11px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.site-link:hover,
.site-link--screen:hover {
  color: var(--vp-c-brand-1);
}
</style>
