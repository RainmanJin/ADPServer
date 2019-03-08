/**
 * Created by weijian.lin on 2018/5/21.
 */
'use strict';
let dblUtil = require('../../util/dblUtil');
let query = dblUtil.query;//引入mysql的查询工具
/*
 * api_sql:登录账号部分
 */
// 注册用户 @param value Array
let insertUserSql = function( value ) {
    let _sql = `INSERT INTO users (username,password,user_regtime,create_date,update_date) VALUES(?,?,?,?,?)`;
    return query( _sql, value );
};
// 已注册用户查询 @param username String
let queryUserSql = function( username,success,error ){
    let _sql = `SELECT * FROM users WHERE username='${username}'`;
    return query(_sql,[],success,error);
};
// 获取用户列表
let getUsersListSql = function(params,success,error) {
    let _sql = `SELECT * FROM users`;
    return query(_sql,params,success,error);
};



/*
 * 导出接口
 */
module.exports={               /*  使用范围     sql名称              参数名称            参数类型      */
    insertUserSql,             //            注册用户            @param value           Array
    queryUserSql,              //            登录用户查询        @param username        String
    getUsersListSql           //            获取用户列表
};