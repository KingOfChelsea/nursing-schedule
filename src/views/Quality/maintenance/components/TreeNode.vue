<template>
  <div class="custom-tree-node" :class="nodeClasses">
    <div class="node-content">
      <el-icon v-if="data.level === 1" class="node-icon folder"><FolderOpened /></el-icon>
      <el-icon v-else-if="data.level === 2" class="node-icon folder2"><Folder /></el-icon>
      <el-icon v-else class="node-icon file"><Document /></el-icon>
      <span class="node-label">{{ data.name }}</span>
      <span v-if="data.count" class="node-count">({{ data.count }})</span>
    </div>
    <div class="node-actions" @click.stop>
      <el-dropdown trigger="click" @command="handleCommand">
        <el-button text size="small" :icon="MoreFilled" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="addChild">添加子分类</el-dropdown-item>
            <el-dropdown-item command="edit">编辑</el-dropdown-item>
            <el-dropdown-item v-if="data.level < 3" command="addStandard"
              >添加标准</el-dropdown-item
            >
            <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { MoreFilled, FolderOpened, Folder, Document } from '@element-plus/icons-vue';

const props = defineProps({
  node: { type: Object, required: true },
  data: { type: Object, required: true },
});

const emit = defineEmits(['add-child', 'edit', 'delete', 'add-standard']);

const nodeClasses = computed(() => ({
  'is-root': props.data.level === 1,
  'is-level2': props.data.level === 2,
  'is-level3': props.data.level === 3,
}));

const handleCommand = (command) => {
  switch (command) {
    case 'addChild':
      emit('add-child', props.data);
      break;
    case 'edit':
      emit('edit', props.data);
      break;
    case 'addStandard':
      emit('add-standard', props.data);
      break;
    case 'delete':
      emit('delete', props.data);
      break;
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 290px;
  padding: 4px 8px;

  &.is-root .node-label {
    font-weight: 600;
    color: $text-primary;
  }
  &.is-level2 .node-label {
    font-weight: 500;
  }
  &.is-level3 .node-label {
    font-size: 13px;
  }

  .node-content {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;

    .node-icon {
      font-size: 16px;
      flex-shrink: 0;
      &.folder {
        color: #e6a23c;
      }
      &.folder2 {
        color: #409eff;
      }
      &.file {
        color: #909399;
      }
    }

    .node-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .node-count {
      font-size: 12px;
      color: $text-placeholder;
      flex-shrink: 0;
    }
  }

  .node-actions {
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
  }

  &:hover .node-actions {
    opacity: 1;
  }
}
</style>
