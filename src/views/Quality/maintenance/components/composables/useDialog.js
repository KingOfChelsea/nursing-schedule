import { ref } from 'vue';

export function useDialog() {
  // 对话框可见性
  const categoryDialogVisible = ref(false);
  const standardDialogVisible = ref(false);
  const importVisible = ref(false);

  // 对话框状态
  const isEditCategory = ref(false);
  const editCategoryData = ref(null);
  const categoryParentData = ref(null);
  const initialThirdLevel = ref('');

  // 显示添加分类对话框
  const showAddCategoryDialog = (parentData = null) => {
    isEditCategory.value = false;
    editCategoryData.value = null;
    categoryParentData.value = parentData;
    categoryDialogVisible.value = true;
  };

  // 显示添加根节点对话框
  const showAddRootDialog = () => {
    showAddCategoryDialog();
  };

  // 编辑分类
  const editCategory = (data) => {
    isEditCategory.value = true;
    editCategoryData.value = data;
    categoryParentData.value = null;
    categoryDialogVisible.value = true;
  };

  // 显示添加标准对话框
  const showAddStandardDialog = () => {
    initialThirdLevel.value = '';
    standardDialogVisible.value = true;
  };

  // 显示添加检查项对话框
  const showAddItemDialog = (thirdLevelData) => {
    initialThirdLevel.value = thirdLevelData?.name || '';
    standardDialogVisible.value = true;
  };

  // 显示导入对话框
  const showImportDialog = () => {
    importVisible.value = true;
  };

  // 关闭对话框
  const closeCategoryDialog = () => {
    categoryDialogVisible.value = false;
  };

  const closeStandardDialog = () => {
    standardDialogVisible.value = false;
  };

  const closeImportDialog = () => {
    importVisible.value = false;
  };

  return {
    // 可见性
    categoryDialogVisible,
    standardDialogVisible,
    importVisible,

    // 状态
    isEditCategory,
    editCategoryData,
    categoryParentData,
    initialThirdLevel,

    // 方法
    showAddCategoryDialog,
    showAddRootDialog,
    editCategory,
    showAddStandardDialog,
    showAddItemDialog,
    showImportDialog,
    closeCategoryDialog,
    closeStandardDialog,
    closeImportDialog,
  };
}
