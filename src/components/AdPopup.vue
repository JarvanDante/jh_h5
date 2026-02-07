<template>
  <teleport to="body">
    <div v-if="visible" class="ad-popup-overlay" @click="handleClose">
      <div class="ad-popup-wrapper" @click.stop>
        <div class="ad-popup-content">
          <!-- 广告图片列表（竖向排列，不可左右滑动） -->
          <div class="ad-list">
            <img
              v-for="(ad, index) in ads"
              :key="index"
              :src="ad.image"
              :alt="ad.name"
              class="ad-image"
              @click="handleAdClick(ad)"
            />
          </div>

          <!-- 关闭按钮（底部居中） -->
          <div class="close-btn" @click="handleClose">✕</div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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

watch(
  () => props.show,
  (val) => {
    visible.value = val
  },
)

const handleClose = () => {
  visible.value = false
  emit('update:show', false)
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

  .close-btn {
    margin: 16px auto 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
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

  .ad-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ad-image {
    width: 100%;
    display: block;
    border-radius: 12px;
    cursor: pointer;
  }
}
</style>
