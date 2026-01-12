<template>
  <el-card class="box-card">
    <template #header>
      <el-row :gutter="10">
        <el-col :span="4">
          <!-- 请选择商品分类 -->
          <el-select v-model="value" class="m-2" placeholder="请选择商品分类">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <!-- 输入商品名称-->
          <el-input v-model="queryInfo.query" placeholder="输入商品名称" />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="getGoodsList">搜索</el-button>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddProduct">添加商品</el-button>
        </el-col>
      </el-row>
    </template>
    <el-table :data="goods" style="width: 100%">
      <el-table-column label="商品名称" prop="goods_name" />
      <el-table-column label="商品分类" prop="cat_id" />
      <el-table-column label="商品数量" prop="goods_number" />
      <el-table-column label="商品价格" prop="goods_price" />
      <el-table-column align="right" label="操作">
        <template #default="scope">
          <el-button size="small" @click="goUpdateProduct(scope.row.goods_id)"
            >编辑</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="removeById(scope.row.goods_id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryInfo.pagenum"
      v-model:page-size="queryInfo.pagesize"
      :page-sizes="[5, 10, 15, 20]"
      :small="small"
      :disabled="disabled"
      :background="background"
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
const goods = ref([])
const options = ref([]) // 用于存储分类数据
const value = ref('') // 分类选择器的值
const queryInfo = reactive({
  query: '',
  pagenum: 1,
  pagesize: 10
})
const total = ref(0)
// 获取分类列表
const getCategoryList = async () => {
  const token = localStorage.getItem('token')
  try {
    const { data: res } = await axios.get(
      `http://127.0.0.1:8088/sysapi/category`,
      {
        headers: {
          Authorization: token
        }
      }
    )
    if (res.meta.status === 200) {
      // 将分类数据转换为select组件需要的格式
      options.value = res.data.map(item => ({
        label: item.cat_name,
        value: item.cat_id
      }))
    }
  } catch (error) {
    console.error('获取分类列表失败' + error)
    ElMessage.error('获取分类列表失败')
  }
}

//获取商品列表
const getGoodsList = async () => {
  const token = localStorage.getItem('token')
  try {
    const { data: res } = await axios.get(
      `http://127.0.0.1:8088/sysapi/goods`,
      {
        params: queryInfo,
        headers: {
          Authorization: token // 直接使用token，因为后端已经在token中添加了Bearer前缀
        }
      }
    )
    console.log(res)
    goods.value = res.data.goods
    total.value = res.data.total
  } catch (error) {
    console.error('获取商品失败' + error)
  }
}

// 处理分页大小变化
const handleSizeChange = newSize => {
  queryInfo.pagesize = newSize
  getGoodsList()
}

// 处理当前页码变化
const handleCurrentChange = newPage => {
  queryInfo.pagenum = newPage
  getGoodsList()
}
//生命周期钩子函数
onMounted(async () => {
  await getCategoryList() // 先获取分类列表
  getGoodsList() // 再获取商品列表
})
function goAddProduct () {
  router.push('/admin/add-product')
}

// 跳转到编辑商品页面
function goUpdateProduct (goods_id) {
  router.push(`/admin/update-product/${goods_id}`)
}
//删除商品
const removeById = async goods_id => {
  const token = localStorage.getItem('token')
  if (goods_id == '') {
    ElMessage.error('未获取需要删的 ID')
    return
  }
  try {
    const { data: res } = await axios.delete(
      `http://127.0.0.1:8088/sysapi/goods/${goods_id}`,
      {
        headers: {
          Authorization: token // 直接使用token，因为后端已经在token中添加了Bearer前缀
        }
      }
    )
    if (res.meta.status !== 201) {
      ElMessage.error('删除商品失败！')
      return
    }
    ElMessage.success('删除商品成功！')
    getGoodsList()
  } catch (error) {
    console.error('删除分类失败' + error)
  }
}
</script>

<style scoped></style>
