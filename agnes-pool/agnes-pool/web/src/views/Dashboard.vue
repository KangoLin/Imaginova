<template>
  <div>
    <h2>概览</h2>
    <el-row :gutter="20">
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.accounts }}</div>
            <div class="stat-label">账号总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.activeKeys }}</div>
            <div class="stat-label">活跃密钥</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalKeys }}</div>
            <div class="stat-label">密钥总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalCalls }}</div>
            <div class="stat-label">总调用次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value" :style="{ color: stats.cooldownKeys > 0 ? '#e6a23c' : '#67c23a' }">{{ stats.cooldownKeys }}</div>
            <div class="stat-label">冷却键数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.serviceStatus }}</div>
            <div class="stat-label">服务状态</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 24px">
      <el-col :span="12">
        <el-card>
          <template #header><span>快速操作</span></template>
          <el-space direction="vertical" fill style="width: 100%">
            <el-button type="primary" @click="$router.push('/accounts')"><el-icon><Plus /></el-icon> 管理账号</el-button>
            <el-button type="success" @click="$router.push('/keys')"><el-icon><Key /></el-icon> 管理密钥</el-button>
            <el-button @click="$router.push('/proxy')"><el-icon><Connection /></el-icon> 查看代理</el-button>
          </el-space>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>API 端点参考</span></template>
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="平台后端">{{ "https://platform-backend.agnes-ai.com" }}</el-descriptions-item>
            <el-descriptions-item label="图像生成">{{ "https://apihub.agnes-ai.com/v1/images/generations" }}</el-descriptions-item>
            <el-descriptions-item label="视频创建">{{ "https://apihub.agnes-ai.com/v1/videos" }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAccounts, getKeys, getProxyStats, healthCheck } from '../api'

const stats = ref({ accounts: 0, activeKeys: 0, totalKeys: 0, totalCalls: 0, cooldownKeys: 0, serviceStatus: '检查中...' })

onMounted(async () => {
  try {
    const [accRes, keyRes, proxyRes, healthRes] = await Promise.all([
      getAccounts(), getKeys(), getProxyStats(), healthCheck(),
    ])
    const usage = proxyRes.data.usage || {}
    stats.value = {
      accounts: accRes.data.length,
      activeKeys: keyRes.data.filter(k => k.is_active).length,
      totalKeys: keyRes.data.length,
      totalCalls: Object.values(usage).reduce((a, b) => a + b, 0),
      cooldownKeys: proxyRes.data.cooldown_keys || 0,
      serviceStatus: healthRes.data.status === 'ok' ? '正常' : '异常',
    }
  } catch {
    stats.value.serviceStatus = '无法连接'
  }
})
</script>

<style scoped>
.stat-card { text-align: center; padding: 8px 0; }
.stat-value { font-size: 36px; font-weight: bold; color: #409eff; }
.stat-label { font-size: 14px; color: #909399; margin-top: 8px; }
</style>
