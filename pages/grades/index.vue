<template>
  <div class="py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight mb-2">Grades</h1>
        <p class="text-muted-foreground">
          View and track your academic performance for {{ currentSemester.name }}
        </p>
      </div>
    </div>

    <div class="space-y-8">
      <div v-for="course in filteredCourses" :key="course.id" class="rounded-lg border bg-card overflow-hidden">
        <div class="bg-muted/50 p-6 border-b">
          <h2 class="text-xl font-semibold">{{ course.title }}</h2>
          <div class="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <Bookmark class="h-4 w-4" />
              <span>{{ course.code }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Calendar class="h-4 w-4" />
              <span>{{ course.semester }}</span>
            </div>
            <div class="flex items-center gap-2">
              <User class="h-4 w-4" />
              <span>{{ course.instructor }}</span>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <!-- Overall grade summary -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium mb-1">Overall Grade</h3>
              <p class="text-sm text-muted-foreground">Based on current completed assessments</p>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold">{{ course.grade.letter }}</div>
              <div class="text-sm text-muted-foreground">{{ course.grade.percentage }}%</div>
            </div>
          </div>
          
          <!-- Grade breakdown table -->
          <div class="border rounded-md">
            <div class="grid grid-cols-12 gap-4 p-4 border-b font-medium text-sm">
              <div class="col-span-5">Assessment</div>
              <div class="col-span-2">Type</div>
              <div class="col-span-2">Weight</div>
              <div class="col-span-3 text-right">Score</div>
            </div>
            <div v-for="assessment in course.assessments" :key="assessment.id" class="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 text-sm">
              <div class="col-span-5">{{ assessment.title }}</div>
              <div class="col-span-2">{{ assessment.type }}</div>
              <div class="col-span-2">{{ assessment.weight }}%</div>
              <div class="col-span-3 text-right">
                <span v-if="assessment.completed">{{ assessment.score }}%</span>
                <span v-else class="text-muted-foreground italic">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bookmark, Calendar, User, Check, X } from 'lucide-vue-next'
import { useSemester } from '~/composables/useSemester'

// Get semester data from our composable
const { currentSemester, filterBySemester } = useSemester()

// This will be replaced with real data from the API
const courses = [
  {
    id: 6,
    title: 'Advanced Web Development',
    code: 'CS304',
    semester: 'Spring 2025',
    semesterId: 'spring2025',
    instructor: 'Dr. Michael Brown',
    grade: {
      letter: 'In Progress',
      percentage: null
    },
    assessments: [
      {
        id: 1,
        title: 'Web Framework Quiz',
        type: 'Quiz',
        weight: 10,
        score: null,
        completed: false
      },
      {
        id: 2,
        title: 'Frontend Assignment',
        type: 'Assignment',
        weight: 20,
        score: null,
        completed: false
      },
      {
        id: 3,
        title: 'Midterm Project',
        type: 'Project',
        weight: 30,
        score: null,
        completed: false
      },
      {
        id: 4,
        title: 'Backend Assignment',
        type: 'Assignment',
        weight: 15,
        score: null,
        completed: false
      },
      {
        id: 5,
        title: 'Final Project',
        type: 'Project',
        weight: 25,
        score: null,
        completed: false
      }
    ]
  },
  {
    id: 7,
    title: 'Machine Learning Fundamentals',
    code: 'CS410',
    semester: 'Spring 2025',
    semesterId: 'spring2025',
    instructor: 'Dr. Lisa Wang',
    grade: {
      letter: 'In Progress',
      percentage: null
    },
    assessments: [
      {
        id: 1,
        title: 'ML Algorithms Quiz',
        type: 'Quiz',
        weight: 10,
        score: null,
        completed: false
      },
      {
        id: 2,
        title: 'Data Preprocessing',
        type: 'Assignment',
        weight: 15,
        score: null,
        completed: false
      },
      {
        id: 3,
        title: 'Midterm Exam',
        type: 'Exam',
        weight: 25,
        score: null,
        completed: false
      },
      {
        id: 4,
        title: 'Neural Network Project',
        type: 'Project',
        weight: 25,
        score: null,
        completed: false
      },
      {
        id: 5,
        title: 'Final Exam',
        type: 'Exam',
        weight: 25,
        score: null,
        completed: false
      }
    ]
  },
  {
    id: 1,
    title: 'Introduction to Computer Science',
    code: 'CS101',
    semester: 'Winter 2024',
    semesterId: 'winter2024',
    instructor: 'Dr. Adam Chen',
    grade: {
      letter: 'A-',
      percentage: 91
    },
    assessments: [
      {
        id: 1,
        title: 'Programming Quiz 1',
        type: 'Quiz',
        weight: 10,
        score: 85,
        completed: true
      },
      {
        id: 2,
        title: 'Programming Assignment 1',
        type: 'Assignment',
        weight: 15,
        score: 92,
        completed: true
      },
      {
        id: 3,
        title: 'Midterm Exam',
        type: 'Exam',
        weight: 25,
        score: 88,
        completed: true
      },
      {
        id: 4,
        title: 'Programming Assignment 2',
        type: 'Assignment',
        weight: 15,
        score: 95,
        completed: true
      },
      {
        id: 5,
        title: 'Final Exam',
        type: 'Exam',
        weight: 35,
        score: 93,
        completed: true
      }
    ]
  },
  {
    id: 2,
    title: 'Data Structures and Algorithms',
    code: 'CS202',
    semester: 'Winter 2024',
    semesterId: 'winter2024',
    instructor: 'Dr. Sarah Wilson',
    grade: {
      letter: 'In Progress',
      percentage: null
    },
    assessments: [
      {
        id: 1,
        title: 'Algorithmic Analysis Quiz',
        type: 'Quiz',
        weight: 10,
        score: 78,
        completed: true
      },
      {
        id: 2,
        title: 'Data Structures Assignment',
        type: 'Assignment',
        weight: 20,
        score: 88,
        completed: true
      },
      {
        id: 3,
        title: 'Midterm Exam',
        type: 'Exam',
        weight: 25,
        score: 83,
        completed: true
      },
      {
        id: 4,
        title: 'Algorithm Implementation',
        type: 'Assignment',
        weight: 20,
        score: null,
        completed: false
      },
      {
        id: 5,
        title: 'Final Exam',
        type: 'Exam',
        weight: 25,
        score: null,
        completed: false
      }
    ]
  },
  {
    id: 3,
    title: 'Linear Algebra',
    code: 'MATH201',
    semester: 'Fall 2023',
    semesterId: 'fall2023',
    instructor: 'Dr. Robert Johnson',
    grade: {
      letter: 'A',
      percentage: 95
    },
    assessments: [
      {
        id: 1,
        title: 'Matrix Operations Quiz',
        type: 'Quiz',
        weight: 10,
        score: 92,
        completed: true
      },
      {
        id: 2,
        title: 'Vector Spaces Assignment',
        type: 'Assignment',
        weight: 15,
        score: 97,
        completed: true
      },
      {
        id: 3,
        title: 'Midterm Exam',
        type: 'Exam',
        weight: 30,
        score: 94,
        completed: true
      },
      {
        id: 4,
        title: 'Eigenvalues & Eigenvectors Assignment',
        type: 'Assignment',
        weight: 15,
        score: 98,
        completed: true
      },
      {
        id: 5,
        title: 'Final Exam',
        type: 'Exam',
        weight: 30,
        score: 95,
        completed: true
      }
    ]
  }
]

// Use the global semester filter function
const filteredCourses = computed(() => filterBySemester(courses))
</script> 