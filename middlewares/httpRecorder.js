/**
 * Created by weijian.lin on 2018/5/22.
 * 作用 : 这个中间件用于记录所有请求信息，并记录日志
 */
'use strict';
let log = require('../util/logger').getLogger('system');
function httpRecorder() {
    return function httpRecorder(req, res, next) {
        let reqShow = {};
        reqShow['host'] = req.headers['host'];
        reqShow['url'] = req.url ;
        reqShow['method'] = req.method;
        reqShow['query'] = req.query || ' ';
        reqShow['body'] = req.body || ' ';
        reqShow['params'] = req.params || ' ';
        reqShow['user-agent'] = req.headers['user-agent'];
        reqShow['accept'] = req.headers['accept'];
        log.info('请求信息:',JSON.stringify(reqShow));
        next();
    };
}
module.exports =httpRecorder;