/**
 * Created by weijian.lin on 2018/5/23.
 */
'use strict';
//文件网络服务器映到射本地磁盘路径
let rootPath =  'Y:/origin_pic/V1.0.0.0503.1';
//引用fs文件模块
let fs = require('fs'),
    FILES_PATH = require('../filesPathConfigs'),//文件夹路径对象
    NODE_ENV = process.env.NODE_ENV,
    mongodbConfigs = {},
    //mongodb数据库
    mongoose = require('mongoose');

//数据库配置
if(NODE_ENV == 'local'){
    mongodbConfigs = (require(FILES_PATH.dbServiceConfigPath)).mongodbLocalConfig;
}else if(NODE_ENV == 'development'){
    mongodbConfigs = (require(FILES_PATH.dbServiceConfigPath)).mongodbDevConfig;
}else if(NODE_ENV == 'test'){
    mongodbConfigs = (require(FILES_PATH.dbServiceConfigPath)).mongodbTestConfig;
}else{
    mongodbConfigs = (require(FILES_PATH.dbServiceConfigPath)).mongodbProConfig;
}

//连接mongoose
mongoose.connect(mongodbConfigs.uri, mongodbConfigs.options);
let mongooseConnect = mongoose.connection;
mongooseConnect.on('error', console.error.bind(console, 'mongodb连接失败!'));
mongooseConnect.on('open', function (callback) {
    console.log('mongodb连接成功！');
});


//异步操作结束判断，触发事件
let EventProxy = require('eventproxy');
let ep = new EventProxy();
let menuList = [];
let menuCount = 0;
let resourceList = [];
let resourceCount = 0;
let imgUrlList = [];
let imgUrlCount = 0;
const Schema = mongoose.Schema;
const dataSchema = new Schema({
    parentDirectory : String,
    childDirectory : String,
    name : String,
    flag : Number,
    createdAt  : { type : Date, default : Date.now }
});
dataSchema.pre('save',function(next){
    next();
});
dataSchema.methods = {
    updateAndSave : function () {
        return this.save();
    }
};
mongoose.model('dataAll',dataSchema);
const dataAll = mongoose.model('dataAll');
 function addData(params) {
    let  currentData = new dataAll(params);
     currentData.updateAndSave();
}
function readDirList (path, callback) {
    let filesList = [];
    fs.readdir(path, function (err, files) {
        if (err) {
            console.log(err);
            filesList = [];
            return;
        }
        filesList = files;
        callback(filesList);
    });
}
readDirList(rootPath, function (filesList) {
    menuList = filesList;
    menuCount = filesList.length;
    ep.after('got_menuList', (menuList).length, function (list) {
        // 在所有menuList文件的异步执行结束后将被执行
        console.log('--------------菜品名称存储结束-------------------');
        console.log('----------------菜品图片url存储开始,请耐心等待---------------');
        //count = 0;
        setTimeout(function () {
            ep.after('got_imgUrlList', (resourceList).length, function (list) {
                // 在所有resourceList文件的异步执行结束后将被执行
                setTimeout(function(){
                    console.log('----------------菜品图片url存储结束---------------');
                    process.exit();
                },5000);
            });
            for (let i = 0; i < (resourceList).length; i++) {
                fs.readdir((resourceList[i]).path, function (err, files) {
                    // 触发结果事件
                    ep.emit('got_imgUrlList', files);
                    if (err) {
                        console.log(err);
                        return;
                    }
                    for (let j = 0; j < files.length; j++) {
                        imgUrlList.push({
                            path: (resourceList[i]).path + '/' + files[j]
                        });
                        addData({
                            parentDirectory : (resourceList[i]).parentDirectory,
                            childDirectory : (resourceList[i]).childDirectory,
                            name : files[j],
                            flag : 0
                        });
                        imgUrlCount++;
                    }

                });
            }
        },1000);
    });
    console.log('--------------菜品名称存储开始,请耐心等待,此脚本只能执行一次，如果重复请删除原来的集合，再执行此脚本-------------------');
    for (let i = 0; i < (menuList).length; i++) {
        fs.readdir(rootPath + '/' + menuList[i], function (err, files) {
            // 触发结果事件
            ep.emit('got_menuList', files);
            if (err) {
                console.log(err);
                return;
            }
            for (let j = 0; j < files.length; j++) {
                resourceList.push({
                    path: rootPath + '/' + menuList[i] + '/' + files[j],
                    parentDirectory : menuList[i],
                    childDirectory : files[j]
                });
                resourceCount++;
            }
        });
    }
});