<template>
  <div class="nurse-home-wrapper">
    <!-- 背景层 -->
    <div class="background-layer"></div>

    <!-- 内容层 -->
    <div class="content-layer">
      <!-- 左侧主内容 -->
      <div class="left-column">
        <el-card class="welcome-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><UserFilled /></el-icon>
              <span>护理管理系统</span>
            </div>
          </template>
          <div class="card-content">
            <!-- 欢迎语 -->
            <div class="welcome-greeting">欢迎回来，{{ currentTime }}！</div>

            <!-- 日期显示 -->
            <div class="date-display">
              <el-icon><Calendar /></el-icon>
              <span>{{ currentDate }}</span>
            </div>

            <!-- 快速统计 -->
            <el-divider content-position="left">今日概况</el-divider>
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-number">128</span>
                <span class="stat-label">住院患者</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">8</span>
                <span class="stat-label">今日手术</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">16</span>
                <span class="stat-label">值班护士</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">23</span>
                <span class="stat-label">待处理医嘱</span>
              </div>
            </div>

            <!-- 快捷操作 -->
            <el-divider content-position="left">快捷操作</el-divider>
            <div class="quick-actions">
              <el-button type="primary" size="small" round>
                <el-icon><House /></el-icon>
                病房巡查
              </el-button>
              <el-button type="success" size="small" round>
                <el-icon><Medal /></el-icon>
                药品管理
              </el-button>
              <el-button type="warning" size="small" round>
                <el-icon><Document /></el-icon>
                报告填写
              </el-button>
              <el-button type="info" size="small" round>
                <el-icon><WarningFilled /></el-icon>
                紧急呼叫
              </el-button>
            </div>

            <!-- 待办提醒 -->
            <el-divider content-position="left">待办提醒</el-divider>
            <div class="todo-list">
              <div v-for="(todo, index) in todos" :key="index" class="todo-item">
                <el-checkbox v-model="todo.completed">
                  <span :class="{ 'completed-text': todo.completed }">{{ todo.text }}</span>
                </el-checkbox>
                <el-tag :type="todo.priority" size="small" effect="plain">
                  {{ priorityMap[todo.priority] }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧新模块 -->
      <div class="right-column">
        <!-- 值班护士模块 -->
        <el-card class="side-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>今日值班护士</span>
            </div>
          </template>
          <div class="nurse-list">
            <div v-for="(nurse, index) in nurses" :key="index" class="nurse-item">
              <el-avatar :size="36" :src="nurse.avatar">
                {{ nurse.name.charAt(0) }}
              </el-avatar>
              <div class="nurse-info">
                <span class="nurse-name">{{ nurse.name }}</span>
                <span class="nurse-dept">{{ nurse.department }}</span>
              </div>
              <el-tag :type="nurse.status === '在岗' ? 'success' : 'warning'" size="small">
                {{ nurse.status }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 科室通知模块 -->
        <el-card class="side-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Bell /></el-icon>
              <span>科室通知</span>
            </div>
          </template>
          <div class="notice-list">
            <div v-for="(notice, index) in notices" :key="index" class="notice-item">
              <div class="notice-dot" :class="notice.type"></div>
              <div class="notice-content">
                <span class="notice-title">{{ notice.title }}</span>
                <span class="notice-time">{{ notice.time }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 床位使用率模块 -->
        <el-card class="side-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><DataBoard /></el-icon>
              <span>床位使用率</span>
            </div>
          </template>
          <div class="bed-stats">
            <div class="bed-progress">
              <div class="progress-label">
                <span>内科</span>
                <!-- <span>85%</span> -->
              </div>
              <el-progress :percentage="85" :stroke-width="12" color="#409eff" />
            </div>
            <div class="bed-progress">
              <div class="progress-label">
                <span>外科</span>
                <!-- <span>72%</span> -->
              </div>
              <el-progress :percentage="72" :stroke-width="12" color="#67c23a" />
            </div>
            <div class="bed-progress">
              <div class="progress-label">
                <span>儿科</span>
                <!-- <span>45%</span> -->
              </div>
              <el-progress :percentage="45" :stroke-width="12" color="#e6a23c" />
            </div>
            <div class="bed-progress">
              <div class="progress-label">
                <span>ICU</span>
                <!-- <span>90%</span> -->
              </div>
              <el-progress :percentage="90" :stroke-width="12" color="#f56c6c" />
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  UserFilled,
  Calendar,
  House,
  Medal,
  Document,
  WarningFilled,
  User,
  Bell,
  DataBoard,
} from '@element-plus/icons-vue';

// 当前时间问候语
const currentTime = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return '上午好，护士长';
  if (hour < 18) return '下午好，护士长';
  return '晚上好，护士长';
});

// 当前日期
const currentDate = computed(() => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  };
  return now.toLocaleDateString('zh-CN', options);
});

// 待办事项接口
interface Todo {
  text: string;
  completed: boolean;
  priority: 'danger' | 'warning' | 'info';
}

// 优先级映射
const priorityMap: Record<string, string> = {
  danger: '紧急',
  warning: '重要',
  info: '普通',
};

// 待办事项列表
const todos = ref<Todo[]>([
  { text: '3床患者术后观察记录', completed: false, priority: 'danger' },
  { text: '核对下午用药清单', completed: false, priority: 'warning' },
  { text: '参加科室例会（15:00）', completed: false, priority: 'info' },
  { text: '检查急救设备状态', completed: true, priority: 'danger' },
  { text: '新入院患者健康教育', completed: false, priority: 'warning' },
]);

// 值班护士数据
interface Nurse {
  name: string;
  department: string;
  status: string;
  avatar?: string;
}

const nurses = ref<Nurse[]>([
  { name: '李明月', department: '内科', status: '在岗' },
  { name: '王雪梅', department: '外科', status: '在岗' },
  { name: '张雨欣', department: '儿科', status: '休息' },
  { name: '刘思琪', department: '急诊科', status: '在岗' },
  { name: '陈晓燕', department: 'ICU', status: '在岗' },
]);

// 通知数据
interface Notice {
  title: string;
  time: string;
  type: 'urgent' | 'normal' | 'info';
}

const notices = ref<Notice[]>([
  { title: '关于2026年第三季度护理质量检查的通知', time: '10分钟前', type: 'urgent' },
  { title: '新入职护士培训计划安排', time: '1小时前', type: 'normal' },
  { title: '本周五科室团建活动通知', time: '2小时前', type: 'info' },
  { title: '急救技能考核成绩公布', time: '昨天', type: 'normal' },
  { title: '护理文书规范化培训通知', time: '昨天', type: 'info' },
]);
</script>

<style scoped lang="scss">
.nurse-home-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;

  background-image: url(''); // @/assets/background.png
  background-size: contain;
  transform: scale(1);
  transform-origin: center;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    pointer-events: none;
  }
}

.content-layer {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: flex-start;
  overflow-y: auto;
}

.left-column {
  flex: 1;
  max-width: 55%;
}

.right-column {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-card {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);

  .card-header {
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 18px;
    color: #303133;

    .el-icon {
      margin-right: 8px;
      color: #409eff;
    }
  }

  .card-content {
    color: #606266;
    line-height: 1.8;
    padding: 10px 0;
  }
}

.side-card {
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(5px);

  .card-header {
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 16px;
    color: #303133;

    .el-icon {
      margin-right: 8px;
      color: #409eff;
    }
  }
}

/* 左侧内容样式 */
.welcome-greeting {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;

  .el-icon {
    font-size: 16px;
  }
}

.stats-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;

  .stat-item {
    flex: 1;
    text-align: center;
    padding: 12px 8px;
    background: #f5f7fa;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: #ecf5ff;
      transform: translateY(-2px);
    }

    .stat-number {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #409eff;
      line-height: 1.2;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
}

.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  .el-button {
    .el-icon {
      margin-right: 4px;
    }
  }
}

.todo-list {
  .todo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }

    .completed-text {
      text-decoration: line-through;
      color: #c0c4cc;
    }
  }
}

.el-divider {
  margin: 16px 0;
}

/* 右侧模块样式 */

// 值班护士列表
.nurse-list {
  .nurse-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }

    .nurse-info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .nurse-name {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }

      .nurse-dept {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

// 通知列表
.notice-list {
  .notice-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }

    .notice-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;

      &.urgent {
        background: #f56c6c;
      }
      &.normal {
        background: #409eff;
      }
      &.info {
        background: #909399;
      }
    }

    .notice-content {
      flex: 1;
      display: flex;
      flex-direction: column;

      .notice-title {
        font-size: 13px;
        color: #303133;
        line-height: 1.4;
      }

      .notice-time {
        font-size: 11px;
        color: #c0c4cc;
        margin-top: 4px;
      }
    }
  }
}

// 床位使用率
.bed-stats {
  .bed-progress {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 13px;
      color: #606266;
    }
  }
}
</style>
