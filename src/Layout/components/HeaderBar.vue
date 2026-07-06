<template>
  <el-header class="header">
    <div class="header-left">
      <slot name="left" />
    </div>
    <div class="header-right">
      <NotificationBell :count="pendingCount" @click="$emit('notify-click')" />
      <el-tooltip content="全屏" placement="bottom">
        <el-button :icon="FullScreen" text class="header-btn" @click="$emit('fullscreen-click')" />
      </el-tooltip>
      <UserDropdown
        :user-name="userName"
        :avatar="avatar"
        :menu-items="userMenuItems"
        @command="$emit('user-command', $event)"
      />
    </div>
  </el-header>
</template>

<script setup>
import { FullScreen } from '@element-plus/icons-vue'
import NotificationBell from './NotificationBell.vue'
import UserDropdown from './UserDropdown.vue'

defineProps({
  pendingCount: {
    type: Number,
    default: 0
  },
  userName: {
    type: String,
    default: '管理员'
  },
  avatar: {
    type: String,
    default: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  userMenuItems: {
    type: Array,
    default: () => [
      { command: 'profile', label: '个人中心' },
      { command: 'password', label: '修改密码' },
      { command: 'tasks', label: '我的任务' },
      { command: 'logout', label: '退出登录', divided: true }
    ]
  }
})

defineEmits(['notify-click', 'fullscreen-click', 'user-command'])
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.header {
  background: $bg-white;
  height: 52px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid $border-light;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;

    .header-btn {
      font-size: 18px;
      color: $text-secondary;

      &:hover {
        color: $primary;
      }
    }
  }
}
</style>