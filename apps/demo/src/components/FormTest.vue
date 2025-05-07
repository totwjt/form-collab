<template>
  <div class="form-test">
    <div class="form-container">
      <h2>表单 A</h2>
      <div class="form">
        <div class="form-item">
          <label>用户名</label>
          <input
            v-model="formA.username"
            v-collab="'username'"
            :disabled="isFieldLocked('username')"
          />
          <span v-if="getFieldLocker('username')" class="lock-info">
            {{ getFieldLocker('username')?.name }} 正在编辑
          </span>
        </div>
        <div class="form-item">
          <label>邮箱</label>
          <input
            v-model="formA.email"
            v-collab="'email'"
            :disabled="isFieldLocked('email')"
          />
          <span v-if="getFieldLocker('email')" class="lock-info">
            {{ getFieldLocker('email')?.name }} 正在编辑
          </span>
        </div>
      </div>
    </div>

    <div class="form-container">
      <h2>表单 B</h2>
      <div class="form">
        <div class="form-item">
          <label>用户名</label>
          <input
            v-model="formB.username"
            v-collab="'username'"
            :disabled="isFieldLocked('username')"
          />
          <span v-if="getFieldLocker('username')" class="lock-info">
            {{ getFieldLocker('username')?.name }} 正在编辑
          </span>
        </div>
        <div class="form-item">
          <label>邮箱</label>
          <input
            v-model="formB.email"
            v-collab="'email'"
            :disabled="isFieldLocked('email')"
          />
          <span v-if="getFieldLocker('email')" class="lock-info">
            {{ getFieldLocker('email')?.name }} 正在编辑
          </span>
        </div>
      </div>
    </div>

    <div class="status-panel">
      <h3>当前用户</h3>
      <div>ID: {{ currentUser.id }}</div>
      <div>名称: {{ currentUser.name }}</div>

      <h3>在线用户</h3>
      <ul>
        <li v-for="user in onlineUsers" :key="user.id">
          {{ user.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FormStore, FormUser } from '@form-collab/core'

// 模拟两个不同的用户
const currentUser: FormUser = {
  id: Math.random().toString(36).substr(2, 9),
  name: `User ${Math.floor(Math.random() * 1000)}`
}

const formA = ref({
  username: '',
  email: ''
})

const formB = ref({
  username: '',
  email: ''
})

const onlineUsers = ref<FormUser[]>([])
let formStore: FormStore | null = null

// 初始化表单存储
onMounted(() => {
  formStore = new FormStore('ws://localhost:8089', currentUser)

  // 监听字段变化
  formStore.onChange((field, value) => {
    if (field === 'username') {
      formA.value.username = value
      formB.value.username = value
    } else if (field === 'email') {
      formA.value.email = value
      formB.value.email = value
    }
  })
})

// 清理资源
onUnmounted(() => {
  formStore?.disconnect()
})

// 字段锁定状态
const isFieldLocked = (field: string) => {
  return formStore?.isFieldLocked(field) ?? false
}

// 获取字段锁定者
const getFieldLocker = (field: string) => {
  return formStore?.getFieldLocker(field)
}
</script>

<style scoped>
.form-test {
  display: flex;
  gap: 2rem;
  padding: 2rem;
}

.form-container {
  flex: 1;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 4px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-item input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-item input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.lock-info {
  font-size: 0.8rem;
  color: #666;
}

.status-panel {
  width: 200px;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 4px;
}

.status-panel h3 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.status-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.status-panel li {
  padding: 0.25rem 0;
}
</style>