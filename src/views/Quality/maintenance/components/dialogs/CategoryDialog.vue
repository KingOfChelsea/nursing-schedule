<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑分类' : '新建分类'"
    width="450px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入分类名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item v-if="formData.level === 1" label="年份" prop="year">
        <el-date-picker
          v-model="formData.year"
          type="year"
          placeholder="选择年份"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item v-if="formData.level === 1" label="及格线" prop="passLine">
        <el-input-number
          v-model="formData.passLine"
          :min="0"
          :max="100"
          :step="5"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item v-if="formData.level > 1" label="上级分类">
        <el-input :model-value="formData.parentName" disabled />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  parentData: { type: Object, default: null },
});

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref(null);
const submitting = ref(false);

const formData = reactive({
  name: '',
  level: 1,
  parentId: null,
  parentName: '',
  year: '',
  passLine: 85,
});

const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
};

// 监听对话框打开
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.isEdit && props.editData) {
        formData.name = props.editData.name;
        formData.level = props.editData.level;
        formData.year = props.editData.year || '';
        formData.passLine = props.editData.passLine || 85;
      } else if (props.parentData) {
        formData.level = props.parentData.level + 1;
        formData.parentId = props.parentData.id;
        formData.parentName = props.parentData.name;
        formData.name = '';
        formData.year = '';
        formData.passLine = 85;
      } else {
        formData.level = 1;
        formData.parentId = null;
        formData.parentName = '';
        formData.name = '';
        formData.year = '';
        formData.passLine = 85;
      }
    }
  },
);

const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true;
      setTimeout(() => {
        emit('submit', { ...formData });
        submitting.value = false;
      }, 300);
    }
  });
};
</script>
