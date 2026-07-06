import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/Layout/index.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: Layout,
      redirect: '/nurseHome',
      children: [
        // ===== 主页 =====
        {
          path: 'nurseHome',
          name: 'nurseHome',
          component: () => import('@/views/NurseHomeView.vue'),
          meta: { title: '主页', icon: 'Calendar' },
        },
        // ===== 质量管理（三级质量） =====
        {
          path: 'quality/maintenance',
          name: 'QualityMaintenance',
          component: () => import('@/views/Quality/maintenance/index.vue'),
          meta: { title: '质量维护', icon: 'Checked' },
        },
        {
          path: 'quality/standard',
          name: 'QualityStandard',
          component: () => import('@/views/Quality/standard/index.vue'),
          meta: { title: '质量标准 ', icon: 'Checked' },
        },
        {
          path: '/quality/inspection',
          name: 'QualityInspection',
          component: () => import('@/views/Quality/inspection/index.vue'),
          meta: { title: '质量检查', icon: 'Checked' },
        },
      ],
    },
  ],
});

export default router;
