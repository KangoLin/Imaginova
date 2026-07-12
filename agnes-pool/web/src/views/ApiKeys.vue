<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2 style="margin: 0">API 密钥</h2>
      <el-button type="primary" @click="refresh"><el-icon><Refresh /></el-icon> 刷新</el-button>
    </div>
    <el-table :data="keys" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="key_preview" label="密钥预览" width="160" />
      <el-table-column prop="account_id" label="账号 ID" width="80" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
            {{ row.is_active ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-switch
            :model-value="row.is_active"
            @change="val => handleToggle(row.id, val)"
            style="margin-right: 12px"
          />
          <el-popconfirm title="确定删除此密钥？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button type="danger" size="small" text><el-icon><Delete /></el-icon></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getKeys, toggleKey, deleteKey } from '../api'
import { ElMessage } from 'element-plus'

const keys = ref([])

async function fetchKeys() {
  const res = await getKeys()
  keys.value = res.data
}

async function handleToggle(id, active) {
  try {
    await toggleKey(id, active)
    ElMessage.success(active ? '已启用' : '已禁用')
    await fetchKeys()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function handleDelete(id) {
  try {
    await deleteKey(id)
    ElMessage.success('删除成功')
    await fetchKeys()
  } catch {
    ElMessage.error('删除失败')
  }
}

function refresh() {
  fetchKeys()
}

onMounted(fetchKeys)
</script>
