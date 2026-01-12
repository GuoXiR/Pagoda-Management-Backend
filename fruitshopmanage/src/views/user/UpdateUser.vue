<template>
  <el-card>
    <el-alert title="编辑用户信息" type="info" center show-icon />
    <el-form
      ref="formRef"
      :model="updateForm"
      :rules="rules"
      label-width="120px"
      style="margin-top: 30px"
    >
      <el-form-item label="用户名" prop="mg_name">
        <el-input v-model="updateForm.mg_name"></el-input>
      </el-form-item>
      <el-form-item label="密码（可选）" prop="mg_pwd">
        <el-input
          v-model="updateForm.mg_pwd"
          type="password"
          placeholder="不修改请留空"
        ></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mg_mobile">
        <el-input v-model="updateForm.mg_mobile"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="mg_email">
        <el-input v-model="updateForm.mg_email"></el-input>
      </el-form-item>
      <el-form-item label="角色ID" prop="role_id">
        <el-input v-model.number="updateForm.role_id" type="number"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="mg_state">
        <el-switch
          v-model="updateForm.mg_state"
          active-value="1"
          inactive-value="0"
        ></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="update">更新用户</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script setup>
import axios from 'axios'
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)

const updateForm = reactive({
  mg_id: '',
  mg_name: '',
  mg_pwd: '',
  mg_mobile: '',
  mg_email: '',
  role_id: null,
  mg_state: '1'
})

const rules = reactive({
  mg_name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  mg_pwd: [
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  mg_mobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入有效的手机号码',
      trigger: 'blur'
    }
  ],
  mg_email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
      message: '请输入有效的邮箱地址',
      trigger: 'blur'
    }
  ],
  role_id: [
    { required: true, message: '请输入角色ID', trigger: ['blur', 'change'] },
    {
      type: 'number',
      min: 0,
      message: '角色ID必须为非负整数',
      trigger: ['blur', 'change']
    }
  ]
})

// 获取用户详情
const getUserDetail = async () => {
  const token = localStorage.getItem('token')
  const userId = route.params.id

  try {
    const { data: res } = await axios.get(
      `http://127.0.0.1:8088/sysapi/users/${userId}`,
      {
        headers: {
          Authorization: token
        }
      }
    )

    if (res.meta.status === 200) {
      const user = res.data
      updateForm.mg_id = user.mg_id
      updateForm.mg_name = user.mg_name
      updateForm.mg_mobile = user.mg_mobile
      updateForm.mg_email = user.mg_email
      updateForm.role_id = Number(user.role_id)
      updateForm.mg_state = user.mg_state
    } else {
      ElMessage.error(res.meta.msg || '获取用户详情失败')
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  }
}

// 更新用户
const update = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 准备提交数据，移除空密码
    const submitData = { ...updateForm }
    if (!submitData.mg_pwd) {
      delete submitData.mg_pwd
    }

    const token = localStorage.getItem('token')
    const { data: res } = await axios.put(
      `http://127.0.0.1:8088/sysapi/users/${updateForm.mg_id}`,
      submitData,
      {
        headers: {
          Authorization: token
        }
      }
    )

    if (res.meta.status === 200) {
      ElMessage.success('更新用户成功')
      router.push('/admin/user-list')
    } else {
      ElMessage.error(res.meta.msg || '更新用户失败')
    }
  } catch (error) {
    console.error('更新用户失败:', error)
    if (error.response) {
      ElMessage.error(error.response.data.meta?.msg || '更新用户失败')
    } else {
      ElMessage.error('网络错误，请稍后重试')
    }
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 返回用户列表
const goBack = () => {
  router.push('/admin/user-list')
}

// 生命周期钩子函数
onMounted(() => {
  getUserDetail()
})
</script>
<style scoped></style>
