<template>
  <div class="standard-item">
    <div class="item-header">
      <span class="item-index">{{ index + 1 }}</span>
      <span class="item-content">{{ data.content }}</span>
      <el-tag v-if="data.score" size="small" type="success" effect="plain">
        {{ data.score }}分
      </el-tag>
    </div>
    <div class="item-actions">
      <el-button text type="primary" size="small" @click="$emit('edit', data)">编辑</el-button>
      <el-button text type="danger" size="small" @click="$emit('delete', data)">删除</el-button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Object, required: true },
  index: { type: Number, default: 0 },
});

defineEmits(['edit', 'delete']);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.standard-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: $bg-base;

    .item-actions {
      opacity: 1;
    }
  }

  .item-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex: 1;

    .item-index {
      width: 20px;
      height: 20px;
      background: $primary;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .item-content {
      flex: 1;
      line-height: 1.6;
      color: $text-regular;
    }
  }

  .item-actions {
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
    display: flex;
    gap: 4px;
  }
}
</style>
