<template>
  <div class="page-header">
    <div class="header-left">
      <h2 class="page-title">质量标准维护</h2>
      <span class="page-desc">维护护理质量标准模板，支持Excel导入导出</span>
    </div>
    <div class="header-right">
      <el-button type="primary" plain @click="$emit('import')">
        <el-icon><Upload /></el-icon>导入
      </el-button>
      <el-button type="primary" plain @click="$emit('export')">
        <el-icon><Download /></el-icon>导出
      </el-button>
      <el-button type="primary" @click="$emit('add-root')">
        <el-icon><Plus /></el-icon>新增根节点
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Upload, Download, Plus } from '@element-plus/icons-vue';

defineEmits(['import', 'export', 'add-root']);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: $bg-white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .header-left {
    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 4px 0;
    }
    .page-desc {
      font-size: 13px;
      color: $text-secondary;
    }
  }
  .header-right {
    display: flex;
    gap: 12px;
  }
}
</style>
