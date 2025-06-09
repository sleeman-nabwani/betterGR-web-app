import { computed, ref, watch } from 'vue'
import { useAuth } from './useAuth.js'
import { useGraphQL } from './useGraphQL.js'
import { useSemesters } from './useSemesters.js'

// Grade interface
interface Grade {
  id: string
  studentId: string
  courseId: string
  semester: string
  gradeType: string
  itemId: string
  gradeValue: string
  gradedBy?: string
  comments?: string
  gradedAt: string
  updatedAt: string
}

interface Course {
  id: string
  name: string
  semester: string
  description?: string
}

interface CourseGradesGroup {
  course: Course
  grades: Grade[]
}

export function useGrades() {
  const { userId, isAuthenticated } = useAuth()
  const { getCourses, getGrades } = useGraphQL()
  const { currentSemester } = useSemesters()

  // State
  const courses = ref<Course[]>([])
  const grades = ref<Grade[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Computed property to group grades by course
  const courseGrades = computed(() => {
    const groupedData: CourseGradesGroup[] = []
    
    // Get unique courses from grades
    const uniqueCourses = new Map()
    
    grades.value.forEach((grade: Grade) => {
      if (!uniqueCourses.has(grade.courseId)) {
        // Find course info or create placeholder
        const courseInfo = courses.value.find((c: Course) => c.id === grade.courseId) || {
          id: grade.courseId,
          name: `Course ${grade.courseId}`,
          semester: grade.semester,
          description: null
        }
        uniqueCourses.set(grade.courseId, courseInfo)
      }
    })
    
    // Create grouped data structure
    uniqueCourses.forEach((course, courseId) => {
      const courseGradeList = grades.value.filter((grade: Grade) => grade.courseId === courseId)
      groupedData.push({
        course,
        grades: courseGradeList
      })
    })
    
    return groupedData
  })

  // Fetch student courses using auto-generated function
  async function fetchCourses() {
    if (!isAuthenticated.value || !userId.value) return
    
    try {
      const coursesData = await getCourses(userId.value)
      courses.value = coursesData || []
    } catch (err) {
      console.error('Error fetching courses:', err)
      courses.value = []
    }
  }

  // Fetch grades for current semester using auto-generated function
  async function fetchGrades() {
    if (!isAuthenticated.value || !userId.value) {
      error.value = new Error('You must be logged in to view grades')
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      // Fetch courses first
      await fetchCourses()
      
      // Get grades using the auto-generated function
      let gradesData
      if (currentSemester.value.id === 'all') {
        // Get all grades (no course filter)
        gradesData = await getGrades(userId.value)
      } else {
        // Get grades for specific semester
        // Note: The auto-generated function might need semester filtering on the server side
        // For now, we'll get all grades and filter client-side
        gradesData = await getGrades(userId.value)
        
        // Filter by semester if not "all"
        if (currentSemester.value.name) {
          gradesData = gradesData.filter((grade: Grade) => 
            grade.semester === currentSemester.value.name
          )
        }
      }
      
      grades.value = gradesData || []
      console.log('Received grades:', gradesData)
    } catch (err) {
      console.error('Error fetching grades:', err)
      
      // Handle specific GraphQL errors more gracefully
      const errorMessage = err instanceof Error ? err.message : String(err)
      
      if (errorMessage.includes('Unimplemented') || errorMessage.includes('unknown service')) {
        error.value = new Error('Grades service is currently unavailable. Please try again later.')
      } else if (errorMessage.includes('must be provided')) {
        error.value = new Error('Invalid request. Please refresh the page and try again.')
      } else {
        error.value = new Error(errorMessage || 'Failed to load grades')
      }
      
      grades.value = []
    } finally {
      loading.value = false
    }
  }

  // Format date helper
  function formatDate(dateString: string) {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Watch for semester changes
  watch(currentSemester, () => {
    fetchGrades()
  }, { immediate: true })

  return {
    // State
    courses,
    grades,
    loading,
    error,
    
    // Computed
    courseGrades,
    
    // Methods
    fetchGrades,
    fetchCourses,
    formatDate
  }
} 