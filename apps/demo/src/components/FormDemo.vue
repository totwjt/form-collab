<template>
  <div class="form-demo">
    <FormTest
      title="表单 A"
      :current-user="userA"
      :ws-url="wsUrl"
    />
    <FormTest
      title="表单 B"
      :current-user="userB"
      :ws-url="wsUrl"
    />
  </div>
</template>

<script setup lang="ts">
import {  createFormUser } from '@form-collab/core'

import FormTest from './FormTest.vue'

// 创建两个不同的用户
const userA = createFormUser('用户 A')
const userB = createFormUser('用户 B')

const wsUrl = 'ws://localhost:8089'
</script>

<style scoped>
.form-demo {
  display: flex;
  gap: 2rem;
}
</style>