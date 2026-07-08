<template>
  <div class="standard-content">
    <el-card shadow="never" class="content-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="title-text">{{ currentCategory?.name || '请选择质量标准' }}</span>
            <el-tag v-if="currentCategory?.passLine" type="warning" size="small" effect="plain">
              及格线: {{ currentCategory.passLine }}
            </el-tag>
            <el-tag v-if="currentCategory?.year" type="info" size="small" effect="plain">
              {{ currentCategory.year }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-switch
              :model-value="showDetail"
              active-text="显示明细"
              inactive-text="汇总视图"
              @change="$emit('view-change', $event)"
            />
            <el-button
              v-if="currentCategory"
              type="primary"
              size="small"
              @click="$emit('add-standard')"
            >
              <el-icon><Plus /></el-icon>新增标准
            </el-button>
          </div>
        </div>
      </template>

      <EmptyState v-if="!currentCategory" />

      <StandardTree
        v-else
        :standard-data="standardData"
        :show-detail="showDetail"
        @add-item="$emit('add-item', $event)"
        @edit-item="$emit('edit-item', $event)"
        @delete-item="$emit('delete-item', $event)"
      />
    </el-card>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue';
import EmptyState from './EmptyState.vue';
import StandardTree from './StandardTree.vue';

defineProps({
  currentCategory: { type: Object, default: null },
  standardData: { type: Array, default: () => [] },
  showDetail: { type: Boolean, default: true },
});

defineEmits(['add-standard', 'add-item', 'edit-item', 'delete-item', 'view-change']);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.standard-content {
  flex: 1;
  overflow: hidden;

  .content-card {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      overflow-y: auto;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;

      .title-text {
        font-weight: 600;
        font-size: 16px;
        color: $text-primary;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
}
</style>
