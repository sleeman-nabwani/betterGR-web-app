export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message, streaming = true } = body

    if (!message || typeof message !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message is required',
      })
    }

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
            // Mock response based on user message
            const mockResponse = generateMockResponse(message)
            
            // Simulate streaming by chunking the response
            const chunks = mockResponse.split(' ')
            
            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i] + (i < chunks.length - 1 ? ' ' : '')
              
              const data = JSON.stringify({
                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                role: 'assistant',
                content: chunk,
                isPartial: i < chunks.length - 1,
                timestamp: new Date().toISOString(),
              })

              controller.enqueue(`data: ${data}\n\n`)
              
              // Simulate streaming delay
              await new Promise(resolve => setTimeout(resolve, 100))
            }

            // Send end signal
            controller.enqueue('data: [DONE]\n\n')
            controller.close()
          } catch (error) {
            console.error('Chat API Error:', error)
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
    } else {
      // Non-streaming response
      const mockResponse = generateMockResponse(message)
      return {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: mockResponse,
        timestamp: new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error('Chat API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})

function generateMockResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()
  
  if (message.includes('hello') || message.includes('hi')) {
    return 'Hello! How can I assist you today? I can help with **course information**, *assignment details*, or answer questions about your academic progress.'
  }
  
  if (message.includes('course') || message.includes('class')) {
    return 'I can help you with course-related queries. Here are some things I can assist with:\n\n- Course schedules\n- Prerequisites\n- Course descriptions\n- Registration information\n\nWhat specific course information do you need?'
  }
  
  if (message.includes('assignment') || message.includes('homework')) {
    return 'For assignment help, I can provide:\n\n1. **Due dates** and deadlines\n2. *Submission guidelines*\n3. Assignment requirements\n4. Extension policies\n\nWhich assignment do you need help with?'
  }
  
  if (message.includes('grade') || message.includes('score')) {
    return 'I can help you understand your grades and academic performance. You can check your grades in the **Grades** section of the portal. If you have questions about specific grades, please contact your instructor directly.'
  }
  
  if (message.includes('help') || message.includes('support')) {
    return 'I\'m here to help! I can assist with:\n\n- 📚 Course information\n- 📝 Assignment details\n- 📊 Grade inquiries\n- 🏫 General campus information\n- 🔧 Technical support\n\nWhat do you need help with?'
  }
  
  // Default response with markdown examples
  return `I understand you're asking about "${userMessage}". While I don't have specific information about that topic, I can help you with:\n\n**Academic Information:**\n- Course schedules and descriptions\n- Assignment deadlines\n- Grade inquiries\n\n**Technical Support:**\n- Portal navigation\n- Account issues\n\n*Is there something specific I can help you with?*`
} 