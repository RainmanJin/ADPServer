/**
 * Created by weijian.lin on 2018/5/21.
 */
'use strict';
const mongoose = require('mongoose');
const MainBody = mongoose.model('MainBody');
const SerialNumber = mongoose.model('SerialNumber');
const Category = mongoose.model('Category');
const nodeMailer = require('nodemailer');
const emailConfig = require('../../configs/email');
let transporter = nodeMailer.createTransport(emailConfig);
/*const nodejieba = require('nodejieba');*/
let resData = require('../../util/common').resData;
const moment = require('moment');
/*
* 主题名字和别名抽取关键字函数
* */
/*function getKeyword(name = '',alias = []){
    let keywordList;
    if(name.length < 3){
        keywordList = [name];
    }else {
        keywordList = [].concat(nodejieba.cut(name));
    }
    for(let k = 0 ; k < (alias).length ; k++){
        if((alias[k]).length < 3){
            keywordList = (keywordList).concat([alias[k]])
        }else {
            keywordList = (keywordList).concat(nodejieba.cut(alias[k]));
        }

    }
    for(let l = 0 ; l < (keywordList).length ; l++){
        if((keywordList[l]).length < 2){
            (keywordList).splice(l, 1);
        }
    }
    //定义一个新的数组(去重后的数组)
    var s = [];
    //遍历数组
    for(var i = 0;i<keywordList.length;i++){
        if(s.indexOf(keywordList[i]) == -1){  //判断在s数组中是否存在，不存在则push到s数组中
            s.push(keywordList[i]);
        }
    }
    return  s;
}*/

/*
 * 主题名字抽取关键字函数
 * */
/*function getNameKeyword(name){
    if(name.length < 3){
        return name;
    }
    let keywordList = [].concat(nodejieba.cut(name));
    for(let l = 0 ; l < (keywordList).length ; l++){
        if((keywordList[l]).length < 2){
            (keywordList).splice(l, 1);
        }
    }
    return  keywordList;
}*/

/*分类算法*/
function classification (list){
    if(!list) return list;
    let   data = [];
    for(var i = 0; i < list.length; i++) {
        if(!data[list[i].email]) {
            let arr = [];
            arr.push(list[i].name);
            data[list[i].email] = arr;
        }else {
            data[list[i].email].push(list[i].name)
        }
    }
    return data;
}
/**数据统一发送格式
 * @code      {Number}           请求状态
 * @msg      {String}           解释信息
 * @data       {Array/Object}     返回数据
 */

//新增主体
exports.addMainBody = async (req, res, next)=> {
    let params = {
        name: req.body.name,//名称
        main_image: req.body.mainImage,//主图
        typical_diagram: req.body.typicalDiagram,//典型图
        alias: req.body.alias,//别名
        title: req.body.title,//标题
        clean_require: req.body.cleanRequire,//清洗要求
        description: req.body.description,//描述
        country: req.body.country,//国家
        province: req.body.province,//省份
        category_id: req.body.categoryId,//分类ID
        keyword:[],
        audit_status:1,//默认未审核
        main_status:1,//默认未审核
        task_status:0,//默认爬虫未启动
        total_crawler:0,//爬虫完成后的图片总数量
        total_clean:0,//爬虫完成后的图片总数量
        clean_status:1,
        cleaner:"",//洗菜人员
        cleaner_id:"",//洗菜人员
        audit_time:'',//审核时间
        isChecked:false,//用于前端的选中
        cleanCategory:1,//默认1:新任务
        manual_review_status:1,//默认人工待审核
        transfer_status:1//默认为未移交
    };
    if (!params.name) {
        res.send(resData('-1', '名字不能为空', {}));
        return;
    }
    if (!params.main_image) {
        res.send(resData('-1', '主图不能为空', {}));
        return;
    }
    if (!params.category_id) {
        res.send(resData('-1', '分类ID不能为空', {}));
        return;
    }
    if (params.name) {
        let duplicatedFlag = await  MainBody.duplicatedName(params.name);
        if (duplicatedFlag) {
            res.send(resData('-1', '已经存在' + params.name + '这个名字', {}));
            return;
        }
    }
    //params.keyword = getKeyword(params.name,params.alias);
    let isExist =  await SerialNumber.find({name: 'body_serial'}).exec();
    //生成编号
    if (isExist.length < 1) {
        await SerialNumber.create({name: 'body_serial',value:1000000000});
        params.serial_number = 1000000001;
        await SerialNumber.update({name: 'body_serial'}, {$set: {value:1000000001}});
    }else {
        params.serial_number = isExist[0].value +1;
        await SerialNumber.update({name: 'body_serial'}, {$set: {value:params.serial_number}});
    }
    try {
        await  MainBody.create(params);
        res.send(resData('0', '保存成功', {}));
    } catch (error) {
        res.send(resData('-1', '保存失败', {}));
    }
};

//修改主体
exports.updateMainBody = async (req, res, next)=> {
    let conditions = {
        _id: req.body.id
    };
    let params = {
        name: req.body.name,//名称
        main_image: req.body.mainImage,//主图
        typical_diagram: req.body.typicalDiagram,//典型图
        alias: req.body.alias,//别名
        title: req.body.title,//标题
        clean_require: req.body.cleanRequire,//清洗要求
        description: req.body.description,//描述
        country: req.body.country,//国家
        province: req.body.province,//省份
        category_id: req.body.categoryId,//分类ID
        audit_time: req.body.auditTime,//审核时间
        audit_status: req.body.auditStatus,//审核状态
        main_status: req.body.mainStatus,//主体状态
        task_status:req.body.taskStatus,//任务状态
        total_crawler: req.body.totalCrawler,//爬虫完成后的图片总数量
        total_clean: req.body.totalClean,//爬虫完成后的图片总数量
        task_main_body: req.body.taskMainBody//任务记录
    };
    if (!conditions._id) {
        res.send(resData('-1', 'ID不能为空', {}));
        return;
    }
    for (let key in params) {
        //别名、标题、清洗要求、描述、国家、地区 可以传空
        if('province' == key || 'country' == key || 'alias' == key || 'title' == key || 'clean_require' == key || 'description' == key){

        }else {
            if (!params[key] && params[key] !=0) delete params[key]
        }
    }
    if (params.name) {
        let duplicatedFlag = await  MainBody.duplicatedName(params.name, conditions._id);
        if (duplicatedFlag) {
            res.send(resData('-1', '已经存在' + params.name + '这个名字', {}));
            return;
        }
    }
    let isExist =  await MainBody.find({_id: conditions._id}).exec();
    //如果删除的时候没有这个ID，则直接返回错误
    if (isExist.length < 1) {
        res.send(resData('-1', '没有找到ID,可能已被其他终端删除', {}));
        return;
    }
    try {
        await  MainBody.update(conditions, {$set: params});
        res.send(resData('0', '保存成功', {}));
    } catch (error) {
        res.send(resData('-1', '保存失败', {}));
    }
};

//获取主体列表
exports.getMainBody = async (req, res, next)=> {
    try {
        let params = {
            name: req.body.name,
            serialNumber: req.body.serialNumber,
            beginTime: req.body.beginTime,
            endTime:req.body.endTime,
            auditStatus: req.body.auditStatus,
            mainStatus: req.body.mainStatus,
            manualReviewStatus:req.body.manualReviewStatus,
            transferStatus:req.body.transferStatus,
            taskStatus:req.body.taskStatus,
            categoryId: req.body.categoryId,
            sortByTotalCrawler: req.body.sortByTotalCrawler,
            sortByRealNumCrawler: req.body.sortByRealNumCrawler,
            sortByTotalClean: req.body.sortByTotalClean,
            pageSize: req.body.pageSize,
            curPage: req.body.curPage,
            sortByUpdateTime:req.body.sortByUpdateTime,
            alreadyInTask:req.body.alreadyInTask,
            cleanCategory:req.body.cleanCategory,//清洗任务类型[0:全部,1:新任务,2:退回任务]
            cleanStatus:req.body.cleanStatus,//清洗状态[0.全部,1.未清洗,2.清洗中,3.清洗完全]
            sortByCompleted:req.body.sortByCompleted,//按照清洗完成时间排序
            sortByManualReviewDate:req.body.sortByManualReviewDate,//按照人工审核时间排序
            cleaner:req.body.cleaner,//清洗人员
            cleanListFlag:req.body.cleanListFlag
        };
        let list = await  MainBody.list(params);
        res.send(resData('0', '成功', list));
    } catch (error) {
        res.send(resData('-1', '失败', {}));
    }
};

//删除主体
exports.deleteMainBody = async (req, res, next)=> {
    let conditions = {
        _id: req.body.id
    };
    if (!req.body || !conditions._id) {
        res.send(resData('-1', '参数不能为空', {}));
        return;
    }
    try {
        let isExist =  await MainBody.find({_id: conditions._id}).exec();
        //如果删除的时候没有这个ID，则直接返回错误
        if (isExist.length < 1) {
            res.send(resData('-1', '没有找到ID,可能已被其他终端删除', {}));
            return;
        }else {
            if(isExist[0].audit_status == 3){
                res.send(resData('-1', '审核通过之后不能删除', {}));
                return;
            }
        }
        let result = await MainBody.remove({_id: conditions._id});//删除主体
        res.send(resData('0', '删除成功', {}));
    } catch (error) {
        console.log(error);
        res.send(resData('-1', '删除失败', {error: JSON.stringify(error)}));
    }
};

//获取主体详情
exports.getMainBodyDetail = async (req, res, next)=> {
    try {
        let params = {
            id: req.body.id
        };
        let bodyMain = await  MainBody.findOne({_id: params.id}).exec();
        let categoryObj = await Category.searchCategoryRoot(bodyMain.category_id);
        bodyMain.category_value = categoryObj.level3.name;
        bodyMain.category_level2_id = categoryObj.level2._id;
        bodyMain.category_level2_value = categoryObj.level2.name;
        bodyMain.category_level1_value = categoryObj.level1.name;
        bodyMain.category_level1_id = categoryObj.level1.id;
        bodyMain.category_level_list = [categoryObj.level1.id,categoryObj.level2._id,bodyMain.category_id];
        bodyMain.createdTime = moment(bodyMain.created).format('YYYY-MM-DD HH:mm:ss');
        bodyMain.updatedTime = moment(bodyMain.updated).format('YYYY-MM-DD HH:mm:ss');
        bodyMain.auditTime = (bodyMain.audit_time)?(moment(bodyMain.audit_time).format('YYYY-MM-DD HH:mm:ss')):('');
        res.send(resData('0', '成功', bodyMain));
    } catch (error) {
        res.send(resData('-1', '失败', {}));
    }
};

//主体名称检测
exports.keywordCheck = async (req, res, next)=> {
    try {
    let params = {
        name: req.body.name//名称
    };
    if (!params.name) {
        res.send(resData('-1', '名字不能为空', {}));
        return;
    }
    /*let keyword = getNameKeyword(params.name);
        let keyList = [];
        for(let i = 0 ; i < keyword.length ; i++){
            keyList.push({name: {$regex: keyword[i], $options: 'i'}});
            keyList.push({alias: {$regex: keyword[i], $options: 'i'}})
        }
    let filter = {
        $or: keyList
    };
    let list = await  MainBody.find(filter).exec();*/
        res.send(resData('0', '查询成功', list));
    } catch (error) {
        res.send(resData('-1', '保存失败', {}));
    }
};

//审核
exports.examinationPassed = async (req, res, next)=> {
    try {
        let params = {
            id: req.body.id,//ID
            audit_status: req.body.auditStatus//2.不通过，3.通过
        };
        if(params.audit_status == 1){
            res.send(resData('-1', '不能更改为未审核', {}));
            return;
        }
        if (!params.id) {
            res.send(resData('-1', 'ID不能为空', {}));
            return;
        }
        await MainBody.update({_id:params.id}, {$set: {
            audit_status:params.audit_status,
            audit_time:new Date()
        }});
        if(params.audit_status == 2){
            res.send(resData('0002', '审核不通过', {}));
            return;
        }
        if(params.audit_status == 3){
            res.send(resData('0', '审核通过', {}));
            return;
        }
    } catch (error) {
        res.send(resData('-1', '审核失败', {}));
    }
};

//添加任务id
exports.addTaskId = async (taskList)=> {
    try {
        let params = {
            taskList:taskList
        };
        if (!params.taskList) {
            return {
                code:-1,
                msg:'任务不能为空'
            };
        }
        for (let i = 0 ; i < (params.taskList).length ; i++){
            if(!params.taskList[i].id || !params.taskList[i].idTask){
                return {
                    code:-1,
                    msg:'id或者id_task不能为空'
                };
            }
            try {
                await MainBody.update({_id:params.taskList[i].id}, {
                    $set: {
                    id_task:params.taskList[i].idTask,
                    total_crawler:params.taskList[i].totalCrawler,
                    task_status:params.taskList[i].taskStatus
                },
                    $push:{
                        websites:params.taskList[i].websites 
                    }
                });
            }catch (err){
                return {
                    code:-1,
                    msg:'添加任务ID失败'
                };
            }
        }
        return {
            code:0,
            msg:'添加成功'
        };
    } catch (error) {
        return {
            code:-1,
            msg:'添加任务ID失败'
        };
    }
};

//通过任务id获取主体
exports.getBodyByTaskId = async (req, res, next)=> {
    try {
        let params = {
            id:req.body.id,
            name:req.body.name,
            taskStatus:req.body.taskStatus,
            mainStatus:req.body.mainStatus,
            sortByUpdateTime:req.body.sortByUpdateTime,
            pageSize:req.body.pageSize,
            curPage:req.body.curPage
        };
        if (!params.id) {
            res.send(resData('-1', '任务ID不能为空', {}));
            return;
        }
        let list = await  MainBody.getTaskList(params);
        res.send(resData('0', '成功', list));
    } catch (error) {
        res.send(resData('-1', '添加任务ID失败', {}));
    }
};

//通过主体ID得到任务ID
exports.getTaskIdById = async (id)=> {
    try {
        if (!id) {
            return {
                code:-1,
                msg:'爬虫结束后获取主体的taskId失败--缺少参数[id]',
                data:null
            };
        }
        let params = {
            id:id
        };
        let bodyMain = await  MainBody.findOne({_id: params.id}).exec();
        return {
            code:0,
            msg:'爬虫结束后获取主体的taskId成功',
            data:bodyMain
        };
    } catch (error) {
        return {
            code:-1,
            msg:'爬虫结束后获取主体的taskId失败:'+JSON.stringify(error),
            data:null
        };
    }
};

//爬虫开始后更新主体信息【爬虫中】、或者用于图片不满足要求的时候清除任务标记
//spiderObj对象{taskId:'xxx',taskStatus:'yy'} [0:爬虫未启动，1:爬虫进行中，2：爬虫已完成]
exports.updateMainBodyOfSpider = async (spiderObj)=> {
    console.log('排查--爬虫开始后更新主体信息【爬虫中】：更新主体表部分');
    try {
        let conditions = {
            _id: spiderObj.taskId
        };
        let params = {
            task_status:spiderObj.taskStatus//更新爬虫状态
        };
        if (!conditions._id) {
            return {
                code:-1,
                msg:'爬虫更新主体信息失败:taskId不能为空',
                data:null
            };
        }
        //判断当前是否存在这个id
        let isExist =  await MainBody.find({id_task: conditions._id}).exec();
        if (isExist.length < 1) {
            return {
                code:-1,
                msg:'爬虫更新主体信息失败:没有找到任务ID,可能已被其他终端删除',
                data:null
            };
        }
        await  MainBody.update({id_task:conditions._id},{$set:{task_status:params.task_status}});
        return {
            code:0,
            msg:'爬虫结束后更新主体信息成功',
            data:null
        }
    } catch (error) {
        return {
            code:-1,
            msg:'爬虫结束后更新主体信息失败',
            data:null
        }
    }
};

//爬虫结束后更新主体信息【爬虫完成】
exports.updateMainBodyAfterSpider = async (spiderObj)=> {
    console.log('排查--2：更新主体表部分');
    try {
        let conditions = {
            _id: spiderObj.subjectId
        };
        let params = {
            saveAddress:spiderObj.saveAddress,//网站
            absAddress:spiderObj.absAddress//文件存储地址(硬盘地址)

        };
        let websitesList = spiderObj.websites;//网站信息
        if (!conditions._id) {
            return {
                code:-1,
                msg:'爬虫结束后更新主体信息失败:subjectId不能为空',
                data:null
            };
        }
        for (let key in params) {
            if (!params[key]) delete params[key]
        }
        //判断当前是否存在这个id
        let isExist =  await MainBody.find({_id: conditions._id}).exec();
        if (isExist.length < 1) {
            return {
                code:-1,
                msg:'爬虫结束后更新主体信息失败:没有找到ID,可能已被其他终端删除',
                data:null
            };
        }

        //更新主体的爬虫爬取了多少数据real_num
        await MainBody.update({_id:conditions._id}, {
            $set: {
                absAddress:params.absAddress,
                saveAddress:params.saveAddress
            }
        });
        for(let j = 0 ; j < websitesList.length ;j++){
            await  MainBody.update({_id:conditions._id,'websites.name':websitesList[j].name},
                { $set: {
                    'websites.$.real_num' :  websitesList[j].real_num
                }
                }
            );
        }

        //计算实际爬虫爬取图片数量
        let currentBody = await MainBody.findOne({_id:conditions._id});
        let realNumCrawler = 0;
        for(let k = 0 ; k < (currentBody.websites).length ; k++){
            realNumCrawler += currentBody.websites[k].real_num;
        }
        await  MainBody.update({_id:conditions._id},{$set:{real_num_crawler:realNumCrawler,total_clean:realNumCrawler,task_status:3}});
        return {
            code:0,
            msg:'爬虫结束后更新主体信息成功',
            data:null
        }
    } catch (error) {
        return {
            code:-1,
            msg:'爬虫结束后更新主体信息失败',
            data:null
        }
    }
};

//通过用户ID查询是否关联主体
exports.getMainBodyByUserId = async (id)=> {
    try {
        let params = {
            _id:id
        };
        if (!params._id) {
            return {
                code:-1,
                msg:"用户ID不能为空"
            };
        }
        let currentBody = await  MainBody.findOne({cleaner_id: params._id});
        return {
            code:0,
            data:currentBody,
            msg: "ok"
        };
    } catch (error) {
        return {
            code:-1,
            msg:"查询异常"
        };
    }
};

//清洗分配
exports.cleanDistribution = async (req, res, next)=> {
    try {
        let params = {
            distributionList:req.body.distributionList
        };
        if (!params.distributionList) {
            res.send(resData('-1', '数据不能为空', {}));
            return;
        }
         for(let i = 0 ; i < (params.distributionList).length ; i++){
            let updateData = {
                clean_status:2,
                cleaner_id:(params.distributionList[i]).cleanerId,
                cleaner:(params.distributionList[i]).cleaner,
                clean_category:(params.distributionList[i].cleanCategory)?(params.distributionList[i].cleanCategory):(1),
                clean_distribution_date:new Date()
            };
            await  MainBody.findOneAndUpdate({_id: (params.distributionList[i]).id}, {$set:updateData });
         }
        let classificationData = classification(params.distributionList);
        for(let key in classificationData){
            let mailOptions = {
                from: emailConfig.auth.user, // sender address
                to: key, // list of receivers
                subject: '清洗任务', // Subject line
                // 发送text或者html格式
                // text: 'Hello world?', // plain text body
                html: '<p>您有新的清洗任务，请进入ADP系统完成；</p>'+'<p>主体名称:'+(classificationData[key]).join(' | ')+'</p>' // html body
            };
            transporter.sendMail(mailOptions);
        }
        console.log(classificationData);
        res.send(resData('0', '分配完成', {}));
    } catch (error) {
        res.send(resData('-1', '分配失败', {}));
    }
};

//重新分配
exports.cleanRedistribution = async (req, res, next)=> {
    try {
        let params = {
            id:req.body.id,
            cleaner_id:req.body.cleanerId,
            cleaner:req.body.cleaner,
            name:req.body.name,
            email:req.body.email
        };
        if (!params.id || !params.cleaner_id || !params.cleaner || !params.name || !params.email ) {
            res.send(resData('-1', '数据不能为空', {}));
            return;
        }
        let updateData = {
            cleaner_id:params.cleaner_id,
            cleaner:params.cleaner,
            clean_distribution_date:new Date()
        };
        await  MainBody.findOneAndUpdate({_id: params.id}, {$set:updateData });
        let mailOptions = {
            from: emailConfig.auth.user, // sender address
            to: params.email, // list of receivers
            subject: '清洗任务', // Subject line
            // 发送text或者html格式
            // text: 'Hello world?', // plain text body
            html: '<b>清洗人:'+updateData.cleaner+':</b>；'+'<b>主体名:'+params.name+'</b>' // html body
        };
        transporter.sendMail(mailOptions);
        res.send(resData('0', '分配完成', {}));
    } catch (error) {
        res.send(resData('-1', '分配失败', {}));
    }
};

//清洗完成
exports.cleanCompleted = async (req, res, next)=> {
    try {
        let params = {
            id:req.body.id
        };
        if (!params.id) {
            res.send(resData('-1', 'ID不能为空', {}));
            return;
        }
        await MainBody.update({_id: params.id}, {$set: {clean_status:3,clean_completed_date:new Date()}});
        res.send(resData('0', '清洗完成', {}));
    } catch (error) {
        res.send(resData('-1', '清洗处理失败', {}));
    }
};

//通过移交id获取主体列表
exports.getMainBodyListByDeliverId = async (req, res, next)=> {
    try {
        let params = {
            name:req.body.name || "",
            deliver_id: req.body.id,
            pageSize: req.body.pageSize || 10,
            curPage: req.body.curPage || 1
        };
        let _filter = {
            $and: [
                params.deliver_id ? {deliver_id: params.deliver_id} : {},
                params.name ? {name: {$regex: params.name, $options: 'i'}}:{}
            ]
        };
        console.log(_filter);
        let  totalCount = 0;
       try{
           totalCount = await  MainBody.count(_filter).exec();
       }catch (err){
           console.log(err)
       }
        if (totalCount / params.pageSize < params.curPage && (totalCount / params.pageSize) % 1 === 0) {
            params.curPage = parseInt(totalCount / params.pageSize) === 0 ? 1 : parseInt(totalCount / params.pageSize);
        }
        let list = [];
       try {
           list = await MainBody.find(_filter).skip((params.curPage - 1) *params.pageSize).limit(parseInt(params.pageSize)).exec();
       }catch (err){
           console.log(err)
       }
        res.send(resData('0', '成功', {
            list:list,
            curPage:parseInt(params.curPage),
            pageSize:parseInt(params.pageSize),
            totalCount:totalCount,
            totalPages:Math.ceil(totalCount / params.pageSize)
        }));
    } catch (error) {
        res.send(resData('-1', '失败', {}));
    }
};

//人工审核通过
exports.manualReview = async (subjectParams) => {
    console.log('subjectParams=', subjectParams);
    try {
        let params = {
            id: subjectParams.subjectId,
            manual_review_status: subjectParams.manualReviewStatus,
        };
        // if (!params.id) {
        //     res.send(resData('-1', 'ID不能为空', {}));
        //     return;
        // }
        await MainBody.update({ _id: params.id }, {
            $set: {
                manual_review_status:params.manual_review_status,
                manual_review_date:new Date()
            }
        });
        console.log('我执行了');
        // res.send(resData('0', '审核完成', {}));
    } catch (error) {
        // res.send(resData('-1', '审失败', {}));
    }
};

//人工审核退回
exports.manualReviewBack = async (req, res, next) => {
    // console.log(req.manualReviewStatus);
    try {
        let params = {
            id: req.body.id,
            manual_review_status: req.body.manualReviewStatus,
        };
        if (!params.id) {
            res.send(resData('-1', 'ID不能为空', {}));
            return;
        }
        await MainBody.update({ _id: params.id }, {
            $set: {
                manual_review_status:params.manual_review_status,
                clean_category: 2,
                clean_status: 1,
                manual_review_date:new Date(),
            }
        });
        res.send(resData('0', '退回完成', {}));
    } catch (error) {
        res.send(resData('-1', '退回失败', {}));
    }
};

//清洗时候更新保留数量
exports.updateMainBodyAfterClean = async (cleanObj)=> {
    console.log('minBody=', cleanObj);
    try {
        let conditions = {
            _id: cleanObj.subjectId
        };
        let params = {
            total_clean:cleanObj.totalClean//清洗后总共保留数量
        };
        if (!conditions._id) {
            return {
                code:-1,
                msg:'subjectId不能为空',
                data:null
            };
        }
        //更新主体的清洗后保留数量
        await MainBody.update({_id:conditions._id}, {
            $set: {
                total_clean:params.total_clean
            }
        });
        return {
            code:0,
            msg:'保留成功',
            data:null
        };
    } catch (error) {
        return {
            code:-1,
            msg:'保留失败',
            data:null
        };
    }
};




