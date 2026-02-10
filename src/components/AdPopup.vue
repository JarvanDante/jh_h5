<template>
  <teleport to="body">
    <div v-if="visible && currentAd" class="ad-popup-overlay" @click="handleClose">
      <div class="ad-popup-wrapper" @click.stop>
        <!-- 左箭头 -->
        <div
          v-if="sortedAds.length > 1"
          class="nav-btn nav-prev"
          :class="{ disabled: currentIndex === 0 }"
          @click="prevAd"
        >
          ‹
        </div>

        <div class="ad-popup-content">
          <img
            :src="currentAd.image"
            :alt="currentAd.name"
            class="ad-image"
            @click="handleAdClick(currentAd)"
          />
          <!-- 指示器 -->
          <div v-if="sortedAds.length > 1" class="ad-indicators">
            <span
              v-for="(_, i) in sortedAds"
              :key="i"
              class="dot"
              :class="{ active: i === currentIndex }"
              @click="currentIndex = i"
            />
          </div>
        </div>

        <!-- 右箭头 -->
        <div
          v-if="sortedAds.length > 1"
          class="nav-btn nav-next"
          :class="{ disabled: currentIndex === sortedAds.length - 1 }"
          @click="nextAd"
        >
          ›
        </div>
      </div>

      <!-- 关闭按钮 -->
      <div class="close-btn" @click="handleClose">✕</div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { AdItem } from '@/api/modules/user'

interface Props {
  show: boolean
  ads: AdItem[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'click', ad: AdItem): void
}>()

const router = useRouter()

const visible = ref(props.show)
const currentIndex = ref(0)

const sortedAds = computed(() => [...props.ads].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)))
const currentAd = computed(() => sortedAds.value[currentIndex.value] || null)

watch(
  () => props.show,
  (val) => {
    visible.value = val
    if (val) currentIndex.value = 0
  },
)

const prevAd = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

const nextAd = () => {
  if (currentIndex.value < sortedAds.value.length - 1) currentIndex.value++
}

const handleClose = () => {
  visible.value = false
  emit('update:show', false)
}

const handleAdClick = (ad: AdItem) => {
  emit('click', ad)
  handleClose()
  if (ad.url) {
    // 如果是站内路径（以/开头），用router跳转；否则当前窗口打开外链
    if (ad.url.startsWith('/')) {
      router.push(ad.url)
    } else {
      window.location.href = ad.url
    }
  }
}
</script>

<style lang="scss" scoped>
.ad-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ad-popup-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 16px;
  gap: 8px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  user-select: none;

  &:active {
    transform: scale(0.9);
    background: rgba(255, 255, 255, 0.35);
  }

  &.disabled {
    opacity: 0.3;
    pointer-events: none;
  }
}

.ad-popup-content {
  position: relative;
  width: 100%;
  max-width: 300px;

  .ad-image {
    width: 100%;
    display: block;
    border-radius: 12px;
    cursor: pointer;
  }

  .ad-indicators {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 12px;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      transition: all 0.2s;

      &.active {
        background: #fdb927;
        transform: scale(1.2);
      }
    }
  }
}

.close-btn {
  margin-top: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  font-size: 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transition: all 0.2s;

  &:active {
    transform: scale(0.9);
    background: rgba(255, 255, 255, 0.2);
  }
}
</style>
