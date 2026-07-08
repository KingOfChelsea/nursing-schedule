<template>
  <div class="quality-maintenance">
    <MaintenanceHeader
      @import="showImportDialog"
      @export="handleExport"
      @add-root="showAddRootDialog"
    />

    <div class="main-content">
      <CategoryTree
        :data="categoryTree"
        :filter-text="filterText"
        @node-click="handleCategoryClick"
        @add-category="showAddCategoryDialog"
        @edit-category="editCategory"
        @delete-category="deleteCategory"
        @add-standard="showAddStandardDialog"
      />

      <StandardContent
        :current-category="currentCategory"
        :standard-data="standardData"
        :show-detail="showDetail"
        @add-standard="showAddStandardDialog"
        @add-item="showAddItemDialog"
        @edit-item="handleEditItem"
        @delete-item="handleDeleteItem"
        @view-change="handleViewChange"
      />
    </div>

    <CategoryDialog
      v-model:visible="categoryDialogVisible"
      :is-edit="isEditCategory"
      :edit-data="editCategoryData"
      :parent-data="categoryParentData"
      @submit="submitCategory"
    />

    <StandardDialog
      v-model:visible="standardDialogVisible"
      :first-level-options="firstLevelOptions"
      :second-level-options="secondLevelOptions"
      :third-level-options="thirdLevelOptions"
      :initial-third-level="initialThirdLevel"
      @submit="submitStandard"
    />

    <ImportDialog
      v-model:visible="importVisible"
      @import="confirmImport"
      @download-template="downloadTemplate"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import MaintenanceHeader from './components/MaintenanceHeader.vue';
import CategoryTree from './components/CategoryTree.vue';
import StandardContent from './components/StandardContent.vue';
import CategoryDialog from './components/dialogs/CategoryDialog.vue';
import StandardDialog from './components/dialogs/StandardDialog.vue';
import ImportDialog from './components/dialogs/ImportDialog.vue';
import { useCategoryTree } from './components/composables/useCategoryTree';
import { useStandardData } from './components/composables/useStandardData';
import { useDialog } from './components/composables/useDialog';

// 组合式函数
const { categoryTree, filterText, addCategory, updateCategory, removeCategory, findInTree } =
  useCategoryTree();

const {
  standardData,
  totalScore,
  totalItems,
  firstLevelOptions,
  secondLevelOptions,
  thirdLevelOptions,
  loadStandardData,
  addStandardItem,
  removeStandardItem,
} = useStandardData();

const {
  categoryDialogVisible,
  standardDialogVisible,
  importVisible,
  isEditCategory,
  editCategoryData,
  categoryParentData,
  initialThirdLevel,
  showAddCategoryDialog,
  showAddRootDialog,
  showAddStandardDialog,
  showAddItemDialog,
  showImportDialog,
  editCategory,
  closeCategoryDialog,
  closeStandardDialog,
  closeImportDialog,
} = useDialog();

// 状态
const currentCategory = ref(null);
const showDetail = ref(true);

// 分类点击
const handleCategoryClick = (data) => {
  if (data.level === 3) {
    currentCategory.value = data;
    loadStandardData(data.id);
  } else {
    currentCategory.value = null;
  }
};

// 删除分类
const deleteCategory = (data) => {
  ElMessageBox.confirm(
    `确定要删除分类「${data.name}」吗？${data.children?.length ? '其下的所有子分类也将被删除。' : ''}`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(() => {
      removeCategory(data.id);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

// 提交分类
const submitCategory = (formData) => {
  if (isEditCategory.value && editCategoryData.value) {
    updateCategory(editCategoryData.value.id, formData);
    ElMessage.success('分类更新成功');
  } else {
    addCategory(formData);
    ElMessage.success('分类创建成功');
  }
  closeCategoryDialog();
};

// 提交标准
const submitStandard = (formData) => {
  addStandardItem(formData);
  ElMessage.success('检查标准添加成功');
  closeStandardDialog();
};

// 编辑检查项
const handleEditItem = (item) => {
  ElMessage.info('编辑功能开发中');
};

// 删除检查项
const handleDeleteItem = (item) => {
  ElMessageBox.confirm('确定要删除此项检查标准吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      removeStandardItem(item);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

// 视图切换
const handleViewChange = (val) => {
  showDetail.value = val;
};

// 导入
const confirmImport = () => {
  ElMessage.success('导入成功，共导入 32 条检查标准');
  closeImportDialog();
};

const downloadTemplate = () => {
  ElMessage.success('模板下载中...');
};

const handleExport = () => {
  ElMessage.success('数据导出中...');
};

onMounted(() => {
  loadStandardData();
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.quality-maintenance {
  padding: 20px;
  background: $bg-base;
  min-height: calc(100vh - 144px);
}

.main-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 220px);
}
</style>
