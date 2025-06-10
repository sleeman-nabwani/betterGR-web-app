<<<<<<< HEAD
import { defineEventHandler, readBody, createError, setHeader, sendStream } from 'h3'
=======
import OpenAI from 'openai'
import { defineEventHandler, readBody, createError, setHeader, sendStream, getRequestHeaders, getRequestURL } from 'h3'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
>>>>>>> c42e598 (AI chat bot implementation with openAI)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
<<<<<<< HEAD
    const { 
      message, 
      sessionId,
      chatHistory = [],
      streaming = true,
      context = {}
    } = body
=======
    const { message, userId, userRole, conversationHistory = [] } = body
>>>>>>> c42e598 (AI chat bot implementation with openAI)

    if (!message || typeof message !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message is required',
      })
    }

<<<<<<< HEAD
    // Log received chat history for debugging
    console.log('Received chat history:', chatHistory.length, 'messages')
    console.log('Session ID:', sessionId)
    console.log('Context:', context)

    if (streaming) {
      // Set headers for Server-Sent Events
      setHeader(event, 'content-type', 'text/event-stream')
      setHeader(event, 'cache-control', 'no-cache')
      setHeader(event, 'connection', 'keep-alive')
      setHeader(event, 'access-control-allow-origin', '*')
      setHeader(event, 'access-control-allow-headers', 'Cache-Control')

      // Create a readable stream for SSE
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Generate response using chat history context
            const mockResponse = generateContextualResponse(message, chatHistory, context, sessionId)
=======
    if (!userId || !userRole) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User authentication required',
      })
    }

    // Get user context from GraphQL
    const userContext = await getUserContext(userId, userRole, event)
    
    // Build system prompt with user context
    const systemPrompt = buildAcademicAssistantPrompt(userContext)
    
    // Prepare conversation history with proper OpenAI types
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ]
    
    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      // Add previous conversation messages
      conversationHistory.forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content })
        }
      })
    }
    
    // Add the current user message
    messages.push({ role: 'user', content: message })

    // Set headers for Server-Sent Events
    setHeader(event, 'content-type', 'text/event-stream')
    setHeader(event, 'cache-control', 'no-cache')
    setHeader(event, 'connection', 'keep-alive')
    setHeader(event, 'access-control-allow-origin', '*')
    setHeader(event, 'access-control-allow-headers', 'Cache-Control')

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const openaiStream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1000,
          })

          for await (const chunk of openaiStream) {
            const content = chunk.choices[0]?.delta?.content || ''
>>>>>>> c42e598 (AI chat bot implementation with openAI)
            
            if (content) {
              const data = JSON.stringify({
                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                role: 'assistant',
<<<<<<< HEAD
                content: chunk,
                timestamp: new Date().toISOString(),
                sessionId,
                isPartial: i < chunks.length - 1,
                isComplete: i === chunks.length - 1,
                isStreaming: true,
                metadata: {
                  messageIndex: i + 1,
                  totalChunks: chunks.length,
                  context
                }
=======
                content: content,
                timestamp: new Date().toISOString(),
                isPartial: true,
>>>>>>> c42e598 (AI chat bot implementation with openAI)
              })

              controller.enqueue(`data: ${data}\n\n`)
            }
<<<<<<< HEAD

            // Send completion signal
            const completionData = JSON.stringify({
              id: `completion-${Date.now()}`,
              role: 'system',
              content: '[DONE]',
              timestamp: new Date().toISOString(),
              sessionId,
              isPartial: false,
              isComplete: true,
              isStreaming: false
            })

            controller.enqueue(`data: ${completionData}\n\n`)
            controller.enqueue('data: [DONE]\n\n')
            controller.close()
          } catch (error) {
            console.error('Chat API Error:', error)
            const errorData = JSON.stringify({
              id: `error-${Date.now()}`,
              role: 'system',
              content: 'Failed to process chat message',
              timestamp: new Date().toISOString(),
              sessionId,
              error: error instanceof Error ? error.message : 'Unknown error',
              isPartial: false,
              isComplete: true,
              isStreaming: false
            })
            controller.enqueue(`data: ${errorData}\n\n`)
            controller.close()
=======
>>>>>>> c42e598 (AI chat bot implementation with openAI)
          }

<<<<<<< HEAD
      return sendStream(event, stream)
    } else {
      // Non-streaming response in GraphQL format
      const mockResponse = generateContextualResponse(message, chatHistory, context, sessionId)
      return {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: mockResponse,
        timestamp: new Date().toISOString(),
        sessionId,
        isPartial: false,
        isComplete: true,
        isStreaming: false,
        metadata: {
          historyLength: chatHistory.length,
          context
        }
      }
    }
=======
          // Send end signal
          controller.enqueue('data: [DONE]\n\n')
          controller.close()
        } catch (error) {
          console.error('OpenAI Streaming Error:', error)
          const errorData = JSON.stringify({
            error: 'Failed to process chat message',
            message: error instanceof Error ? error.message : 'Unknown error',
          })
          controller.enqueue(`data: ${errorData}\n\n`)
          controller.close()
        }
      },
    })

    return sendStream(event, stream)
>>>>>>> c42e598 (AI chat bot implementation with openAI)
  } catch (error) {
    console.error('Chat API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})

<<<<<<< HEAD
function generateContextualResponse(userMessage: string, chatHistory: any[], context: any, sessionId?: string): string {
  const message = userMessage.toLowerCase()
  const historyLength = chatHistory.length
  
  // Analyze chat history for context
  const previousMessages = chatHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content.toLowerCase())
    .slice(-3) // Last 3 user messages for context
  
  // Check if this is a follow-up question
  const isFollowUp = historyLength > 2
  const hasGreeted = chatHistory.some(msg => 
    msg.role === 'assistant' && 
    (msg.content.includes('Hello') || msg.content.includes('Hi'))
  )
  
  // Context-aware responses
  if (message.includes('hello') || message.includes('hi')) {
    if (hasGreeted) {
      return 'Hello again! How else can I help you today?'
    }
    return 'Hello! Welcome to the Technion Academic Portal. I can help with **course information**, *assignment details*, or answer questions about your academic progress. What would you like to know?'
  }
  
  if (message.includes('thank') || message.includes('thanks')) {
    return 'You\'re welcome! Is there anything else I can help you with regarding your academic needs?'
  }
  
  // Follow-up context handling
  if (isFollowUp) {
    if (previousMessages.some(prev => prev.includes('course') || prev.includes('class'))) {
      if (message.includes('more') || message.includes('details') || message.includes('tell me')) {
        return `Based on our previous discussion about courses, here are additional details:\n\n**Course Resources:**\n- Lecture materials and recordings\n- Office hours with instructors\n- Study groups and tutoring\n- Online learning platforms\n\n**Registration Support:**\n- Prerequisites checking\n- Schedule conflict resolution\n- Waitlist management\n\nWhat specific aspect would you like to explore further?`
      }
    }
    
    if (previousMessages.some(prev => prev.includes('assignment') || prev.includes('homework'))) {
      if (message.includes('deadline') || message.includes('when') || message.includes('due')) {
        return `Regarding assignment deadlines from our conversation:\n\n**Important Reminders:**\n- Check the course portal for the most current due dates\n- Submit assignments before **11:59 PM** on the due date\n- Late submissions may incur penalties\n- Contact your instructor for extensions\n\n*Would you like help with a specific assignment?*`
      }
    }
  }
  
  // Standard responses with history awareness
  if (message.includes('course') || message.includes('class')) {
    const contextNote = historyLength > 0 ? '\n\n*I notice we\'ve been chatting - feel free to ask follow-up questions!*' : ''
    return `I can help you with course-related queries. Here are some things I can assist with:\n\n- Course schedules and descriptions\n- Prerequisites and requirements\n- Registration information\n- Instructor contact details\n- Course materials and resources${contextNote}\n\nWhat specific course information do you need?`
  }
  
  if (message.includes('assignment') || message.includes('homework')) {
    const contextNote = historyLength > 0 ? '\n\n*Building on our previous conversation...*' : ''
    return `For assignment help, I can provide:${contextNote}\n\n1. **Due dates** and deadlines\n2. *Submission guidelines*\n3. Assignment requirements\n4. Extension policies\n5. Grading rubrics\n\nWhich assignment do you need help with?`
  }
  
  if (message.includes('grade') || message.includes('score')) {
    return `I can help you understand your grades and academic performance:\n\n**Grade Information:**\n- Current semester grades\n- Assignment scores\n- Exam results\n- GPA calculations\n\n**Grade Access:**\nYou can check your grades in the **Grades** section of the portal. For specific grade inquiries or concerns, please contact your instructor directly.\n\n*Is there a particular course grade you'd like to discuss?*`
  }
  
  if (message.includes('help') || message.includes('support')) {
    const sessionNote = sessionId ? `\n\n*Session ID: ${sessionId.substring(0, 8)}...*` : ''
    return `I'm here to help! I can assist with:\n\n- 📚 **Course information** and schedules\n- 📝 **Assignment details** and deadlines\n- 📊 **Grade inquiries** and academic progress\n- 🏫 **General campus** information\n- 🔧 **Technical support** for the portal\n\n**Chat History:** I can see our previous ${historyLength} messages to provide better context.${sessionNote}\n\nWhat do you need help with?`
  }
  
  // Default contextual response
  const historyContext = historyLength > 0 
    ? `\n\n*I can see we've been discussing various topics (${historyLength} messages so far). Feel free to continue our conversation or ask about something new!*`
    : ''
    
  return `I understand you're asking about "${userMessage}". While I don't have specific information about that topic, I can help you with:\n\n**Academic Information:**\n- Course schedules and descriptions\n- Assignment deadlines and requirements\n- Grade inquiries and academic progress\n\n**Technical Support:**\n- Portal navigation\n- Account issues\n- System troubleshooting${historyContext}\n\n*Is there something specific I can help you with?*`
=======
// Get user context from GraphQL
async function getUserContext(userId: string, userRole: 'student' | 'staff', event: any) {
  try {
    // Get authorization header from the request 
    const headers = getRequestHeaders(event)
    const authHeader = headers.authorization || ''
    
    // Use the same approach as working pages - go through /api/graphql proxy
    
    if (userRole === 'student') {
      const response = await fetch(`${getRequestURL(event).origin}/api/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          query: `
            query GetStudentContext($studentId: ID!) {
              student(id: $studentId) {
                id
                firstName
                lastName
                email
              }
              studentCourses(studentId: $studentId) {
                id
                name
                semester
                description
              }
              grades(studentId: $studentId) {
                id
                studentId
                courseId
                semester
                gradeType
                itemId
                gradeValue
                comments
                gradedAt
              }
            }
          `,
          variables: { studentId: userId }
        })
      })
      
      const data = await response.json()
      
      return {
        type: 'student',
        data: {
          student: data.data?.student,
          courses: data.data?.studentCourses || [],
          grades: data.data?.grades || []
        }
      }
    } else {
      const response = await fetch(`${getRequestURL(event).origin}/api/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          query: `
            query GetStaffContext($staffId: ID!) {
              staff(id: $staffId) {
                id
                firstName
                lastName
                email
              }
              staffCourses(staffId: $staffId) {
                id
                name
                semester
                description
                students {
                  id
                  firstName
                  lastName
                }
              }
            }
          `,
          variables: { staffId: userId }
        })
      })
      
      const data = await response.json()
      
      return {
        type: 'staff',
        data: {
          staff: data.data?.staff,
          courses: data.data?.staffCourses || []
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user context:', error)
    return {
      type: userRole,
      data: null,
      error: 'Failed to load user context'
    }
  }
}

function buildAcademicAssistantPrompt(userContext: any): string {
  const basePrompt = `You are an AI academic assistant for the BetterGR academic management system.

IMPORTANT SECURITY RULES:
- You can ONLY VIEW and provide information about existing data
- You CANNOT create, modify, or delete any data
- You CANNOT make changes to grades, courses, assignments, or any other records
- You CANNOT perform any write operations
- If asked to make changes, politely explain you can only provide information

Your role is to help users understand and navigate their academic information by:
- **DISPLAYING and explaining grades, courses, and assignments when requested**
- **SHOWING specific grade values, course details, and academic progress**  
- Answering questions about courses, grades, and assignments
- Explaining academic policies and procedures
- Providing summaries and insights about academic progress
- Helping with general academic guidance

When asked about grades or courses, you SHOULD:
- Show the actual grade values and details
- Display course information and descriptions
- Provide specific academic data from the system
- Format the information clearly using tables or lists

Response guidelines:
- Be helpful, professional, and informative
- Always base responses on actual data when available
- Display specific information when requested (grades, courses, etc.)
- Use markdown formatting for better readability (tables, lists, etc.)
- If you don't have specific information, say so clearly
- Provide actionable insights when possible

Current user context:`

  if (!userContext || !userContext.data) {
    return basePrompt + `
- User authentication successful but detailed information is not available
- You can provide general academic guidance and answer questions about the system`
  }

  if (userContext.type === 'student') {
    const student = userContext.data.student
    const courses = userContext.data.courses || []
    const grades = userContext.data.grades || []

    return basePrompt + `
- Student: ${student?.firstName || 'N/A'} ${student?.lastName || 'N/A'}
- Email: ${student?.email || 'N/A'}
- Currently enrolled in ${courses.length} course(s)
- Courses: ${courses.map((c: any) => c.name).join(', ') || 'None'}
- Total grades recorded: ${grades.length}

AVAILABLE DATA TO DISPLAY:
**Courses:**
${courses.map((c: any) => `- ${c.name} (${c.id}) - ${c.semester}: ${c.description}`).join('\n')}

**Grades:**
${grades.map((g: any) => `- ${g.gradeType} "${g.itemId}" in course ${g.courseId}: ${g.gradeValue} (${g.comments || 'No comments'})`).join('\n')}

You have access to this detailed information and SHOULD display it when requested. Show grades, course details, and academic insights based on this actual data.`
  } else if (userContext.type === 'staff') {
    const staff = userContext.data.staff
    const courses = userContext.data.courses || []

    return basePrompt + `
- Staff Member: ${staff?.firstName || 'N/A'} ${staff?.lastName || 'N/A'}
- Email: ${staff?.email || 'N/A'}
- Teaching ${courses.length} course(s)
- Courses: ${courses.map((c: any) => c.name).join(', ') || 'None'}

You have access to information about the courses they teach and student information.`
  }

  return basePrompt + `
- User type: ${userContext.type}
- Limited context available`
>>>>>>> c42e598 (AI chat bot implementation with openAI)
} 