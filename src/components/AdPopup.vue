<template>
  <teleport to="body">
    <div v-if="visible && currentAd" class="ad-popup-overlay" @click="handleClose">
      <div class="ad-popup-wrapper" @click.stop>
        <div class="ad-popup-content">
          <img
            :src="currentAd.image"
            :alt="currentAd.name"
            class="ad-image"
            @click="handleAdClick(currentAd)"
          />
          <!-- 关闭按钮 -->
          <div class="close-btn" @click="handleClose">✕</div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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

const visible = ref(props.show)
const currentIndex = ref(0)

// 按 sort 从小到大排序
const sortedAds = computed(() => [...props.ads].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)))

const currentAd = computed(() => sortedAds.value[currentIndex.value] || null)

watch(
  () => props.show,
  (val) => {
    visible.value = val
    if (val) {
      currentIndex.value = 0
    }
  },
)

const handleClose = () => {
  // 还有下一个广告，显示下一个
  if (currentIndex.value < sortedAds.value.length - 1) {
    currentIndex.value++
  } else {
    // 全部关完
    visible.value = false
    emit('update:show', false)
  }
}

const handleAdClick = (ad: AdItem) => {
  emit('click', ad)
  if (ad.url) {
    window.open(ad.url, '_blank')
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
  align-items: center;
  justify-content: center;
}

.ad-popup-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 32px;
}

.ad-popup-content {
  position: relative;
  width: 100%;
  max-width: 340px;

  .ad-image {
    width: 100%;
    display: block;
    border-radius: 12px;
    cursor: pointer;
  }

  .close-btn {
    margin: 16px auto 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    font-size: 14px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    transition: all 0.2s;

    &:active {
      transform: scale(0.9);
      background: rgba(255, 255, 255, 0.2);
    }
  }
}
</style>
