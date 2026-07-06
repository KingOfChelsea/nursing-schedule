<template>
  <el-dropdown>
    <span class="user-info">
      <el-avatar :size="32" :src="avatar" />
      <span class="username">{{ userName }}</span>
      <el-icon><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in menuItems"
          :key="item.command"
          :command="item.command"
          :divided="item.divided"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'

defineProps({
  userName: {
    type: String,
    default: '管理员'
  },
  avatar: {
    type: String,
    default: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  menuItems: {
    type: Array,
    default: () => [
      { command: 'profile', label: '个人中心' },
      { command: 'password', label: '修改密码' },
      { command: 'tasks', label: '我的任务' },
      { command: 'logout', label: '退出登录', divided: true }
    ]
  }
})

defineEmits(['command'])
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.2s;

  &:hover {
    background: rgba(52, 152, 219, 0.06);
  }

  .username {
    font-size: 14px;
    color: $text-regular;
  }

  .el-icon {
    font-size: 12px;
    color: $text-placeholder;
  }
}
</style>