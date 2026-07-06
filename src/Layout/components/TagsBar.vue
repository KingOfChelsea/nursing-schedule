<template>
  <div class="tabs-bar">
    <div class="tabs-wrapper">
      <el-tag
        v-for="tab in tags"
        :key="tab.path"
        :closable="tab.closable !== false && tab.path !== '/dashboard'"
        :type="tab.path === currentPath ? '' : 'info'"
        :effect="tab.path === currentPath ? 'dark' : 'plain'"
        @close="$emit('close-tag', tab)"
        @click="$emit('switch-tag', tab)"
        class="tab-item"
        size="small"
      >
        {{ tab.title }}
      </el-tag>
    </div>
    <div class="tabs-actions">
      <el-dropdown trigger="click" @command="$emit('tags-action', $event)">
        <el-button text size="small">
          标签操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="closeOther">关闭其他</el-dropdown-item>
            <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'

defineProps({
  tags: {
    type: Array,
    required: true
  },
  currentPath: {
    type: String,
    required: true
  }
})

defineEmits(['switch-tag', 'close-tag', 'tags-action'])
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.tabs-bar {
  background: $bg-white;
  border-bottom: 1px solid $border-light;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  .tabs-wrapper {
    flex: 1;
    display: flex;
    gap: 4px;
    overflow-x: auto;
    white-space: nowrap;

    &::-webkit-scrollbar {
      height: 0;
    }

    .tab-item {
      cursor: pointer;
      flex-shrink: 0;
      user-select: none;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        opacity: 0.8;
      }

      &.el-tag--dark {
        background: rgba(52, 152, 219, 0.1);
        border-color: rgba(52, 152, 219, 0.2);
        color: #2980b9;
      }
    }
  }

  .tabs-actions {
    flex-shrink: 0;
    
    .el-button {
      color: $text-secondary;
      
      &:hover {
        color: $primary;
      }
    }
  }
}
</style>