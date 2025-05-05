<template>
  <div class="container py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">My Courses</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink 
        v-for="course in courses" 
        :key="course.slug"
        :to="`/courses/${course.slug}`"
        class="group flex flex-col border rounded-lg overflow-hidden hover:border-primary focus:border-primary hover:bg-muted/20 transition-colors"
      >
        <div class="bg-muted/40 p-6 flex items-center gap-4">
          <div class="rounded-lg bg-primary/10 p-3 text-primary">
            <BookOpen class="h-5 w-5" />
          </div>
          <div>
            <h3 class="font-semibold tracking-tight">{{ course.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ course.code }}</p>
          </div>
        </div>
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div class="text-sm text-muted-foreground space-y-2">
            <div class="flex items-center gap-2">
              <Calendar class="h-4 w-4" />
              <span>{{ course.semester }}</span>
            </div>
            <div class="flex items-center gap-2">
              <User class="h-4 w-4" />
              <span>{{ course.instructor }}</span>
            </div>
            <div class="flex items-center gap-2">
              <GraduationCap class="h-4 w-4" />
              <span>{{ course.credits }} Credits</span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { BookOpen, Calendar, User, GraduationCap } from 'lucide-vue-next'
import { courses } from '@/data/courses'
</script>