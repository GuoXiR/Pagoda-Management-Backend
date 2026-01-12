module.exports=function(db,callback){
    //分类模型
    db.define("CategoryModel",{
        cat_id:{type:'serial',key:true},
        cat_name:String,
        cat_pid:Number,
        cat_level:Number,
        cat_deleted:Boolean,
        cat_icon:String,
        cat_src:String
    },{
        table:"category"
    })
    return callback()
}