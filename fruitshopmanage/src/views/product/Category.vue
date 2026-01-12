<template>
  <el-card class="box-card">
    <!-- 搜索栏 -->
    <el-row :gutter="10">
      <el-col :span="6">
        <el-input v-model="searchKeyword" placeholder="输入分类名称"></el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="showAddDialog">添加分类</el-button>
      </el-col>
    </el-row>
    <el-table :data="catelist" style="width: 100%">
      <el-table-column label="分类编号" prop="cat_id" />
      <el-table-column label="分类名称" prop="cat_name" />
      <el-table-column label="分类级别" prop="cat_level" />
      <el-table-column label="操作" align="right">
        <template #default="scope">
          <el-button size="small" @click="editCategory(scope.row.cat_id)">
            编辑</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="deleteCategory(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <!-- 添加分类弹出层 begin -->
  <el-dialog
    v-model="add_dialogVisible"
    title="添加分类"
    width="40%"
    :before-close="handleClose"
  >
    <el-form
      ref="ruleFormRef"
      :model="addCateForm"
      status-icon
      :rules="rules"
      label-width="120px"
      class="demo-ruleForm"
    >
      <el-form-item label="分类名称：">
        <el-input v-model="addCateForm.cat_name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="父级分类：">
        <el-select
          v-model="selectvalue"
          class="m-2"
          placeholder="请选择"
          style="width: 240px"
        >
          <el-option
            v-for="item in parentCateList"
            :key="item.cat_id"
            :label="item.cat_name"
            :value="item.cat_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addCate">确定</el-button>
        <el-button @click="cancelAddCate">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <!-- 添加分类弹出层 end -->
  <!-- 编辑分类弹出层 begin -->
  <el-dialog
    v-model="edit_dialogVisible"
    title="修改分类"
    width="40%"
    :before-close="handleClose"
  >
    <el-form
      ref="ruleFormRef"
      :model="editCateForm"
      status-icon
      :rules="rules"
      label-width="120px"
      class="demo-ruleForm"
    >
      <el-form-item label="分类名称：">
        <el-input v-model="editCateForm.cat_name" autocomplete="off" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="editCate(editCateForm.cat_id)"
          >确定
        </el-button>
        <el-button @click="edit_dialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <!-- 编辑分类弹出层 end -->
</template>

<script setup>
import axios from 'axios'
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
const catelist = ref([])
const parentCateList = ref([])
const add_dialogVisible = ref(false)
const selectvalue = ref()
const searchKeyword = ref('')
const addCateForm = reactive({
  cat_id: '',
  cat_name: '', // 将要添加的分类的名称
  cat_pid: 0, // 父级分类的 Id
  cat_level: 0 // 分类的等级，默认要添加的是 1 级分类
})
const edit_dialogVisible = ref(false)
const editCateForm = reactive({
  cat_id: '',
  cat_name: ''
})
//"添加分类"按钮事件
function showAddDialog () {
  add_dialogVisible.value = true
}
// 重置添加分类表单
const resetAddForm = () => {
  addCateForm.cat_name = ''
  selectvalue.value = null
}

// 取消添加分类
const cancelAddCate = () => {
  add_dialogVisible.value = false
  resetAddForm()
}

//点击按钮，添加新的分类
const addCate = async () => {
  const token = localStorage.getItem('token')

  // 根据父级分类计算分类级别
  let catLevel = 1 // 默认一级分类
  if (selectvalue.value) {
    // 如果选择了父级分类，查找父级分类的级别并+1
    const parentCategory = parentCateList.value.find(
      cate => cate.cat_id === selectvalue.value
    )
    if (parentCategory) {
      catLevel = parentCategory.cat_level + 1
    }
  }

  try {
    const { data: res } = await axios.post(
      `http://127.0.0.1:8088/sysapi/category`,
      {
        cat_pid: selectvalue.value || 0, // 父级分类的 Id
        cat_name: addCateForm.cat_name, // 将要添加的分类的名称
        cat_level: catLevel // 根据父级分类计算的分类级别
      },
      {
        headers: {
          Authorization: `${token}` // 最常见的格式
        }
      }
    )
    if (res.meta.status !== 201) {
      ElMessage.error('添加分类失败！')
      return
    }
    ElMessage.success('添加分类成功！')
    getCateList()
    add_dialogVisible.value = false
    resetAddForm() // 添加成功后重置表单
  } catch (error) {
    console.error('获取分类失败' + error)
  }
}
//搜索分类函数
const handleSearch = () => {
  getCateList(searchKeyword.value)
}

//获取类别列表
const getCateList = async (keyword = '') => {
  const token = localStorage.getItem('token')
  try {
    const { data: res } = await axios.get(
      `http://127.0.0.1:8088/sysapi/category`,
      {
        params: {
          keyword: keyword
        },
        headers: {
          Authorization: `${token}` // 最常见的格式
        }
      }
    )
    console.log(res)
    catelist.value = res.data
    parentCateList.value = res.data
  } catch (error) {
    console.error('获取分类失败' + error)
  }
}
//生命周期钩子函数
onMounted(() => {
  getCateList()
})
//删除分类
const deleteCategory = async cat_id => {
  const token = localStorage.getItem('token')
  if (cat_id == '') {
    ElMessage.error('为获取需要删的 ID')
    return
  }
  try {
    const { data: res } = await axios.delete(
      `http://127.0.0.1:8088/sysapi/category/${cat_id}`,
      {
        headers: {
          Authorization: `${token}` // 最常见的格式
        }
      }
    )
    if (res.meta.status !== 400) {
      ElMessage.error('删除分类失败！')
      return
    }
    ElMessage.success('删除分类成功！')
    getCateList()
  } catch (error) {
    console.error('删除分类失败' + error)
  }
}
//编辑分类，渲染原始分类名称
const editCategory = async cat_id => {
  edit_dialogVisible.value = true
  const token = localStorage.getItem('token')
  try {
    const { data: res } = await axios.get(
      `http://127.0.0.1:8088/sysapi/category/` + cat_id,
      {
        headers: {
          Authorization: `${token}` // 最常见的格式
        }
      }
    )
    if (res.meta.status !== 200) {
      ElMessage.error('获取分类失败！')
      return
    }
    editCateForm.cat_name = res.data.cat_name
    editCateForm.cat_id = res.data.cat_id
  } catch (error) {
    console.error('获取分类失败' + error)
  }
}
//点击按钮，编辑分类
const editCate = async cat_id => {
  const token = localStorage.getItem('token')
  try {
    const { data: res } = await axios.put(
      `http://127.0.0.1:8088/sysapi/category/` + cat_id,
      {
        cat_name: editCateForm.cat_name
      },
      {
        headers: {
          Authorization: `${token}` // 最常见的格式
        }
      }
    )
    if (res.meta.status !== 200) {
      ElMessage.error('更新分类失败！')
      return
    }
    ElMessage.success('更新分类成功！')
    getCateList()
    edit_dialogVisible.value = false
  } catch (error) {
    console.error('更新分类失败' + error)
  }
}
</script>

<style scoped>
.box-card {
  width: 100%;
}
</style>
