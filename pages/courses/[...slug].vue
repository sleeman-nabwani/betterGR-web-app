<template>
  <div>
    <!-- Breadcrumb navigation -->
    <div class="border-b mb-8">
      <div class="container py-4">
        <div class="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <NuxtLink to="/" class="hover:text-foreground transition-colors">Home</NuxtLink>
          <ChevronRight class="h-4 w-4" />
          <NuxtLink to="/courses" class="hover:text-foreground transition-colors">Courses</NuxtLink>
          <ChevronRight class="h-4 w-4" />
          <span class="text-foreground">{{ course.title }}</span>
        </div>
      </div>
    </div>
    
    <div class="container pb-8">
      <!-- Title and metadata at the top -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight mb-4">{{ course.title }}</h1>
        <div class="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <div class="flex items-center gap-1">
            <Calendar class="h-4 w-4" />
            <span>{{ course.semester }}</span>
          </div>
          <div class="flex items-center gap-1">
            <User class="h-4 w-4" />
            <span>{{ course.instructor }}</span>
          </div>
          <div class="flex items-center gap-1">
            <GraduationCap class="h-4 w-4" />
            <span>{{ course.credits }} Credits</span>
          </div>
        </div>
      </div>
      
      <!-- Two-column layout: Sidebar and Content -->
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar on the left with sticky positioning -->
        <div class="lg:w-1/4 relative">
          <div class="sticky top-20">
            <CourseSidebar :sections="course.sections || []" />
          </div>
        </div>
        
        <!-- Course content on the right -->
        <div class="lg:w-3/4 prose dark:prose-invert max-w-none">
          <!-- Display course content if available -->
          <ContentRenderer v-if="courseContent" :value="courseContent" />
          
          <!-- Fallback content if no markdown is found -->
          <div v-else id="overview">
            <h2 class="text-2xl font-bold mb-4">Course Overview</h2>
            <p>This course provides an introduction to {{ course.title }} concepts and techniques.</p>
            
            <!-- Display course sections -->
            <div v-if="course.sections && course.sections.length > 0">
              <div v-for="(section, index) in course.sections" :key="index" class="mt-6">
                <h3 class="text-xl font-bold mb-2">{{ section.title }}</h3>
                <p v-if="section.description">{{ section.description }}</p>
                <ul v-if="section.items && section.items.length > 0" class="mt-2 space-y-1">
                  <li v-for="(item, itemIndex) in section.items" :key="itemIndex" class="flex items-start">
                    <div class="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <p class="text-muted-foreground mt-4">Detailed course content is available in the course materials section.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, User, GraduationCap, ChevronRight } from 'lucide-vue-next'
import { useRoute } from '#imports'
import { computed } from 'vue'
import { courses } from '@/data/courses'

// Define page metadata
definePageMeta({
  name: 'course-detail'
})

// Get the route parameter
const route = useRoute()
const slug = route.params.slug

// Find the course using the slug from the URL
const course = computed(() => {
  return courses.find(c => c.slug === slug[0] || c.slug === slug)
})

// Fetch the course content using the new collection API
const { data: courseContent } = await useAsyncData(
  `course-${slug}`,
  () => queryCollection('courses').where({ _path: `/courses/${slug}` }).findOne()
)
</script> 