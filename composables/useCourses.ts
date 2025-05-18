import { ref, Ref } from 'vue'
import { useAuth } from './useAuth.js'
import { useGraphQL } from './useGraphQL.js'

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

/**
 * Composable for managing course data
 */
export function useCourses() {
  const { userId } = useAuth()
  const { executeQuery } = useGraphQL()
  
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
      // Execute the GraphQL query to get student courses
      const data = await executeQuery<StudentCoursesResponse, { studentId: string }>(
        'GqlStudentCourses',
        { studentId: userId.value }
      )
      
      // Process the fetched courses
      if (data.studentCourses) {
        processCourses(data.studentCourses)
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