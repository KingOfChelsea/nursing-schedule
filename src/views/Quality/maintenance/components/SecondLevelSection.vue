<template>
  <div class="second-level">
    <div class="level-header level-2">
      <el-icon><Menu /></el-icon>
      <span class="level-label">二级：</span>
      <span class="level-name">{{ data.name }}</span>
    </div>

    <ThirdLevelSection
      v-for="(third, ti) in data.children"
      :key="ti"
      :data="third"
      :show-detail="showDetail"
      @add-item="$emit('add-item', $event)"
      @edit-item="$emit('edit-item', $event)"
      @delete-item="$emit('delete-item', $event)"
    />
  </div>
</template>

<script setup>
import { Menu } from '@element-plus/icons-vue';
import ThirdLevelSection from './ThirdLevelSection.vue';

defineProps({
  data: { type: Object, required: true },
  showDetail: { type: Boolean, default: true },
});

defineEmits(['add-item', 'edit-item', 'delete-item']);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.second-level {
  border-top: 1px solid $border-lighter;

  .level-header {
    padding: 10px 16px 10px 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    background: #fafafa;
    color: $text-primary;
    font-weight: 500;

    .level-label {
      color: $text-secondary;
      font-weight: 400;
    }
  }
}
</style>
