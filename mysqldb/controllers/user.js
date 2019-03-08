'use strict';
const util = require('util'),//node模块 格式化JSON数据
    http = require('http'),
    mysql = require('../models/user'),
    log = require('../../util/logger').getLogger('system');
/**数据统一发送格式
 * @status       {Number}           请求状态
 * @message      {String}           解释信息
 * @result       {Array/Object}     返回数据
 */
let responseData = {
    'status' : '0',             //默认状态：200  
    'message':'success',        //默认文本：'请求成功'
    'result' : null             //默认数据：null
};

//用户登录
let getUserList = function(req, res, next){
    mysql.getUsersListSql([],function(result){
        responseData.status = '0';
        responseData.message = 'success';
        responseData.result = result;
        log.info('返回信息:',JSON.stringify(responseData));
        res.send(responseData);
    },function(err){
        res.sendStatus = 500;  
        log.error('错误信息:',JSON.stringify(err));      
        throw err;
    });
};
//用户注册
let userRegister = function(req,res,next){
    let nowTime = new Date(),
        user = req.body;
    mysql.queryUserSql(user.username,function(result){
        if(result&&result.length!=0){
            responseData.status = '2';
            responseData.message = '用户已存在';
            responseData.result = null;
        }
        log.info('返回信息:',JSON.stringify(responseData));
        res.send(responseData);
    },function(err){
        log.info('错误信息:',JSON.stringify(err));
        // res.sendStatus(500);
        res.send(err);
    });
};

module.exports = {
    userRegister:userRegister,        // 用户注册
    getUserList:getUserList                // 获取用户列表
};