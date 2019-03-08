/**
 * Created by yong.li on 2018/7/17.
 */
'use strict';
const FILES_PATH = require('../../filesPathConfigs'),
    requestConfig = require(FILES_PATH.thirdServerConfigPath).algorithmServerConfig,
    algorithmRequestIpPort = FILES_PATH.algorithmRequestIpPort,
    util = require('util'),
    // Async = require('async'),
    request = require('request'), 
    mongoose = require('mongoose'),
    DeliverHistory = mongoose.model('DeliverHistory'),
    TestRecordModel = mongoose.model('testRecordModel'),
    TestPicRecordModel = mongoose.model('testPicRecordModel'),
    TestDetailRecordModel = mongoose.model('testDetailRecordModel'),
    SerialNumber = mongoose.model('SerialNumber'),
    PictureResource = mongoose.model('pictureResource'),
    MainBody = mongoose.model('MainBody'),
    ModelTrainUnit = mongoose.model('ModelTrainUnit'),
    moment = require('moment'),
    tools = require('../../util/common'),
    log = require('../../util/logger').getLogger('system');
    
/**
 * 创建数据移交记录
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.createDeliver = async (req,res,next)=> {
    let params = req.body;
    if(await tools.isEmptyObject(params)){
        res.send(tools.resData(1001,'参数不能为空',null));
        return;
    }
    if(!params.subjects||!params.organizations){
        res.send(tools.resData(1002,'缺少主体参数或机构参数',null));
        return; 
    }else if(params.subjects.length==0||params.organizations.length==0){
        res.send(tools.resData(1003,'主体参数或机构参数不能为空值',null));
        return;
    }else{
        let organizations = params.organizations;
        for(let i=0,len=organizations.length;i<len;i++){
            if(await tools.isEmptyObject(organizations[i])){
                res.send(tools.resData(1003,'机构列表不能为空',null));
                return;
            }else if(!organizations[i].org_id||!organizations[i].org_name){
                res.send(tools.resData(1004,'机构列表参数不完整','originData:'+JSON.stringify(organizations)));
                return;
            }
        }
    }
    try {
        var serialNumber = null;
        let isExist =  await SerialNumber.find({name: 'deliver_serial'}).exec();
        if(isExist.length<1){
            serialNumber = 1000000001;
            await SerialNumber.create({name: 'deliver_serial',value:serialNumber});
        }else {
            serialNumber = isExist[0].value +1;
            await SerialNumber.update({name: 'deliver_serial'}, {$set: {value:serialNumber}});
        }
    } catch (error) {
        res.send(tools.resData(2002,'序列号生成时，数据库报错','错误信息:'+JSON.stringify(error.stack)));
        return;
    }
    try {
        let createDeliverHistory = await DeliverHistory.create({            //                 是否必传            备注
            deliver_serial_num:serialNumber?serialNumber:null,              //                   [否]            后台生成
            state:1,                                                        //                   [否]            后台控制：1:训练中，2:训练完成，3:训练异常
            state_train:1,                                                  //                   [否]            后台控制：1:初始状态，2:测试中，3:测试完成，4:测试异常
            subjects:params.subjects,                                       //                   [是]
            organizations:params.organizations,                             //                   [是]
            creator:params.creator?params.creator:null,                     //                   [否]          
            is_all_train:false,                                             //                   [否]            后台控制            
            images_train_num:null,                                          //                [否]            后台控制
            images_train_types:[],                                         //                   [否]            后台控制
            model_version:null,                                             //                   [否]            算法返回
            model_path:null,                                                //                   [否]            算法返回
            finish_time:null,                                               //                   [否]            训练结束后更新字段
        });
        if(createDeliverHistory.id){
            /**
             * 【更新主体表-内部调用】
             * 1.实现多对多关系---调用主体模型方法：更新主体的deliver_id、transfer_status字段
             */
            params.subjects.forEach(async function(item,index){
                let updateResult = await MainBody.findByIdAndUpdate(item,{
                    '$push': {deliver_id:createDeliverHistory.id},
                    '$set':{transfer_status:2}
                });
                if(updateResult&&updateResult._id){
                    log.info('[更新主体表]-更新主体deliver_id字段成功');
                }else{
                    log.error('[更新主体表]-更新主体deliver_id字段失败');
                }
            });
            /**
             * 【更新机构表-内部调用】
             * 1.实现多对多关系：更新机构表的handRecord字段(该字段存储移交记录的id)
             */
            params.organizations.forEach(async function(item,index){
                let updateResult = await ModelTrainUnit.findByIdAndUpdate(item.org_id,{
                    '$push': {handRecord:createDeliverHistory.id}
                });
                if(updateResult&&updateResult._id){
                    log.info('[更新机构表]-更新机构表的handRecord字段成功');
                }else{
                    log.error('[更新机构表]-更新机构表的handRecord失败');
                }
            });
            res.send(tools.resData(0,'success',null));
            /**
             * 【算法对接-调用算法接口】
             * 1.主体图片数据移交训练
             * 【坑】：forEach属于异步方法，会导致后面请求数据为空，解决方法是放到回调中执行
             */
            let requestPrams = {
                requestId:null,
                batchId:createDeliverHistory.id,
                subjectList:[],
                callback:algorithmRequestIpPort+'/pic/manage/v1/afterMoveSubject'
            };
            for(let i=0,len=params.subjects.length;i<len;i++){
                let subjectItem = {
                    subjectPicPath:'',
                    subjectName:'',
                    trainPicList:[]
                };
                let queryResult = await PictureResource.find({'id_subject':params.subjects[i],'trainOrTest':1});  //筛选训练集图片 1:训练集，2:测试集
                if(queryResult.length>0){
                    queryResult.forEach(function($item,$index){
                        if($index===0){
                            subjectItem.subjectPicPath = $item.saveAddress;
                            subjectItem.subjectName = $item.subject_name;
                        }
                        subjectItem.trainPicList.push(`${$item.website}/${$item.img_name}`);
                    });
                    requestPrams.subjectList.push(subjectItem);
                }
            }
            log.info('[后台请求算法]POST移交数据：'+JSON.stringify(requestPrams));
            request({ 
                url: requestConfig.host+requestConfig.moveToTrainApi,
                method: 'POST', 
                json: true, 
                headers: { 'content-type': 'application/json'}, 
                body: {
                    requestId:requestPrams.requestId,
                    batchId:requestPrams.batchId,
                    subjectList:requestPrams.subjectList,
                    callback:requestPrams.callback,
                }
            },function(error, result, body) { 
                if(error){
                    log.error('[后台请求算法]返回信息-请求算法接口失败-1：'+JSON.stringify(error.stack));
                    return;
                }
                if(body.code===0||body.code==='0'){
                    log.info('[后台请求算法]返回信息-请求算法接口成功：'+JSON.stringify(body));
                }else{
                    log.error('[后台请求算法]返回信息-请求算法接口失败-2：'+JSON.stringify(result));
                    return; 
                }
            });
        }
    } catch (error) {
        res.send(tools.resData(2002,'模型数据(集合)创建失败-数据格式错误或其他错误','MESSAGE:'+error.stack));
        return;
    }
};
/**
 * 获取数据移交记录列表
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.getDeliverList = async (req,res,next)=> {
    let queryParams = req.query;
    let queryOptions = {
        filter:{
            $and:[{}]                       //"MongoError: $and/$or/$nor must be a nonempty array":初始化时不能为空数组，需要放个空对象
        },
        pageInfo : {
            perPageSize:20,                 //每页默认数据：20条
            currentPage:1,                  //当前页默认：第1页
            skipSize:0                      //分页跳转个数
        },
        sort:-1                             //默认排序：按跟新时间倒叙排序
    };
    //分页参数
    if(queryParams.perPageSize){
        if(isNaN(Number(queryParams.perPageSize))||Number(queryParams.perPageSize)<1){
            res.send(tools.resData(1006,'参数错误-perPageSize参数至少为1',null));
            return false;
        }else{
            queryOptions.pageInfo.perPageSize = Number(queryParams.perPageSize);
        }
    }
    if(queryParams.currentPage){
        if(isNaN(Number(queryParams.currentPage))||Number(queryParams.currentPage)<1){
            res.send(tools.resData(1006,'参数错误-currentPage参数至少为1',null));
            return false;
        }else{
            queryOptions.pageInfo.currentPage = Number(queryParams.currentPage);
        }
    }
    //查询参数
    if(undefined!=queryParams.org_name&&null!=queryParams.org_name&&''!=queryParams.org_name){
        queryOptions.filter['$and'].push(
            {organizations: {'$elemMatch': {'org_name': {$regex: queryParams.org_name, $options: 'i'}}}}
        );
    }
    if(queryParams.deliver_serial_num){
        if(isNaN(Number(queryParams.deliver_serial_num))){
            res.send(tools.resData(1006,'参数格式错误',null));
            return false;
        }else{
            queryOptions.filter['$and'].push(
                {deliver_serial_num: Number(queryParams.deliver_serial_num)}
            );
        }
    }
    if(queryParams.state){
        if(isNaN(Number(queryParams.state))){
            res.send(tools.resData(1006,'参数格式错误',null));
            return false;
        }else{
            queryOptions.filter['$and'].push(
                {state: Number(queryParams.state)}
            );
        }
    }
    if(queryParams.state_train){
        if(isNaN(Number(queryParams.state_train))){
            res.send(tools.resData(1006,'参数格式错误',null));
            return false;
        }else{
            queryOptions.filter['$and'].push(
                {state_train: Number(queryParams.state_train)}
            );
        }
    }
    if(queryParams.start_time||queryParams.end_time){
        if(!queryParams.start_time&&!queryParams.end_time){
            res.send(tools.resData(1006,'参数错误-selectTimeStart或selectTimeEnd不存在',null));
            return false;
        }
        queryOptions.filter['$and'].push(
            {created: { '$gt': queryParams.start_time }},
            {created: { '$lt': queryParams.end_time }}
        );
    }
    try {
        queryOptions.pageInfo.skipSize = queryOptions.pageInfo.perPageSize*(queryOptions.pageInfo.currentPage-1);
        let count = await DeliverHistory.count(queryOptions.filter).exec(),
            totalPages = Math.ceil(count/queryOptions.pageInfo.perPageSize);
        let list = await DeliverHistory.list(queryOptions);
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
    } catch (error) {
        res.send(tools.resData(2001,'数据库返回错误，数据格式错误或其他错误',error.stack));
        return;
    }
};
/**
 * 获取图片处理类型
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.getTypeList = async (req, res ,next)=>{
    let reqUrl = requestConfig.host+requestConfig.getTypeApi;
    console.log(reqUrl);
    request(reqUrl,async (error,response,body)=>{
        console.log(error);
        console.log(JSON.parse(body));
        if(error){
            return res.send(tools.resData(-1,'数据获取失败'));
        }
        if(response.statusCode === 200 && JSON.parse(body).code === 0){
            console.log(response.statusCode);

            return res.send(tools.resData(0,'',JSON.parse(body).data));
        }else{
            return res.send(tools.resData(-1,'服务器异常'));

        }
    });

};
/**
 * 创建测试
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.createTest = async (req, res, next)=>{
    let {picDealMethodList,subjects,batchId,modelPath,picCount,allTest} = req.body;
    let reqUrl = requestConfig.host+requestConfig.moveToTestApi;
    let requestParam ={
        'requestId':new Date(),
        'batchId':batchId,
        'picDealMethodList':picDealMethodList,
        'modelPath':modelPath,
        'subjectList':[],
        'callback':algorithmRequestIpPort+'/pic/manage/v1/postModelTestData'    
    };
    console.log(req.body);
    
    for (let i = 0;i<subjects.length;i++){
        let subjectListObj = {
            testPicList:[]
        };
        let subjectImg = await PictureResource.find({'id_subject':subjects[i],'trainOrTest':2}).limit(parseInt(picCount)).exec();
        let subject = await MainBody.findById(subjects[i]);
        console.log(subject);
        console.log('---------------subjectImg-----------------');
        console.log(subjectImg);

        subjectListObj.subjectPicPath = subject.saveAddress;
        subjectListObj.subjectName = subject.name;
        subjectListObj.subjectId = subjects[i];
        subjectListObj.alias = subject.alias;
        for(let j = 0; j < subjectImg.length;j++){
            subjectListObj.testPicList.push(subjectImg[j].img_name);
        }
        console.log('---------------------------------------------------------');
        console.log(subjectListObj);
        requestParam.subjectList.push(subjectListObj);
    }
    console.log(requestParam);

    request({ 
        url: reqUrl, 
        method: 'POST', 
        json: true, 
        headers: { 'content-type': 'application/json', }, 
        body: requestParam
    },async (error, response, body)=>{
        console.log(body);
        console.log(error);
        if(error){
            return res.send(tools.resData(-1,'数据获取失败'));
        }
        if(response.statusCode === 200 && body.code === 0){
            let result = await DeliverHistory.findByIdAndUpdate(batchId,{$set:{'state_train':2}});
            console.log(result);
            return res.send(tools.resData(0,'创建测试成功'));
        }
    });
};
/**
 * 算法回调，存入算法数据
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.getTestRecord = async (req, res, next)=>{
    let {batchId,subjectList} = req.body;
    let len = 0; 
    let fTop1 = 0,
    fTop5 = 0, 
    creditTop1 = 0,
    creditTop5 = 0,
    accuracyBaidu = 0;
    console.log(req.body);
    try{
        let result;
        if(batchId){
            let result = await DeliverHistory.findByIdAndUpdate(batchId,{'state_train':3});
            console.log(result);
        }
        for(let i = 0;i<subjectList.length;i++){
            for(let j = 0;subjectList[i].testResult.length; j++){
                len = subjectList[i].testResult[j].testPicList.length;
                for(let k = 0;k<subjectList[i].testResult[j].testPicList.length;k++){
                    let picParams = {
                        'id_request':new Date(),
                        'id_batch':batchId,
                        'id_subject':subjectList[i].subjectId,
                        'id_pic':k,
                        'name_subject':subjectList[i].subjectName,
                        'deal_model':subjectList[i].testResult[j].picDealMethod,
                        'picName':subjectList[i].testResult[j].testPicList[k].picName,
                        'isTop1':subjectList[i].testResult[j].testPicList[k].isTop1,
                        'isTop5':subjectList[i].testResult[j].testPicList[k].isTop5,
                        'creditOfTop1':subjectList[i].testResult[j].testPicList[k].creditOfTop1,
                        'nameOfTop1':subjectList[i].testResult[j].testPicList[k].nameOfTop1,
                        'creditOfTop2':subjectList[i].testResult[j].testPicList[k].creditOfTop2,
                        'nameOfTop2':subjectList[i].testResult[j].testPicList[k].nameOfTop2,
                        'creditOfTop3':subjectList[i].testResult[j].testPicList[k].creditOfTop3,
                        'nameOfTop3':subjectList[i].testResult[j].testPicList[k].nameOfTop3,
                        'creditOfTop4':subjectList[i].testResult[j].testPicList[k].creditOfTop4,
                        'nameOfTop4':subjectList[i].testResult[j].testPicList[k].nameOfTop4,
                        'creditOfTop5':subjectList[i].testResult[j].testPicList[k].creditOfTop5,
                        'nameOfTop5':subjectList[i].testResult[j].testPicList[k].nameOfTop5,
                        'isBaiduTop1':subjectList[i].testResult[j].testPicList[k].isBaiduTop1,
                        'creditOfBaiduTop1':subjectList[i].testResult[j].testPicList[k].creditOfBaiduTop1,
                        'errType':subjectList[i].testResult[j].testPicList[k].errType
                    };

                    let rTop1 = subjectList[i].testResult[j].testPicList[k].isTop1;
                    if(!rTop1){
                        fTop1 +=1; 
                    }
                    let rTop5 = subjectList[i].testResult[j].testPicList[k].isTop5;
                    if(!rTop5){
                        fTop5 +=1;
                    }
                    let rBaidu  = subjectList[i].testResult[j].testPicList[k].isBaiduTop1;
                    if(rBaidu){
                        accuracyBaidu += 1; 
                    }
                    creditTop1 += subjectList[i].testResult[j].testPicList[k].creditOfTop1;
                    creditTop5 += subjectList[i].testResult[j].testPicList[k].creditOfTop5;
                    let testPicResult = await TestPicRecordModel.create(picParams);
                    console.log(testPicResult);
                }
                let detailParams = {
                    'rTop1':0,
                    'fTop1':0,
                    'accuracyTop1':'',
                    'creditTop1':0,
                    'rTop5':0,
                    'fTop5':0,
                    'accuracyTop5':'',
                    'creditTop5':0
                };
                detailParams.rTop1 = len -fTop1;
                detailParams.fTop1 = fTop1;
                detailParams.accuracyTop1 = (len - fTop1)/len+'%';
                detailParams.creditTop1 = creditTop1/(len-fTop1)+'%';
                detailParams.rTop5 = len - fTop5;
                detailParams.fTop5 = fTop5;
                detailParams.accuracyTop5 = (len - fTop5)/len+'%';
                detailParams.creditTop5 = creditTop5/(len - fTop5)+'%';
                if(subjectList[i].testResult[j].picDealMethod === '标准'){
                    Object.assign(subjectParams,detailParams);
                }
                result = await TestDetailRecordModel.create(detailParams);
                console.log(result);                
            }
            let subjectParams = {
                'testAccount':len,
                'accuracyBaidu':accuracyBaidu/len +'%',
                'comparedBaidu':accuracyBaidu/len - (len - fTop1)/len +'%'
            };
            let testResult = await TestRecordModel.create();
            console.log(testResult);
        }
        return res.send(tools.resData(0,'success'));
    }
    catch(error){
        return res.send(tools.resData(-1,'数据异常'));
    }
};

/**
 * 获取测试情况
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */

exports.getTestRecordList = async (req,res,next)=>{
    let {subjectName,batchId,pageSize,currentPage} = req.query;
    pageSize = pageSize || 20;
    currentPage = currentPage || 1;
    let start = (parseInt(currentPage) - 1) * parseInt(pageSize);
    let options ={};
    console.log(batchId);
    try{
        if(batchId === '' || batchId === undefined){
            return res.send(tools.resData(-1,'参数错误'));
        }
        if(subjectName === '' || subjectName === undefined){
            Object.assign(options,{'id_batch':batchId});
        }else{
            Object.assign(options,{'id_batch':batchId,'name_subject':subjectName});
        }
        let subjectList = TestRecordModel.find(options).skip(start).limit(parseInt(pageSize)).exec();
        return res.send(tools.resData(0,'success',subjectList));
    }catch(error){
        return res.send(tools.resData(-1,'数据异常'));
    }
};

/**
 * 获取测试详情
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.getTestDetailRecordList = async (req, res, next)=>{
    try{
        let result = await TestDetailRecordModel.find({}).exec();
        return res.send(tools.resData(0,'success',result));
    }catch(error){
        return res.send(tools.resData(-1,'数据异常'));
    }
};
/**
 * 获取图片详情
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */ 

exports.getTestPicRecordList  =async (req, res, next) =>{
    let {top1,top5,baidu,errType,pageSize,currentPage} = req.params;
    pageSize = pageSize || 20;
    currentPage = currentPage || 1;
    let start = (parseInt(currentPage) - 1) * parseInt(pageSize);
    let options = {

    };
    try{
       if(top1 !== ''){
        Object.assign(options,{'isTop1':top1});
       }else if(top5 !== ''){
        Object.assign(options,{'isTop5':top5});
       } else if(baidu !== ''){
        Object.assign(options,{'isBaiduTop1':baidu});
       }else if(errType !== ''){
        Object.assign(options,{'errType':errType});    
       }
        let result = await TestPicRecordModel.find(options).skip(start).limit(parseInt(pageSize)).exec();
        return res.send(tools.resData(0,'success',result)); 
    }catch(error){
        return res.send(tools.resData(-1,'数据异常'));
    }
};
/**
 * 回调函数--移交洗完成的主体集给指定的机构后
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.afterMoveSubject = async (req,res,next)=>{
    let params = req.body;
    log.info('[算法请求后台]-移交训练后已收到算法的回调请求');
    log.info('[算法请求后台]-请求数据：'+JSON.stringify(params));
    if(await tools.isEmptyObject(params)){
        res.send(tools.resData(1001,'参数不能为空',null));
        return;
    }
    if(!params.batchId||!params.modelPath){ //应该加上模型版本的验证
        res.send(tools.resData(1002,'缺少batchId参数或modelPath参数或modelVersion参数',null));
        return; 
    }
    try {
        await DeliverHistory.findByIdAndUpdate(params.batchId, {
            model_path:params.modelPath?params.modelPath:null,
            model_version:params.modelVersion?params.modelVersion:null,
            state:2,
            finish_time:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        });
        res.send(tools.resData(0,'success',null));
    } catch (error) {
        res.send(tools.resData(2002,'模型数据(集合)创建失败-数据格式错误或其他错误','MESSAGE:'+error.stack));
        return;
    }
};

