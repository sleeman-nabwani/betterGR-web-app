<template>
  <div class="rounded-lg border bg-card p-6">
    <div class="flex items-center gap-4">
      <div class="rounded-full bg-primary/10 p-3">
        <BookOpen class="h-5 w-5 text-primary" />
      </div>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Enrolled Courses</div>
        <div class="text-2xl font-bold">{{ coursesCount }}</div>
      </div>
    </div>
  </div>
  
  <div class="rounded-lg border bg-card p-6">
    <div class="flex items-center gap-4">
      <div class="rounded-full bg-primary/10 p-3">
        <ClipboardList class="h-5 w-5 text-primary" />
      </div>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Pending Assignments</div>
        <div class="text-2xl font-bold">{{ pendingAssignments }}</div>
      </div>
    </div>
  </div>
  
  <div class="rounded-lg border bg-card p-6">
    <div class="flex items-center gap-4">
      <div class="rounded-full bg-primary/10 p-3">
        <CalendarClock class="h-5 w-5 text-primary" />
      </div>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Upcoming Deadlines</div>
        <div class="text-2xl font-bold">{{ upcomingDeadlines }}</div>
        <div class="text-xs text-muted-foreground">Within the next 7 days</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BookOpen, ClipboardList, CalendarClock } from 'lucide-vue-next'

defineProps({
  coursesCount: {
    type: Number,
    default: 0
  },
  pendingAssignments: {
    type: Number,
    default: 0
  },
  upcomingDeadlines: {
    type: Number,
    default: 0
  }
})
</script> 