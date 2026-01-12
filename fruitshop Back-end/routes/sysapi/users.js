var express = require('express')
var path = require('path')
var router = express.Router()
var ManagerService = require(path.join(
  process.cwd(),
  'services/ManagerService'
))

//返回用户列表
router.get(
  '/',
  function (req, res, next) {
    if (!req.query.pagenum || req.query.pagenum <= 0)
      return res.sendResult(null, 400, 'pagenum 参数错误')
    if (!req.query.pagesize || req.query.pagesize <= 0)
      return res.sendResult(null, 400, 'pagesize 参数错误')
    next()
  }, //业务逻辑
  function (req, res, next) {
    var conditions = {
      pagenum: req.query.pagenum,
      pagesize: req.query.pagesize,
      query: req.query.query // 添加搜索关键词参数
    }

    ManagerService.getAllUsers(conditions, function (err, result) {
      if (err) return res.sendResult(null, 400, err)
      res.sendResult(result, 200, '获取成功')
    })
  }
)

//删除用户
router.delete(
  '/:id',
  //参数验证
  function (req, res, next) {
    if (!req.params.id) return res.sendResult(null, 400, '用户 ID 不能为空')
    if (isNaN(req.params.id))
      return res.sendResult(null, 400, '用户 ID 必须为数字')
    next()
  }, //业务逻辑
  function (req, res, next) {
    ManagerService.deleteUser(req.params.id, function (err, result) {
      if (err) return res.sendResult(null, 400, '删除失败')
      res.sendResult(result, 201, '删除成功')
    })
  }
)

//更新用户
router.put(
  '/:id',
  //参数验证
  function (req, res, next) {
    if (!req.params.id) return res.sendResult(null, 400, '用户 ID 不能为空')
    if (isNaN(req.params.id))
      return res.sendResult(null, 400, '用户 ID 必须为数字')
    next()
  }, //业务逻辑
  function (req, res, next) {
    var params = req.body
    ManagerService.updateUser(req.params.id, params, function (err, newUser) {
      if (err) return res.sendResult(null, 400, err)
      res.sendResult(newUser, 200, '更新用户成功')
    })
  }
)

//根据用户 ID 获取用户详情
router.get(
  '/:id',
  //参数验证
  function (req, res, next) {
    if (!req.params.id) return res.sendResult(null, 400, '用户 ID 不能为空')
    if (isNaN(req.params.id))
      return res.sendResult(null, 400, '用户 ID 必须为数字')
    next()
  }, //业务逻辑
  function (req, res, next) {
    ManagerService.getUserById(req.params.id, function (err, user) {
      if (err) return res.sendResult(null, 400, err)
      res.sendResult(user, 200, '获取成功')
    })
  }
)

module.exports = router
