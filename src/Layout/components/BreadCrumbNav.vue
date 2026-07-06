<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/nurseHome' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>{{ title }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>