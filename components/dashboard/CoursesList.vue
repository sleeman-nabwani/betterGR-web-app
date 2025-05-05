<template>
  <div class="rounded-lg border bg-card">
    <div class="p-6">
      <h3 class="text-xl font-semibold tracking-tight mb-4">Your Courses</h3>
      <div class="space-y-4">
        <div v-for="course in courses" :key="course.id" class="flex items-start gap-4 p-3 rounded-md hover:bg-muted/50 transition-colors">
          <div class="rounded-lg bg-primary/10 p-2">
            <BookOpen class="h-5 w-5 text-primary" />
          </div>
          <div class="w-full">
            <h4 class="font-medium">{{ course.title }}</h4>
            <p class="text-sm text-muted-foreground mb-2">{{ course.code }} • {{ course.instructor }}</p>
            
            <!-- Assignments section -->
            <div v-if="course.assignments && course.assignments.length > 0" class="mt-2">
              <p class="text-xs font-medium text-muted-foreground mb-1">Assignments:</p>
              <ul class="text-sm space-y-1">
                <li v-for="assignment in course.assignments" :key="assignment.id">
                  <NuxtLink 
                    :to="assignment.path" 
                    class="text-primary hover:underline"
                  >
                    {{ assignment.title }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6 flex justify-end">
        <NuxtLink to="/courses" class="text-sm font-medium text-primary hover:underline">View all courses</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BookOpen } from 'lucide-vue-next'

// Sample course data with assignments
const courses = [
  {
    id: 1,
    title: 'Introduction to Computer Science',
    code: 'CS101',
    instructor: 'Dr. John Smith',
    assignments: [
      { 
        id: 1, 
        title: 'Assignment 1 - Basic Programming Concepts',
        path: '/courses/intro-to-cs/assignments/assignment1'
      }
    ]
  },
  {
    id: 2,
    title: 'Data Structures and Algorithms',
    code: 'CS202',
    instructor: 'Prof. Jane Doe',
    assignments: []
  },
  {
    id: 3,
    title: 'Linear Algebra',
    code: 'MATH201',
    instructor: 'Dr. Robert Johnson',
    assignments: []
  }
]
</script> 