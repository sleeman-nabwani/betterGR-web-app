import { computed } from 'vue'

// Type declarations for auto-imported functions
declare function useChatStore(): any
declare function useGraphQL(): any
declare function useAuth(): any
declare function useRoute(): any

// Chat message interface - role indicates WHO spoke the message
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'  // WHO spoke: user or assistant
  content: string             // WHAT they said
  timestamp: Date
}

export interface ChatResponse {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  sessionId?: string
  isPartial?: boolean
  isComplete?: boolean
  isStreaming?: boolean
  metadata?: Record<string, any>
  error?: string
}

export function useChat() {
  const chatStore = useChatStore()
  const { sendChatMessage: sendChatToGraphQL } = useGraphQL()
  
  // Get current user context from real auth
  function getCurrentContext() {
    const { userId, userName, isAuthenticated } = useAuth()
    
    // Try to get route safely
    let courseId = null
    try {
      const route = useRoute()
      courseId = route?.params?.courseId as string || null
    } catch (e) {
      // Route not available, that's okay
    }
    
    return {
      userId: userId.value || 'anonymous',
      userRole: 'student',
      courseId: courseId,
      userName: userName.value,
      isAuthenticated: isAuthenticated.value
    }
  }

  async function sendMessage(message: string) {
    try {
      chatStore.setLoading(true)
      
      // Get real context from auth
      const currentContext = getCurrentContext()
      chatStore.initializeContext(currentContext)
      
      // Add user message to store
      chatStore.addMessage({
        role: 'user',
        content: message,
      })

      console.log('Sending chat message with context:', chatStore.context)
      console.log('Chat history:', chatStore.chatHistory)

      // Send to GraphQL with real auth handling
      const response = await sendChatToGraphQL({
        newMessage: message,
        chatHistory: chatStore.chatHistory,
        context: {
          userId: chatStore.context.userId!,
          userRole: chatStore.context.userRole!,
          courseId: chatStore.context.courseId || undefined,
          sessionId: chatStore.context.sessionId,
          userName: currentContext.userName,
          isAuthenticated: currentContext.isAuthenticated
        }
      })
      
      if (response) {
        // Add AI response to store
        chatStore.addMessage({
          role: 'assistant',
          content: response.content,
        })
      }

    } catch (error) {
      console.error('Error sending message:', error)
      chatStore.addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message.',
      })
    } finally {
      chatStore.setLoading(false)
    }
  }

  function clearChat() {
    chatStore.clearMessages()
  }

  // Update course context when navigating
  function updateCourseContext(courseId: string | null) {
    chatStore.updateCourseContext(courseId)
  }

  return {
    sendMessage,
    clearChat,
    updateCourseContext,
    isLoading: computed(() => chatStore.isLoading),
    isStreaming: computed(() => chatStore.isStreaming),
    messages: computed(() => chatStore.messages),
    hasMessages: computed(() => chatStore.hasMessages),
    sessionId: computed(() => chatStore.sessionId),
    context: computed(() => chatStore.context),
  }
}