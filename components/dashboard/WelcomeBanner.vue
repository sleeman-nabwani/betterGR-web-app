<template>
  <div class="mb-8 rounded-lg border bg-card p-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight mb-1">
          Welcome back, {{ studentDisplayName }}
        </h1>
        <p class="text-muted-foreground">
          Current semester: {{ semesterName }}
        </p>
        <!-- Debug info during development -->
        <div v-if="loading" class="text-xs text-muted-foreground">
          Loading student data...
        </div>
        <div v-if="error" class="text-xs text-red-500">
          Error: {{ error.message }}
        </div>
      </div>
      <div class="hidden md:block">
        <div class="text-primary h-16 w-16 flex items-center justify-center text-2xl font-bold">
          T
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStudent } from '~/composables/useStudent'
import { onMounted, computed } from 'vue'

interface Props {
  semesterName: string
}

const props = defineProps<Props>()

// Get student data
const { student, loading, error, fetchStudent } = useStudent()

// Computed property for student display name
const studentDisplayName = computed(() => {
  if (loading.value) return 'Loading...'
  if (error.value) return 'Student'
  if (student.value) {
    return `${student.value.firstName} ${student.value.lastName}`
  }
  return 'Student'
})

// Fetch student data when component mounts
onMounted(async () => {
  try {
    await fetchStudent()
  } catch (err) {
    console.error('WelcomeBanner: Error fetching student:', err)
  }
})
</script>