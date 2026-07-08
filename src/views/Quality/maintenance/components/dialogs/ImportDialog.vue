<template>
  <el-dialog
    :model-value="visible"
    title="导入质量标准"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="import-content">
      <el-upload
        class="upload-area"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将Excel文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xlsx/xls 文件
            <el-button link type="primary" @click.stop="$emit('download-template')"
              >下载模板</el-button
            >
          </div>
        </template>
      </el-upload>

      <div class="import-options">
        <el-checkbox v-model="importOptions.overwrite">覆盖已存在的数据</el-checkbox>
        <el-checkbox v-model="importOptions.validateOnly">仅验证不导入</el-checkbox>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="$emit('import')" :loading="importing">开始导入</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';

defineProps({
  visible: { type: Boolean, default: false },
});

defineEmits(['update:visible', 'import', 'download-template']);

const importing = ref(false);

const importOptions = reactive({
  overwrite: false,
  validateOnly: false,
});

const handleFileChange = (file) => {
  console.log('文件已选择:', file.name);
};
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.import-content {
  .upload-area {
    :deep(.el-upload) {
      width: 100%;
    }
    :deep(.el-upload-dragger) {
      width: 100%;
      height: 160px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .el-upload__tip {
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .import-options {
    margin-top: 20px;
    padding: 16px;
    background: $bg-base;
    border-radius: 8px;
    display: flex;
    gap: 24px;
  }
}
</style>
