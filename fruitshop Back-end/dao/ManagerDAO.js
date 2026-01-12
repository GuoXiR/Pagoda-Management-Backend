var path = require("path")
var daoModule=require("./DAO")
module.exports.findOne=function(conditions,cb){ 
    daoModule.findOne("ManagerModel",conditions,cb);
}