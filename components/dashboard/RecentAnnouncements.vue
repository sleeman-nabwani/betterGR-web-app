<template>
  <div class="rounded-lg border bg-card">
    <div class="p-6">
      <h3 class="text-xl font-semibold tracking-tight mb-4">Recent Announcements</h3>
      <div class="space-y-4">
        <div v-for="announcement in announcements" :key="announcement.id" class="space-y-2 pb-4 border-b last:border-b-0 last:pb-0">
          <div class="flex items-center justify-between">
            <h4 class="font-medium">{{ announcement.title }}</h4>
            <span class="text-xs text-muted-foreground">{{ announcement.date }}</span>
          </div>
          <p class="text-sm text-muted-foreground">{{ announcement.content }}</p>
          <div class="flex items-center text-xs text-muted-foreground">
            <MessageSquare class="h-3.5 w-3.5 mr-1" />
            <span>{{ announcement.course }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MessageSquare } from 'lucide-vue-next'

// Sample announcements data
const announcements = [
  {
    id: 1,
    title: 'Midterm Exam Date Change',
    content: 'The midterm exam has been rescheduled to next Tuesday at 10:00.',
    date: 'Today',
    course: 'CS101'
  },
  {
    id: 2,
    title: 'New Assignment Posted',
    content: 'Assignment 3 has been posted. Due date is in two weeks.',
    date: 'Yesterday',
    course: 'MATH201'
  },
  {
    id: 3,
    title: 'Office Hours Canceled',
    content: "Tomorrow's office hours are canceled due to faculty meeting.",
    date: '2 days ago',
    course: 'CS202'
  }
]
</script> 