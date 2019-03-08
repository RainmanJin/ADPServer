/**
 * Created by weijian.lin on 2018/5/21.
 */
'use strict';
const mongoose = require('mongoose');
const Test = mongoose.model('Test');
let log = require('../../util/logger').getLogger('system');
/**数据统一发送格式
 * @status       {Number}           请求状态
 * @message      {String}           解释信息
 * @result       {Array/Object}     返回数据
 */
let responseData = {
    'status' : '0',             //默认状态：0
    'message':'success',        //默认文本：'请求成功'
    'result' : null             //默认数据：null
};

exports.create = async (req,res,next)=> {
    let  test = new Test({
        name : '名字',
        sex : 1,
        age : 13,
        birth : '2012-12-1',
        addr : '地址'
    });
    try {
        await test.updateAndSave();
        log.info('返回信息:','保存成功');
        responseData.result = '保存成功';
        res.send(responseData);
    } catch (error) {
        log.error('错误信息:',JSON.stringify(error));
        responseData.result = 'error';
        responseData.status = '-1';
        res.send(responseData);
    }
};
exports.update = async (req,res,next)=> {
    try {
        let test = req.test;
        test = Object.assign(test,req.body);
        await  test.updateAndSave();
        log.info('返回信息:','保存成功');
        responseData.result = '保存成功';
        res.send(responseData);
    } catch (error) {
        log.error('错误信息:',JSON.stringify(error));
        responseData.result = 'error';
        responseData.status = '-1';
        res.send(responseData);
    }
};
exports.list =async (req,res,next)=> {
    try{
        var query = {
            page : 1,
            limit : 10
        };
        var list = await  Test.list(query);
        var count = await  Test.count();
        responseData.result = {
            count:count,
            list:list
        };
        log.info('返回信息:',JSON.stringify(responseData));
        res.send(responseData);
        //res.send('读取用户列表成功',list,{count:count})
    } catch (error){
        log.info('返回错误:',JSON.stringify(error));
        responseData.result = 'error';
        responseData.status = '-1';
        res.send(responseData);
    }
};
exports.delete = async (req,res,next)=> {
    try {
        let test = await req.test;
        await test.remove();
        responseData.result = '删除成功';
        log.info('返回信息:',JSON.stringify(responseData));
        res.send(responseData);
    } catch (error) {
        log.info('返回信息:',JSON.stringify(error));
        responseData.result = 'error';
        responseData.status = '-1';
        res.send(responseData);
    }
};
