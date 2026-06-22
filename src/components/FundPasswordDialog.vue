<template>
  <van-overlay :show="show" @click="handleClose">
    <div class="dialog-wrapper" @click.stop>
      <div class="dialog-content">
        <div class="close-btn" @click="handleClose">
          <van-icon name="cross" size="20" color="#999" />
        </div>

        <div class="message">{{ t('fundPassword.message') }}</div>

        <van-button class="confirm-btn" block @click="handleConfirm">{{ t('common.confirm') }}</van-button>
      </div>
    </div>
  </van-overlay>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const handleClose = () => {
  emit('update:show', false)
}

const handleConfirm = () => {
  emit('confirm')
  emit('update:show', false)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.dialog-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 24px;
}

.dialog-content {
  background: #fff;
  border-radius: 16px;
  padding: 48px 24px 24px;
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s;
    touch-action: manipulation;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    &:active {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  .message {
    font-size: 16px;
    line-height: 1.6;
    color: #666;
    text-align: center;
    margin-bottom: 32px;
    padding: 0 8px;
  }

  .confirm-btn {
    background: linear-gradient(135deg, #552583 0%, #7b3fa8 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: bold;
    height: 48px;
    box-shadow: 0 4px 12px rgba(85, 37, 131, 0.3);
    transition: all 0.3s ease;
    touch-action: manipulation;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
}
</style>
