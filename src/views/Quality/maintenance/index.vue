<template>
  <div class="quality-maintenance">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">质量维护</h2>
        <span class="page-desc">维护护理质量标准，支持Excel导入导出</span>
      </div>
      <div class="header-right">
        <el-button type="primary" plain @click="showImportDialog">
          <el-icon><Upload /></el-icon>导入
        </el-button>
        <el-button type="primary" plain @click="handleExport">
          <el-icon><Download /></el-icon>导出
        </el-button>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>新增
        </el-button>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧分类树 -->
      <div class="category-tree">
        <div class="tree-header">
          <el-input
            v-model="filterText"
            placeholder="搜索分类"
            size="small"
            clearable
            prefix-icon="Search"
          />
        </div>
        <el-tree
          ref="treeRef"
          :data="categoryTree"
          :props="{ label: 'name', children: 'children' }"
          :filter-node-method="filterNode"
          default-expand-all
          highlight-current
          @node-click="handleCategoryClick"
          class="category-tree-wrapper"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <el-icon v-if="data.icon" class="node-icon"><component :is="data.icon" /></el-icon>
              <span>{{ node.label }}</span>
              <span class="node-count">({{ data.count || 0 }})</span>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧表格区域 -->
      <div class="standard-table">
        <el-card shadow="never" class="table-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <span>{{ currentCategory?.name || '全部标准' }}</span>
                <el-tag v-if="currentCategory" size="small" type="info"
                  >{{ currentCategory.level }}级质量</el-tag
                >
              </div>
              <div class="header-actions">
                <el-switch
                  v-model="showDisabled"
                  active-text="显示停用"
                  @change="handleShowDisabledChange"
                />
              </div>
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="standardList"
            border
            stripe
            style="width: 100%"
            row-key="id"
          >
            <el-table-column type="index" label="序号" width="80" align="center" />
            <el-table-column
              prop="project"
              label="项目/质控标准"
              min-width="200"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <div class="project-cell">
                  <el-icon v-if="row.hasChildren" class="expand-icon"><Plus /></el-icon>
                  <span :class="{ 'parent-project': row.isParent, 'child-project': !row.isParent }">
                    {{ row.project }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="standard"
              label="评分标准"
              min-width="300"
              show-overflow-tooltip
            />
            <el-table-column prop="score" label="分" width="80" align="center" />
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleAddChild(row)"
                  >新增标准</el-button
                >
                <el-button link type="primary" size="small" @click="handleEdit(row)"
                  >编辑</el-button
                >
                <el-button link type="danger" size="small" @click="handleDelete(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        v-loading="submitting"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="standard-form"
      >
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="上级项目" prop="parentId">
          <el-select
            v-model="formData.parentId"
            placeholder="请选择上级项目（可选）"
            style="width: 100%"
          >
            <el-option label="无（顶级项目）" value="" />
            <el-option
              v-for="item in parentOptions"
              :key="item.id"
              :label="item.project"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="项目名称" prop="project">
          <el-input v-model="formData.project" placeholder="请输入项目名称" />
        </el-form-item>

        <el-form-item label="评分标准" prop="standard">
          <el-input
            v-model="formData.standard"
            type="textarea"
            :rows="3"
            placeholder="请输入详细的评分标准描述"
          />
        </el-form-item>

        <el-form-item label="分值" prop="score">
          <el-input-number
            v-model="formData.score"
            :min="0"
            :max="100"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="检查方法" prop="method">
          <el-input v-model="formData.method" placeholder="请输入检查方法" />
        </el-form-item>

        <el-form-item label="检查频次" prop="frequency">
          <el-select v-model="formData.frequency" placeholder="请选择检查频次" style="width: 100%">
            <el-option label="每日" value="每日" />
            <el-option label="每周" value="每周" />
            <el-option label="每月" value="每月" />
            <el-option label="每季度" value="每季度" />
            <el-option label="每半年" value="每半年" />
            <el-option label="每年" value="每年" />
          </el-select>
        </el-form-item>

        <el-form-item label="适用级别" prop="levels">
          <el-checkbox-group v-model="formData.levels">
            <el-checkbox label="一级质量" value="一级质量" />
            <el-checkbox label="二级质量" value="二级质量" />
            <el-checkbox label="三级质量" value="三级质量" />
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="启用">启用</el-radio>
            <el-radio label="停用">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog v-model="importVisible" title="导入质量标准" width="500px">
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
              只能上传 xlsx/xls 文件，且不超过 10MB
              <el-button link type="primary" @click.stop="downloadTemplate">下载模板</el-button>
            </div>
          </template>
        </el-upload>

        <div class="import-options">
          <el-checkbox v-model="importOptions.overwrite">覆盖已存在的数据</el-checkbox>
          <el-checkbox v-model="importOptions.validateOnly">仅验证不导入</el-checkbox>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport" :loading="importing">开始导入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Upload, Download, Plus, UploadFilled } from '@element-plus/icons-vue';
import {
  getCategoryTree,
  getStandardList,
  createStandard,
  updateStandard,
  deleteStandard,
  exportStandards,
  importStandards,
} from '@/api/quality';

// 数据状态
const loading = ref(false);
const submitting = ref(false);
const importing = ref(false);
const dialogVisible = ref(false);
const importVisible = ref(false);
const showDisabled = ref(false);
const filterText = ref('');
const treeRef = ref(null);
const formRef = ref(null);
const currentCategory = ref(null);
const isEdit = ref(false);
const dialogTitle = ref('新增标准');

// 表单数据
const formData = reactive({
  id: null,
  categoryId: '',
  parentId: '',
  project: '',
  standard: '',
  score: 5,
  method: '',
  frequency: '每月',
  levels: ['一级质量', '二级质量', '三级质量'],
  remark: '',
  status: '启用',
});

// 表单验证规则
const formRules = {
  categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
  project: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  standard: [{ required: true, message: '请输入评分标准', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分值', trigger: 'blur' }],
  levels: [{ type: 'array', required: true, message: '请至少选择一个适用级别', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 分页数据
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0,
});

// 分类树数据
const categoryTree = ref([]);
const categoryOptions = ref([]);

// 上级项目选项
const parentOptions = ref([]);

// 标准列表数据
const standardList = ref([]);

// 导入选项
const importOptions = reactive({
  overwrite: false,
  validateOnly: false,
});

// 文件上传
const uploadFile = ref(null);

// 获取分类树
const fetchCategoryTree = async () => {
  try {
    const res = await getCategoryTree();
    categoryTree.value = res.data;
    categoryOptions.value = flattenCategories(res.data);
  } catch (error) {
    console.error('获取分类树失败:', error);
    ElMessage.error('获取分类树失败');
  }
};

// 扁平化分类数据
const flattenCategories = (tree) => {
  const result = [];
  const traverse = (nodes) => {
    nodes.forEach((node) => {
      result.push({
        id: node.id,
        name: node.name,
        level: node.level,
      });
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(tree);
  return result;
};

// 获取标准列表
const fetchStandardList = async () => {
  if (!currentCategory.value && !filterText.value) return;

  loading.value = true;
  try {
    const params = {
      categoryId: currentCategory.value?.id,
      page: pagination.page,
      size: pagination.size,
      showDisabled: showDisabled.value,
      keyword: filterText.value,
    };

    const res = await getStandardList(params);
    standardList.value = res.data.records;
    pagination.total = res.data.total;
  } catch (error) {
    console.error('获取标准列表失败:', error);
    ElMessage.error('获取标准列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取上级项目选项
const fetchParentOptions = async () => {
  try {
    const res = await getStandardList({
      categoryId: formData.categoryId,
      pageSize: 9999,
    });
    parentOptions.value = res.data.records.filter((item) => !item.parentId);
  } catch (error) {
    console.error('获取上级项目失败:', error);
  }
};

// 分类树过滤
const filterNode = (value, data) => {
  if (!value) return true;
  return data.name.includes(value);
};

// 监听筛选条件变化
watch(filterText, (val) => {
  treeRef.value.filter(val);
});

// 点击分类节点
const handleCategoryClick = (data) => {
  currentCategory.value = data;
  pagination.page = 1;
  fetchStandardList();
};

// 切换显示停用
const handleShowDisabledChange = () => {
  pagination.page = 1;
  fetchStandardList();
};

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.size = size;
  pagination.page = 1;
  fetchStandardList();
};

// 页码变化
const handleCurrentChange = (page) => {
  pagination.page = page;
  fetchStandardList();
};

// 显示新增对话框
const showAddDialog = () => {
  isEdit.value = false;
  dialogTitle.value = '新增标准';
  resetForm();
  dialogVisible.value = true;
};

// 添加子项
const handleAddChild = (row) => {
  isEdit.value = false;
  dialogTitle.value = '新增子标准';
  resetForm();
  formData.categoryId = row.categoryId;
  formData.parentId = row.id;
  dialogVisible.value = true;
};

// 编辑标准
const handleEdit = (row) => {
  isEdit.value = true;
  dialogTitle.value = '编辑标准';
  Object.assign(formData, {
    id: row.id,
    categoryId: row.categoryId,
    parentId: row.parentId || '',
    project: row.project,
    standard: row.standard,
    score: row.score,
    method: row.method,
    frequency: row.frequency,
    levels: row.levels || ['一级质量', '二级质量', '三级质量'],
    remark: row.remark || '',
    status: row.status,
  });
  dialogVisible.value = true;
  nextTick(() => {
    fetchParentOptions();
  });
};

// 删除标准
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除"${row.project}"吗？删除后不可恢复！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteStandard(row.id);
        ElMessage.success('删除成功');
        fetchStandardList();
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        const api = isEdit.value ? updateStandard : createStandard;
        await api(formData);
        ElMessage.success(isEdit.value ? '修改成功' : '创建成功');
        dialogVisible.value = false;
        fetchStandardList();
      } catch (error) {
        console.error('操作失败:', error);
        ElMessage.error('操作失败');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    categoryId: currentCategory.value?.id || '',
    parentId: '',
    project: '',
    standard: '',
    score: 5,
    method: '',
    frequency: '每月',
    levels: ['一级质量', '二级质量', '三级质量'],
    remark: '',
    status: '启用',
  });
  formRef.value?.resetFields();
};

// 显示导入对话框
const showImportDialog = () => {
  importOptions.overwrite = false;
  importOptions.validateOnly = false;
  uploadFile.value = null;
  importVisible.value = true;
};

// 文件变化
const handleFileChange = (uploadFile) => {
  this.uploadFile = uploadFile.raw;
};

// 确认导入
const confirmImport = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请先选择文件');
    return;
  }

  importing.value = true;
  try {
    const formData = new FormData();
    formData.append('file', uploadFile.value);
    formData.append('overwrite', importOptions.overwrite);
    formData.append('validateOnly', importOptions.validateOnly);

    const res = await importStandards(formData);
    ElMessage.success(`导入成功，共处理 ${res.data.successCount} 条数据`);
    importVisible.value = false;
    fetchStandardList();
  } catch (error) {
    console.error('导入失败:', error);
    ElMessage.error('导入失败：' + (error.message || '未知错误'));
  } finally {
    importing.value = false;
  }
};

// 下载模板
const downloadTemplate = () => {
  // 这里应该调用下载模板的API
  ElMessage.success('模板下载中...');
  // 实际项目中应使用：
  // window.open('/api/quality/template/download')
};

// 导出标准
const handleExport = async () => {
  try {
    const params = {
      categoryId: currentCategory.value?.id,
      showDisabled: showDisabled.value,
      keyword: filterText.value,
    };
    await exportStandards(params);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

// 生命周期
onMounted(() => {
  fetchCategoryTree();
  // 默认加载第一个分类的数据
  if (categoryTree.value.length > 0) {
    currentCategory.value = categoryTree.value[0];
    fetchStandardList();
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.quality-maintenance {
  padding: 20px;
  background: $bg-base;
  min-height: calc(100vh - 84px);
}

// 页面头部
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

// 主内容区
.main-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 160px);
}

// 左侧分类树
.category-tree {
  width: 280px;
  background: $bg-white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;

  .tree-header {
    padding: 16px;
    border-bottom: 1px solid $border-light;

    .el-input {
      :deep(.el-input__wrapper) {
        box-shadow: 0 0 0 1px $border-light inset;
      }
    }
  }

  .category-tree-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;

    :deep(.el-tree-node__content) {
      height: 36px;
      line-height: 36px;
    }
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    .node-icon {
      font-size: 14px;
      color: $text-secondary;
    }

    .node-count {
      margin-left: auto;
      font-size: 12px;
      color: $text-placeholder;
    }
  }
}

// 右侧表格区域
.standard-table {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .table-card {
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;

      span {
        font-weight: 600;
        font-size: 16px;
        color: $text-primary;
      }

      .el-tag {
        font-size: 12px;
      }
    }
  }

  .pagination-container {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid $border-light;
  }
}

// 表格单元格样式
.project-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .expand-icon {
    color: $text-secondary;
    font-size: 12px;
  }

  .parent-project {
    font-weight: 600;
    color: $text-primary;
  }

  .child-project {
    color: $text-regular;
    padding-left: 16px;
  }
}

// 表单样式
.standard-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: $text-primary;
  }
}

// 导入对话框
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
      border: 2px dashed $border-light;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        border-color: $primary;
      }

      .el-icon--upload {
        font-size: 48px;
        color: $primary;
        margin-bottom: 12px;
      }

      .el-upload__text {
        color: $text-regular;
        em {
          color: $primary;
          cursor: pointer;
        }
      }
    }

    .el-upload__tip {
      margin-top: 12px;
      font-size: 13px;
      color: $text-secondary;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .import-options {
    margin-top: 24px;
    padding: 16px;
    background: $bg-base;
    border-radius: 8px;
    display: flex;
    gap: 24px;
  }
}

// 响应式
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    height: auto;
  }

  .category-tree {
    width: 100%;
    height: 300px;
  }
}
</style>
