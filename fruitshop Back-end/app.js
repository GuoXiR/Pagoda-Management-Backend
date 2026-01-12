var express = require('express')
var app = express()
//处理文件路径的小工具
var path = require('path')

//挂载中间件，设置统一响应
var resextra = require('./modules/resExtra')
app.use(resextra)
// 设置跨域和相应数据格式，注意位置
const cors = require('cors')
app.use(cors())
// 获取验证模块
// 初始化数据库模块
// 设置跨域和相应数据格式
// 引入 bodyParser 解析 json
var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// 挂载静态资源
//步骤 1：获取管理员逻辑模块
var managerService = require(path.join(
  process.cwd(),
  'services/ManagerService'
))
//步骤 2：引入后台登录 passport
sys_passport = require('./modules/passport')
//步骤 3：调用 setup 实现 loginFunc 方法初始化
sys_passport.setup(app, managerService.login)
//步骤 4：设置登录入口
app.use('/sysapi/login', sys_passport.login)

//token校验，仅作为测试，后续作为中间件挂载到其他路由
//app.get("/auth",sys_passport.tokenAuth)

//指定其他接口也添加校验，排除登录接口
app.use('/sysapi/users', sys_passport.tokenAuth)
app.use('/sysapi/goods', sys_passport.tokenAuth)
app.use('/sysapi/upload', sys_passport.tokenAuth)
app.use('/tmp_uploads', express.static('tmp_uploads'))
// 初始化数据库模块
var database = require('./modules/db')
database.init(app, function (err) {
  if (err) console.error('连接数据库失败%s', err)
  console.log('数据库初始化成功')
})

//路由加载
var mount = require('mount-routes')
//初始化 路由
mount(app, path.join(process.cwd(), '/routes'), true)

app.get('/', (req, res) => {
  //res.send('welcome')
  res.sendResult('welcome', 200, '获取成功')
})
//未匹配到的路由，提示404
app.use((req, res, next) => {
  res.sendResult(null, 404, 'not Found')
})
app.listen(8088, () => {
  console.log('服务器地址 http://127.0.0.1:8088')
})
