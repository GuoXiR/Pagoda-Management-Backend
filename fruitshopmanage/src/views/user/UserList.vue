<template>
  <el-card class="box-card">
    <template #header>
      <el-row :gutter="10">
        <el-col :span="8">
          <!-- 输入用户名-->
          <el-input v-model="queryInfo.query" placeholder="输入用户名" />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="getUserList">搜索</el-button>
        </el-col>
      </el-row>
    </template>
    <el-table :data="users" style="width: 100%">
      <el-table-column label="用户ID" prop="mg_id" width="80" />
      <el-table-column label="用户名" prop="mg_name" />
      <el-table-column label="手机" prop="mg_mobile" />
      <el-table-column label="邮箱" prop="mg_email" />
      <el-table-column label="角色" prop="role_id" />
      <el-table-column label="状态" prop="mg_state">
        <template #default="scope">
          <el-switch
            v-model="scope.row.mg_state"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="mg_time">
        <template #default="scope">
          {{ formatDate(scope.row.mg_time) }}
        </template>
      </el-table-column>
      <el-table-column align="right" label="操作">
        <template #default="scope">
          <el-button size="small" @click="goUpdateUser(scope.row.mg_id)">
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="removeById(scope.row.mg_id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryInfo.pagenum"
      v-model:page-size="queryInfo.pagesize"
      :page-sizes="[5, 10, 15, 20]"
      :background="true"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-card>
</template>

<script setup>
import axios from 'axios'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const users = ref([])
const queryInfo = reactive({
  query: '',
  pagenum: 1,
  pagesize: 10
})
const total = ref(0)

// 格式化时间
const formatDate = timestamp => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 获取用户列表
const getUserList = async () => {
  const token = localStorage.getItem('token')
  try {
    const { data: res } = await axios.get(
      `http://127.0.0.1:8088/sysapi/users`,
      {
        params: queryInfo,
        headers: {
          Authorization: token
        }
      }
    )

    if (res.meta.status !== 200) {
      ElMessage.error('获取用户列表失败')
      return
    }

    users.value = res.data.users
    total.value = res.data.total
  } catch (error) {
    console.error('获取用户列表失败' + error)
    ElMessage.error('获取用户列表失败')
  }
}

// 处理分页大小变化
const handleSizeChange = newSize => {
  queryInfo.pagesize = newSize
  getUserList()
}

// 处理当前页码变化
const handleCurrentChange = newPage => {
  queryInfo.pagenum = newPage
  getUserList()
}

// 处理用户状态变更
const handleStatusChange = async user => {
  const token = localStorage.getItem('token')
  try {
    const { data: res } = await axios.put(
      `http://127.0.0.1:8088/sysapi/users/${user.mg_id}`,
      {
        mg_state: user.mg_state
      },
      {
        headers: {
          Authorization: token
        }
      }
    )

    if (res.meta.status !== 200) {
      ElMessage.error('更新用户状态失败')
      // 恢复原来的状态
      user.mg_state = user.mg_state === 1 ? 0 : 1
      return
    }

    ElMessage.success('更新用户状态成功')
  } catch (error) {
    console.error('更新用户状态失败' + error)
    ElMessage.error('更新用户状态失败')
    // 恢复原来的状态
    user.mg_state = user.mg_state === 1 ? 0 : 1
  }
}

// 跳转到编辑用户页面
function goUpdateUser (mg_id) {
  router.push(`/admin/update-user/${mg_id}`)
}

// 删除用户
const removeById = async mg_id => {
  const token = localStorage.getItem('token')
  if (!mg_id) {
    ElMessage.error('未获取需要删除的用户ID')
    return
  }

  try {
    const { data: res } = await axios.delete(
      `http://127.0.0.1:8088/sysapi/users/${mg_id}`,
      {
        headers: {
          Authorization: token
        }
      }
    )

    if (res.meta.status !== 201) {
      ElMessage.error('删除用户失败！')
      return
    }

    ElMessage.success('删除用户成功！')
    getUserList()
  } catch (error) {
    console.error('删除用户失败' + error)
    ElMessage.error('删除用户失败！')
  }
}

// 生命周期钩子函数
onMounted(() => {
  getUserList()
})
</script>

<style scoped></style>
