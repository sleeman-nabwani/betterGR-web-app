<template>
  <div class="mb-8 rounded-lg border bg-card p-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight mb-1">
          Welcome back, Student
        </h1>
        <p class="text-muted-foreground">
          Current semester: {{ semesterName }}
        </p>
      </div>
      <div class="hidden md:block">
        <div class="text-primary h-16 w-16 flex items-center justify-center text-2xl font-bold">
          T
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  semesterName: {
    type: String,
    required: true
  }
})
</script> 