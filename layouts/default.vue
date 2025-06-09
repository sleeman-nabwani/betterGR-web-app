<template>
  <div class="min-h-screen flex flex-col bg-background">
    <TheHeader />
    <main class="flex-1 px-8 md:px-16 mx-auto w-full max-w-[1600px]">
      <slot />
    </main>
    
    <!-- Mini Chat Widget -->
    <MiniChat />
  </div>
</template>
