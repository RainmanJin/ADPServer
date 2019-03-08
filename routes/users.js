'use strict';
const util = require('util'),//node模块 格式化JSON数据
    http = require('http'),
    mysql = require('../mysqldb/controllers/user'),
    mongo = require('../mongodb/controllers/test');

//用户登录
var getUserList = function(req, res, next){
    /**
     * @api {get} /userList/ 获取用户列表（mysql数据库）
     * @apiName userList
     * @apiGroup User
     *
     * @apiParam {Number} id Users unique ID.
     *
     * @apiSuccess {String} firstname Firstname of the User.
     * @apiSuccess {String} lastname  Lastname of the User.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'firstname': 'Hello',
     *       'lastname': 'Doe'
     *     }
     *
     * @apiError UserNotFound The <code>id</code> of the User was not found.
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'error': 'UserNotFound'
     *     }
     */
    mysql.getUserList(req, res, next);
};
//用户注册
var userRegister = function(req,res,next){
    mysql.userRegister(req, res, next);
};
//获取mongodb的user数据(测试)
var getMongooseUserListTest  = function (req,res,next) {
    mongo.list(req,res,next);
};
//添加mongodb的user数据（测试）
var addMongooseUser =  function (req,res,next) {
    /**
     * @api {get} /user/ 获取用户列表(mongo数据库)
     * @apiName user
     * @apiGroup Details
     *
     * @apiParam {Number} id Users unique ID.
     *
     * @apiSuccess {String} firstname Firstname of the User.
     * @apiSuccess {String} lastname  Lastname of the User.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {}
     *
     * @apiError UserNotFound The <code>id</code> of the User was not found.
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'error': 'UserNotFound'
     *     }
     */
    mongo.create(req,res,next);
};
module.exports = {
    'POST /api/users/register':userRegister,        // 用户注册
    'GET /api/userList':getUserList,                // 获取用户列表
    'GET /api/user':getMongooseUserListTest,        //测试mongodb获取数据
    'POST /api/addUser':addMongooseUser,            //测试mongodb获取数据
};