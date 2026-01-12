// 统一返回 json 格式结果的中间件
module.exports = function (req, res, next) {
    res.sendResult = function (data, code, message) {
        var fmt = req.query.fmt ? req.query.fmt : "rest";
        if (fmt == "rest") {
            res.json(
                {
                    "data": data,
                    "meta": {
                        "msg": message,
                        "status": code
                    }
                }
            )
        }
    }
    next();
}