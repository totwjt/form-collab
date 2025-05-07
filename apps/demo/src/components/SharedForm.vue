<template>
  <div class="shared-form">
    <div class="form-header">
      <h3>{{ user.name }}'s Form</h3>
      <div class="online-users">
        Online Users: {{ onlineUsers.length }}
        <div v-for="user in onlineUsers" :key="user.id" class="user-badge">
          {{ user.name }}
        </div>
      </div>
    </div>

    <div class="form-fields">
      <div v-for="field in fields" :key="field" class="form-field">
        <label :for="field">{{ field }}</label>
        <div class="field-control">
          <input
            :id="field"
            v-model="formData[field]"
            :disabled="isFieldLocked(field) && !isFieldLockedByMe(field)"
            @focus="lockField(field)"
            @blur="unlockField(field)"
            @input="(e) => updateField(field, (e.target as HTMLInputElement).value)"
          />
          <div v-if="isFieldLocked(field)" class="lock-indicator">
            Locked by {{ getFieldLocker(field)?.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { FormStore, FormUser } from '@form-collab/core';

const props = defineProps<{
  user: FormUser;
  wsUrl: string;
}>();

const fields = ['name', 'email', 'phone', 'address'];
const formData = ref<Record<string, string>>({});
const onlineUsers = ref<FormUser[]>([]);
let formStore: FormStore | null = null;

const isFieldLocked = (field: string) => {
  return formStore?.isFieldLocked(field) || false;
};

const isFieldLockedByMe = (field: string) => {
  const locker = formStore?.getFieldLocker(field);
  return locker?.id === props.user.id;
};

const getFieldLocker = (field: string) => {
  return formStore?.getFieldLocker(field);
};

const lockField = (field: string) => {
  formStore?.lockField(field);
};

const unlockField = (field: string) => {
  formStore?.unlockField(field);
};

const updateField = (field: string, value: string) => {
  formStore?.updateField(field, value);
};

onMounted(() => {
  formStore = new FormStore(props.wsUrl, props.user);

  // Initialize form data
  fields.forEach(field => {
    formData.value[field] = formStore?.getField(field) || '';
  });

  // Subscribe to field changes
  const unsubscribe = formStore.onChange((field: string, value: string) => {
    formData.value[field] = value;
  });

  // Update online users periodically
  const updateUsers = () => {
    onlineUsers.value = formStore?.getUsers() || [];
  };
  const interval = setInterval(updateUsers, 1000);

  onUnmounted(() => {
    clearInterval(interval);
    unsubscribe();
    formStore?.disconnect();
  });
});
</script>

<style scoped>
.shared-form {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 10px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.online-users {
  display: flex;
  gap: 8px;
  align-items: center;
}

.user-badge {
  background-color: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.form-fields {
  display: grid;
  gap: 16px;
}

.form-field {
  display: grid;
  gap: 8px;
}

.field-control {
  position: relative;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

input:disabled {
  background-color: #f3f4f6;
}

.lock-indicator {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #666;
}
</style>