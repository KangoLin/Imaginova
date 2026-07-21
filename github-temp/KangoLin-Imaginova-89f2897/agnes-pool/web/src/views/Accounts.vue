<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2 style="margin: 0">账号管理</h2>
    </div>
    <el-table :data="accounts" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="platform_user_id" label="平台用户 ID" />
      <el-table-column prop="key_count" label="Key 数量" width="80" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
            {{ row.is_active ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-popconfirm title="确定删除此账号？" @confirm="handleDelete(row.id)">
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
import { getAccounts, deleteAccount } from '../api'
import { ElMessage } from 'element-plus'

const accounts = ref([])

async function fetchAccounts() {
  const res = await getAccounts()
  accounts.value = res.data
}

async function handleDelete(id) {
  try {
    await deleteAccount(id)
    ElMessage.success('删除成功')
    await fetchAccounts()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(fetchAccounts)
</script>
