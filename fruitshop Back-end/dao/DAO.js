var path=require("path")
    //获取数据库模型
    databaseModule=require(path.join(process.cwd(),"modules/db"))
    //获取一条数据
    module.exports.findOne=function(modelName,conditions,cb){
        var db=databaseModule.getDatabase();
        var Model=db.models[modelName]; //Model 相当于是一个数据表
        if(!Model) return cb("模型不存在",null);
        if(!conditions) return cb("条件为空",null);
        Model.one(conditions,function(err,obj){
            if(err) return cb("查询失败",null);
        return cb(null,obj);
        })
    }
    //创建对象数据
    module.exports.create=function(modelName,obj,cb){
        var db=databaseModule.getDatabase()
        var model=db.models[modelName]
        model.create(obj,cb)//在Model中添加一条记录
    }
    //获取所有数据
    module.exports.list = function (modelName, conditions, cb) {
      var db = databaseModule.getDatabase()
      var model = db.models[modelName]
      if (!model) return cb('模型不存在', null)
      if (conditions) {
        if (conditions['columns']) {
          model = model.find(conditions['columns'])
        } else {
          model = model.find()
        }
        if (conditions['offset']) {
          model = model.offset(parseInt(conditions['offset']))
        }
        if (conditions['limit']) {
          model = model.limit(parseInt(conditions['limit']))
        }
        if (conditions['only']) {
          model = model.only(conditions['only'])
        }
        if (conditions['omit']) {
          model = model.omit(conditions['omit'])
        }
        if (conditions['order']) {
          model = model.order(conditions['order'])
        }
      } else {
        model = model.find()
      }
      model.run(function (err, models) {
        if (err) {
          return cb('查询失败', null)
        }
        cb(null, models)
      })
    }

    //获取指定的分类，通过逐渐ID获取对象
    module.exports.show=function(modelName,id,cb){
        var db=databaseModule.getDatabase()
        var model=db.models[modelName]
        model.get(id,function(err,obj){
            cb(err,obj)
        })
    }

    // 更改指定的分类，通过逐渐 ID 获取对象
    module.exports.update = function(modelName, id, updateObj, cb) {
      var db = databaseModule.getDatabase();
      var model = db.models[modelName];
    
      model.get(id, function(err, obj) {
        if (err) return cb("更新失败", null)
        obj.save(updateObj, cb);
      });
    }
    

    //获取模型
    module.exports.getModel=function(modelName){
        var db=databaseModule.getDatabase()
        return db.models[modelName]
    }

    //条件查询
module.exports.countByConditions = function (modelName, conditions, cb) {
  var db = databaseModule.getDatabase();
  var model = db.models[modelName];
  if(!model) return cb("模型不存在", null);
  var resultCB = function(err, count) {
    if(err) return cb("查询失败", null);
    cb(null, count);
  }
  if(conditions) {
    if(conditions["columns"]){ 
      model = model.count(conditions["columns"], resultCB);
    } else {
      model = model.count(resultCB);
    }
  } else {
    model = model.count(resultCB);
  }
}
