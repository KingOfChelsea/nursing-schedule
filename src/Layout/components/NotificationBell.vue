<template>
  <el-tooltip content="待办事项" placement="bottom">
    <el-badge :value="count" :hidden="count === 0" class="notification-badge">
      <el-button :icon="Bell" text class="header-btn" @click="$emit('click')" />
    </el-badge>
  </el-tooltip>
</template>

<script setup>
import { Bell } from '@element-plus/icons-vue'

defineProps({
  count: {
    type: Number,
    default: 0
  }
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.notification-badge {
  :deep(.el-badge__content) {
    background-color: $danger;
  }
}

.header-btn {
  font-size: 18px;
  color: $text-secondary;

  &:hover {
    color: $primary;
  }
}
</style>