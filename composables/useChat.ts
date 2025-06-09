import type { ChatMessage } from '~/stores/chat'

export interface ChatResponse {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isPartial?: boolean
  error?: string
}

export function useChat() {
  const chatStore = useChatStore()

  async function sendMessage(message: string, streaming: boolean = true) {
    try {
      chatStore.setLoading(true)
      
      // Add user message to store
      const userMessage = chatStore.addMessage({
        role: 'user',
        content: message,
      })

      if (streaming) {
        await handleStreamingResponse(message)
      } else {
        await handleNonStreamingResponse(message)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      chatStore.addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message.',
      })
    } finally {
      chatStore.setLoading(false)
      chatStore.setStreaming(false)
    }
  }

  async function handleStreamingResponse(message: string) {
    chatStore.setStreaming(true)
    
    // Add initial assistant message
    let assistantMessage = chatStore.addMessage({
      role: 'assistant',
      content: '',
    })

    try {
      const response = await $fetch<ReadableStream>('/api/chat', {
        method: 'POST',
        body: {
          message,
          streaming: true,
        },
        responseType: 'stream',
      })

      const reader = response.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()

        if (done) {
          if (buffer.trim()) {
            console.warn('Stream ended with unparsed data:', buffer)
          }
          break
        }

        buffer += value
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice('data: '.length).trim()
            
            if (data === '[DONE]') {
              return
            }

            try {
              const jsonData: ChatResponse = JSON.parse(data)
              
              if (jsonData.error) {
                console.error('Stream error:', jsonData.error)
                break
              }

              if (jsonData.content) {
                // Update the last assistant message with new content
                if (assistantMessage && assistantMessage.role === 'assistant') {
                  assistantMessage.content += jsonData.content
                }
              }
            } catch (parseError) {
              console.warn('Error parsing JSON:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
      throw error
    }
  }

  async function handleNonStreamingResponse(message: string) {
    try {
      const response = await $fetch<ChatResponse>('/api/chat', {
        method: 'POST',
        body: {
          message,
          streaming: false,
        },
      })

      if (response.error) {
        throw new Error(response.error)
      }

      chatStore.addMessage({
        role: 'assistant',
        content: response.content,
      })
    } catch (error) {
      console.error('Non-streaming error:', error)
      throw error
    }
  }

  function clearChat() {
    chatStore.clearMessages()
  }

  return {
    sendMessage,
    clearChat,
    isLoading: computed(() => chatStore.isLoading),
    isStreaming: computed(() => chatStore.isStreaming),
    messages: computed(() => chatStore.messages),
  }
} 