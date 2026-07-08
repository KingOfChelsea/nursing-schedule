<template>
  <div class="root-info">
    <div class="root-header">
      <el-icon :size="24"><FolderOpened /></el-icon>
      <div class="root-details">
        <h3 class="root-title">{{ currentCategory?.name || '质量标准' }}</h3>
        <p class="root-meta">
          <span>及格线: {{ currentCategory?.passLine || 85 }}分</span>
          <span>|</span>
          <span>总分: {{ totalScore }}分</span>
          <span>|</span>
          <span>检查项: {{ totalItems }}项</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FolderOpened } from '@element-plus/icons-vue';

defineProps({
  currentCategory: { type: Object, default: null },
  totalScore: { type: Number, default: 0 },
  totalItems: { type: Number, default: 0 },
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.root-info {
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 8px;

  .root-header {
    display: flex;
    align-items: center;
    gap: 16px;

    .el-icon {
      color: $primary;
    }

    .root-details {
      .root-title {
        margin: 0 0 4px 0;
        font-size: 18px;
        color: $text-primary;
      }

      .root-meta {
        margin: 0;
        font-size: 13px;
        color: $text-secondary;
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
  }
}
</style>
