<template>
  <div class="quality-maintenance">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">质量标准维护</h2>
        <span class="page-desc">维护护理质量标准模板，支持Excel导入导出</span>
      </div>
      <div class="header-right">
        <el-button type="primary" plain @click="showImportDialog">
          <el-icon><Upload /></el-icon>导入
        </el-button>
        <el-button type="primary" plain @click="handleExport">
          <el-icon><Download /></el-icon>导出
        </el-button>
        <el-button type="primary" @click="showAddRootDialog">
          <el-icon><Plus /></el-icon>新增根节点
        </el-button>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧三级分类树 -->
      <div class="category-tree">
        <div class="tree-header">
          <el-input
            v-model="filterText"
            placeholder="搜索分类"
            size="small"
            clearable
            prefix-icon="Search"
          />
          <el-button text type="primary" size="small" @click="showAddCategoryDialog">
            <el-icon><FolderAdd /></el-icon>新建分类
          </el-button>
        </div>
        <el-tree
          ref="treeRef"
          :data="categoryTree"
          node-key="id"
          :props="treeProps"
          :filter-node-method="filterNode"
          default-expand-all
          highlight-current
          draggable
          :allow-drop="allowDrop"
          @node-click="handleCategoryClick"
          @node-drop="handleDrop"
          class="category-tree-wrapper"
        >
          <template #default="{ node, data }">
            <div
              class="custom-tree-node"
              :class="{
                'is-root': data.level === 1,
                'is-level2': data.level === 2,
                'is-level3': data.level === 3,
              }"
            >
              <div class="node-content">
                <el-icon v-if="data.level === 1" class="node-icon folder"><FolderOpened /></el-icon>
                <el-icon v-else-if="data.level === 2" class="node-icon folder2"><Folder /></el-icon>
                <el-icon v-else class="node-icon file"><Document /></el-icon>
                <span class="node-label">{{ data.name }}</span>
                <span v-if="data.count" class="node-count">({{ data.count }})</span>
              </div>
              <div class="node-actions" @click.stop>
                <el-dropdown trigger="click" @command="(cmd) => handleNodeCommand(cmd, data)">
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
        </el-tree>
      </div>

      <!-- 右侧标准内容 -->
      <div class="standard-content">
        <el-card shadow="never" class="content-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <span class="title-text">{{ currentCategory?.name || '请选择质量标准' }}</span>
                <el-tag v-if="currentCategory?.passLine" type="warning" size="small" effect="plain">
                  及格线: {{ currentCategory.passLine }}
                </el-tag>
                <el-tag v-if="currentCategory?.year" type="info" size="small" effect="plain">
                  {{ currentCategory.year }}
                </el-tag>
              </div>
              <div class="header-actions">
                <el-switch
                  v-model="showDetail"
                  active-text="显示明细"
                  inactive-text="汇总视图"
                  @change="handleViewChange"
                />
                <el-button
                  v-if="currentCategory"
                  type="primary"
                  size="small"
                  @click="showAddStandardDialog"
                >
                  <el-icon><Plus /></el-icon>新增标准
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="!currentCategory" class="empty-state">
            <el-empty description="请从左侧选择一个质量标准" />
          </div>

          <div v-else class="standard-tree">
            <!-- 根节点信息 -->
            <div class="root-info">
              <div class="root-header">
                <el-icon :size="24"><FolderOpened /></el-icon>
                <div class="root-details">
                  <h3 class="root-title">{{ currentCategory.name }}</h3>
                  <p class="root-meta">
                    <span>及格线: {{ currentCategory.passLine }}分</span>
                    <span>|</span>
                    <span>总分: {{ totalScore }}分</span>
                    <span>|</span>
                    <span>检查项: {{ totalItems }}项</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- 四级标准内容 -->
            <div class="standard-items">
              <div v-for="(firstLevel, fi) in standardData" :key="fi" class="first-level">
                <div class="level-header level-1">
                  <el-icon><List /></el-icon>
                  <span class="level-label">一级：</span>
                  <span class="level-name">{{ firstLevel.name }}</span>
                </div>

                <div
                  v-for="(secondLevel, si) in firstLevel.children"
                  :key="si"
                  class="second-level"
                >
                  <div class="level-header level-2">
                    <el-icon><Menu /></el-icon>
                    <span class="level-label">二级：</span>
                    <span class="level-name">{{ secondLevel.name }}</span>
                  </div>

                  <div
                    v-for="(thirdLevel, ti) in secondLevel.children"
                    :key="ti"
                    class="third-level"
                  >
                    <div class="level-header level-3">
                      <el-icon><Edit /></el-icon>
                      <span class="level-label">三级：</span>
                      <span class="level-name">{{ thirdLevel.name }}</span>
                    </div>

                    <div class="fourth-level">
                      <div
                        v-for="(item, ii) in thirdLevel.children"
                        :key="ii"
                        class="standard-item"
                      >
                        <div class="item-header">
                          <span class="item-index">{{ ii + 1 }}</span>
                          <span class="item-content">{{ item.content }}</span>
                          <el-tag v-if="item.score" size="small" type="success" effect="plain">
                            {{ item.score }}分
                          </el-tag>
                        </div>
                        <div class="item-actions">
                          <el-button text type="primary" size="small" @click="handleEditItem(item)"
                            >编辑</el-button
                          >
                          <el-button text type="danger" size="small" @click="handleDeleteItem(item)"
                            >删除</el-button
                          >
                        </div>
                      </div>
                      <div class="add-item-btn">
                        <el-button
                          text
                          type="primary"
                          size="small"
                          @click="showAddItemDialog(thirdLevel)"
                        >
                          <el-icon><Plus /></el-icon>添加检查项
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 新建/编辑分类对话框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryDialogTitle"
      width="450px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="categoryForm.name"
            placeholder="请输入分类名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item v-if="categoryForm.level === 1" label="年份" prop="year">
          <el-date-picker
            v-model="categoryForm.year"
            type="year"
            placeholder="选择年份"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="categoryForm.level === 1" label="及格线" prop="passLine">
          <el-input-number
            v-model="categoryForm.passLine"
            :min="0"
            :max="100"
            :step="5"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="categoryForm.level > 1" label="上级分类" prop="parentId">
          <el-input :model-value="categoryForm.parentName" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCategory" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增标准对话框 -->
    <el-dialog
      v-model="standardDialogVisible"
      title="新增检查标准"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="standardFormRef"
        :model="standardForm"
        :rules="standardRules"
        label-width="100px"
      >
        <el-form-item label="一级分类" prop="firstLevel">
          <el-select
            v-model="standardForm.firstLevel"
            placeholder="选择一级分类"
            style="width: 100%"
          >
            <el-option v-for="item in firstLevelOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类" prop="secondLevel">
          <el-select
            v-model="standardForm.secondLevel"
            placeholder="选择二级分类"
            style="width: 100%"
          >
            <el-option v-for="item in secondLevelOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="三级分类" prop="thirdLevel">
          <el-select
            v-model="standardForm.thirdLevel"
            placeholder="选择三级分类"
            style="width: 100%"
          >
            <el-option v-for="item in thirdLevelOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="检查内容" prop="content">
          <el-input
            v-model="standardForm.content"
            type="textarea"
            :rows="3"
            placeholder="请输入检查标准内容"
          />
        </el-form-item>
        <el-form-item label="分值" prop="score">
          <el-input-number
            v-model="standardForm.score"
            :min="0"
            :max="100"
            :step="0.5"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="检查方法" prop="method">
          <el-input v-model="standardForm.method" placeholder="如：现场查看、查阅资料等" />
        </el-form-item>
        <el-form-item label="检查频次" prop="frequency">
          <el-select v-model="standardForm.frequency" placeholder="选择频次" style="width: 100%">
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
        <el-button @click="standardDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStandard" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importVisible"
      title="导入质量标准"
      width="500px"
      :close-on-click-modal="false"
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
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport" :loading="importing">开始导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Upload,
  Download,
  Plus,
  FolderAdd,
  MoreFilled,
  FolderOpened,
  Folder,
  Document,
  List,
  Menu,
  Edit,
  UploadFilled,
} from '@element-plus/icons-vue';

// ==================== 模拟数据 ====================
const mockCategoryTree = [
  {
    id: 1,
    name: '全部',
    level: 1,
    count: 86,
    children: [
      {
        id: 11,
        name: '护理总值班',
        level: 2,
        count: 62,
        children: [
          {
            id: 111,
            name: '2026年1月护理总值班（病区）(及格线:85)',
            level: 3,
            passLine: 85,
            year: '2026年',
            count: 32,
          },
          {
            id: 112,
            name: '2026年1月护理总值班（门急诊）(及格线:85)',
            level: 3,
            passLine: 85,
            year: '2026年',
            count: 30,
          },
        ],
      },
      {
        id: 12,
        name: '普通病区',
        level: 2,
        count: 24,
        children: [
          {
            id: 121,
            name: '基础护理质量标准(及格线:90)',
            level: 3,
            passLine: 90,
            year: '2026年',
            count: 24,
          },
        ],
      },
    ],
  },
];

const mockStandardData = [
  {
    name: '护理值班查房评价标准（病区）',
    children: [
      {
        name: '急救车管理',
        children: [
          {
            name: '现场查看',
            children: [
              {
                content: '定位放置；车面不放杂物；有急救车醒目标识',
                score: 4,
                method: '现场查看',
                frequency: '每日',
              },
              { content: '急救车整洁，活动自如', score: 3, method: '现场查看', frequency: '每日' },
              {
                content: '设立急救车点数记录本及基数表',
                score: 4,
                method: '现场查看',
                frequency: '每日',
              },
              {
                content: '物品定位放置，无菌与非无菌物品分类放置，放置合理，便于取用',
                score: 5,
                method: '现场查看',
                frequency: '每日',
              },
              { content: '物品与基数表相符', score: 5, method: '现场查看', frequency: '每日' },
            ],
          },
          {
            name: '查阅记录',
            children: [
              {
                content: '急救车点数记录本记录完整，签名规范',
                score: 3,
                method: '查阅记录',
                frequency: '每周',
              },
              {
                content: '急救车封条完好，封条更换记录完整',
                score: 3,
                method: '查阅记录',
                frequency: '每周',
              },
            ],
          },
        ],
      },
      {
        name: '患者身份识别',
        children: [
          {
            name: '现场查看',
            children: [
              {
                content: '患者佩戴腕带，信息清晰可辨',
                score: 4,
                method: '现场查看',
                frequency: '每日',
              },
              {
                content: '给药前核对腕带信息，执行双人核对',
                score: 5,
                method: '现场查看',
                frequency: '每日',
              },
              {
                content: '操作前后核对患者身份，使用两种以上方式',
                score: 5,
                method: '现场查看',
                frequency: '每日',
              },
            ],
          },
          {
            name: '询问患者',
            children: [
              {
                content: '患者知晓自己姓名、主管医生、责任护士',
                score: 3,
                method: '询问患者',
                frequency: '每周',
              },
              {
                content: '患者了解治疗方案及注意事项',
                score: 3,
                method: '询问患者',
                frequency: '每周',
              },
            ],
          },
        ],
      },
      {
        name: '防跌倒管理',
        children: [
          {
            name: '现场查看',
            children: [
              {
                content: '高危跌倒患者有防跌倒标识',
                score: 4,
                method: '现场查看',
                frequency: '每日',
              },
              { content: '床栏完好，使用正确', score: 3, method: '现场查看', frequency: '每日' },
              { content: '地面干燥，无障碍物', score: 3, method: '现场查看', frequency: '每日' },
            ],
          },
          {
            name: '查阅资料',
            children: [
              {
                content: '跌倒风险评估表填写完整、及时',
                score: 4,
                method: '查阅资料',
                frequency: '每周',
              },
              { content: '防跌倒宣教记录完整', score: 3, method: '查阅资料', frequency: '每周' },
            ],
          },
        ],
      },
      {
        name: '危急值管理',
        children: [
          {
            name: '现场查看',
            children: [
              { content: '危急值登记本记录完整', score: 4, method: '现场查看', frequency: '每日' },
              { content: '5分钟内报告医生', score: 5, method: '现场查看', frequency: '每日' },
            ],
          },
          {
            name: '查阅记录',
            children: [
              {
                content: '危急值处置记录完整，有时间记录',
                score: 4,
                method: '查阅记录',
                frequency: '每日',
              },
              { content: '危急值追踪记录完整', score: 3, method: '查阅记录', frequency: '每日' },
            ],
          },
        ],
      },
      {
        name: '手卫生管理',
        children: [
          {
            name: '现场查看',
            children: [
              {
                content: '洗手设施齐全，配备洗手液、干手设施',
                score: 4,
                method: '现场查看',
                frequency: '每日',
              },
              { content: '医护人员掌握洗手指征', score: 4, method: '现场查看', frequency: '每日' },
              { content: '操作前后洗手依从性好', score: 5, method: '现场查看', frequency: '每日' },
            ],
          },
          {
            name: '技能考核',
            children: [
              { content: '七步洗手法操作规范', score: 4, method: '技能考核', frequency: '每月' },
              { content: '手卫生知识知晓率达标', score: 3, method: '技能考核', frequency: '每月' },
            ],
          },
        ],
      },
    ],
  },
];

// ==================== 状态变量 ====================
const filterText = ref('');
const showDetail = ref(true);
const loading = ref(false);
const submitting = ref(false);
const importing = ref(false);
const treeRef = ref(null);
const categoryFormRef = ref(null);
const standardFormRef = ref(null);
const categoryDialogVisible = ref(false);
const standardDialogVisible = ref(false);
const importVisible = ref(false);
const currentCategory = ref(null);
const isEditCategory = ref(false);
const editCategoryData = ref(null);

// 分类树数据
const categoryTree = ref([]);
const standardData = ref([]);

// 树形配置
const treeProps = {
  label: 'name',
  children: 'children',
};

// 分类表单
const categoryForm = reactive({
  name: '',
  level: 1,
  parentId: null,
  parentName: '',
  year: '',
  passLine: 85,
});

// 分类表单验证
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
};

// 标准表单
const standardForm = reactive({
  firstLevel: '',
  secondLevel: '',
  thirdLevel: '',
  content: '',
  score: 5,
  method: '',
  frequency: '每日',
});

// 标准表单验证
const standardRules = {
  firstLevel: [{ required: true, message: '请选择一级分类', trigger: 'change' }],
  secondLevel: [{ required: true, message: '请选择二级分类', trigger: 'change' }],
  thirdLevel: [{ required: true, message: '请选择三级分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入检查内容', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分值', trigger: 'blur' }],
};

// 导入选项
const importOptions = reactive({
  overwrite: false,
  validateOnly: false,
});
const uploadFile = ref(null);

// ==================== 计算属性 ====================
const categoryDialogTitle = computed(() => {
  return isEditCategory.value ? '编辑分类' : '新建分类';
});

const totalScore = computed(() => {
  let score = 0;
  const traverse = (items) => {
    items.forEach((item) => {
      if (item.children) {
        traverse(item.children);
      } else if (item.score) {
        score += item.score;
      }
    });
  };
  traverse(standardData.value);
  return score;
});

const totalItems = computed(() => {
  let count = 0;
  const traverse = (items) => {
    items.forEach((item) => {
      if (item.children) {
        traverse(item.children);
      } else {
        count++;
      }
    });
  };
  traverse(standardData.value);
  return count;
});

const firstLevelOptions = computed(() => {
  return standardData.value.map((item) => item.name);
});

const secondLevelOptions = computed(() => {
  const first = standardData.value.find((item) => item.name === standardForm.firstLevel);
  return first ? first.children.map((item) => item.name) : [];
});

const thirdLevelOptions = computed(() => {
  const first = standardData.value.find((item) => item.name === standardForm.firstLevel);
  if (!first) return [];
  const second = first.children.find((item) => item.name === standardForm.secondLevel);
  return second ? second.children.map((item) => item.name) : [];
});

// ==================== 方法 ====================
// 初始化数据
const initData = () => {
  categoryTree.value = JSON.parse(JSON.stringify(mockCategoryTree));
  standardData.value = JSON.parse(JSON.stringify(mockStandardData));
};

// 树节点过滤
const filterNode = (value, data) => {
  if (!value) return true;
  return data.name.includes(value);
};

// 监听筛选
watch(filterText, (val) => {
  treeRef.value?.filter(val);
});

// 允许拖放
const allowDrop = (draggingNode, dropNode, type) => {
  return draggingNode.data.level === dropNode.data.level;
};

// 拖放处理
const handleDrop = (draggingNode, dropNode, type, event) => {
  ElMessage.success('分类排序已更新');
};

// 分类点击
const handleCategoryClick = (data) => {
  if (data.level === 3) {
    currentCategory.value = data;
    // 这里可以根据不同的三级分类加载不同的标准数据
    // 目前使用模拟数据
    standardData.value = JSON.parse(JSON.stringify(mockStandardData));
  } else {
    currentCategory.value = null;
  }
};

// 节点操作命令
const handleNodeCommand = (command, data) => {
  switch (command) {
    case 'addChild':
      showAddCategoryDialog(data);
      break;
    case 'edit':
      editCategory(data);
      break;
    case 'addStandard':
      showAddStandardDialog();
      break;
    case 'delete':
      deleteCategory(data);
      break;
  }
};

// 显示新建分类对话框
const showAddCategoryDialog = (parentData = null) => {
  isEditCategory.value = false;
  editCategoryData.value = null;
  categoryForm.name = '';
  categoryForm.year = '';
  categoryForm.passLine = 85;

  if (parentData) {
    categoryForm.level = parentData.level + 1;
    categoryForm.parentId = parentData.id;
    categoryForm.parentName = parentData.name;
  } else {
    categoryForm.level = 1;
    categoryForm.parentId = null;
    categoryForm.parentName = '';
  }

  categoryDialogVisible.value = true;
};

// 显示新建根节点对话框
const showAddRootDialog = () => {
  showAddCategoryDialog();
};

// 编辑分类
const editCategory = (data) => {
  isEditCategory.value = true;
  editCategoryData.value = data;
  categoryForm.name = data.name;
  categoryForm.level = data.level;
  categoryForm.parentId = data.parentId || null;
  categoryForm.parentName = data.parentName || '';
  categoryForm.year = data.year || '';
  categoryForm.passLine = data.passLine || 85;
  categoryDialogVisible.value = true;
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
      removeFromTree(categoryTree.value, data.id);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

// 从树中移除节点
const removeFromTree = (tree, id) => {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      tree.splice(i, 1);
      return true;
    }
    if (tree[i].children) {
      if (removeFromTree(tree[i].children, id)) {
        return true;
      }
    }
  }
  return false;
};

// 提交分类
const submitCategory = async () => {
  if (!categoryFormRef.value) return;

  await categoryFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true;
      setTimeout(() => {
        if (isEditCategory.value && editCategoryData.value) {
          editCategoryData.value.name = categoryForm.name;
          editCategoryData.value.year = categoryForm.year;
          editCategoryData.value.passLine = categoryForm.passLine;
          ElMessage.success('分类更新成功');
        } else {
          const newNode = {
            id: Date.now(),
            name: categoryForm.name,
            level: categoryForm.level,
            year: categoryForm.year,
            passLine: categoryForm.passLine,
            count: 0,
            children: [],
          };

          if (categoryForm.parentId) {
            const parent = findInTree(categoryTree.value, categoryForm.parentId);
            if (parent) {
              if (!parent.children) parent.children = [];
              parent.children.push(newNode);
            }
          } else {
            categoryTree.value.push(newNode);
          }
          ElMessage.success('分类创建成功');
        }

        submitting.value = false;
        categoryDialogVisible.value = false;
      }, 500);
    }
  });
};

// 在树中查找节点
const findInTree = (tree, id) => {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 显示新增标准对话框
const showAddStandardDialog = () => {
  standardForm.firstLevel = '';
  standardForm.secondLevel = '';
  standardForm.thirdLevel = '';
  standardForm.content = '';
  standardForm.score = 5;
  standardForm.method = '';
  standardForm.frequency = '每日';
  standardDialogVisible.value = true;
};

// 提交标准
const submitStandard = async () => {
  if (!standardFormRef.value) return;

  await standardFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true;
      setTimeout(() => {
        const newItem = {
          content: standardForm.content,
          score: standardForm.score,
          method: standardForm.method,
          frequency: standardForm.frequency,
        };

        // 找到对应的三级节点并添加
        const first = standardData.value.find((f) => f.name === standardForm.firstLevel);
        if (first) {
          const second = first.children.find((s) => s.name === standardForm.secondLevel);
          if (second) {
            const third = second.children.find((t) => t.name === standardForm.thirdLevel);
            if (third) {
              if (!third.children) third.children = [];
              third.children.push(newItem);
            }
          }
        }

        submitting.value = false;
        standardDialogVisible.value = false;
        ElMessage.success('检查标准添加成功');
      }, 500);
    }
  });
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
      // 遍历查找并删除
      const traverseAndRemove = (items) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i] === item) {
            items.splice(i, 1);
            return true;
          }
          if (items[i].children) {
            if (traverseAndRemove(items[i].children)) {
              return true;
            }
          }
        }
        return false;
      };
      traverseAndRemove(standardData.value);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

// 添加检查项对话框
const showAddItemDialog = (thirdLevel) => {
  standardForm.firstLevel = '';
  standardForm.secondLevel = '';
  standardForm.thirdLevel = thirdLevel.name;
  standardForm.content = '';
  standardForm.score = 5;
  standardForm.method = '';
  standardForm.frequency = '每日';
  standardDialogVisible.value = true;
};

// 视图切换
const handleViewChange = (val) => {
  showDetail.value = val;
};

// 导入相关
const showImportDialog = () => {
  importVisible.value = true;
};

const handleFileChange = (file) => {
  uploadFile.value = file.raw;
};

const confirmImport = () => {
  if (!uploadFile.value) {
    ElMessage.warning('请先选择文件');
    return;
  }

  importing.value = true;
  setTimeout(() => {
    importing.value = false;
    importVisible.value = false;
    ElMessage.success('导入成功，共导入 32 条检查标准');
  }, 2000);
};

const downloadTemplate = () => {
  ElMessage.success('模板下载中...');
};

const handleExport = () => {
  ElMessage.success('数据导出中...');
};

// 生命周期
onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.quality-maintenance {
  padding: 20px;
  background: $bg-base;
  min-height: calc(100vh - 144px);
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
  height: calc(100vh - 220px);
}

// 左侧分类树
.category-tree {
  width: 320px;
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

    :deep(.el-tree-node__content) {
      height: auto;
      min-height: 40px;
      padding: 4px 0;
    }

    :deep(.el-tree-node.is-current > .el-tree-node__content) {
      background: rgba($primary, 0.08);
    }
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 4px 8px;

    &.is-root {
      .node-label {
        font-weight: 600;
        color: $text-primary;
      }
    }
    &.is-level2 {
      .node-label {
        font-weight: 500;
      }
    }
    &.is-level3 {
      .node-label {
        font-size: 13px;
      }
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
}

// 右侧标准内容
.standard-content {
  flex: 1;
  overflow: hidden;

  .content-card {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      overflow-y: auto;
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

      .title-text {
        font-weight: 600;
        font-size: 16px;
        color: $text-primary;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

// 标准树
.standard-tree {
  .root-info {
    padding: 16px;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border-radius: 8px;
    margin-bottom: 20px;

    .root-header {
      display: flex;
      align-items: center;
      gap: 16px;

      .el-icon {
        color: $primary;
      }

      .root-details {
        .root-title {
          margin: 0 0 4px 0;
          font-size: 18px;
          color: $text-primary;
        }

        .root-meta {
          margin: 0;
          font-size: 13px;
          color: $text-secondary;
          display: flex;
          gap: 12px;
          align-items: center;
        }
      }
    }
  }

  .standard-items {
    .first-level {
      margin-bottom: 24px;
      border: 1px solid $border-light;
      border-radius: 8px;
      overflow: hidden;

      .level-header {
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        &.level-1 {
          background: #f0f5ff;
          color: $primary;
          font-weight: 600;
        }
        &.level-2 {
          background: #fafafa;
          color: $text-primary;
          font-weight: 500;
          padding-left: 32px;
        }
        &.level-3 {
          background: #f5f5f5;
          color: $text-regular;
          font-weight: 500;
          padding-left: 56px;
        }

        .level-label {
          color: $text-secondary;
          font-weight: 400;
        }
      }
    }

    .second-level {
      border-top: 1px solid $border-lighter;
    }

    .third-level {
      border-top: 1px solid $border-extra-light;
    }

    .fourth-level {
      padding: 8px 76px;

      .standard-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 8px 12px;
        border-radius: 4px;
        transition: background 0.2s;

        &:hover {
          background: $bg-base;

          .item-actions {
            opacity: 1;
          }
        }

        .item-header {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          flex: 1;

          .item-index {
            width: 20px;
            height: 20px;
            background: $primary;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .item-content {
            flex: 1;
            line-height: 1.6;
            color: $text-regular;
          }
        }

        .item-actions {
          opacity: 0;
          transition: opacity 0.2s;
          flex-shrink: 0;
          display: flex;
          gap: 4px;
        }
      }

      .add-item-btn {
        padding: 8px 12px;
        text-align: center;
        border: 1px dashed $border-light;
        border-radius: 4px;
        margin-top: 4px;

        &:hover {
          border-color: $primary;
          background: rgba($primary, 0.02);
        }
      }
    }
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
