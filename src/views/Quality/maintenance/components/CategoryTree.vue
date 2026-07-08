<template>
  <div class="category-tree">
    <div class="tree-header">
      <el-input
        v-model="searchText"
        placeholder="搜索分类"
        size="small"
        clearable
        prefix-icon="Search"
        @input="handleFilter"
      />
      <el-button text type="primary" size="small" @click="$emit('add-category')">
        <el-icon><FolderAdd /></el-icon>新建
      </el-button>
    </div>
    <el-tree
      ref="treeRef"
      :data="data"
      node-key="id"
      :props="treeProps"
      :filter-node-method="filterNode"
      default-expand-all
      highlight-current
      draggable
      :allow-drop="allowDrop"
      @node-click="handleNodeClick"
      @node-drop="handleNodeDrop"
      class="category-tree-wrapper"
    >
      <template #default="{ node, data }">
        <TreeNode
          :node="node"
          :data="data"
          @add-child="(d) => $emit('add-category', d)"
          @edit="(d) => $emit('edit-category', d)"
          @delete="(d) => $emit('delete-category', d)"
          @add-standard="(d) => $emit('add-standard', d)"
        />
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, FolderAdd } from '@element-plus/icons-vue';
import TreeNode from './TreeNode.vue';

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  filterText: {
    type: String,
    default: '',
  },
});

const emit = defineEmits([
  'node-click',
  'add-category',
  'edit-category',
  'delete-category',
  'add-standard',
]);

const treeRef = ref(null);
const searchText = ref('');

const treeProps = {
  label: 'name',
  children: 'children',
};

const filterNode = (value, data) => {
  if (!value) return true;
  return data.name.includes(value);
};

const handleFilter = (val) => {
  treeRef.value?.filter(val);
};

const allowDrop = (draggingNode, dropNode, type) => {
  return draggingNode.data.level === dropNode.data.level;
};

const handleNodeDrop = () => {
  ElMessage.success('分类排序已更新');
};

const handleNodeClick = (data) => {
  emit('node-click', data);
};
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.category-tree {
  width: 340px;
  background: $bg-white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .tree-header {
    padding: 12px 16px;
    border-bottom: 1px solid $border-light;
    display: flex;
    gap: 8px;
    align-items: center;

    .el-input {
      flex: 1;
    }
  }

  .category-tree-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }
}
</style>
