'use strict';
const util = require('util'),//node模块 格式化JSON数据
    http = require('http'),
    mongo = require('../mongodb/controllers/user');

//获取用户
let getUser  = function (req,res,next) {
    mongo.getUser(req,res,next);
    /**
     * @api {post} /pic/manage/v1/getUser  获取用户列表
     * @apiName user
     * @apiGroup userList
     *
     * @apiParam {String} username 用户名称.
     * @apiParam {Number} pageSize 条数.
     * @apiParam {Number} curPage 当前页.
     * @apiParam {Number} sortByUpdateTime 更新时间排序 （默认）降序： -1，升序： 1.
     *
     * @apiSuccess {String} username 用户名.
     * @apiSuccess {String} password 密码.
     * @apiSuccess {String} email 邮箱.
     * @apiSuccess {String} updatedTime 更新时间.
     * @apiSuccess {String} _id 数据id.
     * @apiSuccess {Array} groups 分组信息.
     * @apiSuccess {Array} cleanTasks 清洗任务.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       curPage: 1,
     *       pageSize: 20,
     *       totalCount: 4,
     *       totalPages: 1,
     *       userList: [{
     *          username: 'zl',
     *          password: '123456',
     *          email: '123456@163.com',
     *          updatedTime: '2018-07-03 17:25:40',
     *          groups: ['1组','2组'],
     *          cleanTasks: ['任务id','任务id'],
     *          _id: '5b3b40d3863fd72d38688eee',
     *       },{
     *          username: 'zl',
     *          password: '123456',
     *          email: '123456@163.com',
     *          updatedTime: '2018-07-03 17:25:40',
     *          groups: ['1组','2组'],
     *          cleanTasks: ['任务id','任务id'],
     *          _id: '5b3b40d3863fd72d38688eee',
     *       }]
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
};
//获取所有用户
let getAllUser  = function (req,res,next) {
    mongo.getAllUser(req,res,next);
};
//新增用户
let addUser  = function (req,res,next) {
    mongo.addUser(req,res,next);
};
//编辑用户
let editUser  = function (req,res,next) {
    mongo.editUser(req,res,next);
};
//删除用户
let delUser  = function (req,res,next) {
    mongo.delUser(req,res,next);
};
module.exports = {
    'POST /pic/manage/v1/getUser': getUser,                      //获取用户
    'POST /pic/manage/v1/getAllUser': getAllUser ,               //获取所有用户
    'POST /pic/manage/v1/addUser': addUser ,                     //新增用户
    'POST /pic/manage/v1/editUser': editUser ,                   //编辑用户
    'POST /pic/manage/v1/delUser': delUser ,                     //删除用户
};