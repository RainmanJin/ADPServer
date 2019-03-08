'use strict';

/*
 * 组装返回数据
 * 前三个参数固定名称： code, msg, data；后面参数不固定，需要以数组的方式输入键值对 eg: ['键', '值']
 * 例子如下：
 * 输入： resData(1, 'okok', {a:1, b:2}, ['curPage', 23], ['totalPage', 444]);
 * 返回： 
  { 
    code: 1,
    msg: 'okok',
    data: { a: 1, b: 2 },
    curPage: 23,
    totalPage: 444
  }
 */
let log = require('../util/logger').getLogger('system');
let resData = function () {
    let len = arguments.length;
    let res = {
        code: arguments[0],
        msg: arguments[1],
        data: arguments[2] || null
    };
    for (let i = 0; i < len; i++) {
        if (i > 2) {
            res[arguments[i][0]] = arguments[i][1];
        }
    }
    if(res.code == 0 || res.code == '0'){
        log.info('返回信息:'+JSON.stringify(res));
    }else {
        log.error('错误信息:'+JSON.stringify(res));
    }

    return res;
};
let isEmptyObject = function(obj){
    for(var key in obj){
        return false;
    }
    return true;
};
module.exports={
  resData,
  isEmptyObject
};

