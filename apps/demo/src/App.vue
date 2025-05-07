<template>
  <div class="app">
    <h1>Form-Collab Demo</h1>
    <FormTest />
  </div>
</template>

<script setup lang="ts">
import FormTest from './components/FormTest.vue'
</script>

<style>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}
</style>