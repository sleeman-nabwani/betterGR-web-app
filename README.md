# Dynamic Content Frontend

A modern web application built with Nuxt.js that dynamically renders content from markdown files, allowing for a flexible, documentation-driven approach to content management.

## Features

- **Markdown-Powered Pages**: Automatically transforms markdown files (including READMEs) into fully styled web pages
- **Dynamic Routing**: Creates routes based on the structure of your markdown files

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration details.

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## How It Works

### Markdown to Page Conversion

This application dynamically converts markdown files (including README.md files) into web pages. 

1. Place markdown files in the `/content` directory
2. The application will automatically:
   - Parse the markdown structure
   - Extract metadata and headings
   - Generate dynamic routes
   - Apply styling and layout components

# Technion Portal - Mini Chat Implementation

## Overview

This project includes a comprehensive mini-chat implementation for your Nuxt 3 application. The chat widget provides:

- **Floating chat button** positioned on the right side of the screen
- **Real-time streaming responses** using Server-Sent Events (SSE)
- **Markdown parsing and rendering** for rich message formatting
- **Persistent chat state** using Pinia store
- **Auto-scrolling** chat container
- **Responsive design** that works across all pages

## Implementation Guide

### 1. Install Dependencies

First, install the required dependency for markdown parsing:

```bash
npm install @nuxtjs/mdc
```

### 2. Update Nuxt Configuration

Add the MDC module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    // ... existing modules
    '@nuxtjs/mdc',
  ],
  // ... rest of config
})
```

### 3. Components Created

The following components have been created for you:

#### `stores/chat.ts`
- Pinia store for managing chat state
- Handles messages, loading states, and chat window visibility
- Provides actions for adding messages, updating streaming content, etc.

#### `composables/useChat.ts`
- Composable for handling chat API calls
- Supports both streaming and non-streaming responses
- Handles Server-Sent Events (SSE) for real-time updates

#### `components/ChatMessage.vue`
- Renders individual chat messages
- Handles markdown parsing using Nuxt MDC
- Differentiates between user and assistant messages
- Shows timestamps and loading states

#### `components/MiniChat.vue`
- Main chat widget component
- Floating button and expandable chat window
- Message list with auto-scrolling
- Input form for sending messages
- Clear chat functionality

#### `server/api/chat.post.ts`
- Server API endpoint for handling chat requests
- Supports streaming responses using SSE
- Mock responses for demonstration (replace with your GraphQL implementation)

### 4. Integration with Your GraphQL Backend

To integrate with your actual GraphQL backend, replace the mock implementation in `server/api/chat.post.ts` with your GraphQL mutation:

```typescript
// Replace the mock response generation with your GraphQL call
const response = await $gql.default.request(`
  mutation SendChatMessage($input: ChatMessageInput!) {
    sendChatMessage(input: $input) {
      id
      role
      content
      timestamp
    }
  }
`, {
  input: {
    message: message.trim(),
    streaming,
  },
})
```

### 5. Features Included

#### Streaming Support
- **Real-time streaming** using Server-Sent Events
- **Progressive message rendering** as content arrives
- **Typing indicators** during streaming

#### Markdown Rendering
- **Rich text support** using Nuxt MDC
- **Code blocks**, **lists**, **emphasis**, and more
- **Proper styling** with Tailwind CSS typography

#### User Experience
- **Auto-scrolling** to latest messages
- **Unread message indicators** when chat is closed
- **Responsive design** that works on mobile and desktop
- **Keyboard shortcuts** (Enter to send, Shift+Enter for new line)

#### State Management
- **Persistent chat history** during session
- **Loading and streaming states**
- **Clear chat functionality**

### 6. Customization

#### Styling
The components use Tailwind CSS classes that follow your existing design system:
- `bg-primary`, `text-primary-foreground` for primary elements
- `bg-muted`, `border` for secondary elements
- Dark mode support through Tailwind's dark mode classes

#### Position
The chat widget is positioned using `fixed bottom-6 right-6 z-50`. You can adjust this in `components/MiniChat.vue`.

#### Behavior
- **Auto-open**: The chat opens automatically when clicked
- **Auto-scroll**: Messages automatically scroll to the bottom
- **Streaming**: Enabled by default (can be toggled in the `useChat` composable)

### 7. Known Limitations

The current implementation includes:
- **Mock API responses** for demonstration
- **Basic error handling** (can be enhanced)
- **Simple markdown parsing** (can be extended with more features)

### 8. Next Steps

To fully integrate the chat widget:

1. **Replace mock API** with your actual GraphQL implementation
2. **Enhance error handling** for production use
3. **Add authentication** if required by your backend
4. **Customize styling** to match your design requirements
5. **Add more advanced features** like file uploads, emojis, etc.

### 9. Usage

Once implemented, the chat widget will:
- Appear as a floating button on all pages
- Open into a chat window when clicked
- Support real-time conversations with markdown formatting
- Persist chat history during the session
- Automatically scroll to new messages

The implementation follows best practices for Vue 3, Nuxt 3, and modern web development patterns, ensuring maintainability and performance.

## Technical Details

### Server-Sent Events (SSE)
The implementation uses SSE for real-time streaming, which provides:
- **Unidirectional communication** from server to client
- **Automatic reconnection** handling
- **Better performance** than polling
- **Native browser support**

### Markdown Processing
Messages are processed using Nuxt MDC, which supports:
- **GitHub Flavored Markdown**
- **Code syntax highlighting**
- **Custom Vue components** in markdown
- **Real-time parsing** for streaming content

### State Management
The Pinia store provides:
- **Reactive state management**
- **TypeScript support**
- **DevTools integration**
- **Composable-friendly API**

