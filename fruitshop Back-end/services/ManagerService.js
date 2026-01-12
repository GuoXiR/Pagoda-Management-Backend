var path = require('path')
var managersDAO = require(path.join(process.cwd(), 'dao/ManagerDAO'))
var _ = require('lodash')
var Promise = require('bluebird')
var dao = require(path.join(process.cwd(), 'dao/DAO'))
var orm = require('orm')

//管理员登录
module.exports.login = function (username, password, cb) {
  console.log('用户名：%s，密码：%s', username, password)
  managersDAO.findOne({ mg_name: username }, function (err, manager) {
    if (err || !manager) return cb('用户名不存在')
    if (manager.role_id < 0) return cb('该用户没有权限登录')
    if (manager.role_id != 0 && manager.mg_state != 1)
      return cb('该用户已经被禁用')
    if (password === manager.mg_pwd) {
      cb(null, {
        id: manager.mg_id,
        rid: manager.role_id,
        username: manager.mg_name,
        mobile: manager.mg_mobile,
        email: manager.mg_email
      })
    } else {
      return cb('密码错误！')
    }
  })
}

//创建用户
module.exports.createUser = function (params, cb) {
  //验证参数 & 生成数据
  generateUserInfo(params)
    //检查用户名
    .then(checkUserName)
    //创建用户
    .then(createUserInfo)
    //创建成功
    .then(function (user) {
      cb(null, user)
    })
    .catch(function (err) {
      cb(err)
    })
}

//通过参数生成用户基本信息
function generateUserInfo (params) {
  return new Promise(function (resolve, reject) {
    var info = {}
    if (params.mg_id) info['mg_id'] = params.mg_id
    // 只有在创建新用户（没有mg_id）时才强制要求用户名和密码
    if (!params.mg_id) {
      if (!params.mg_name) return reject('用户名不能为空')
      if (!params.mg_pwd) return reject('密码不能为空')
    }
    if (params.mg_name) info['mg_name'] = params.mg_name
    if (params.mg_pwd) info['mg_pwd'] = params.mg_pwd

    if (params.mg_mobile) info['mg_mobile'] = params.mg_mobile
    if (params.mg_email) info['mg_email'] = params.mg_email
    if (params.role_id !== undefined) info['role_id'] = params.role_id
    if (params.mg_state !== undefined) info['mg_state'] = params.mg_state
    if (params.mg_time) info['mg_time'] = params.mg_time

    resolve(info)
  })
}

//检查用户名是否重复
function checkUserName (info) {
  return new Promise(function (resolve, reject) {
    dao.findOne(
      'ManagerModel',
      { mg_name: info.mg_name },
      function (err, user) {
        if (err) return reject(err)
        if (!user) return resolve(info)
        if (parseInt(user.mg_id) === parseInt(info.mg_id)) return resolve(info)
        return reject('用户名已经存在')
      }
    )
  })
}

//创建用户，向数据库中添加用户
function createUserInfo (info) {
  return new Promise(function (resolve, reject) {
    dao.create('ManagerModel', _.clone(info), function (err, newUser) {
      if (err) return reject('创建用户失败')
      resolve(newUser)
    })
  })
}

//获取用户列表
module.exports.getAllUsers = function (params, cb) {
  var conditions = {}
  if (!params.pagenum || params.pagenum <= 0) return cb('pagenum 参数错误')
  if (!params.pagesize || params.pagesize <= 0) return cb('pagesize 参数错误')
  conditions['columns'] = {}
  if (params.query) {
    conditions['columns']['mg_name'] = orm.like('%' + params.query + '%')
  }

  dao.countByConditions('ManagerModel', conditions, function (err, count) {
    if (err) return cb(err)
    var pagesize = params.pagesize
    var pagenum = params.pagenum
    var pageCount = Math.ceil(count / pagesize)
    var offset = (pagenum - 1) * pagesize
    if (offset >= count) offset = count
    var limit = pagesize
    //构建条件
    conditions['offset'] = offset //跳过的记录数量
    conditions['limit'] = limit //返回的最大记录数量
    //设置查询时只能返回特定的字段
    conditions['only'] = [
      'mg_id',
      'mg_name',
      'mg_mobile',
      'mg_email',
      'mg_state',
      'mg_time',
      'role_id'
    ]
    conditions['order'] = '-mg_time'

    dao.list('ManagerModel', conditions, function (err, users) {
      if (err) return cb(err)
      var resultDta = {}
      resultDta['total'] = count
      resultDta['pagenum'] = pagenum
      resultDta['users'] = users
      cb(null, resultDta)
    })
  })
}

//删除用户
module.exports.deleteUser = function (id, cb) {
  if (!id) return cb('用户 ID 不能为空')
  if (isNaN(id)) return cb('用户 ID 必须为数字')

  // 软删除用户
  dao.update('ManagerModel', id, { mg_state: 0 }, function (err) {
    if (err) return cb(err)
    cb(null)
  })
}

//更新用户
module.exports.updateUser = function (id, params, cb) {
  params.mg_id = id
  //验证参数 & 生成数据
  generateUserInfo(params)
    //检查用户名
    .then(checkUserName)
    //更新用户
    .then(updateUserInfo)
    //更新成功
    .then(function (user) {
      cb(null, user)
    })
    .catch(function (err) {
      cb(err)
    })
}

//修改用户信息
function updateUserInfo (info) {
  return new Promise(function (resolve, reject) {
    if (!info.mg_id) return reject('用户 ID 不存在')
    dao.update(
      'ManagerModel',
      info.mg_id,
      _.clone(info),
      function (err, updatedUser) {
        if (err) return reject('更新用户失败')
        resolve(updatedUser)
      }
    )
  })
}

//根据用户 ID 获取用户详情
module.exports.getUserById = function (id, cb) {
  if (!id || isNaN(id)) return cb('用户 ID 格式不正确')

  dao.show('ManagerModel', id, function (err, user) {
    if (err) return cb(err)
    if (!user) return cb('用户不存在')
    cb(null, user)
  })
}
