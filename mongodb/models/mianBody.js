/**
 * Created by weijian.lin on 2018/5/21.
 */
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Category = mongoose.model('Category');
const moment = require('moment');

const MainBodySchema = new Schema({
    name: { type: String, index: true },//名称
    keyword:Array,//拆词
    main_image:  String,//主图
    typical_diagram: Array,//典型图
    alias:Array,//别名
    title:String,//标题
    clean_require:String,//清洗要求
    description:String,//描述
    country:String,//国家
    province:String,//省份
    audit_time:Date,//审核时间
    auditTime:String,//审核时间
    audit_status:{ type: Number, index: true },//审核状态1.未审核，2.审核未通过，3.审核通过]
    main_status:Number,//主体状态[1.待爬虫，4.爬虫中，5.清洗中，6.训练中，7.测试中，8.已删除，9.已上线]
    task_status: { type: Number, min: 0, max: 3, index: true },//任务状态[0:全部，1:爬虫未启动，2：爬虫进行中，3:爬虫已完成]
    category_id:String,//类别第三级ID
    category_value:String,//类别第三级值
    category_level2_value:String,//类别第二级值
    category_level2_id:String,//类别第二级id
    category_level1_value:String,//类别第一级值
    category_level1_id:String,//类别第一级id
    category_level_list:Array,//类别List
    total_crawler:Number,//要求爬虫需要爬取图片总数量
    real_num_crawler:Number,//爬虫实际爬取的图片数量
    total_clean:Number,//清洗后的图片总数量
    clean_category:Number,//清洗任务类型[0:全部,1:新任务,2:退回任务]
    cleaner:String,//洗菜人员
    cleaner_id:String,//洗菜人员
    clean_status:{ type: Number, index: true },//清洗状态[0.全部,1.未清洗,2.清洗中,3.清洗完成]
    clean_distribution_date:Date,//清洗分配时间
    cleanDistributionDate:String,//清洗分配时间，用于返回数据
    clean_completed_date:Date,//清洗完成时间
    cleanCompletedDate:String,//清洗完成时间，用于返回数据
    manual_reviewer:String,//审核人
    manual_review_status:{ type: Number, index: true },//人工审核状态[0.全部,1.待审核,2.退回,3.审核通过]
    manual_review_date:Date,//审核时间
    manualReviewDate:String,//审核时间，用于返回数据
    transfer_status:{ type: Number, index: true },//移交状态[0.全部,1.未移交,2.已移交]
    training_number:Number,//训练集数量
    transfer_number:Number,//已移交数量
    deliver_id:Array,//移交批次ID
    clean_reason_for_return:String,//退回清洗原因
    task_main_body:Array,//任务记录
    createdTime:String,//创建时间
    updatedTime:String,//更新时间
    serial_number:Number,//编号
    id_task:String,//任务编号[无任务的时候置位为null]
    websites:Array,//网站
    absAddress:String,//文件存储地址(硬盘地址)
    saveAddress:String,//文件访问地址(web地址)
    isChecked:Boolean//用于前端判断是否勾选
}, {
    timestamps: {
        createdAt: 'created',//添加时间
        updatedAt: 'updated'//更新(编辑)时间
    }
});
MainBodySchema.pre('save', function (next) {
    next();
});

MainBodySchema.methods = {
    updateAndSave: function () {
        return this.save();
    }
};

MainBodySchema.statics = {
    //判断数据是否重名
    duplicatedName: async function (name,id) {
        let nameList = await  this.find({name:name});
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
    //列表查询
    list: async function (params) {
        // 需要支持模糊搜索 { $regex: params.name, $options: 'i' }
        try {
            let name = params.name || "";//名字
            let serialNumber = params.serialNumber || "";//编号
            let beginTime = params.beginTime || '';//开始时间
            let endTime = params.endTime || "";//结束时间
            let auditStatus = params.auditStatus || "";//审核状态
            let mainStatus = params.mainStatus || "";//主体状态
            let taskStatus = params.taskStatus || "";//任务状态
            let manualReviewStatus = params.manualReviewStatus || "";//人工审核状态
            let transferStatus = params.transferStatus || "";//移交状态
            let categoryId = params.categoryId || "";//类别ID
            let sortByTotalCrawler = params.sortByTotalCrawler || ""; //爬虫设定的图片总数量
            let sortByRealNumCrawler = params.sortByRealNumCrawler || ""; //爬虫完成后的图片总数量
            let sortByTotalClean = params.sortByTotalClean || "";//爬虫完成后的图片总数量
            let sortByUpdateTime =  params.sortByUpdateTime || "";//更新时间
            let pageSize = params.pageSize || 10;
            let curPage = params.curPage || 1;
            let alreadyInTask = params.alreadyInTask;//通过任务id获取审核过，未爬虫的主体数据
            let cleanCategory =  params.cleanCategory;//清洗任务类型[0:全部,1:新任务,2:退回任务]
            let cleanStatus =  params.cleanStatus;//清洗状态[0.全部,1.未清洗,2.清洗中,3.清洗完全]
            let sortByCompleted =  params.sortByCompleted;//按照清洗完成时间排序
            let sortByManualReviewDate =  params.sortByManualReviewDate;//按照人工审核时间排序
            let cleanListFlag = params.cleanListFlag;//是否是清洗列表，清洗列表只会返回清洗中和清洗完成的数据，如果cleanListFlag为1则过滤
            let cleaner = params.cleaner || "";//清洗人员
            let totalCount = 0;
            let _filter = {
                $and: [
                    {name: {$regex: name, $options: 'i'}},
                    {cleaner: {$regex: cleaner, $options: 'i'}},
                    serialNumber ? {serial_number: serialNumber} : {},
                    beginTime ? {'updated': {'$gt': new Date(beginTime)}} : {},
                    endTime ? {'updated': {'$lt': new Date(endTime)}} : {},
                    auditStatus ? {audit_status: auditStatus} : {},
                    mainStatus ? {main_status: mainStatus} : {},
                    manualReviewStatus ? {manual_review_status: manualReviewStatus} : {},
                    transferStatus ? {transfer_status: transferStatus} : {},
                    taskStatus ? {task_status: taskStatus} : {},
                    categoryId ? {category_id: categoryId} : {},
                    alreadyInTask?{"$or":[{"id_task":{$exists:false}},{"id_task":null}]}:{},
                    cleanCategory?{clean_category: cleanCategory} : {},
                    cleanListFlag?{"$or":[{"clean_status":2},{"clean_status":3}]}:(cleanStatus?{clean_status: cleanStatus} : {})
                ]
            };

            totalCount = await  this.count(_filter).exec();
            if (totalCount / pageSize < curPage && (totalCount / pageSize) % 1 === 0) {
                curPage = parseInt(totalCount / pageSize) === 0 ? 1 : parseInt(totalCount / pageSize);
            }
            let sort_filter = {
                total_crawler: parseInt(sortByTotalCrawler),
                real_num_crawler: parseInt(sortByRealNumCrawler),
                total_clean: parseInt(sortByTotalClean),
                updated: parseInt(sortByUpdateTime),
                clean_completed_date: parseInt(sortByCompleted),
                manual_review_date: parseInt(sortByManualReviewDate)
            };
            //清除无效filter
            for (let key in sort_filter) {
                if (!sort_filter[key]) delete sort_filter[key]
            }
            //默认排序
            if(!sort_filter.real_num_crawler && !sort_filter.total_clean){
                sort_filter.updated = -1;
            }
            let list = await this.find(_filter).sort(sort_filter).skip((curPage - 1) * pageSize).limit(parseInt(pageSize)).exec();
            for (let i = 0 ; i < list.length ; i++){
                let categoryObj = await Category.searchCategoryRoot(list[i].category_id);
                list[i].category_value = categoryObj.level3.name;
                list[i].category_level2_id = categoryObj.level2._id;
                list[i].category_level2_value = categoryObj.level2.name;
                list[i].category_level1_value = categoryObj.level1.name;
                list[i].category_level1_id = categoryObj.level1.id;
                list[i].createdTime = moment(list[i].created).format('YYYY-MM-DD HH:mm:ss');
                list[i].updatedTime = moment(list[i].updated).format('YYYY-MM-DD HH:mm:ss');
                list[i].auditTime = (list[i].audit_time)?(moment(list[i].audit_time).format('YYYY-MM-DD HH:mm:ss')):("");
                list[i].cleanCompletedDate = (list[i].clean_completed_date)?(moment(list[i].clean_completed_date).format('YYYY-MM-DD HH:mm:ss')):("");
                list[i].cleanDistributionDate = (list[i].clean_distribution_date)?(moment(list[i].clean_distribution_date).format('YYYY-MM-DD HH:mm:ss')):("");
                list[i].manualReviewDate = (list[i].manual_review_date)?(moment(list[i].manual_review_date).format('YYYY-MM-DD HH:mm:ss')):("");
            }
            return{
                list:list,
                curPage:parseInt(curPage),
                pageSize:parseInt(pageSize),
                totalCount:totalCount,
                totalPages:Math.ceil(totalCount / pageSize)
            }
        }catch (err){
            console.log(err)
        }
    },
    //任务列表查询
    getTaskList:async function (params) {
        // 需要支持模糊搜索 { $regex: params.name, $options: 'i' }
        let name = params.name || "";//名字
        let id = params.id || "";//名字
        let mainStatus = params.mainStatus || "";//主体状态
        let taskStatus = params.taskStatus;//任务状态
        let sortByUpdateTime = params.sortByUpdateTime || 1;//通过更新时间排序
        let pageSize = params.pageSize || 10;
        let curPage = params.curPage || 1;
        let totalCount = 0;
        let _filter = {
            $and: [
                {name: {$regex: name, $options: 'i'}},
                id ? {id_task: id} : {},
                mainStatus?{main_status:mainStatus}:{},
                taskStatus?{task_status:taskStatus}:{}
            ]
        };

        totalCount = await  this.count(_filter).exec();
        if (totalCount / pageSize < curPage && (totalCount / pageSize) % 1 === 0) {
            curPage = parseInt(totalCount / pageSize) === 0 ? 1 : parseInt(totalCount / pageSize);
        }
        let list = await this.find(_filter).sort({
            updated: parseInt(sortByUpdateTime)
        }).skip((curPage - 1) * pageSize).limit(parseInt(pageSize)).exec();
        for (let i = 0 ; i < list.length ; i++){
            list[i].createdTime = moment(list[i].created).format('YYYY-MM-DD HH:mm:ss');
            list[i].updatedTime = moment(list[i].updated).format('YYYY-MM-DD HH:mm:ss');
            list[i].auditTime = (list[i].audit_time)?(moment(list[i].audit_time).format('YYYY-MM-DD HH:mm:ss')):("");
        }
        return{
            list:list,
            curPage:parseInt(curPage),
            pageSize:parseInt(pageSize),
            totalCount:totalCount,
            totalPages:Math.ceil(totalCount / pageSize)
        }
    }
};
//注册mongoose模型，其他地方可以直接 mongoose.model('MainBody')调用
mongoose.model('MainBody', MainBodySchema);
