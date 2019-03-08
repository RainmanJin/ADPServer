/**
 * Created by lin.zhou on 2018/6/21.
 */
'use strict';
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    role: String,
    updatedTime: String,
    isChecked: Boolean, 
    groups: Array,
});

userSchema.pre('save', function (next) {
    next();
});

userSchema.methods = {
    updateAndSave: function () {
        return this.save();
    }
};

userSchema.statics = {
    //查询用户
    userList: async function (params) {
        let username = params.username || '';                           //用户名字
        let groupName = params.groupName || '';                         //分组名称
        let groupId = params.groupId || '';                             //分组id
        let sortByUpdateTime =  params.sortByUpdateTime || -1;          //更新时间
        let pageSize = params.pageSize || 20;
        let curPage = params.curPage || 1;
        let totalCount = 0;

        let _filter = {
            $and: [
                {username: {$regex: username, $options: 'i'}},
                groupName ? {groups: {'$elemMatch': {'groupName': {$regex: groupName, $options: 'i'}}}} : {},
                groupId ? {groups: {'$elemMatch': {'groupId': ObjectID(groupId)}}} : {}
            ]
        };
        //总条数
        totalCount = await  this.count(_filter).exec();
        if(totalCount == 0){
            return {
                userList: [],
                curPage: parseInt(curPage),
                pageSize: parseInt(pageSize),
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
            };
        }else{
            //如果传入的当前页大于数据库中的页数，就返回数据库中的最后一页数据
            if( curPage > Math.ceil(totalCount / pageSize) ){
                curPage = Math.ceil(totalCount / pageSize);
            }
            let userList = await this.find(_filter,{'password':0})
                                    .sort({updatedTime: sortByUpdateTime})
                                    .skip((curPage-1)*pageSize)
                                    .limit(parseInt(pageSize))
                                    .exec();
            
            return {
                userList: userList,
                curPage: parseInt(curPage),
                pageSize: parseInt(pageSize),
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
            };
        }
    },
    //判断数据是否重名
    isRename: async function (username,id) {
        let nameList = await  this.find({username:username});
        if(nameList.length > 0){
            for(let i = 0 ; i < nameList.length ; i++){
                if(nameList[i].id == id){
                    return false;
                }
            }
            return true;
        }else {
            return false;
        }
    },

};
//注册mongoose模型，其他地方可以直接 mongoose.model('User')调用
mongoose.model('User', userSchema, 'User');
