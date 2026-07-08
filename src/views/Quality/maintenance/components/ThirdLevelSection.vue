<template>
  <div class="third-level">
    <div class="level-header level-3">
      <el-icon><Edit /></el-icon>
      <span class="level-label">三级：</span>
      <span class="level-name">{{ data.name }}</span>
    </div>

    <div class="fourth-level">
      <StandardItem
        v-for="(item, ii) in data.children"
        :key="ii"
        :data="item"
        :index="ii"
        @edit="$emit('edit-item', $event)"
        @delete="$emit('delete-item', $event)"
      />
      <AddItemButton @click="$emit('add-item', data)" />
    </div>
  </div>
</template>

<script setup>
import { Edit } from '@element-plus/icons-vue';
import StandardItem from './StandardItem.vue';
import AddItemButton from './AddItemButton.vue';

defineProps({
  data: { type: Object, required: true },
  showDetail: { type: Boolean, default: true },
});

defineEmits(['add-item', 'edit-item', 'delete-item']);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.third-level {
  border-top: 1px solid $border-extra-light;

  .level-header {
    padding: 10px 16px 10px 56px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    background: #f5f5f5;
    color: $text-regular;
    font-weight: 500;

    .level-label {
      color: $text-secondary;
      font-weight: 400;
    }
  }

  .fourth-level {
    padding: 8px 72px;
  }
}
</style>
