<template>
  <div class="add-item-btn" @click="$emit('click')">
    <el-button text type="primary" size="small">
      <el-icon><Plus /></el-icon>添加检查项
    </el-button>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue';

defineEmits(['click']);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.add-item-btn {
  padding: 8px 12px;
  text-align: center;
  border: 1px dashed $border-light;
  border-radius: 4px;
  margin-top: 4px;

  &:hover {
    border-color: $primary;
    background: rgba($primary, 0.02);
  }
}
</style>
