var express = require('express')
var router = express.Router()
var path = require('path')
var categoryService = require(path.join(
  process.cwd(),
  'services/CategoryService'
))

// router.get('/',(req,res)=>{
//     res.sendResult('获取商品分类',200,'success')
// })

router.get(
  '/',
  function (req, res, next) {
    next()
  },
  function (req, res, next) {
    var conditions = null
    //之前判断用户传过来的值，post方法通过body接收，get方法通过query接收
    if (req.query.pagenum && req.query.pagesize) {
      conditions = {
        pagenum: req.query.pagenum,
        pagesize: req.query.pagesize
      }
    }
    //获取搜索关键词
    var keyword = req.query.keyword
    categoryService.getAllCategories(
      req.query.type,
      conditions,
      keyword,
      function (err, result) {
        if (err) return res.sendResult(null, 400, '获取分类列表失败')
        res.sendResult(result, 200, '获取分类列表成功')
      }
    )
  }
)

router.post(
  '/',
  function (req, res, next) {
    if (!req.body.cat_name) {
      return res.sendResult(null, 400, '必须提供分类名称')
    }
    next()
  },
  function (req, res) {
    categoryService.addCategory(
      {
        cat_pid: req.body.cat_pid,
        cat_name: req.body.cat_name,
        cat_level: req.body.cat_level
      },
      function (err, result) {
        if (err) return res.sendResult(null, 400, err)
        res.sendResult(result, 201, '创建成功')
      }
    )
  }
)

//获取指定ID的分类
router.get(
  '/:id',
  function (req, res, next) {
    if (!req.params.id) {
      return res.sendResult(null, 400, '分类ID不能为空')
    }
    if (isNaN(parseInt(req.params.id))) {
      return res.sendResult(null, 400, '分类ID必须是数字')
    }
    next()
  },
  function (req, res, next) {
    categoryService.getCategoryById(req.params.id, function (err, result) {
      if (err) return res.sendResult(null, 400, err)
      res.sendResult(result, 200, '获取成功')
    })
  }
)

// 更新指定 ID 的分类
router.put(
  '/:id',
  function (req, res, next) {
    if (!req.params.id) {
      return res.sendResult(null, 400, '分类 ID 不能为空')
    }
    if (isNaN(parseInt(req.params.id))) {
      return res.sendResult(null, 400, '分类 ID 必须是数字')
    }
    next()
  }, //正常业务逻辑
  function (req, res, next) {
    categoryService.updateCategory(
      req.params.id,
      req.body.cat_name,
      function (err, result) {
        if (err) return res.sendResult(null, 400, err)
        res.sendResult(result, 200, '更新成功')
      }
    )
  }
)

// 删除指定的分类
router.delete(
  '/:id',
  function (req, res, next) {
    if (!req.params.id) {
      return res.sendResult(null, 400, '分类 ID 不能为空')
    }
    if (isNaN(req.params.id)) {
      return res.sendResult(null, 400, '分类 ID 必须是数字')
    }
    next()
  },
  function (req, res, next) {
    categoryService.deleteCategory(req.params.id, function (err, result) {
      if (err) return res.sendResult(null, 400, err)
      res.sendResult(result, 200, '删除指定分类成功')
    })
  }
)

module.exports = router
