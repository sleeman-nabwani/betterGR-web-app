<script setup>
import { NuxtLink } from '#components'
</script>

<template>
  <NuxtLink 
    :to="`/courses/${course.slug}`" 
    class="text-sm font-medium text-primary hover:underline"
  >
    View Course
  </NuxtLink>
</template> 