<template>
  <el-container class="layout-container">
    <SidebarMenu
      :is-collapse="isCollapse"
      :active-menu="activeMenu"
      @menu-select="handleMenuSelect"
    />

    <el-container class="main-container">
      <HeaderBar
        :pending-count="pendingCount"
        :user-name="userName"
        @notify-click="showPendingTasks"
        @fullscreen-click="toggleFullScreen"
        @user-command="handleUserCommand"
      >
        <template #left>
          <el-button
            @click="toggleCollapse"
            :icon="isCollapse ? 'Expand' : 'Fold'"
            text
            class="collapse-btn"
          />
          <BreadCrumbNav :title="currentTitle" />
        </template>
      </HeaderBar>

      <TagsBar
        :tags="tagsViewStore.visitedViews"
        :current-path="currentPath"
        @switch-tag="handleSwitchTag"
        @close-tag="handleCloseTag"
        @tags-action="handleTagsAction"
      />

      <el-main class="main-content">
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="tagsViewStore.cachedViews">
            <component :is="Component" :key="route.path" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTagsViewStore } from '@/stores/tagsView';
import { titleMap } from '@/config/menuData';
import SidebarMenu from './components/SidebarMenu.vue';
import HeaderBar from './components/HeaderBar.vue';
import TagsBar from './components/TagsBar.vue';
import BreadCrumbNav from './components/BreadCrumbNav.vue';

const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagsViewStore();

const isCollapse = ref(false);
const userName = ref('王护士长');
const pendingCount = ref(5);

const currentPath = computed(() => route.path);
const currentTitle = computed(() => titleMap[route.path] || '未知页面');

// 计算当前激活的菜单
const activeMenu = computed(() => {
  const path = route.path;
  const prefixMap = {
    '/quality': '/quality/maintenance',
    '/indicators': '/indicators/nursing',
    '/schedule': '/schedule/plan',
    '/patients': '/patients/info',
    '/nurses': '/nurses/profile',
    '/incident': '/incident/report',
    '/settings': '/settings/basic',
  };

  for (const [prefix, defaultPath] of Object.entries(prefixMap)) {
    if (path.startsWith(prefix)) return defaultPath;
  }
  return path;
});

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const showPendingTasks = () => {
  ElNotification({
    title: '待办事项',
    message: `您有 ${pendingCount.value} 个待处理事项`,
    type: 'warning',
    duration: 3000,
  });
};

const handleUserCommand = (command) => {
  switch (command) {
    case 'logout':
      // 退出登录逻辑
      break;
    default:
      break;
  }
};

// 标签相关逻辑
const getRouteNameByPath = (path) => {
  const nameMap = {
    '/nurseHome': 'NurseHome',
    '/quality/maintenance': 'QualityMaintenance',
    '/quality/standard': 'QualityStandard',
    '/quality/inspection': 'QualityInspection',
    '/quality/problem': 'QualityProblem',
    '/quality/tracking': 'QualityTracking',
    '/quality/verify': 'QualityVerify',
    '/quality/report': 'QualityReport',
    '/indicators/nursing': 'IndicatorsNursing',
    '/indicators/safety': 'IndicatorsSafety',
    '/indicators/efficiency': 'IndicatorsEfficiency',
    '/indicators/satisfaction': 'IndicatorsSatisfaction',
    '/indicators/trend': 'IndicatorsTrend',
    '/indicators/compare': 'IndicatorsCompare',
    '/schedule/plan': 'SchedulePlan',
    '/schedule/view': 'ScheduleView',
    '/schedule/adjust': 'ScheduleAdjust',
    '/schedule/statistics': 'ScheduleStatistics',
    '/patients/info': 'PatientsInfo',
    '/patients/nursing': 'PatientsNursing',
    '/patients/handover': 'PatientsHandover',
    '/patients/risk': 'PatientsRisk',
    '/nurses/profile': 'NursesProfile',
    '/nurses/training': 'NursesTraining',
    '/nurses/performance': 'NursesPerformance',
    '/nurses/certification': 'NursesCertification',
    '/incident/report': 'IncidentReport',
    '/incident/investigation': 'IncidentInvestigation',
    '/incident/analysis': 'IncidentAnalysis',
    '/incident/prevention': 'IncidentPrevention',
    '/settings/basic': 'SettingsBasic',
    '/settings/shift': 'SettingsShift',
    '/settings/indicator': 'SettingsIndicator',
    '/settings/permission': 'SettingsPermission',
    '/settings/log': 'SettingsLog',
  };
  return nameMap[path] || '';
};

const addTag = (path) => {
  const view = {
    name: getRouteNameByPath(path),
    path: path,
    title: titleMap[path] || '未命名',
  };
  tagsViewStore.addView(view);
};

const handleMenuSelect = (index) => {
  addTag(index);
};

onMounted(() => {
  addTag('/nurseHome');
});

watch(
  () => route.path,
  (newPath) => {
    addTag(newPath);
  },
  { immediate: true },
);

const handleSwitchTag = (tab) => {
  if (tab.path !== currentPath.value) {
    router.push(tab.path);
  }
};

const handleCloseTag = (tab) => {
  const visitedViews = tagsViewStore.visitedViews;
  const index = visitedViews.findIndex((v) => v.path === tab.path);

  tagsViewStore.removeView(tab.path);

  if (tab.path === currentPath.value) {
    const updatedViews = tagsViewStore.visitedViews;
    const prevTab = updatedViews[index - 1] || updatedViews[0];
    if (prevTab) {
      router.push(prevTab.path);
    }
  }
};

const handleTagsAction = (command) => {
  const currentView = tagsViewStore.visitedViews.find((v) => v.path === currentPath.value);

  switch (command) {
    case 'closeOther':
      if (currentView) {
        tagsViewStore.removeOtherViews(currentView);
      }
      break;
    case 'closeAll':
      tagsViewStore.removeAllViews();
      router.push('/dashboard');
      break;
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.layout-container {
  height: 100vh;
  overflow: hidden;
}

.main-container {
  display: flex;
  flex-direction: column;
  background: $bg-base;
}

.collapse-btn {
  font-size: 18px;
  color: $text-secondary;

  &:hover {
    color: $primary;
  }
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: $bg-base;
}
</style>
