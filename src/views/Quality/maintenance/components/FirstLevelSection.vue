<template>
  <div class="first-level">
    <div class="level-header level-1">
      <el-icon><List /></el-icon>
      <span class="level-label">一级：</span>
      <span class="level-name">{{ data.name }}</span>
    </div>

    <SecondLevelSection
      v-for="(second, si) in data.children"
      :key="si"
      :data="second"
      :show-detail="showDetail"
      @add-item="$emit('add-item', $event)"
      @edit-item="$emit('edit-item', $event)"
      @delete-item="$emit('delete-item', $event)"
    />
  </div>
</template>

<script setup>
import { List } from '@element-plus/icons-vue';
import SecondLevelSection from './SecondLevelSection.vue';

defineProps({
  data: { type: Object, required: true },
  index: { type: Number, default: 0 },
  showDetail: { type: Boolean, default: true },
});

defineEmits(['add-item', 'edit-item', 'delete-item']);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.first-level {
  margin-bottom: 24px;
  border: 1px solid $border-light;
  border-radius: 8px;
  overflow: hidden;

  .level-header {
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;

    &.level-1 {
      background: #f0f5ff;
      color: $primary;
      font-weight: 600;
    }

    .level-label {
      color: $text-secondary;
      font-weight: 400;
    }
  }
}
</style>
