<template>
  <div class="form-container">
    <div class="user-info">{{ currentUser?.name }} （{{ currentUser?.id }}）</div>
    <div class="form">
      <div class="form-item">
        <label>用户名</label>
        <div class="input-wrapper">
          <input
            v-model="formData.username"
            @focus="handleFieldFocus('username')"
            @blur="handleFieldBlur('username')"
            :disabled="fieldLockedState.username"
          />
          <span v-if="getFieldLocker('username')" class="lock-info">
            {{ getFieldLocker('username')?.name }} 正在编辑
          </span>
        </div>
      </div>
      <div class="form-item">
        <label>邮箱</label>
        <div class="input-wrapper">
          <input
            v-model="formData.email"
            @focus="handleFieldFocus('email')"
            @blur="handleFieldBlur('email')"
            :disabled="fieldLockedState.email"
          />
          <span v-if="getFieldLocker('email')" class="lock-info">
            {{ getFieldLocker('email')?.name }} 正在编辑
          </span>
        </div>
      </div>
    </div>

    <div class="status-panel">
      <h3>当前用户</h3>
      <div>ID: {{ currentUser?.id }}</div>
      <div>名称: {{ currentUser?.name }}</div>

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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { FormStore } from '@form-collab/core'
import type { FormUser } from '@form-collab/core'

const props = defineProps<{
  title: string
  currentUser: FormUser
  wsUrl: string
}>()

const formData = ref({
  username: '',
  email: ''
})

const fieldLockedState = ref<Record<string, boolean>>({
  username: false,
  email: false
})

const onlineUsers = ref<FormUser[]>([])
let formStore: FormStore | null = null

// 初始化表单存储
onMounted(() => {
  formStore = new FormStore(props.wsUrl, props.currentUser)

  // 监听字段变化
  formStore.onChange((field, value) => {
    console.log('监听字段变化', field, value);
    if (field === 'username') {
      formData.value.username = value
    } else if (field === 'email') {
      formData.value.email = value
    }
  })

  // 监听用户列表变化
  formStore.onUsersChange((users) => {
    onlineUsers.value = users
  })

  // 监听字段锁定状态变化
  formStore.onFieldLockChange((field, isLocked) => {
    fieldLockedState.value[field] = isLocked
  })
})

// 清理资源
onUnmounted(() => {
  formStore?.disconnect()
})

// 字段锁定状态
const isFieldLocked = (field: string) => {
  console.log('isFieldLocked',field, formStore?.isFieldLocked(field));

  return formStore?.isFieldLocked(field) ?? false
}

// 获取字段锁定者
const getFieldLocker = (field: string) => {
  return formStore?.getFieldLocker(field)
}

// 处理字段获得焦点
const handleFieldFocus = (field: string) => {
  formStore?.handleFieldFocus(field)
}

// 处理字段失去焦点
const handleFieldBlur = (field: string) => {
  formStore?.handleFieldBlur(field)
}

// 处理字段值变化
const handleFieldChange = (field: string, value: any) => {
  if (formStore) {
    formStore.updateField(field, value)
  }
}

// 监听表单数据变化
watch(() => formData.value.username, (newValue, oldValue) => {
  if (newValue !== oldValue && formStore) {
    formStore.updateField('username', newValue)
  }
})

watch(() => formData.value.email, (newValue, oldValue) => {
  if (newValue !== oldValue && formStore) {

    formStore.updateField('email', newValue)
  }
})

// 在组件卸载时清理定时器
onUnmounted(() => {
  if (this.usernameUpdateTimeout) {
    clearTimeout(this.usernameUpdateTimeout)
  }
  if (this.emailUpdateTimeout) {
    clearTimeout(this.emailUpdateTimeout)
  }
  formStore?.disconnect()
})
</script>

<style scoped>
.form-container {
  position: relative;
  flex: 1;
  border: 1px solid #ddd;
  padding: 2rem;
  border-radius: 4px;
}

.user-info {
  width: 100%;
  background: #f7f7f7;
  font-size: 14px;
  position: absolute;
  top: 0;
  left: 0;
}

.form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  border: 1px solid #ddd;
  padding: 0.5rem;
  border-radius: 4px;
}

.lock-info {
  position: absolute;
  top: -20px;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
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