// src/config/menuData.js
export const menuData = [
  {
    index: '/nurseHome',
    title: '工作台',
    icon: 'HomeFilled',
  },
  {
    index: 'quality',
    title: '质量管理',
    icon: 'Checked',
    children: [
      { index: '/quality/maintenance', title: '质量维护' },
      { index: '/quality/standard', title: '质量标准' },
      { index: '/quality/inspection', title: '质量检查' },
      { index: '/quality/problem', title: '问题整改' },
      { index: '/quality/tracking', title: '整改追踪' },
      { index: '/quality/verify', title: '效果验证' },
      { index: '/quality/report', title: '质量报告' },
    ],
  },
  {
    index: 'indicators',
    title: '指标分析',
    icon: 'DataAnalysis',
    children: [
      { index: '/indicators/nursing', title: '护理质量指标' },
      { index: '/indicators/safety', title: '安全指标' },
      { index: '/indicators/efficiency', title: '效率指标' },
      { index: '/indicators/satisfaction', title: '满意度指标' },
      { index: '/indicators/trend', title: '趋势分析' },
      { index: '/indicators/compare', title: '对比分析' },
    ],
  },
  {
    index: 'schedule',
    title: '排班管理',
    icon: 'Calendar',
    children: [
      { index: '/schedule/plan', title: '排班计划' },
      { index: '/schedule/view', title: '排班查看' },
      { index: '/schedule/adjust', title: '排班调整' },
      { index: '/schedule/statistics', title: '排班统计' },
    ],
  },
  {
    index: 'patients',
    title: '患者管理',
    icon: 'UserFilled',
    children: [
      { index: '/patients/info', title: '患者信息' },
      { index: '/patients/nursing', title: '护理记录' },
      { index: '/patients/handover', title: '交接班' },
      { index: '/patients/risk', title: '风险评估' },
    ],
  },
  {
    index: 'nurses',
    title: '护士管理',
    icon: 'Avatar',
    children: [
      { index: '/nurses/profile', title: '档案管理' },
      { index: '/nurses/training', title: '培训考核' },
      { index: '/nurses/performance', title: '绩效考核' },
      { index: '/nurses/certification', title: '资质管理' },
    ],
  },
  {
    index: 'incident',
    title: '不良事件',
    icon: 'WarningFilled',
    children: [
      { index: '/incident/report', title: '事件上报' },
      { index: '/incident/investigation', title: '事件调查' },
      { index: '/incident/analysis', title: '根因分析' },
      { index: '/incident/prevention', title: '预防措施' },
    ],
  },
  {
    index: 'settings',
    title: '系统设置',
    icon: 'Setting',
    children: [
      { index: '/settings/basic', title: '基础设置' },
      { index: '/settings/shift', title: '班次设置' },
      { index: '/settings/indicator', title: '指标配置' },
      { index: '/settings/permission', title: '权限管理' },
      { index: '/settings/log', title: '操作日志' },
    ],
  },
];

// 页面标题映射
export const titleMap = {};
menuData.forEach((item) => {
  if (item.children) {
    item.children.forEach((child) => {
      titleMap[child.index] = child.title;
    });
  } else {
    titleMap[item.index] = item.title;
  }
});
