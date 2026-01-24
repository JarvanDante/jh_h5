<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cacheViews">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const cacheViews = computed(() => appStore.cacheViews);
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
}
</style>
