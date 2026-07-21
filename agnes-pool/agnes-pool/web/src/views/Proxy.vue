<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2 style="margin: 0">代理状态</h2>
      <el-space>
        <el-button @click="runHealthCheck" :loading="healthRunning"><el-icon><Monitor /></el-icon> 健康检查</el-button>
        <el-button type="primary" @click="refreshKeys"><el-icon><Refresh /></el-icon> 刷新密钥池</el-button>
      </el-space>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.total_keys }}</div>
            <div class="stat-label">密钥总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.active_keys }}</div>
            <div class="stat-label">活跃密钥</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value" :style="{ color: stats.cooldown_keys > 0 ? '#e6a23c' : '#409eff' }">{{ stats.cooldown_keys }}</div>
            <div class="stat-label">冷却中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ usageTotal }}</div>
            <div class="stat-label">总调用次数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 24px">
      <template #header><span>密钥用量明细</span></template>
      <el-table :data="keyRows" stripe style="width: 100%">
        <el-table-column prop="key_preview" label="密钥" width="200" />
        <el-table-column prop="account_id" label="账号 ID" width="100" />
        <el-table-column prop="calls" label="调用次数" width="100" align="center" />
        <el-table-column label="成功/失败" width="140" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ row.success }}</el-tag>
            &nbsp;/&nbsp;
            <el-tag size="small" :type="row.fail > 0 ? 'danger' : 'info'">{{ row.fail }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="success_rate" label="成功率" width="120" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.success_rate"
              :color="row.success_rate >= 80 ? '#67c23a' : row.success_rate >= 50 ? '#e6a23c' : '#f56c6c'"
              :stroke-width="16"
            />
          </template>
        </el-table-column>
        <el-table-column prop="last_check" label="健康检查" width="160" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.health_status === 'ok'" size="small" type="success">正常</el-tag>
            <el-tag v-else-if="row.health_status === 'invalid'" size="small" type="danger">失效</el-tag>
            <el-tag v-else-if="row.health_status" size="small" type="warning">{{ row.health_status }}</el-tag>
            <span v-else class="dim">未检查</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.is_active" size="small" type="success">启用</el-tag>
            <el-tag v-else size="small" type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_used" label="最后使用" min-width="160">
          <template #default="{ row }">
            <span class="dim">{{ row.last_used || '从未' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card style="margin-top: 24px">
      <template #header><span>轮询策略说明</span></template>
      <p>当前策略：<el-tag>Round-Robin</el-tag> — 在可用密钥之间循环分配请求。遇 429 限流自动冷却 60 秒并切换下一个 Key。</p>
      <p>代理端点：<code>POST /v1/images/generations</code>、<code>POST /v1/videos</code>、<code>GET /agnesapi?video_id=</code></p>
      <p>超时设置：300 秒</p>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProxyStats, refreshProxyKeys, getHealthCheckResults, runHealthCheck as apiRunHealth } from '../api'
import { ElMessage } from 'element-plus'

const stats = ref({ total_keys: 0, active_keys: 0, cooldown_keys: 0, usage: {}, per_key: [] })
const healthResults = ref({})
const healthRunning = ref(false)

const usageTotal = computed(() =>
  Object.values(stats.value.usage).reduce((a, b) => a + b, 0)
)

const keyRows = computed(() => {
  return (stats.value.per_key || []).map(k => ({
    ...k,
    health_status: healthResults.value[k.key_id]?.status,
    last_check: healthResults.value[k.key_id]?.checked_at,
  }))
})

async function fetchStats() {
  try {
    const [statsRes, healthRes] = await Promise.all([
      getProxyStats(),
      getHealthCheckResults(),
    ])
    stats.value = statsRes.data
    healthResults.value = healthRes.data.results || {}
  } catch {
    ElMessage.error('获取数据失败')
  }
}

async function refreshKeys() {
  try {
    await refreshProxyKeys()
    ElMessage.success('密钥池已刷新')
    await fetchStats()
  } catch {
    ElMessage.error('刷新失败')
  }
}

async function runHealthCheck() {
  healthRunning.value = true
  try {
    const res = await apiRunHealth()
    healthResults.value = res.data.results || {}
    ElMessage.success('健康检查完成')
    await fetchStats()
  } catch {
    ElMessage.error('健康检查失败')
  } finally {
    healthRunning.value = false
  }
}

onMounted(fetchStats)
</script>

<style scoped>
.stat-card { text-align: center; padding: 8px 0; }
.stat-value { font-size: 36px; font-weight: bold; color: #409eff; }
.stat-label { font-size: 14px; color: #909399; margin-top: 8px; }
.dim { color: #909399; font-size: 13px; }
code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
</style>
