var path=require("path")
var dao=require(path.join(process.cwd(),"dao/DAO"))
var _=require('lodash')
module.exports.addCategory=function(cat,cb){
    dao.create("CategoryModel",{
        "cat_pid":cat.cat_pid,
        "cat_name":cat.cat_name,
        "cat_level":cat.cat_level
    },function(err,newCat){
        if(err)return cb("创建分类失败")
        cb(null,newCat)
    })
}
//获取所有分类
module.exports.getAllCategories=function(type,conditions,keyword,cb){
    dao.list("CategoryModel",{"cat_deleted":false},function(err,categories){
    var keyCategories=_.keyBy(categories,'cat_id');
    //使用 Lodash 库的_.keyBy 方法将原来的 categories 数组转成一个键值对，
    //转换之后的每一个对象，其 key 值为 cat_id，值为一条记录
    
    //根据关键词过滤分类
    if(keyword && keyword.trim()!==''){
        keyword = keyword.toLowerCase();
        categories = categories.filter(function(category){
            return category.cat_name.toLowerCase().indexOf(keyword) !== -1;
        });
        //重新构建keyCategories，因为categories可能已经被过滤
        keyCategories = _.keyBy(categories, 'cat_id');
    }
    
    if(!type) type=3;
    //转换为树形菜单，形如下图所示
    result=getTreeResult(keyCategories,categories,type);
    if(conditions){
        count=result.length;
        pagesize=parseInt(conditions.pagesize);
        pagenum=parseInt(conditions.pagenum)-1;
        result=_.take(_.drop(result,pagenum*pagesize),pagesize);
        var resultDta={};
        resultDta["total"]=count;
        resultDta["pagenum"]=pagenum;
        resultDta["pagesize"]=pagesize;
        resultDta["result"]=result;
        return cb(null,resultDta)
    }
    cb(null,result)
    });
}
//获取树状结果
function getTreeResult(keyCategories,categories,type){
    var result=[];
    for(idx in categories){
    var cat=categories[idx];
    //判断是否被删除
    if(isDelete(keyCategories,cat)) continue;
    if(cat.cat_pid==0){
        result.push(cat);
    }else{
        if(cat.cat_level>=type) continue;
        var parantCat=keyCategories[cat.cat_pid];
        if(!parantCat) continue;
        if(!parantCat.children){
            parantCat["children"]=[];
        }
        parantCat.children.push(cat);
    }
    }
    return result;
}
    //判断是否删除
    function isDelete(keyCategories,cat){
    if(cat.cat_pid==0){
        return cat.cat_deleted;
    }else if(cat.cat_deleted){
        return true;
    }else{
        parentCat=keyCategories[cat.cat_pid];
    if(!parentCat) return true;
        return isDelete(keyCategories,parentCat);
    }
}

//获得指定ID的分类对象
module.exports.getCategoryById=function(id,cb){
    dao.show("CategoryModel",id,function(err,category){
        if(err)return cb("获取分类对象失败")
        cb(null,category)
    })
}

// 更新指定 ID 的分类对象
module.exports.updateCategory = function(cat_id, newName, cb) {
  dao.update("CategoryModel", cat_id, {"cat_name": newName}, function(err, newCat) {
    if(err) return cb("更新失败");
    cb(null, newCat)
  });
}

//删除指定ID的分类
module.exports.deleteCategory = function(cat_id, cb) {
    dao.update("CategoryModel", cat_id, {"cat_deleted": true}, function(err, newCat) {
      if(err) return cb("删除失败");
      cb("删除成功")
    });
  }