<template>
  <!-- 卡片区域 -->
  <el-card>
    <!-- 提示区域 -->
    <el-alert title="编辑商品信息" type="info" center show-icon />
    <!-- 步骤条区域 -->
    <el-steps :active="activeIndex - 0" finish-status="success">
      <el-step title="基本信息" />
      <el-step title="商品图片" />
      <el-step title="商品详情" />
      <el-step title="完成" />
    </el-steps>
    <!-- tab 栏区域 -->
    <el-form
      ref="formRef"
      :model="updateForm"
      :rules="rules"
      label-width="120px"
      class="demo-dynamic"
      style="margin-top: 30px"
    >
      <el-tabs :tab-position="tabPosition" class="demo-tabs">
        <!-- 第一个选项卡 -->
        <el-tab-pane label="基本信息">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="updateForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input
              v-model.number="updateForm.goods_price"
              type="number"
            ></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input
              v-model.number="updateForm.goods_weight"
              type="number"
            ></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input
              v-model.number="updateForm.goods_number"
              type="number"
            ></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-select
              v-model="updateForm.goods_cat"
              class="m-2"
              placeholder="请选择"
              style="width: 240px"
            >
              <el-option
                v-for="item in catelist"
                :key="item.cat_id"
                :label="item.cat_name"
                :value="item.cat_id"
              />
            </el-select>
          </el-form-item>
        </el-tab-pane>
        <!-- 第二个选项卡 -->
        <el-tab-pane label="商品图片">
          <el-upload
            class="upload-demo"
            :http-request="uploadImage"
            :file-list="fileList"
            action="#"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            list-type="picture"
          >
            <el-button type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <!-- 第三个选项卡 -->
        <el-tab-pane label="商品详情">
          <!-- 富文本编辑器组件 -->
          <QuillEditor
            theme="snow"
            style="height: 300px"
            v-model:content="updateForm.goods_introduce"
            contentType="html"
            :toolbar="[
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              ['link', 'image', 'video', 'formula'],
              [{ header: 1 }, { header: 2 }],
              [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
              [{ script: 'sub' }, { script: 'super' }],
              [{ indent: '-1' }, { indent: '+1' }],
              [{ direction: 'rtl' }],
              [{ size: ['small', false, 'large', 'huge'] }],
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ color: [] }, { background: [] }],
              [{ font: [] }],
              [{ align: [] }],
              ['clean']
            ]"
          />
          <!-- 更新商品的按钮 -->
          <el-button
            type="primary"
            class="btnUpdate"
            @click="update"
            style="
              margin-top: 20px;
              display: block;
              margin-left: auto;
              margin-right: auto;
            "
            >更新商品</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
</template>
<script setup>
import axios from 'axios'
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
const router = useRouter()
const route = useRoute()

// 表单引用
const formRef = ref(null)

// 步骤条激活索引
const activeIndex = ref('0')

// 父分类列表
const parentCateList = ref([])

// 文件列表
const fileList = ref([])

// 表单验证规则
const rules = ref({
  goods_name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    {
      min: 1,
      max: 50,
      message: '商品名称长度在 1 到 50 个字符',
      trigger: 'blur'
    }
  ],
  goods_price: [
    { required: true, message: '请输入商品价格', trigger: ['blur', 'change'] },
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback(new Error('请输入商品价格'))
        } else if (typeof value !== 'number') {
          callback(new Error('请输入有效的数字'))
        } else if (value <= 0) {
          callback(new Error('商品价格必须大于 0'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ],
  goods_weight: [
    { required: true, message: '请输入商品重量', trigger: ['blur', 'change'] },
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback(new Error('请输入商品重量'))
        } else if (typeof value !== 'number') {
          callback(new Error('请输入有效的数字'))
        } else if (value <= 0) {
          callback(new Error('商品重量必须大于 0'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ],
  goods_number: [
    { required: true, message: '请输入商品数量', trigger: ['blur', 'change'] },
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback(new Error('请输入商品数量'))
        } else if (typeof value !== 'number') {
          callback(new Error('请输入有效的数字'))
        } else if (value <= 0) {
          callback(new Error('商品数量必须大于 0'))
        } else if (!Number.isInteger(value)) {
          callback(new Error('商品数量必须为整数'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ],
  goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'change' }]
})

const updateForm = reactive({
  goods_id: '',
  goods_name: '',
  goods_price: null,
  goods_weight: null,
  goods_number: null,
  // 商品所属的分类
  goods_cat: '',
  // 图片的数组
  pics: [],
  // 商品的详情描述
  goods_introduce: ''
})
//获取类别列表
const catelist = ref([])
const getCateList = async () => {
  const token = localStorage.getItem('token')
  try {
    const { data: res } = await axios.get(
      `http://127.0.0.1:8088/sysapi/category`,
      {
        headers: {
          Authorization: `${token}`
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
//获取商品详情
const getGoodsDetail = async () => {
  const token = localStorage.getItem('token')
  const goodsId = route.params.id
  try {
    const { data: res } = await axios.get(
      `http://127.0.0.1:8088/sysapi/goods/${goodsId}`,
      {
        headers: {
          Authorization: `${token}`
        }
      }
    )
    console.log('商品详情:', res)
    if (res.meta.status === 200) {
      const goods = res.data
      // 填充表单数据
      updateForm.goods_id = goods.goods_id
      updateForm.goods_name = goods.goods_name
      updateForm.goods_price = Number(goods.goods_price)
      updateForm.goods_weight = Number(goods.goods_weight)
      updateForm.goods_number = Number(goods.goods_number)
      updateForm.goods_cat = String(goods.goods_cat)
      updateForm.goods_introduce = goods.goods_introduce
      
      // 处理商品图片
      if (goods.pics && goods.pics.length > 0) {
        goods.pics.forEach(pic => {
          fileList.value.push({
            uid: pic.pics_id,
            name: pic.pics_name || '商品图片',
            status: 'success',
            url: pic.pics_mid_url || pic.pics_mid
          })
        })
        updateForm.pics = goods.pics
      }
    }
  } catch (error) {
    console.error('获取商品详情失败' + error)
    ElMessage.error('获取商品详情失败')
  }
}
//Tabs 标签页的方向
const tabPosition = ref('left')
//生命周期钩子函数
onMounted(() => {
  getCateList()
  getGoodsDetail()
})

//图片上传
const uploadImage = async option => {
  const { file, onSuccess, onError } = option
  const formData = new FormData()
  const token = localStorage.getItem('token')
  formData.append('file', file)
  try {
    const { data: res } = await axios.post(
      'http://127.0.0.1:8088/sysapi/upload',
      formData,
      {
        headers: {
          Authorization: `${token}`
        }
      }
    )
    console.log(res)
    const uploadedFile = {
      uid: Date.now(),
      name: file.name,
      status: 'success',
      url: res.data.tmp_path
    }
    fileList.value.push(uploadedFile)
    updateForm.pics.push({ pic: res.data.tmp_path })
    onSuccess && onSuccess()
  } catch (err) {
    onError(err)
  }
}

// 图片预览函数
const handlePreview = file => {
  console.log(file)
}

// 图片移除函数
const handleRemove = file => {
  // 从显示列表中移除
  const index = fileList.value.findIndex(item => item.uid === file.uid)
  if (index !== -1) {
    fileList.value.splice(index, 1)
  }
  // 从数据列表中移除
  const dataIndex = updateForm.pics.findIndex(item => item.pic === file.url || item.pics_id === file.uid)
  if (dataIndex !== -1) {
    updateForm.pics.splice(dataIndex, 1)
  }
  return true
}

// 提交更新商品的表单
const update = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()

    // 准备提交数据，确保数据类型正确
    const submitData = {
      ...updateForm,
      goods_price: Number(updateForm.goods_price),
      goods_weight: Number(updateForm.goods_weight),
      goods_number: Number(updateForm.goods_number),
      // 确保goods_cat是字符串类型
      goods_cat: String(updateForm.goods_cat)
    }

    console.log('表单验证通过，提交数据:', submitData)
    const token = localStorage.getItem('token')
    console.log('token:', token)
    const { data: res } = await axios.put(
      `http://127.0.0.1:8088/sysapi/goods/${updateForm.goods_id}`,
      submitData,
      {
        headers: {
          Authorization: `${token}`
        }
      }
    )
    console.log('API响应:', res)
    if (res.meta.status === 200) {
      ElMessage.success('更新商品成功')
      router.push('/admin/product-list')
    } else {
      ElMessage.error(res.meta.msg || '更新商品失败')
    }
  } catch (error) {
    console.error('更新商品失败:', error)
    if (error.response) {
      console.error('响应错误:', error.response)
      ElMessage.error(
        error.response.data.meta?.msg ||
          error.response.data?.message ||
          '更新商品失败'
      )
    } else if (error.request) {
      console.error('请求错误:', error.request)
      ElMessage.error('服务器无响应，请检查网络连接')
    } else {
      console.error('请求配置错误:', error.message)
      ElMessage.error('网络错误，请稍后重试')
    }
  }
}
</script>
<style scoped>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>