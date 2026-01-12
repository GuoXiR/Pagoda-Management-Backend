require("mysql")
var orm = require("orm")
var path=require("path")
var fs=require("fs")
var Promise=require("bluebird")
const {error}=require("console")
// 初始化数据连接
function init(app,callback){
//加载数据库的配置
var config=require('config').get('db_config');
//组装数据库连接参数
var db_opts={
protocol:config.get("protocol"),
host:config.get("host"),
port:config.get("port"),
database:config.get("database"),
user:config.get("user"),
password:config.get("password"),
query:{pool:true,debug:true}
};
console.log("数据库连接信息：%s",JSON.stringify(db_opts));
//初始化 ORM 模型
app.use(orm.express(db_opts,{
define:function(db,models,next){
var modelsPath=path.join(process.cwd(),"/models");
//读取所有模型文件
var loadModelAsynFns=new Array();
fs.readdir(modelsPath,function(err,files){
for(var i=0;i<files.length;i++){
var modelPath=modelsPath+"/"+files[i];
loadModelAsynFns[i]=db.loadAsync(modelPath); 
}
});
Promise.all(loadModelAsynFns).then(function(){
console.log("ORM 模型加载完成");
callback(null);
next();
}).catch(function(err){
console.error("ORM 模型加载出错"+err);
callback(error);
next();
})
global.database=db;
}
}))
}
module.exports.init=init;
module.exports.getDatabase=function(){
return global.database;
}