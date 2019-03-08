/**
 * Created by yong.li on 2018/7/03.
 */
'use strict';
const util = require('util'),
    mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    moment = require('moment'),
    tools = require('../../util/common'),
    log = require('../../util/logger').getLogger('system');
let User = require('./user');
exports.createGroup = async (req,res,next)=> {
    let params = req.body;
    if(await tools.isEmptyObject(params)){
        res.send(tools.resData(1001,'参数不能为空',null));
        return;
    }
    if(!params.name){
        res.send(tools.resData(1002,'缺少组名',null));
        return; 
    }else if(typeof params.name !=='string' || typeof params.desc !=='string'){
        res.send(tools.resData(1003,'数据格式错误',null));
        return; 
    }
    // if(params.members&&params.members.length==0){
    //     res.send(tools.resData(1004,'成员members字段参数不能为空值 ',null));
    //     return; 
    // }
    try {
        
        let isExist = await Group.find({name:params.name});
        if(isExist.length>0){
            res.send(tools.resData(1005,'该分组已存在 ',null));
            return; 
        }
        let creatGroup = await Group.create({               //                 是否必传            备注
            name:params.name,                               //                   [是]
            desc:params.desc,                               //                   [是]
            members:params.members,                         //                   [否]            
        });
        if(creatGroup.id){
            /**
             * 【更新用户表-内部调用】
             * 1.实现多对多关系---调用用户接口：为改组下面的所有用户加上改组的id
             * 2.已创建的组不能再次创建
             */
            let updataUserTableResult = await User.updataUserGroup(creatGroup);
            if(updataUserTableResult.code!=='0'){
                res.send(tools.resData(-1,'[后台交互]-创建组失败',null));
                return;
            }
            res.send(tools.resData(0,'success',creatGroup.id));
            return;
        }
    } catch (error) {
        res.send(tools.resData(2001,'模型数据(集合)创建失败-数据格式不正确或其他问题',JSON.stringify(error.stack)));
        return;
    }
    
};
exports.updateGroup = async (req,res,next)=> {
    let queryParams = req.body,
        updateData = {};
    if(!queryParams.id){
        res.send(tools.resData(1002,'缺少参数',null));
        return;
    }
    if(queryParams.name){
        updateData['name'] = queryParams.name;
    }
    if(queryParams.members){
        updateData['members'] = queryParams.members;
    }
    if(queryParams.desc){
        updateData['desc'] = queryParams.desc;
    }
    try {
        //如果存在相同的用户名就不能修改成功
        let nameList = await Group.find({name:queryParams.name});
        if(nameList.length > 0){
            for(let i = 0 ; i < nameList.length ; i++){
                if(nameList[i].id != queryParams.id){
                    res.send(tools.resData(1005,'该分组已存在 ',null));
                    return; 
                }
            }
        }
        let updateItemResult = await Group.findByIdAndUpdate(queryParams.id, updateData, {
            new:true,           //返回最细的文档数据而不是更新之前的旧文档数据
            runValidators:true, //如果为true，则在此命令上运行update validators。 更新验证程序根据模型的架构验证更新操作。
        });
        /**
         * 【更新用户表-内部调用】
         * 1.实现多对多关系---调用用户接口：为该组下面的所有用户更新组的id绑定
         */

        let updataUserTableResult = await User.updataUserGroup(updateItemResult);
        if(updataUserTableResult.code!=='0'){
            res.send(tools.resData(-1,'[后台交互]-更新成员信息失败',null));
            return;
        }
        res.send(tools.resData(0,'success',updateItemResult));
        return;
    } catch (error) {
        res.send(tools.resData(3001,'数据库返回的错误,数据格式不正确',error.stack));
        return;
    }
    
};
exports.removeMemberOfGroup = async(req,res,next)=> {
    let queryParams = req.body,
        newMembers = [];
    if(!queryParams.id || !queryParams.userId){
        res.send(tools.resData(1002,'缺少参数',null));
        return;
    }
    try {
        let updateUserResult = await User.delOneUserGroup({
            groupId:queryParams.id,
            userId:queryParams.userId
        });
        if(updateUserResult.code!=='0'){
            res.send(tools.resData(-1,'[后台交互]-移除单个用户时更新用户表失败',null));
            return;
        }
        let updateResult = await Group.findByIdAndUpdate(queryParams.id, {
            $pull:{members:queryParams.userId}
        }, {
            new:true,           
            runValidators:true,
        });
        res.send(tools.resData(0,'success',null));
    } catch (error) {
        res.send(tools.resData(2001,'数据库返回的错误,数据格式不正确或其他问题',error.stack));
        return;
    }
};
exports.getGroupList = async (req,res,next)=> {
    let queryParams = req.query;
    let queryOptions = {
        filter:{
            $and:[]
        },
        pageInfo : {
            perPageSize:20,                 //每页默认数据：20条
            currentPage:1,                  //当前页默认：第1页
            skipSize:0                      //分页跳转个数
        },
        sort:-1                             //默认排序：按跟新时间倒叙排序
    };
    if(queryParams.sort){
        if(isNaN(Number(queryParams.sort))||(Number(queryParams.sort)!==-1&&Number(queryParams.sort)!==1)){
            res.send(tools.resData(1005,'参数格式错误',null));
            return false;
        }else{
            queryOptions.sort = Number(queryParams.sort); 
        }
    }
    if(queryParams.perPageSize){
        if(isNaN(Number(queryParams.perPageSize))||Number(queryParams.perPageSize)<1){
            res.send(tools.resData(1006,'参数错误',null));
            return false;
        }else{
            queryOptions.pageInfo.perPageSize = Number(queryParams.perPageSize);
        }
    }
    if(queryParams.currentPage){
        if(isNaN(Number(queryParams.currentPage))||Number(queryParams.currentPage)<1){
            res.send(tools.resData(1006,'参数错误',null));
            return false;
        }else{
            queryOptions.pageInfo.currentPage = Number(queryParams.currentPage);
        }
    }
    try {
        queryOptions.filter['$and'].push(
            (undefined!=queryParams.name&&null!=queryParams.name&&''!=queryParams.name)
            ?{name: {$regex: queryParams.name, $options: 'i'}}
            :{}
        );
        queryOptions.pageInfo.skipSize = queryOptions.pageInfo.perPageSize*(queryOptions.pageInfo.currentPage-1);
        let count = await Group.count(queryOptions.filter).exec(),
            totalPages = Math.ceil(count/queryOptions.pageInfo.perPageSize);
        let list = await Group.list(queryOptions);
        list.forEach(function($item,$index){
            $item.create_time = moment($item.created).format('YYYY-MM-DD HH:mm:ss');
            $item.update_time = moment($item.updated).format('YYYY-MM-DD HH:mm:ss');
        });
        res.send(tools.resData(0,'success',Object.assign({
            currentPage:queryOptions.pageInfo.currentPage,
            totalPages:totalPages,
            totalCount:count
        },{
            result:list
        })));
        return;
    } catch (error) {
        res.send(tools.resData(2001,'数据库返回错误，数据个数错误或其他错误',error.stack));
        return;
    }
    
};
exports.getGroup = async (req,res,next)=> {
    let queryParams = req.query;
    if(!queryParams.id){
        res.send(tools.resData(1002,'缺少参数',null));
        return;
    }
    try {
        var result = await Group.queryInfoById(queryParams.id);
        result.create_time = moment(result.created).format('YYYY-MM-DD HH:mm:ss');
        result.update_time = moment(result.updated).format('YYYY-MM-DD HH:mm:ss');
        res.send(tools.resData(0,'success',result));
        return;
    } catch (error) {
        res.send(tools.resData(2001,'数据库返回的错误,数据格式不正确',error.stack));
        return;
    }
}; 
exports.deleteGroup = async (req,res,next)=> {
    let queryParams = req.query;
    if(!queryParams.id){
        res.send(tools.resData(1002,'缺少参数',null));
        return;
    }
    try {
        let removeItemResult = await Group.findByIdAndRemove(queryParams.id, {
            new:false,           
            runValidators:true,
        });

        console.log(removeItemResult);
        if(!removeItemResult){
            res.send(tools.resData(1007,'删除的对象不存在',null));
            return;
        }
        /**
         * 【更新用户表-内部调用】
         * 1.实现多对多关系---调用用户接口：为改组下面的所有用户解除组的id绑定
         */
        let removeItemInfo = {
            _id:removeItemResult._id,
            name:removeItemResult.name,
            members:[]
        };
        let updataUserTableResult = await User.updataUserGroup(removeItemInfo);
        if(updataUserTableResult.code!=='0'){
            res.send(tools.resData(-1,'[后台交互]-更新成员信息失败',null));
            return;
        }
        res.send(tools.resData(0,'success',null));
        return;
    } catch (error) {
        res.send(tools.resData(2001,'数据库返回的错误,数据格式不正确',error.stack));
        return;
    }
};




