import { defineStore } from 'pinia'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  isStreaming: boolean
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    messages: [],
    isOpen: false,
    isLoading: false,
    isStreaming: false,
  }),

  actions: {
    toggleChat() {
      this.isOpen = !this.isOpen
    },

    openChat() {
      this.isOpen = true
    },

    closeChat() {
      this.isOpen = false
    },

    addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
      const newMessage: ChatMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      }
      this.messages.push(newMessage)
      return newMessage
    },

    updateLastMessage(content: string) {
      if (this.messages.length > 0) {
        const lastMessage = this.messages[this.messages.length - 1]
        if (lastMessage.role === 'assistant') {
          lastMessage.content += content
        }
      }
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setStreaming(streaming: boolean) {
      this.isStreaming = streaming
    },

    clearMessages() {
      this.messages = []
    },
  },

  getters: {
    hasMessages: (state) => state.messages.length > 0,
    lastMessage: (state) => state.messages[state.messages.length - 1],
  },
}) 