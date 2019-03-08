/**
 * Created by weijian.lin on 2018/5/21.
 */
'use strict';
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const User = mongoose.model('User');
let resData = require('../../util/common').resData;
let log = require('../../util/logger').getLogger('system');
//设置时间格式
const moment = require('moment');               
//创建用户成功后发送邮件通知
const nodeMailer = require('nodemailer');
const emailConfig = require('../../configs/email');
let transporter = nodeMailer.createTransport(emailConfig);
//引入主体模块
const mainBody = require('./mainBody'); 
//crypto加密        
const crypto = require('crypto');

//获取用户
exports.getUser = async (req,res,next)=> {
    let params = {
        username: req.body.username,
        pageSize: req.body.pageSize,
        curPage: req.body.curPage,
        sortByUpdateTime:req.body.sortByUpdateTime,
        groupName: req.body.groupName,
        groupId: req.body.groupId,
    };
    try{
        let userList = await  User.userList(params);
        res.send(resData('0','成功',userList));
    } catch (error){
        log.error('返回错误:',error);
        res.send(resData('-1','失败',{}));
    }
};

//获取所有用户
exports.getAllUser = async (req,res,next)=> {
    try{
        let allUserList = await  User.find();
        res.send(resData('0','成功',allUserList));
    } catch (error){
        log.error('返回错误:',error);
        res.send(resData('-1','失败',{}));
    }
};

//新增用户
exports.addUser =async (req,res,next)=> {
    let creatTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    //判断用户名是否已经存在
    if (req.body.username) {
        let isRenameFlag = await User.isRename(req.body.username);
        if (isRenameFlag) {
            res.send(resData('-1', '已经存在' + req.body.username + '这个用户', {}));
            return;
        }
    }
    let pwd = crypto.createHash('md5').update(req.body.password).digest('hex');               //密码加密处理
    console.log('密码',pwd);
    let params = {
        username: req.body.username,         
        password: pwd,
        email: req.body.email,
        role: req.body.role,
        isChecked: false,
        updatedTime: creatTime,
    };
    
    try{
        console.log(123456789);
        await  User.create(params);
        //发送邮件
        let mailOptions = {
            from: emailConfig.auth.user, // sender address
            to: params.email, // list of receivers
            subject: '新建用户', // Subject line
            // 发送text或者html格式
            // text: 'Hello world?', // plain text body
            html: '<p>新建用户:'+params.username+'</p>'+'<p>密码:'+req.body.password+'</p>' // html body
        };
        transporter.sendMail(mailOptions);
        res.send(resData('0','保存成功',{}));
    } catch (error){
        log.error('返回错误:',JSON.stringify(error));
        res.send(resData('-1','保存失败',{}));
    }
};

//编辑用户
exports.editUser =async (req,res,next)=> {
    let updatedTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    let conditions = {
        _id: req.body._id
    };
    let params = {
        username: req.body.username,  
        email: req.body.email,
        role: req.body.role,
        updatedTime: updatedTime,
    };
    //如果编辑的时候没有这个ID，则直接返回错误
    let isExist =  await User.find({_id: conditions._id}).exec();
    if (isExist.length < 1) {
        res.send(resData('-1', '没有找到ID,可能已被其他终端删除', {}));
        return;
    }
    //判断用户名是否已经存在
    if (params.username) {
        let isRenameFlag = await  User.isRename(params.username,conditions._id);
        if (isRenameFlag) {
            res.send(resData('-1', '已经存在' + params.username + '这个用户', {}));
            return;
        }
    }
    try{
        let userData = await mainBody.getMainBodyByUserId(conditions._id);
        if(!userData.data){
            await  User.update(conditions, {$set: params});
            //发送邮件
            let mailOptions = {
                from: emailConfig.auth.user, // sender address
                to: params.email, // list of receivers
                subject: '编辑用户', // Subject line
                // 发送text或者html格式
                // text: 'Hello world?', // plain text body
                html: '<p>编辑用户:'+params.username+'</p>' // html body
            };
            transporter.sendMail(mailOptions);
            res.send(resData('0','编辑成功',{}));
        }else{
            res.send(resData('-1','此用户有清洗任务，不能编辑',{}));
        }
    } catch (error){
        log.error('返回错误:',JSON.stringify(error));
        res.send(resData('-1','编辑失败',{}));
    }
};

//删除用户
exports.delUser =async (req,res,next)=> {
    try{
        //如果删除的时候没有这个ID，则直接返回错误
        let isExist =  await User.find({_id: req.body._id}).exec();
        if (isExist.length < 1) {
            res.send(resData('-1', '没有找到ID,可能已被其他终端删除', {}));
            return;
        }
        let userData = await mainBody.getMainBodyByUserId(req.body._id);
        if(!userData.data){
            await  User.remove({_id: req.body._id});
            res.send(resData('0','删除成功',{}));
        }else{
            res.send(resData('-1','此用户有清洗任务，不能删除',{}));
        }
    } catch (error){
        log.error('返回错误:',JSON.stringify(error));
        res.send(resData('-1','删除失败',{}));
    }
};

//更新用户分组信息
exports.updataUserGroup =async (options)=> {
    let updatedTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    let usersId = options.members;
    let groupData = await User.find({groups: {'$elemMatch': {'groupId': options._id}}});
    let groupId = '';
    try{
        //清空现有的分组成员
        for(let i=0; i<groupData.length; i++){
            groupId= options._id;
            await User.update({groups: {'$elemMatch': {'groupId': groupId}}},{'$pull':{'groups':{'groupId':groupId}}});
        }
        // 更新新的分组成员
        for(let i=0; i<usersId.length; i++){
            groupId = options._id;
            await User.update({ _id: usersId[i] },{'$addToSet':{'groups':{'groupId':groupId,'groupName':options.name}},$set:{'updatedTime':updatedTime}});
        }
        return {
            code:'0',
            msg:'更新成功',
            data:null,
        };
    } catch (error){
        return {
            code:'-1',
            msg:'更新失败',
            data:null,
        };
    }
    
};

//删除单个用户分组信息
exports.delOneUserGroup =async (options)=> {
    let updatedTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    try{
        await User.update({'_id':options.userId},{'$pull':{'groups':{'groupId':ObjectID(options.groupId)}},$set:{'updatedTime':updatedTime}});
        return {
            code:'0',
            msg:'删除成功',
            data:null,
        };
    } catch (error){
        return {
            code:'-1',
            msg:'删除失败',
            data:null,
        };
    }
};

