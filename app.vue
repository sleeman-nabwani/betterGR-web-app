<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

const colorMode = useColorMode()
</script>