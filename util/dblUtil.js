/**
 * Created by weijian.lin on 2018/5/21.
 */
'use strict';
let mysql = require('mysql'),
    NODE_ENV = process.env.NODE_ENV,
    mysqlServiceConfig = {},
    log = require('../util/logger').getLogger('system');
//数据库配置
if(NODE_ENV == 'local'){
    mysqlServiceConfig = (require(require('../filesPathConfigs').dbServiceConfigPath)).mysqlLocalConfig;
}else if(NODE_ENV == 'development'){
    mysqlServiceConfig = (require(require('../filesPathConfigs').dbServiceConfigPath)).mysqlDevConfig;
}else if(NODE_ENV == 'test'){
    mysqlServiceConfig = (require(require('../filesPathConfigs').dbServiceConfigPath)).mysqlTestConfig;
}else{
    mysqlServiceConfig = (require(require('../filesPathConfigs').dbServiceConfigPath)).mysqlProConfig;
}
//mysql的查询工具
let query = function(sql,params,success,error){
    //每次使用的时候需要创建链接，数据操作完成之后要关闭连接
    let pool = mysql.createPool(mysqlServiceConfig);
    pool.getConnection(function(err,connection){
        if(err){
            error && error(err);
            log.info('mysql数据库链接失败：', JSON.stringify(err));
            throw err;
        }
        //开始数据操作
        connection.query( {
            sql : sql,
            timeout: mysqlServiceConfig.connectionTimeout,
            values : params
        }, function(err,results,fields ){
            //log.info('mysql操作结果:',  JSON.stringify(results));
            if(err){
                log.info('mysql数据库操作失败：', JSON.stringify(err));
                error && error(err);
                throw err;
            }
            //将查询出来的数据返回给回调函数，这个时候就没有必要使用错误前置的思想了，因为我们在这个文件中已经对错误进行了处理，如果数据检索报错，直接就会阻塞到这个文件中
            success && success(results, fields);
            //results作为数据操作后的结果，fields作为数据库连接的一些字段，大家可以打印到控制台观察一下
            //停止链接数据库，必须再查询语句后，要不然一调用这个方法，就直接停止链接，数据操作就会失败
            connection.release();
            // connection.end(function(err){
            //     if(err){
            //             console.log('关闭数据库连接失败！');
            //             throw err;
            //     }
            // });
        });
    });
};

/*
 * 数据库相关工具
 */
module.exports={query};