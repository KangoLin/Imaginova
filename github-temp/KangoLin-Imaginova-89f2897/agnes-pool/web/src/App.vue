<template>
  <el-container style="min-height: 100vh">
    <el-aside width="220px" style="background: #1a1a2e">
      <div class="logo">Agnes Pool</div>
      <el-menu
        :default-active="route.path"
        router
        background-color="#1a1a2e"
        text-color="#a0aec0"
        active-text-color="#63b3ed"
      >
        <el-menu-item index="/">
          <el-icon><DataBoard /></el-icon><span>概览</span>
        </el-menu-item>
        <el-menu-item index="/accounts">
          <el-icon><User /></el-icon><span>账号管理</span>
        </el-menu-item>
        <el-menu-item index="/keys">
          <el-icon><Key /></el-icon><span>API 密钥</span>
        </el-menu-item>
        <el-menu-item index="/proxy">
          <el-icon><Connection /></el-icon><span>代理状态</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; padding: 0 24px">
        <h3 style="margin: 0">{{ route.meta.title }}</h3>
      </el-header>
      <el-main style="background: #f7fafc; padding: 24px">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style>
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.logo { height: 60px; display: flex; align-items: center; justify-content: center; color: #63b3ed; font-size: 20px; font-weight: bold; letter-spacing: 1px; }
.el-menu { border-right: none; }
</style>
