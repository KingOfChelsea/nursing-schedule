<template>
  <el-dialog
    :model-value="visible"
    title="新增检查标准"
    width="700px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="一级分类" prop="firstLevel">
        <el-select v-model="formData.firstLevel" placeholder="选择一级分类" style="width: 100%">
          <el-option v-for="item in firstLevelOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类" prop="secondLevel">
        <el-select v-model="formData.secondLevel" placeholder="选择二级分类" style="width: 100%">
          <el-option v-for="item in secondLevelOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类" prop="thirdLevel">
        <el-select v-model="formData.thirdLevel" placeholder="选择三级分类" style="width: 100%">
          <el-option v-for="item in thirdLevelOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="检查内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="3"
          placeholder="请输入检查标准内容"
        />
      </el-form-item>
      <el-form-item label="分值" prop="score">
        <el-input-number
          v-model="formData.score"
          :min="0"
          :max="100"
          :step="0.5"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="检查方法" prop="method">
        <el-input v-model="formData.method" placeholder="如：现场查看、查阅资料等" />
      </el-form-item>
      <el-form-item label="检查频次" prop="frequency">
        <el-select v-model="formData.frequency" placeholder="选择频次" style="width: 100%">
          <el-option label="每日" value="每日" />
          <el-option label="每周" value="每周" />
          <el-option label="每月" value="每月" />
          <el-option label="每季度" value="每季度" />
          <el-option label="每半年" value="每半年" />
          <el-option label="每年" value="每年" />
        </el-select>
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
  firstLevelOptions: { type: Array, default: () => [] },
  secondLevelOptions: { type: Array, default: () => [] },
  thirdLevelOptions: { type: Array, default: () => [] },
  initialThirdLevel: { type: String, default: '' },
});

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref(null);
const submitting = ref(false);

const formData = reactive({
  firstLevel: '',
  secondLevel: '',
  thirdLevel: '',
  content: '',
  score: 5,
  method: '',
  frequency: '每日',
});

const formRules = {
  firstLevel: [{ required: true, message: '请选择一级分类', trigger: 'change' }],
  secondLevel: [{ required: true, message: '请选择二级分类', trigger: 'change' }],
  thirdLevel: [{ required: true, message: '请选择三级分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入检查内容', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分值', trigger: 'blur' }],
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      formData.thirdLevel = props.initialThirdLevel || '';
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
