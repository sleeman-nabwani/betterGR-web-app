import { ref, Ref } from 'vue'
import { useAuth } from './useAuth.js'
import { useNuxtApp } from 'nuxt/app'

/**
 * Types for GraphQL responses
 */
interface GraphQLCourse {
  id: string;
  name: string;
  semester: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  staff?: Array<{ id: string; firstName: string; lastName: string }>;
  students?: Array<{ id: string; firstName: string; lastName: string }>;
  homework?: Array<{ id: string; title: string; dueDate: string }>;
  announcements?: any[];
  grades?: any[];
}

interface StudentCoursesResponse {
  studentCourses: GraphQLCourse[];
}

/**
 * Course data model
 */
export interface Course {
  id: string;
  title: string;
  code: string;
  slug: string;
  semesterId: string;
  name: string;
  semester: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  staff: any[];
  students: any[];
  announcements: any[];
  homework: any[];
  grades: any[];
  [key: string]: any;
}

// Type for GqlFunction to fix linter errors
type GqlFunction<T, V> = (variables: V) => Promise<{data?: T, error?: Error}>;

/**
 * Composable for managing course data
 */
export function useCourses() {
  const { userId } = useAuth()
  const nuxtApp = useNuxtApp()
  
  // State
  const courses: Ref<Course[]> = ref([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Fetch courses for the authenticated user
   */
  async function fetchCourses() {
    if (!userId.value) {
      console.warn('Cannot fetch courses: User not authenticated')
      return
    }

    loading.value = true
    error.value = null

    try {
      // Use the auto-generated GqlGetStudentCourses function directly
      // Using type assertion to avoid TypeScript errors
      const gqlGetStudentCourses = (nuxtApp as any).GqlGetStudentCourses as 
        GqlFunction<StudentCoursesResponse, { studentId: string }>;
      
      if (!gqlGetStudentCourses) {
        throw new Error('GqlGetStudentCourses function not available. Is nuxt-graphql-client configured properly?')
      }
      
      const response = await gqlGetStudentCourses({ studentId: userId.value })
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch student courses')
      }
      
      // Process the fetched courses
      if (response.data?.studentCourses) {
        processCourses(response.data.studentCourses)
      } else {
        console.warn('No student courses returned')
        courses.value = []
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
      error.value = err as Error
      courses.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Process and transform course data
   */
  function processCourses(studentCourses: GraphQLCourse[]) {
    const fetchedCourses = studentCourses.map((course: GraphQLCourse) => {
      return {
        id: course.id,
        title: course.name,
        name: course.name,
        code: `COURSE-${course.id}`,
        semester: course.semester,
        semesterId: course.semester?.toLowerCase().replace(/\s+/g, '') || 'current',
        slug: course.id,
        description: course.description || '',
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        staff: course.staff || [],
        students: course.students || [],
        announcements: course.announcements || [],
        homework: course.homework || [],
        grades: course.grades || []
      };
    });
    
    courses.value = fetchedCourses
    console.log('Loaded courses:', fetchedCourses)
  }

  /**
   * Find a course by ID
   */
  function findCourseById(id: string): Course | undefined {
    return courses.value.find(course => course.id === id)
  }

  return {
    courses,
    loading,
    error,
    fetchCourses,
    findCourseById
  }
} 