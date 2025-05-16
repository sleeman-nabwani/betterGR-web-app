declare module '~/data/courses' {
  interface Course {
    id: string;
    title: string;
    code: string;
    slug: string;
    semesterId: string;
    [key: string]: any;
  }
  export const courses: Course[];
}

declare module '~/data/assignments' {
  interface Assignment {
    id: string;
    title: string;
    description?: string;
    course: string;
    courseId: string;
    dueDate: string;
    status: string;
    semesterId: string;
    [key: string]: any;
  }
  export const assignments: Assignment[];
} 