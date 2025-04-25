<template>
  <div class="app">
    <header class="header">
      <h1>Monorepo Starter Demo</h1>
    </header>

    <main class="main">
      <section class="section">
        <h2>Vue Component Demo</h2>
        <HelloWorld />
      </section>

      <section class="section">
        <h2>Core Package Demo</h2>
        <div class="demo-content">
          <p>{{ coreMessage }}</p>
        </div>
      </section>

      <section class="section">
        <h2>Utils Package Demo</h2>
        <div class="demo-content">
          <p>Utils package loaded successfully!</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { HelloWorld } from '@form-collab/vue'
import { HelloWorldCore } from '@form-collab/core'
import { formatDate } from '@form-collab/utils'

const coreMessage = HelloWorldCore()

// Log core package demo
console.log('Core package demo:', coreMessage)

// Log utils package demo
console.log('Utils package demo:', formatDate(new Date()))
</script>

<style>
.app {
  min-height: 100vh;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.main {
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f3f4f6;
  border-radius: 8px;
}

.section h2 {
  color: #3b82f6;
  margin-bottom: 1rem;
}

.demo-content {
  color: #6b7280;
}
</style>