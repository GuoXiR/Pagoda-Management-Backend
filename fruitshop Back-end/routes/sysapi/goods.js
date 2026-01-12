var express = require('express')
var path = require('path')
var router = express.Router()
var GoodService = require(path.join(process.cwd(), 'services/GoodService'))

//添加商品
router.post(
  '/',
  function (req, res, next) {
    next()
  }, //业务逻辑
  function (req, res, next) {
    var params = req.body
    GoodService.createGood(params, function (err, newGood) {
      if (err) return res.sendResult(null, 400, err)
      res.sendResult(newGood, 201, '创建商品成功')
    })
  }
)

//返回商品列表
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

    GoodService.getAllGoods(conditions, function (err, result) {
      if (err) return res.sendResult(null, 400, err)

      res.sendResult(result, 200, '获取成功')
    })
  }
)

//删除商品
router.delete(
  '/:id',
  //参数验证
  function (req, res, next) {
    if (!req.params.id) return res.sendResult(null, 400, '商品 ID 不能为空')
    if (isNaN(req.params.id))
      return res.sendResult(null, 400, '商品 ID 必须为数字')
    next()
  }, //业务逻辑
  function (req, res, next) {
    GoodService.deleteGood(req.params.id, function (err, result) {
      if (err) return res.sendResult(null, 400, '删除失败')
      res.sendResult(result, 201, '删除成功')
    })
  }
)

//更新商品
router.put(
  '/:id',
  //参数验证
  function (req, res, next) {
    if (!req.params.id) return res.sendResult(null, 400, '商品 ID 不能为空')
    if (isNaN(req.params.id))
      return res.sendResult(null, 400, '商品 ID 必须为数字')
    next()
  }, //业务逻辑
  function (req, res, next) {
    var params = req.body
    GoodService.updateGood(req.params.id, params, function (err, newGood) {
      if (err) return res.sendResult(null, 400, err)
      res.sendResult(newGood, 200, '更新商品成功')
    })
  }
)

//根据商品 ID 获取商品详情
router.get(
  '/:id',
  //参数验证
  function (req, res, next) {
    if (!req.params.id) return res.sendResult(null, 400, '商品 ID 不能为空')
    if (isNaN(req.params.id))
      return res.sendResult(null, 400, '商品 ID 必须为数字')
    next()
  }, //业务逻辑
  function (req, res, next) {
    GoodService.getGoodById(req.params.id, function (err, good) {
      if (err) return res.sendResult(null, 400, err)
      res.sendResult(good, 200, '获取成功')
    })
  }
)

module.exports = router
