var express = require('express')
var router = express.Router();
var path = require("path")
var fs = require('fs')
var multer = require('multer')

//临时上传目录
var upload = multer({dest: 'tmp_uploads/'}); //配置上传文件的目录
var upload_config = require('config').get("upload_config");

//提供文件上传服务
router.post("/", upload.single('file'), function(req, res, next) {
  var fileExtArray = req.file.originalname.split("."); //如 1.jpg 拆分成数组
  var ext = fileExtArray[fileExtArray.length-1]; //取图片的扩展名 jpg
  var targetPath = req.file.path + "." + ext; //目标路径:tmp_uploads\xxxxx.jpg
  fs.rename(path.join(process.cwd(), "/", req.file.path),
    path.join(process.cwd(), targetPath), function(err) {
      if(err) {
        return res.sendResult(null, 400, "上传文件失败");
      }
      res.sendResult({"tmp_path":targetPath, "url":upload_config.get("baseURL")+
        "/"+targetPath}, 200, "上传成功");
    });
})

module.exports = router
