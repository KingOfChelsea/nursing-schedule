<template>
  <div class="quality-maintenance">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">质量维护</h2>
        <span class="page-desc">三级质量检查任务管理与下发</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          新建任务
        </el-button>
        <el-button @click="refreshData">
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
            style="width: 140px"
          >
            <el-option label="一级质量" value="level1" />
            <el-option label="二级质量" value="level2" />
            <el-option label="三级质量" value="level3" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            style="width: 130px"
          >
            <el-option label="待下发" value="pending" />
            <el-option label="进行中" value="progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="责任科室">
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
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务列表 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>任务列表</span>
          <el-tag type="info" effect="plain">{{ taskList.length }} 条记录</el-tag>
        </div>
      </template>

      <el-table :data="taskList" stripe style="width: 100%" @row-click="handleRowClick">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="taskName" label="任务名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="level" label="质量级别" width="110">
          <template #default="{ row }">
            <el-tag :type="levelType[row.level]" size="small" effect="dark">
              {{ levelLabel[row.level] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkType" label="检查类型" width="120" />
        <el-table-column prop="responsibleDept" label="责任科室" width="150" />
        <el-table-column prop="responsiblePerson" label="责任人" width="100" />
        <el-table-column prop="deadline" label="截止日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]" size="small">
              {{ statusLabel[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click.stop="handleDispatch(row)"
              >下发</el-button
            >
            <el-button text type="primary" size="small" @click.stop="handleEdit(row)"
              >编辑</el-button
            >
            <el-button text type="danger" size="small" @click.stop="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新建/编辑任务对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑任务' : '新建任务'"
      width="680px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="taskForm"
        :rules="formRules"
        label-width="100px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="任务名称" prop="taskName">
              <el-input
                v-model="taskForm.taskName"
                placeholder="请输入任务名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="质量级别" prop="level">
              <el-select v-model="taskForm.level" placeholder="选择质量级别" style="width: 100%">
                <el-option label="一级质量（科室自查）" value="level1" />
                <el-option label="二级质量（科间互查）" value="level2" />
                <el-option label="三级质量（院级督查）" value="level3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检查类型" prop="checkType">
              <el-select
                v-model="taskForm.checkType"
                placeholder="选择检查类型"
                style="width: 100%"
              >
                <el-option label="基础护理质量" value="basic" />
                <el-option label="专科护理质量" value="specialist" />
                <el-option label="安全管理" value="safety" />
                <el-option label="感染控制" value="infection" />
                <el-option label="文书质量" value="document" />
                <el-option label="急救物品" value="emergency" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="责任科室" prop="responsibleDept">
              <el-select
                v-model="taskForm.responsibleDept"
                placeholder="选择科室"
                filterable
                style="width: 100%"
              >
                <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任人" prop="responsiblePerson">
              <el-select
                v-model="taskForm.responsiblePerson"
                placeholder="选择责任人"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="person in personnel"
                  :key="person"
                  :label="person"
                  :value="person"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="截止日期" prop="deadline">
              <el-date-picker
                v-model="taskForm.deadline"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="taskForm.priority" placeholder="选择优先级" style="width: 100%">
                <el-option label="紧急" value="urgent" />
                <el-option label="重要" value="important" />
                <el-option label="一般" value="normal" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="检查标准" prop="standards">
          <el-input
            v-model="taskForm.standards"
            type="textarea"
            :rows="3"
            placeholder="请输入检查标准和具体要求"
          />
        </el-form-item>

        <el-form-item label="备注说明" prop="remark">
          <el-input
            v-model="taskForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ isEdit ? '保存修改' : '创建并下发' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 下发确认对话框 -->
    <el-dialog v-model="dispatchVisible" title="任务下发确认" width="420px">
      <div class="dispatch-confirm">
        <el-icon class="confirm-icon" color="#409EFF" size="40"><Promotion /></el-icon>
        <p class="confirm-text">确认将任务「{{ dispatchTask?.taskName }}」下发至</p>
        <p class="confirm-target">
          {{ dispatchTask?.responsibleDept }} - {{ dispatchTask?.responsiblePerson }}
        </p>
        <el-checkbox v-model="sendNotify">发送通知提醒</el-checkbox>
      </div>
      <template #footer>
        <el-button @click="dispatchVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDispatch" :loading="dispatching">
          确认下发
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Promotion } from '@element-plus/icons-vue';

// 模拟数据
const departments = ['内科', '外科', '妇产科', '儿科', '急诊科', 'ICU', '手术室', '门诊部'];
const personnel = ['张三', '李四', '王五', '赵六', '孙七', '周八'];

// 统计卡片数据
const statistics = [
  { label: '待下发任务', value: 12, color: '#409EFF' },
  { label: '进行中任务', value: 28, color: '#E6A23C' },
  { label: '已完成任务', value: 156, color: '#67C23A' },
  { label: '本月新增', value: 18, color: '#F56C6C' },
];

// 筛选表单
const filterForm = reactive({
  level: '',
  status: '',
  dept: '',
  dateRange: null,
});

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 58,
});

// 任务列表
const taskList = ref([
  {
    id: 1,
    taskName: '第一季度基础护理质量检查',
    level: 'level3',
    checkType: '基础护理质量',
    responsibleDept: '内科',
    responsiblePerson: '张三',
    deadline: '2026-01-31',
    status: 'pending',
    priority: 'important',
    standards: '按照基础护理质量标准逐项检查',
    remark: '',
  },
  {
    id: 2,
    taskName: '科室自查-急救物品管理',
    level: 'level1',
    checkType: '急救物品',
    responsibleDept: '外科',
    responsiblePerson: '李四',
    deadline: '2026-01-20',
    status: 'progress',
    priority: 'urgent',
    standards: '检查急救药品、器械完好率',
    remark: '重点关注急救车管理',
  },
  {
    id: 3,
    taskName: '科间互查-护理文书质量',
    level: 'level2',
    checkType: '文书质量',
    responsibleDept: '妇产科',
    responsiblePerson: '王五',
    deadline: '2026-01-25',
    status: 'pending',
    priority: 'normal',
    standards: '抽查近一周护理记录单',
    remark: '',
  },
]);

// 等级映射
const levelType = {
  level1: 'success',
  level2: 'warning',
  level3: 'danger',
};

const levelLabel = {
  level1: '一级质量',
  level2: '二级质量',
  level3: '三级质量',
};

const statusType = {
  pending: 'info',
  progress: 'warning',
  completed: 'success',
  closed: '',
};

const statusLabel = {
  pending: '待下发',
  progress: '进行中',
  completed: '已完成',
  closed: '已关闭',
};

// 对话框控制
const dialogVisible = ref(false);
const dispatchVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const dispatching = ref(false);
const formRef = ref(null);
const dispatchTask = ref(null);
const sendNotify = ref(true);

// 任务表单
const taskForm = reactive({
  taskName: '',
  level: '',
  checkType: '',
  responsibleDept: '',
  responsiblePerson: '',
  deadline: '',
  priority: 'normal',
  standards: '',
  remark: '',
});

// 表单校验规则
const formRules = {
  taskName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  level: [{ required: true, message: '请选择质量级别', trigger: 'change' }],
  checkType: [{ required: true, message: '请选择检查类型', trigger: 'change' }],
  responsibleDept: [{ required: true, message: '请选择责任科室', trigger: 'change' }],
  responsiblePerson: [{ required: true, message: '请选择责任人', trigger: 'change' }],
  deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
  standards: [{ required: true, message: '请输入检查标准', trigger: 'blur' }],
};

// 方法
const showCreateDialog = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const refreshData = () => {
  ElMessage.success('数据已刷新');
};

const handleSearch = () => {
  ElMessage.info('查询中...');
};

const resetFilter = () => {
  filterForm.level = '';
  filterForm.status = '';
  filterForm.dept = '';
  filterForm.dateRange = null;
};

const handleRowClick = (row) => {
  console.log('点击行:', row);
};

const handleDispatch = (row) => {
  dispatchTask.value = row;
  dispatchVisible.value = true;
};

const confirmDispatch = () => {
  dispatching.value = true;
  setTimeout(() => {
    dispatchTask.value.status = 'progress';
    dispatching.value = false;
    dispatchVisible.value = false;
    ElMessage.success(`任务「${dispatchTask.value.taskName}」已成功下发`);
    if (sendNotify.value) {
      ElMessage.info('已发送通知提醒');
    }
  }, 1500);
};

const handleEdit = (row) => {
  isEdit.value = true;
  Object.assign(taskForm, row);
  dialogVisible.value = true;
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除任务「${row.taskName}」吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = taskList.value.findIndex((item) => item.id === row.id);
      if (index > -1) {
        taskList.value.splice(index, 1);
      }
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true;
      setTimeout(() => {
        if (isEdit.value) {
          const index = taskList.value.findIndex((item) => item.id === taskForm.id);
          if (index > -1) {
            taskList.value[index] = { ...taskForm };
          }
          ElMessage.success('任务修改成功');
        } else {
          const newTask = {
            ...taskForm,
            id: Date.now(),
            status: 'pending',
          };
          taskList.value.unshift(newTask);
          ElMessage.success('任务创建成功，即将进入下发流程');
          // 自动打开下发对话框
          setTimeout(() => {
            handleDispatch(newTask);
          }, 500);
        }
        submitting.value = false;
        dialogVisible.value = false;
      }, 1000);
    }
  });
};

const resetForm = () => {
  taskForm.taskName = '';
  taskForm.level = '';
  taskForm.checkType = '';
  taskForm.responsibleDept = '';
  taskForm.responsiblePerson = '';
  taskForm.deadline = '';
  taskForm.priority = 'normal';
  taskForm.standards = '';
  taskForm.remark = '';
};

const handleSizeChange = (val) => {
  pagination.pageSize = val;
  ElMessage.info(`每页显示 ${val} 条`);
};

const handleCurrentChange = (val) => {
  pagination.current = val;
  ElMessage.info(`第 ${val} 页`);
};

onMounted(() => {
  // 初始化数据
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.quality-maintenance {
  padding: 0;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
    }

    .page-desc {
      font-size: 13px;
      color: $text-secondary;
      margin-top: 4px;
    }
  }

  .header-right {
    display: flex;
    gap: 10px;
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
    padding: 20px 0;

    .stat-value {
      font-size: 32px;
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

  .el-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  }
}

// 表格卡片
.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0 0;
  }
}

// 下发确认对话框
.dispatch-confirm {
  text-align: center;
  padding: 20px 0;

  .confirm-icon {
    margin-bottom: 16px;
  }

  .confirm-text {
    font-size: 15px;
    color: $text-regular;
    margin-bottom: 8px;
  }

  .confirm-target {
    font-size: 16px;
    font-weight: 600;
    color: $primary;
    margin-bottom: 20px;
  }
}
</style>
