var Promise = require('bluebird')
var path = require('path')
var dao = require(path.join(process.cwd(), 'dao/DAO'))
var _ = require('lodash')
var fs = require('fs')
var upload_config = require('config').get('upload_config')

//创建商品
module.exports.createGood = function (params, cb) {
  //验证参数 & 生成数据
  generateGoodInfo(params)
    //检查商品名称
    .then(checkGoodName)
    //创建商品
    .then(createGoodInfo)
    //更新商品图片
    .then(doUpdateGoodPics)
    //获取图片
    //.then(doGetAllPics)
    //创建成功
    .then(function (info) {
      cb(null, info.good)
      //cb(null,info)
    })
    .catch(function (err) {
      cb(err)
    })
}
//通过参数生成商品基本信息
function generateGoodInfo (params) {
  return new Promise(function (resolve, reject) {
    var info = {}
    if (params.goods_id) info['goods_id'] = params.goods_id
    if (!params.goods_name) return reject('商品名称不能为空')
    info['goods_name'] = params.goods_name

    if (!params.goods_price) return reject('商品价格不能为空')
    var price = parseFloat(params.goods_price)
    if (isNaN(price) || price < 0) return reject('商品价格不正确')
    info['goods_price'] = price

    if (!params.goods_number) return reject('商品数量不能为空')
    var num = parseInt(params.goods_number)
    if (isNaN(num) || num < 0) return reject('商品数量不正确')
    info['goods_number'] = num

    if (!params.goods_cat) return reject('商品没有设置所属分类')
    var cats = params.goods_cat.split(',')
    if (cats.length > 0) info['cat_one_id'] = cats[0]
    if (cats.length > 1) info['cat_two_id'] = cats[1]
    if (cats.length > 2) {
      info['cat_three_id'] = cats[2]
      info['cat_id'] = cats[2]
    }

    if (params.goods_weight) {
      weight = parseFloat(params.goods_weight)
      if (isNaN(weight) || weight < 0) return reject('商品重量格式不正确')
      info['goods_weight'] = weight
    } else {
      info['goods_weight'] = 0
    }

    if (params.goods_introduce) {
      info['goods_introduce'] = params.goods_introduce
    }

    if (params.goods_big_logo) {
      info['goods_big_logo'] = params.goods_big_logo
    } else {
      info['goods_big_logo'] = ''
    }
    if (params.goods_small_logo) {
      info['goods_small_logo'] = params.goods_small_logo
    } else {
      info['goods_small_logo'] = ''
    }
    if (params.goods_state) {
      info['goods_state'] = params.goods_state
    }
    //图片
    if (params.pics) {
      info['pics'] = params.pics
    }
    info['add_time'] = Date.parse(new Date()) / 1000
    info['upd_time'] = Date.parse(new Date()) / 1000
    info['is_del'] = '0'
    if (params.hot_mumber) {
      hot_num = parseInt(params.hot_mumber)
      if (isNaN(hot_num) || hot_num < 0) return reject('热销品数量格式不正确')
      info['hot_mumber'] = hot_mumber
    } else {
      info['hot_mumber'] = 0
    }
    info['is_promote'] = info['is_promote'] ? info['is_promote'] : false
    resolve(info)
  })
}

//检查商品名称是否重复
function checkGoodName (info) {
  return new Promise(function (resolve, reject) {
    dao.findOne(
      'GoodModel',
      { goods_name: info.goods_name, is_del: '0' },
      function (err, good) {
        //如果有错误，直接返回错误信息
        if (err) return reject(err)
        //如果没错，但商品从数据库中未找到
        if (!good) return resolve(info)
        //如果找到，则商品属于修改
        if (parseInt(good.goods_id) === parseInt(info.goods_id))
          return resolve(info)
        //除此之外说明商品已经存在，报错
        return reject('商品名称已经存在')
      }
    )
  })
}

//创建商品，向数据库中添加商品
function createGoodInfo (info) {
  return new Promise(function (resolve, reject) {
    dao.create('GoodModel', _.clone(info), function (err, newGood) {
      if (err) return reject('创建商品基本信息失败')
      newGood.goods_cat = newGood.getGoodsCat()
      info.good = newGood
      return resolve(info)
    })
  })
}

//更新商品图片
function doUpdateGoodPics (info) {
  return new Promise(function (resolve, reject) {
    var good = info.good
    if (!good.goods_id) return reject('更新商品图片失败')
    if (!info.pics) return resolve(info)
    //list 是从表中查询，如果在图片表中有 goods_id 记录就是更新
    //如果没有 goods_id 记录就新增
    dao.list(
      'GoodPicModel',
      { columns: { goods_id: 'good.goods_id' } },
      function (err, oldpics) {
        if (err) return reject('获取商品图片列表失败')
        var batchFns = []
        var newpics = info.pics ? info.pics : []
        var newpicsKV = _.keyBy(newpics, 'pics_id')
        var oldpicsKV = _.keyBy(oldpics, 'pics_id')
        //保存图片集合
        //1.需要新建的图片集合
        var addNewpics = []
        //2.需要保留的图片集合
        var reservedOldpics = []
        //3.需要删除的图片集合
        var delOldpics = []
        //如果提交的新数据中有老数据的 pics_id 则保留数据，否则删除数据
        _(oldpics).forEach(function (pic) {
          if (newpicsKV[pic.pics_id]) reservedOldpics.push(pic)
          else delOldpics.push(pic)
        })
        //从新提交的数据中检索出需要新创建的数据
        _(newpics).forEach(function (pic) {
          if (!pic.pics_id && pic.pic) addNewpics.push(pic)
        })

        //开始处理商品图片数据逻辑
        //1.删除商品图片数据结合
        _(delOldpics).forEach(function (pic) {
          //1.1 删除图片物理路径
          batchFns.push(
            removeGoodPicFile(path.join(process.cwd(), pic.pics_big))
          )
          batchFns.push(
            removeGoodPicFile(path.join(process.cwd(), pic.pics_mid))
          )
          batchFns.push(
            removeGoodPicFile(path.join(process.cwd(), pic.pics_sma))
          )
          //1.2 数据库删除图片数据记录
          batchFns.push(removeGoodPic(pic))
        })
        //2.处理新增图片的结合
        _(addNewpics).forEach(function (pic) {
          if (!pic.pics_id && pic.pic) {
            //2.1 通过原始路径片路径裁剪出需要的图片
            var src = path.join(process.cwd(), pic.pic)
            var tmp = src.split(path.sep)
            var filename = tmp[tmp.length - 1]
            pic.pics_big = '/uploads/goodspics/big_' + filename
            pic.pics_mid = '/uploads/goodspics/mid_' + filename
            pic.pics_sma = '/uploads/goodspics/sma_' + filename

            batchFns.push(
              clipImage(src, path.join(process.cwd(), pic.pics_big), 800, 800)
            )
            batchFns.push(
              clipImage(src, path.join(process.cwd(), pic.pics_mid), 400, 400)
            )
            batchFns.push(
              clipImage(src, path.join(process.cwd(), pic.pics_sma), 200, 200)
            )

            pic.goods_id = good.goods_id
            //2.2 在数据库中新建数据
            batchFns.push(createGoodPic(pic))
          }
        })
        //如果没有任何图片操作则返回
        if (batchFns.length == 0) return resolve(info)
        //批量执行所有操作
        Promise.all(batchFns)
          .then(function () {
            resolve(info)
          })
          .catch(function (error) {
            if (error) return reject(error)
          })
      }
    )
  })
}

//删除图片的物理路径
function removeGoodPicFile (path) {
  return new Promise(function (resolve, reject) {
    fs.unlink(path, function (err, result) {
      resolve()
    })
  })
}
//删除商品图片
function removeGoodPic (pic) {
  return new Promise(function (resolve, reject) {
    if (!pic || !pic.remove) return reject('删除商品图片记录失败')
    pic.remove(function (err) {
      if (err) return reject('删除失败')
      resolve()
    })
  })
}

//剪裁商品图片
function clipImage (srcPath, savePath, newWidth, newHeight) {
  return new Promise(function (resolve, reject) {
    //创建读取流
    readable = fs.createReadStream(srcPath)
    //创建写入流
    writable = fs.createWriteStream(savePath)
    readable.pipe(writable)
    readable.on('end', function () {
      resolve()
    })
  })
}
//添加商品图片到数据库
function createGoodPic (pic) {
  return new Promise(function (resolve, reject) {
    console.log('&&' + pic)
    if (!pic) return reject('图片对象不能为空')
    var GoodPicModel = dao.getModel('GoodPicModel')
    GoodPicModel.create(pic, function (err, newPic) {
      if (err) return reject('创建图片数据失败')
      resolve()
    })
  })
}

//挂载图片
function doGetAllPics (info) {
  return new Promise(function (resolve, reject) {
    var good = info.good
    if (!good.goods_id) return reject('获取商品图片必须先获取商品信息')
    // 3. 组装最新的数据挂载在"info"中"good"对象下
    dao.list(
      'GoodPicModel',
      { columns: { goods_id: 'good.goods_id' } },
      function (err, goodPics) {
        if (err) return reject('获取所有商品图片列表失败')

        _(goodPics).forEach(function (pic) {
          if (pic.pics_big.indexOf('http') == 0) {
            pic.pics_big_url = pic.pics_big
          } else {
            pic.pics_big_url = upload_config.get('baseURL') + pic.pics_big
          }

          if (pic.pics_mid.indexOf('http') == 0) {
            pic.pics_mid_url = pic.pics_mid
          } else {
            pic.pics_mid_url = upload_config.get('baseURL') + pic.pics_mid
          }

          if (pic.pics_sma.indexOf('http') == 0) {
            pic.pics_sma_url = pic.pics_sma
          } else {
            pic.pics_sma_url = upload_config.get('baseURL') + pic.pics_sma
          }
        })
        info.good.pics = goodPics
        resolve(info)
      }
    )
  })
}

var orm = require('orm')

//获取商品列表
module.exports.getAllGoods = function (params, cb) {
  var conditions = {}
  if (!params.pagenum || params.pagenum <= 0) return cb('pagenum 参数错误')
  if (!params.pagesize || params.pagesize <= 0) return cb('pagesize 参数错误')
  conditions['columns'] = {}
  if (params.query) {
    conditions['columns']['goods_name'] = orm.like('%' + params.query + '%')
  }
  conditions['columns']['is_del'] = '0'
  dao.countByConditions('GoodModel', conditions, function (err, count) {
    if (err) return cb(err)
    pagesize = params.pagesize
    pagenum = params.pagenum
    pageCount = Math.ceil(count / pagesize)
    offset = (pagenum - 1) * pagesize
    if (offset >= count) offset = count
    limit = pagesize
    //构建条件
    conditions['offset'] = offset //跳过的记录数量
    conditions['limit'] = limit //返回的最大记录数量
    //设置查询时只能返回特定的字段
    conditions['only'] = [
      'goods_id',
      'goods_name',
      'goods_price',
      'goods_weight',
      'goods_state',
      'add_time',
      'goods_number',
      'upd_time',
      'hot_mumber',
      'is_promote',
      'cat_id' // 添加分类ID字段
    ]
    conditions['order'] = '-add_time'

    dao.list('GoodModel', conditions, function (err, goods) {
      if (err) return cb(err)
      var resultDta = {}
      resultDta['total'] = count
      resultDta['pagenum'] = pagenum
      // _map 遍历 goods 数组，_omit 过滤掉（删除掉）一些字段
      resultDta['goods'] = _.map(goods, function (good) {
        return _.omit(
          good,
          'goods_introduce',
          'is_del',
          'goods_big_logo',
          'goods_small_logo',
          'delete_time'
        )
      })
      cb(null, resultDta)
    })
  })
}

//删除商品
module.exports.deleteGood = function (id, cb) {
  if (!id) return cb('商品 ID 不能为空')
  if (isNaN(id)) return cb('商品 ID 必须为数字')
  dao.update(
    'GoodModel',
    id,
    {
      is_del: '1',
      delete_time: Date.parse(new Date()) / 1000,
      upd_time: Date.parse(new Date()) / 1000
    },
    function (err) {
      if (err) return cb(err)
      cb(null)
    }
  )
}

//更新商品
module.exports.updateGood = function (id, params, cb) {
  params.goods_id = id
  generateGoodInfo(params)
    //检查商品名称
    .then(checkGoodName)
    //修改商品
    .then(updateGoodInfo)
    //更新商品图片
    .then(doUpdateGoodPics)
    //获取图片
    .then(doGetAllPics)
    //创建成功
    .then(function (info) {
      cb(null, info.good)
    })
    .catch(function (err) {
      cb(err)
    })
}
//修改商品信息
function updateGoodInfo (info) {
  return new Promise(function (resolve, reject) {
    if (!info.goods_id) return reject('商品 ID 不存在')
    dao.update(
      'GoodModel',
      info.goods_id,
      _.clone(info),
      function (err, newGood) {
        if (err) return reject('更新商品基本信息失败')
        info.good = newGood
        return resolve(info)
      }
    )
  })
}


//根据商品 ID 获取商品详情
module.exports.getGoodById = function(id, cb) {
  getGoodInfo({"goods_id": id})
    .then(doGetAllPics)

    .then(function(info) {
      cb(null, info.good)
    })
    .catch(function(err) {
      cb(err)
    });
}
//获取商品对象
function getGoodInfo(info) {
  return new Promise(function(resolve, reject) {
    if(!info || !info.goods_id || isNaN(info.goods_id)) return reject("商品 ID 格式不正确");
    dao.show("GoodModel", info.goods_id, function(err, good) {
      if(err) return reject("获取商品基本信息失败");
      good.goods_cat = good.getGoodsCat();
      info["good"] = good;
      return resolve(info);
    });
  })
}
