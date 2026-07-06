<template>
  <div class="quality-inspection">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">质量检查</h2>
        <span class="page-desc">执行护理质量检查任务，记录检查结果</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateInspection">
          <el-icon><Plus /></el-icon>
          新建检查
        </el-button>
        <el-button @click="fetchInspectionList">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-card shadow="never" class="stat-card" v-for="stat in statistics" :key="stat.label">
        <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </el-card>
    </div>

    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="质量级别">
          <el-select
            v-model="filterForm.level"
            placeholder="全部级别"
            clearable
            style="width: 130px"
          >
            <el-option label="一级质量" value="level1" />
            <el-option label="二级质量" value="level2" />
            <el-option label="三级质量" value="level3" />
          </el-select>
        </el-form-item>
        <el-form-item label="检查状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            style="width: 130px"
          >
            <el-option label="待检查" value="pending" />
            <el-option label="检查中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已审核" value="approved" />
          </el-select>
        </el-form-item>
        <el-form-item label="检查科室">
          <el-select
            v-model="filterForm.dept"
            placeholder="选择科室"
            clearable
            filterable
            style="width: 160px"
          >
            <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
          </el-select>
        </el-form-item>
        <el-form-item label="检查人员">
          <el-select
            v-model="filterForm.inspector"
            placeholder="选择人员"
            clearable
            filterable
            style="width: 140px"
          >
            <el-option v-for="person in inspectors" :key="person" :label="person" :value="person" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 检查列表 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="title">检查任务列表</span>
          <div class="header-actions">
            <el-button text type="primary" size="small" @click="exportData">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="inspectionList"
        stripe
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="taskName" label="检查任务" min-width="180" show-overflow-tooltip />
        <el-table-column prop="level" label="质量级别" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="levelType[row.level]" size="small" effect="dark">
              {{ levelLabel[row.level] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dept" label="被检科室" width="130" />
        <el-table-column prop="inspector" label="检查人员" width="110" />
        <el-table-column prop="checkDate" label="检查日期" width="120" />
        <el-table-column prop="totalScore" label="总分" width="80" align="center">
          <template #default="{ row }">
            <span :class="getScoreClass(row.totalScore)">{{ row.totalScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]" size="small">
              {{ statusLabel[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              text
              type="primary"
              size="small"
              @click.stop="startInspection(row)"
            >
              开始检查
            </el-button>
            <el-button
              v-if="row.status === 'in_progress'"
              text
              type="warning"
              size="small"
              @click.stop="continueInspection(row)"
            >
              继续检查
            </el-button>
            <el-button
              v-if="row.status === 'completed'"
              text
              type="success"
              size="small"
              @click.stop="viewResult(row)"
            >
              查看结果
            </el-button>
            <el-button
              v-if="row.status === 'pending' || row.status === 'in_progress'"
              text
              type="danger"
              size="small"
              @click.stop="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
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

    <!-- 新建检查对话框 -->
    <el-dialog
      v-model="createVisible"
      title="新建检查任务"
      width="550px"
      :close-on-click-modal="false"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="检查任务" prop="taskName">
          <el-input v-model="createForm.taskName" placeholder="请输入检查任务名称" />
        </el-form-item>
        <el-form-item label="质量级别" prop="level">
          <el-select v-model="createForm.level" placeholder="选择质量级别" style="width: 100%">
            <el-option label="一级质量（科室自查）" value="level1" />
            <el-option label="二级质量（科间互查）" value="level2" />
            <el-option label="三级质量（院级督查）" value="level3" />
          </el-select>
        </el-form-item>
        <el-form-item label="检查标准" prop="standardId">
          <el-tree-select
            v-model="createForm.standardId"
            :data="standardTree"
            :props="{ label: 'project', value: 'id' }"
            placeholder="选择检查标准模板"
            filterable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="被检科室" prop="dept">
          <el-select
            v-model="createForm.dept"
            placeholder="选择科室"
            filterable
            style="width: 100%"
          >
            <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
          </el-select>
        </el-form-item>
        <el-form-item label="检查人员" prop="inspector">
          <el-select
            v-model="createForm.inspector"
            placeholder="选择人员"
            filterable
            style="width: 100%"
          >
            <el-option v-for="person in inspectors" :key="person" :label="person" :value="person" />
          </el-select>
        </el-form-item>
        <el-form-item label="检查日期" prop="checkDate">
          <el-date-picker
            v-model="createForm.checkDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="createForm.remark"
            type="textarea"
            :rows="2"
            placeholder="备注信息（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate" :loading="creating">创建检查任务</el-button>
      </template>
    </el-dialog>

    <!-- 检查执行对话框 -->
    <el-dialog
      v-model="inspectVisible"
      :title="'检查执行 - ' + currentInspection?.taskName"
      width="900px"
      :close-on-click-modal="false"
      fullscreen
    >
      <div class="inspection-execution">
        <!-- 检查进度 -->
        <div class="inspection-progress">
          <el-steps :active="progressStep" finish-status="success" simple>
            <el-step title="基本信息" />
            <el-step title="逐项检查" />
            <el-step title="总结评价" />
          </el-steps>
        </div>

        <!-- 步骤1：基本信息 -->
        <div v-if="progressStep === 0" class="step-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="检查任务">{{
              currentInspection?.taskName
            }}</el-descriptions-item>
            <el-descriptions-item label="质量级别">
              <el-tag :type="levelType[currentInspection?.level]" size="small">
                {{ levelLabel[currentInspection?.level] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="被检科室">{{
              currentInspection?.dept
            }}</el-descriptions-item>
            <el-descriptions-item label="检查人员">{{
              currentInspection?.inspector
            }}</el-descriptions-item>
            <el-descriptions-item label="检查日期">{{
              currentInspection?.checkDate
            }}</el-descriptions-item>
            <el-descriptions-item label="检查标准">{{
              currentInspection?.standardName
            }}</el-descriptions-item>
          </el-descriptions>
          <div class="step-actions">
            <el-button type="primary" @click="progressStep = 1">开始检查</el-button>
          </div>
        </div>

        <!-- 步骤2：逐项检查 -->
        <div v-if="progressStep === 1" class="step-content">
          <div class="check-items">
            <div
              v-for="(item, index) in checkItems"
              :key="item.id"
              class="check-item"
              :class="{ 'is-pass': item.result === 'pass', 'is-fail': item.result === 'fail' }"
            >
              <div class="item-header">
                <span class="item-index">{{ index + 1 }}</span>
                <span class="item-project">{{ item.project }}</span>
                <span class="item-score">分值：{{ item.score }}分</span>
              </div>
              <div class="item-standard">{{ item.standard }}</div>
              <div class="item-result">
                <el-radio-group v-model="item.result">
                  <el-radio value="pass" size="large">
                    <span class="result-pass">合格</span>
                  </el-radio>
                  <el-radio value="fail" size="large">
                    <span class="result-fail">不合格</span>
                  </el-radio>
                  <el-radio value="na" size="large">
                    <span class="result-na">不适用</span>
                  </el-radio>
                </el-radio-group>
                <div v-if="item.result === 'fail'" class="deduct-score">
                  <span>扣分：</span>
                  <el-input-number
                    v-model="item.deductScore"
                    :min="0"
                    :max="item.score"
                    size="small"
                  />
                  <span class="actual-score"
                    >实得：{{ item.score - (item.deductScore || 0) }}分</span
                  >
                </div>
                <div v-if="item.result === 'fail'" class="problem-desc">
                  <el-input
                    v-model="item.problemDesc"
                    type="textarea"
                    :rows="2"
                    placeholder="请描述存在问题"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="step-actions">
            <el-button @click="progressStep = 0">上一步</el-button>
            <el-button type="primary" @click="calculateScore">下一步：总结评价</el-button>
          </div>
        </div>

        <!-- 步骤3：总结评价 -->
        <div v-if="progressStep === 2" class="step-content">
          <el-card shadow="never" class="summary-card">
            <template #header>
              <span class="summary-title">检查总结</span>
            </template>

            <div class="score-summary">
              <div class="score-item">
                <span class="label">应得分值：</span>
                <span class="value">{{ totalScore }}分</span>
              </div>
              <div class="score-item">
                <span class="label">实得分值：</span>
                <span class="value primary">{{ actualScore }}分</span>
              </div>
              <div class="score-item">
                <span class="label">扣分合计：</span>
                <span class="value danger">{{ deductTotal }}分</span>
              </div>
              <div class="score-item">
                <span class="label">得分率：</span>
                <span class="value success">{{ scoreRate }}%</span>
              </div>
            </div>

            <el-divider />

            <el-form :model="summaryForm" label-width="80px">
              <el-form-item label="总体评价">
                <el-rate v-model="summaryForm.rating" :max="5" show-score />
              </el-form-item>
              <el-form-item label="存在问题">
                <el-input
                  v-model="summaryForm.problems"
                  type="textarea"
                  :rows="3"
                  placeholder="汇总本次检查发现的主要问题"
                />
              </el-form-item>
              <el-form-item label="整改建议">
                <el-input
                  v-model="summaryForm.suggestions"
                  type="textarea"
                  :rows="3"
                  placeholder="提出整改建议和期限"
                />
              </el-form-item>
            </el-form>
          </el-card>

          <div class="step-actions">
            <el-button @click="progressStep = 1">上一步</el-button>
            <el-button type="primary" @click="submitInspection" :loading="submitting">
              提交检查结果
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 查看结果对话框 -->
    <el-dialog v-model="resultVisible" title="检查结果详情" width="800px">
      <div class="result-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="检查任务">{{
            currentInspection?.taskName
          }}</el-descriptions-item>
          <el-descriptions-item label="质量级别">
            <el-tag :type="levelType[currentInspection?.level]" size="small">
              {{ levelLabel[currentInspection?.level] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="被检科室">{{
            currentInspection?.dept
          }}</el-descriptions-item>
          <el-descriptions-item label="检查人员">{{
            currentInspection?.inspector
          }}</el-descriptions-item>
          <el-descriptions-item label="检查日期">{{
            currentInspection?.checkDate
          }}</el-descriptions-item>
          <el-descriptions-item label="检查结果">
            <el-tag :type="resultType" size="small">{{ resultText }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="score-summary">
          <div class="score-item">
            <span class="label">应得分值：</span>
            <span class="value">{{ totalScore }}分</span>
          </div>
          <div class="score-item">
            <span class="label">实得分值：</span>
            <span class="value primary">{{ actualScore }}分</span>
          </div>
          <div class="score-item">
            <span class="label">得分率：</span>
            <span class="value success">{{ scoreRate }}%</span>
          </div>
        </div>

        <el-table :data="checkItems" border style="width: 100%" max-height="300">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="project" label="检查项目" min-width="180" />
          <el-table-column prop="result" label="结果" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.result === 'pass'" type="success" size="small">合格</el-tag>
              <el-tag v-else-if="row.result === 'fail'" type="danger" size="small">不合格</el-tag>
              <el-tag v-else type="info" size="small">不适用</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deductScore" label="扣分" width="60" align="center" />
          <el-table-column
            prop="problemDesc"
            label="问题描述"
            min-width="200"
            show-overflow-tooltip
          />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="resultVisible = false">关闭</el-button>
        <el-button type="primary" @click="printResult">打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Download } from '@element-plus/icons-vue';

// 模拟数据
const departments = [
  '内科一病区',
  '内科二病区',
  '外科一病区',
  '外科二病区',
  '妇产科',
  '儿科',
  '急诊科',
  'ICU',
  '手术室',
  '门诊部',
];
const inspectors = ['张主任', '李护士长', '王质控员', '赵组长', '孙督导'];

// 统计数据
const statistics = [
  { label: '待检查', value: 8, color: '#909399' },
  { label: '检查中', value: 5, color: '#E6A23C' },
  { label: '已完成', value: 128, color: '#67C23A' },
  { label: '本月新增', value: 15, color: '#409EFF' },
];

// 筛选表单
const filterForm = reactive({
  level: '',
  status: '',
  dept: '',
  inspector: '',
  dateRange: null,
});

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 141,
});

// 状态控制
const loading = ref(false);
const creating = ref(false);
const submitting = ref(false);
const createVisible = ref(false);
const inspectVisible = ref(false);
const resultVisible = ref(false);
const progressStep = ref(0);
const createFormRef = ref(null);
const currentInspection = ref(null);

// 检查列表
const inspectionList = ref([
  {
    id: 1,
    taskName: '2026年1月护理总值班质控检查',
    level: 'level3',
    dept: '内科一病区',
    inspector: '张主任',
    checkDate: '2026-01-15',
    totalScore: 92,
    status: 'completed',
    standardName: '护理总值班质控标准',
    standardId: 1,
  },
  {
    id: 2,
    taskName: '一季度基础护理质量检查',
    level: 'level2',
    dept: '外科一病区',
    inspector: '李护士长',
    checkDate: '2026-01-20',
    totalScore: null,
    status: 'in_progress',
    standardName: '基础护理质量标准',
    standardId: 2,
  },
  {
    id: 3,
    taskName: '科室自查-急救物品管理',
    level: 'level1',
    dept: '急诊科',
    inspector: '王质控员',
    checkDate: '2026-01-18',
    totalScore: null,
    status: 'pending',
    standardName: '急救物品管理标准',
    standardId: 3,
  },
]);

// 检查标准树
const standardTree = ref([
  {
    id: 1,
    project: '护理总值班质控标准',
    children: [
      { id: 101, project: '急救车管理' },
      { id: 102, project: '患者身份识别' },
      { id: 103, project: '防跌倒管理' },
      { id: 104, project: '危急值管理' },
    ],
  },
  {
    id: 2,
    project: '基础护理质量标准',
    children: [
      { id: 201, project: '病室环境' },
      { id: 202, project: '床单位管理' },
      { id: 203, project: '口腔护理' },
      { id: 204, project: '压疮护理' },
    ],
  },
  {
    id: 3,
    project: '急救物品管理标准',
    children: [
      { id: 301, project: '急救车物品' },
      { id: 302, project: '抢救设备' },
      { id: 303, project: '药品管理' },
    ],
  },
]);

// 检查项
const checkItems = ref([]);
const totalScore = ref(0);
const actualScore = ref(0);
const deductTotal = ref(0);
const scoreRate = ref(0);

// 总结表单
const summaryForm = reactive({
  rating: 4,
  problems: '',
  suggestions: '',
});

// 新建表单
const createForm = reactive({
  taskName: '',
  level: '',
  standardId: '',
  dept: '',
  inspector: '',
  checkDate: '',
  remark: '',
});

// 表单验证
const createRules = {
  taskName: [{ required: true, message: '请输入检查任务名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择质量级别', trigger: 'change' }],
  standardId: [{ required: true, message: '请选择检查标准', trigger: 'change' }],
  dept: [{ required: true, message: '请选择被检科室', trigger: 'change' }],
  inspector: [{ required: true, message: '请选择检查人员', trigger: 'change' }],
  checkDate: [{ required: true, message: '请选择检查日期', trigger: 'change' }],
};

// 映射
const levelType = { level1: 'success', level2: 'warning', level3: 'danger' };
const levelLabel = { level1: '一级质量', level2: '二级质量', level3: '三级质量' };
const statusType = { pending: 'info', in_progress: 'warning', completed: 'success', approved: '' };
const statusLabel = {
  pending: '待检查',
  in_progress: '检查中',
  completed: '已完成',
  approved: '已审核',
};

// 计算结果
const resultType = computed(() => {
  const rate = scoreRate.value;
  if (rate >= 90) return 'success';
  if (rate >= 70) return 'warning';
  return 'danger';
});

const resultText = computed(() => {
  const rate = scoreRate.value;
  if (rate >= 90) return '优秀';
  if (rate >= 80) return '良好';
  if (rate >= 70) return '合格';
  return '不合格';
});

// 获取检查列表
const fetchInspectionList = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('数据已刷新');
  }, 500);
};

// 搜索
const handleSearch = () => {
  ElMessage.info('查询中...');
};

// 重置筛选
const resetFilter = () => {
  filterForm.level = '';
  filterForm.status = '';
  filterForm.dept = '';
  filterForm.inspector = '';
  filterForm.dateRange = null;
};

// 显示新建对话框
const showCreateInspection = () => {
  createForm.taskName = '';
  createForm.level = '';
  createForm.standardId = '';
  createForm.dept = '';
  createForm.inspector = '';
  createForm.checkDate = '';
  createForm.remark = '';
  createVisible.value = true;
};

// 提交新建
const submitCreate = async () => {
  if (!createFormRef.value) return;

  await createFormRef.value.validate((valid) => {
    if (valid) {
      creating.value = true;
      setTimeout(() => {
        const newInspection = {
          id: Date.now(),
          taskName: createForm.taskName,
          level: createForm.level,
          dept: createForm.dept,
          inspector: createForm.inspector,
          checkDate: createForm.checkDate,
          totalScore: null,
          status: 'pending',
          standardName: '自定义检查',
        };
        inspectionList.value.unshift(newInspection);
        creating.value = false;
        createVisible.value = false;
        ElMessage.success('检查任务创建成功');
      }, 1000);
    }
  });
};

// 开始检查
const startInspection = (row) => {
  currentInspection.value = row;
  progressStep.value = 0;
  initCheckItems();
  inspectVisible.value = true;
};

// 继续检查
const continueInspection = (row) => {
  currentInspection.value = row;
  progressStep.value = 1;
  inspectVisible.value = true;
};

// 初始化检查项
const initCheckItems = () => {
  checkItems.value = [
    {
      id: 1,
      project: '急救车管理',
      standard: '急救车整洁，物品定位放置，无过期物品，有急救车醒目标识',
      score: 4,
      result: null,
      deductScore: 0,
      problemDesc: '',
    },
    {
      id: 2,
      project: '患者身份识别',
      standard: '患者佩戴腕带，给药前核对腕带信息，操作前后核对患者身份',
      score: 4,
      result: null,
      deductScore: 0,
      problemDesc: '',
    },
    {
      id: 3,
      project: '防跌倒管理',
      standard: '高危跌倒患者有防跌倒标识，床栏完好，告知患者防跌倒措施',
      score: 4,
      result: null,
      deductScore: 0,
      problemDesc: '',
    },
    {
      id: 4,
      project: '危急值管理',
      standard: '危急值登记完整，5分钟内报告医生，记录时间准确',
      score: 4,
      result: null,
      deductScore: 0,
      problemDesc: '',
    },
    {
      id: 5,
      project: '手卫生管理',
      standard: '洗手设施齐全，医护人员掌握洗手指征，操作前后洗手',
      score: 4,
      result: null,
      deductScore: 0,
      problemDesc: '',
    },
  ];
  totalScore.value = checkItems.value.reduce((sum, item) => sum + item.score, 0);
};

// 计算分数
const calculateScore = () => {
  deductTotal.value = checkItems.value.reduce((sum, item) => {
    return sum + (item.result === 'fail' ? item.deductScore || item.score : 0);
  }, 0);
  actualScore.value = totalScore.value - deductTotal.value;
  scoreRate.value = Math.round((actualScore.value / totalScore.value) * 100);
  progressStep.value = 2;
};

// 提交检查结果
const submitInspection = () => {
  submitting.value = true;
  setTimeout(() => {
    if (currentInspection.value) {
      currentInspection.value.totalScore = actualScore.value;
      currentInspection.value.status = 'completed';
    }
    submitting.value = false;
    inspectVisible.value = false;
    ElMessage.success('检查结果提交成功');
  }, 1500);
};

// 查看结果
const viewResult = (row) => {
  currentInspection.value = row;
  actualScore.value = row.totalScore || 96;
  totalScore.value = 100;
  deductTotal.value = totalScore.value - actualScore.value;
  scoreRate.value = Math.round((actualScore.value / totalScore.value) * 100);

  checkItems.value = [
    { id: 1, project: '急救车管理', result: 'pass', deductScore: 0, problemDesc: '' },
    { id: 2, project: '患者身份识别', result: 'pass', deductScore: 0, problemDesc: '' },
    { id: 3, project: '防跌倒管理', result: 'fail', deductScore: 2, problemDesc: '床栏未升起' },
    { id: 4, project: '危急值管理', result: 'pass', deductScore: 0, problemDesc: '' },
    { id: 5, project: '手卫生管理', result: 'fail', deductScore: 2, problemDesc: '洗手不规范' },
  ];

  resultVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除检查任务「${row.taskName}」吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = inspectionList.value.findIndex((item) => item.id === row.id);
      if (index > -1) {
        inspectionList.value.splice(index, 1);
      }
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

// 行点击
const handleRowClick = (row) => {
  if (row.status === 'completed') {
    viewResult(row);
  } else if (row.status === 'in_progress') {
    continueInspection(row);
  } else if (row.status === 'pending') {
    startInspection(row);
  }
};

// 导出
const exportData = () => {
  ElMessage.success('数据导出中...');
};

// 打印
const printResult = () => {
  window.print();
};

// 分数样式
const getScoreClass = (score) => {
  if (!score) return '';
  if (score >= 90) return 'score-excellent';
  if (score >= 75) return 'score-good';
  return 'score-poor';
};

// 分页
const handleSizeChange = (size) => {
  pagination.size = size;
  ElMessage.info(`每页显示 ${size} 条`);
};

const handleCurrentChange = (page) => {
  pagination.page = page;
  ElMessage.info(`第 ${page} 页`);
};

onMounted(() => {
  fetchInspectionList();
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.quality-inspection {
  padding: 20px;
  background: $bg-base;
  min-height: calc(100vh - 124px);
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

// 统计卡片
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  .stat-card {
    text-align: center;
    padding: 16px 0;

    .stat-value {
      font-size: 30px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 8px;
    }
    .stat-label {
      font-size: 14px;
      color: $text-secondary;
    }
  }
}

// 筛选区域
.filter-card {
  margin-bottom: 20px;
}

// 表格卡片
.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-weight: 600;
      font-size: 15px;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    margin-top: 16px;
    border-top: 1px solid $border-light;
  }
}

// 分数样式
.score-excellent {
  color: $success;
  font-weight: 600;
}
.score-good {
  color: $warning;
  font-weight: 600;
}
.score-poor {
  color: $danger;
  font-weight: 600;
}

// 检查执行
.inspection-execution {
  .inspection-progress {
    margin-bottom: 24px;
  }

  .step-content {
    min-height: 400px;

    .step-actions {
      margin-top: 24px;
      display: flex;
      justify-content: center;
      gap: 16px;
    }
  }
}

// 检查项
.check-items {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .check-item {
    padding: 16px;
    border: 1px solid $border-light;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      border-color: $primary;
    }

    &.is-pass {
      border-left: 4px solid $success;
    }

    &.is-fail {
      border-left: 4px solid $danger;
    }

    .item-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      .item-index {
        width: 24px;
        height: 24px;
        background: $primary;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
      }

      .item-project {
        font-weight: 600;
        color: $text-primary;
        flex: 1;
      }

      .item-score {
        color: $text-secondary;
        font-size: 13px;
      }
    }

    .item-standard {
      color: $text-regular;
      font-size: 13px;
      margin-bottom: 12px;
      padding-left: 36px;
    }

    .item-result {
      padding-left: 36px;

      .result-pass {
        color: $success;
      }
      .result-fail {
        color: $danger;
      }
      .result-na {
        color: $text-secondary;
      }

      .deduct-score {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 8px;

        .actual-score {
          color: $primary;
          font-weight: 600;
        }
      }

      .problem-desc {
        margin-top: 8px;
      }
    }
  }
}

// 总结卡片
.summary-card {
  .summary-title {
    font-weight: 600;
  }
}

// 分数汇总
.score-summary {
  display: flex;
  gap: 40px;
  padding: 16px 0;

  .score-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      color: $text-secondary;
      font-size: 14px;
    }

    .value {
      font-size: 20px;
      font-weight: 700;

      &.primary {
        color: $primary;
      }
      &.danger {
        color: $danger;
      }
      &.success {
        color: $success;
      }
    }
  }
}

// 结果详情
.result-detail {
  .score-summary {
    justify-content: center;
    margin-bottom: 20px;
  }
}

// 响应式
@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .score-summary {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
