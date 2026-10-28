<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

interface Promo {
  id: string
  title: string
  description?: string
  image?: string
  link: string
  cta?: string
  // 投放位置：aside 右侧栏，footer 正文末尾；省略表示两处都投放
  placements?: Array<'aside' | 'footer'>
  weight?: number
}

const props = defineProps<{ placement: 'aside' | 'footer' }>()

// 默认读取站内 public/promos/promos.json；构建时设置
// VITE_PROMO_URL 可改为 R2 等外部地址，换推广内容无需重新构建。
const source = import.meta.env.VITE_PROMO_URL || withBase('/promos/promos.json')

const promo = ref<Promo | null>(null)

// 只在客户端加载，避免服务端渲染和水合结果不一致；加载失败时不占位。
onMounted(async () => {
  try {
    const response = await fetch(source)
    if (!response.ok) return
    const list: Promo[] = await response.json()
    promo.value = pick(list.filter((item) => !item.placements || item.placements.includes(props.placement)))
  } catch {
    promo.value = null
  }
})

function pick(list: Promo[]): Promo | null {
  const total = list.reduce((sum, item) => sum + (item.weight ?? 1), 0)
  let roll = Math.random() * total
  for (const item of list) {
    roll -= item.weight ?? 1
    if (roll < 0) return item
  }
  return null
}

const href = computed(() => {
  if (!promo.value) return ''
  const url = new URL(promo.value.link, window.location.href)
  if (url.origin !== window.location.origin) {
    url.searchParams.set('utm_source', 'manual')
    url.searchParams.set('utm_medium', props.placement)
    url.searchParams.set('utm_campaign', promo.value.id)
  }
  return url.toString()
})
</script>

<template>
  <a
    v-if="promo"
    :class="['promo-card', `promo-card--${placement}`]"
    :href="href"
    target="_blank"
    rel="noopener sponsored"
  >
    <img v-if="promo.image" class="promo-card__image" :src="withBase(promo.image)" alt="" loading="lazy" />
    <span class="promo-card__body">
      <span class="promo-card__label">推荐</span>
      <strong class="promo-card__title">{{ promo.title }}</strong>
      <span v-if="promo.description" class="promo-card__desc">{{ promo.description }}</span>
      <span class="promo-card__cta">{{ promo.cta ?? '了解更多' }} →</span>
    </span>
  </a>
</template>

<style scoped>
.promo-card {
  display: block;
  margin-top: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: border-color 0.2s;
}

.promo-card:hover {
  border-color: var(--vp-c-brand-1);
}

.promo-card__image {
  display: block;
  width: 100%;
  aspect-ratio: 2 / 1;
  object-fit: cover;
}

.promo-card__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px 14px;
}

.promo-card__label {
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.promo-card__title {
  font-size: 14px;
  line-height: 1.4;
}

.promo-card__desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.promo-card__cta {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

/* 正文末尾横向排列，只在右侧栏不可见时显示（默认主题 1280px 起显示右侧栏） */
.promo-card--footer {
  display: none;
}

@media (max-width: 1279px) {
  .promo-card--footer {
    display: flex;
    margin: 32px 0 0;
  }

  .promo-card--footer .promo-card__image {
    width: 160px;
    flex-shrink: 0;
    aspect-ratio: auto;
  }
}

@media (max-width: 480px) {
  .promo-card--footer {
    flex-direction: column;
  }

  .promo-card--footer .promo-card__image {
    width: 100%;
    aspect-ratio: 2 / 1;
  }
}
</style>
