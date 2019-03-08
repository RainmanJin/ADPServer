'use strict';
const util = require('util'),//node模块 格式化JSON数据
    mongo = require('../mongodb/controllers/mainBody');

//新增主体
let addMainBody = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/addMainBody 新增主体
     * @apiName addMainBody
     * @apiGroup MainBody
     * @apiParam {String} name 名字
     * @apiParam {String} mainImage 主图
     * @apiParam {Array} typicalDiagram 典型图
     * @apiParam {Array} alias 别名
     * @apiParam {String} title 标题
     * @apiParam {String} cleanRequire 清洗要求
     * @apiParam {String} description 描述
     * @apiParam {String} country 国家
     * @apiParam {String} province 省份
     * @apiParam {String} categoryId 分类
     *@apiParamExample {json} Request-Example:
     *{
     *    'name':'西红柿',
     *   'mainImage': 'http://chuantu.biz/t6/331/1529473431x-1404793399.jpg',
     *   'typicalDiagram': ['http://chuantu.biz/t6/331/1529473431x-1404793399.jpg','http://chuantu.biz/t6/331/1529473431x-1404793399.jpg','http://chuantu.biz/t6/331/1529473431x-1404793399.jpg'],
     *   'alias':['番茄,'圣女果'],
     *   'title':'西红柿',
     *   'cleanRequire':'请认真洗菜',
     *   'description':'这是一个洗菜描述',
     *   'country':'中国',
     *   'province':'四川省',
     *   'categoryId':'5b29f4d5f845e52e3c176991'
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.addMainBody(req,res,next);
};
//获取主体列表
let getMainBody = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/getMainBody 获取主体列表
     * @apiName getMainBody
     * @apiGroup MainBody
     * @apiParam {String} name 名字
     * @apiParam {String} _id 主体ID
     * @apiParam {String} serialNumber 编号
     * @apiParam {String} beginTime 开始时间
     * @apiParam {String} endTime 开始时间
     * @apiParam {Number} auditStatus 审核状态[1.未审核，2.审核未通过，3.审核通过]
     * @apiParam {Number} mainTatus 主体状态[1.待爬虫，4.爬虫中，5.清洗中，6.训练中，7.测试中，8.已删除，9.已上线]
     * @apiParam {Number} taskStatus 任务状态[0:爬虫未启动，1:爬虫进行中，2：爬虫已完成,3:全部]
     * @apiParam {Number} manualReviewStatus 人工审核状态[1.待审核,2.退回,3.审核通过]
     * @apiParam {Number} transferStatus 移交状态[1.未移交,2.已移交]
     * @apiParam {Number} alreadyInTask 查找任务为空的主体，才能添加到任务中
     * @apiParam {Number} alreadyInTask 查找任务为空的主体，才能添加到任务中
     * @apiParam {String} clean_category  清洗任务类型[0:全部,1:新任务,2:退回任务]
     * @apiParam {String} clean_status  清洗状态[0.全部,1.未清洗,2.清洗中,3.清洗完全]
     * @apiParam {String} cleaner  清洗人员
     * @apiParam {String} sortByTotalCrawler  设定爬虫需要爬取的数量
     * @apiParam {String} sortByRealNumCrawler  爬虫后图片数量排序
     * @apiParam {String} sortByTotalClean  清洗后图片数量排序
     * @apiParam {String} sortByUpdateTime  按照更新时间排序
     * @apiParam {String} sortByCompleted  按照清洗完成时间排序
     * @apiParam {String} sortByManualReviewDate  按照审核时间排序
     * @apiParam {String} pageSize  分页size
     * @apiParam {String} curPage  当前页码
     * @apiSuccess {String} name  名字
     * @apiSuccess {String} main_image 主图
     * @apiSuccess {Array} typical_diagram 典型图
     * @apiSuccess {Array} alias 别名
     * @apiSuccess {String} title 标题
     * @apiSuccess {String} clean_require 清洗要求
     * @apiSuccess {String} description 描述
     * @apiSuccess {String} country 国家
     * @apiSuccess {String} province 省份
     * @apiSuccess {String} auditTime 审核时间
     * @apiSuccess {Number} audit_status 审核状态[1.未审核，2.审核未通过，3.审核通过]
     * @apiSuccess {Number} main_status 主体状态[1.待爬虫，4.爬虫中，5.清洗中，6.训练中，7.测试中，8.已删除，9.已上线]
     * @apiSuccess {Number} task_status 任务状态[0:爬虫未启动，1:爬虫进行中，2：爬虫已完成,3:全部]
     * @apiSuccess {Number} manual_review_status 人工审核状态[1.待审核,2.退回,3.审核通过]
     * @apiSuccess {Number} transfer_status 移交状态[1.未移交,2.已移交]
     * @apiSuccess {Number} training_number 训练集数量
     * @apiSuccess {Number} transfer_number 已移交数量
     * @apiSuccess {String} category_id 类别ID
     * @apiSuccess {String} serial_number 编号
     * @apiSuccess {String} total_crawler 爬虫完成后的图片总数量
     * @apiSuccess {String}  total_clean 清洗后的图片总数量
     * @apiSuccess {String} sort_by_total_clean 清洗后的图片总数量(升序-1,降序1)
     * @apiSuccess {String} sort_by_total_crawler 爬虫完成图片总数量(升序-1,降序1)
     * @apiSuccess {String}  task_main_body 任务记录
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *        code:0,
     *        msg:'success',
     *       data: {
                name: '名称',//名称
                main_image:  'http://chuantu.biz/t6/331/1529473431x-1404793399.jpg',//主图
                typical_diagram: ['http://chuantu.biz/t6/331/1529473431x-1404793399.jpg','http://chuantu.biz/t6/331/1529473431x-1404793399.jpg'],//典型图
                alias:'别名',//别名
                title:'标题',//标题
                clean_require:'清洗要求',//清洗要求
                description:'描述',//描述
                country:'中国',//国家
                province:'四川省',//省份
                auditTime:'2018-1-12',//审核时间
                auditStatus:'1',//审核状态[1.未审核，2.审核未通过，3.审核通过]
                mainStatus:'2',//主体状态[1.待爬虫，4.爬虫中，5.清洗中，6.训练中，7.测试中，8.已删除，9.已上线]
                category_id:'cccscsdcsdcsd',//类别ID
                totalCrawler:'1212',//爬虫完成后的图片总数量
                totalClean:'1233',//爬虫完成后的图片总数量
                sortByTotalClean:'-1',//清洗后的图片总数量(升序-1,降序1)
                sortByTotalCrawler:'-1',//爬虫完成图片总数量(升序-1,降序1)
                taskMainBody:[],//任务记录
                taskStatus:2,//任务状态[0:爬虫未启动，1:爬虫进行中，2：爬虫已完成,3:全部]
                manualReviewStatus:1,//人工审核状态[1.待审核,2.退回,3.审核通过],
                transfer_status:1,//移交状态[0.全部,1.未移交,2.已移交]
                training_number:122,//训练集数量
                transfer_number:32//已移交数量
     *          }
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.getMainBody(req,res,next);
};
//获取主体详情
let getMainBodyDetail = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/getMainBodyDetail 获取主体详情
     * @apiName getMainBodyDetail
     * @apiGroup MainBody
     * @apiParam {String} id 主体ID
     * @apiSuccess {String} name  名字
     * @apiSuccess {String} main_image 主图
     * @apiSuccess {Array} typical_diagram 典型图
     * @apiSuccess {Array} alias 别名
     * @apiSuccess {String} title 标题
     * @apiSuccess {String} clean_require 清洗要求
     * @apiSuccess {String} description 描述
     * @apiSuccess {String} country 国家
     * @apiSuccess {String} province 省份
     * @apiSuccess {String} audit_time 审核时间
     * @apiSuccess {String} audit_status 审核状态[1.未审核，2.审核未通过，3.审核通过]
     * @apiSuccess {String} main_status 主体状态[1.待爬虫，4.爬虫中，5.清洗中，6.训练中，7.测试中，8.已删除，9.已上线]
     * @apiSuccess {String} task_status 任务状态[0:爬虫未启动，1:爬虫进行中，2：爬虫已完成,3:全部]
     * @apiSuccess {String} category_id 类别ID
     * @apiSuccess {String} serial_number 编号
     * @apiSuccess {String} total_crawler 爬虫完成后的图片总数量
     * @apiSuccess {String}  total_clean 清洗后的图片总数量
     * @apiSuccess {String} sort_by_total_clean 清洗后的图片总数量(升序-1,降序1)
     * @apiSuccess {String} sort_by_total_crawler 爬虫完成图片总数量(升序-1,降序1)
     * @apiSuccess {String}  task_main_body 任务记录
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *        code:0,
     *        msg:'success',
     *       data: {
                name: '名称',//名称
                main_image:  'http://chuantu.biz/t6/331/1529473431x-1404793399.jpg',//主图
                typical_diagram: ['http://chuantu.biz/t6/331/1529473431x-1404793399.jpg','http://chuantu.biz/t6/331/1529473431x-1404793399.jpg'],//典型图
                alias:'别名',//别名
                title:'标题',//标题
                clean_require:'清洗要求',//清洗要求
                description:'描述',//描述
                country:'中国',//国家
                province:'四川省',//省份
                audit_time:'2018-1-12',//审核时间
                audit_status:'1',//审核状态[1.未审核，2.审核未通过，3.审核通过]
                main_status:'2',//主体状态[1.待爬虫，4.爬虫中，5.清洗中，6.训练中，7.测试中，8.已删除，9.已上线]
                task_status:'3',//任务状态[0:爬虫未启动，1:爬虫进行中，2：爬虫已完成,3:全部]
                category_id:'cccscsdcsdcsd',//类别ID
                total_crawler:'1212',//爬虫完成后的图片总数量
                total_clean:'1233',//爬虫完成后的图片总数量
                sort_by_total_clean:'-1',//清洗后的图片总数量(升序-1,降序1)
                sort_by_total_crawler:'-1',//爬虫完成图片总数量(升序-1,降序1)
                task_main_body:[]//任务记录
     *          }
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.getMainBodyDetail(req,res,next);
};
//修改主体
let updateMainBody  = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/updateMainBody 修改主体
     * @apiName updateMainBody
     * @apiGroup MainBody
     *
     * @apiParam {String} name 名字
     * @apiParam {String} mainImage 主图
     * @apiParam {Array} typicalDiagram 典型图
     * @apiParam {Array} alias 别名
     * @apiParam {String} title 标题
     * @apiParam {String} cleanRequire 清洗要求
     * @apiParam {String} description 描述
     * @apiParam {String} country 国家
     * @apiParam {String} province 省份
     *@apiParamExample {json} Request-Example:
     *{
     *     'id':'asdsdsdcsdcsdcsdcsdcsdc',
     *    'name':'西红柿',
     *   'mainImage': 'http://chuantu.biz/t6/331/1529473431x-1404793399.jpg',
     *   'typicalDiagram': ['http://chuantu.biz/t6/331/1529473431x-1404793399.jpg','http://chuantu.biz/t6/331/1529473431x-1404793399.jpg','http://chuantu.biz/t6/331/1529473431x-1404793399.jpg'],
     *   'alias':['番茄,'圣女果'],
     *   'title':'西红柿',
     *   'cleanRequire':'请认真洗菜',
     *   'description':'这是一个洗菜描述',
     *   'country':'中国',
     *   'province':'四川省',
     *   'categoryId':'5b29f4d5f845e52e3c176991'
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.updateMainBody(req,res,next);
};
//删除主体
let deleteMainBody  = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/deleteMainBody 删除主体
     * @apiName deleteMainBody
     * @apiGroup MainBody
     *
     * @apiParam {String} id  主体ID
     *@apiParamExample {json} Request-Example:
     *{
     *    'id':'asasas'
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.deleteMainBody(req,res,next);
};
//主体拆词检测
let keywordCheck  = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/keywordCheck 主体拆词检测
     * @apiName keywordCheck
     * @apiGroup MainBody
     *
     * @apiParam {String} name  主体名
     *@apiParamExample {json} Request-Example:
     *{
     *    'name':'西红柿蛋汤'
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.keywordCheck(req,res,next);
};
//通过主体id更新主体的任务id和爬虫数量
let addTaskId =  function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/addTaskId 通过主体id更新主体的任务id和爬虫数量
     * @apiName addTaskId
     * @apiGroup MainBody
     *
     * @apiParam {String} id  主体ID
     * @apiParam {String} idTask  任务ID
     * @apiParam {String} totalCrawler  爬虫图片数量
     * @apiParam {Array} taskList  任务数组
     * @apiParam {Number} taskStatus  任务状态[0:爬虫未启动，1:爬虫进行中，2：爬虫已完成，3:全部]
     *@apiParamExample {json} Request-Example:
     *[{
     * id:'xxxx',
     * idTask:'yyyyy',
     * totalCrawler:'zzzzzz',
     * taskStatus:'2'
     * },{
     * id:'xxxx',
     * idTask:'yyyyy',
     * totalCrawler:'zzzzzz'
     * taskStatus:'2'
     * }]
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.addTaskId(req,res,next);
};
//获取任务对应的主体
let getBodyByTaskId =  function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/getBodyByTaskId 获取任务对应的主体
     * @apiName getBodyByTaskId
     * @apiGroup MainBody
     *
     * @apiParam {String} id  任务ID
     * @apiParam {String} name  主体名字
     * @apiParam {Number} mainStatus  主体状态
     * @apiParam {Number} taskStatus  任务状态[0:爬虫未启动，1:爬虫进行中，2：爬虫已完成,3:全部]
     * @apiParam {Number} sortByUpdateTime  1是正序，-1是倒序
     * @apiParam {String} pageSize  分页size
     * @apiParam {String} curPage  当前页码
     *@apiParamExample {json} Request-Example:
     *{
     * id:'xxxxxxxxxxxxx',
     * 'name':'yyyy',
     * 'taskStatus':'3',
     * 'sortByUpdateTime':'-1',
     * 'pageSize':10,
     * 'curPage':1
     * }
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.getBodyByTaskId(req,res,next);
};
//主体名字通过审核
let examinationPassed = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/examinationPassed 主体名字通过审核
     * @apiName examinationPassed
     * @apiGroup MainBody
     *
     * @apiParam {String} id  主体ID
     * @apiParam {String} auditStatus  审核状态【1.未审核，2.审核不通过，3.审核通过】
     *@apiParamExample {json} Request-Example:
     *{
     *    'id':'xxxxx',
     *    'auditStatus':'2'
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.examinationPassed(req,res,next);
};
//清洗完成
let cleanCompleted = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/cleanCompleted 清洗完成
     * @apiName cleanCompleted
     * @apiGroup MainBody
     *
     * @apiParam {String} id  主体ID
     *@apiParamExample {json} Request-Example:
     *{
     *    'id':'xxxxx'
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.cleanCompleted(req,res,next);
};
//分配清洗人员
let cleanDistribution = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/cleanDistribution 分配清洗人员
     * @apiName cleanDistribution
     * @apiGroup MainBody
     * @apiParam {Array} distributionList  主体分配列表[id:主体ID,cleanerId:清洗用户ID,cleaner:清洗用户名]
     *@apiParamExample {json} Request-Example:
     *{
     *    'distributionList':[{
     *    	"id":"xxx",
     *      "name":"鱼香肉丝",
	 *      "cleanerId":"yyy",
	 *      "cleaner":"张三",
	 *      "email":"123@phicomm.com"
     *    },{
     *    	"id":"qweqqwe",
	 *      "userId":"xxasx",
	 *      "username":"李四"
     *    }]
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.cleanDistribution(req,res,next);
};
//重新分配清洗人员
let cleanRedistribution = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/cleanRedistribution 重新分配清洗人员
     * @apiName cleanRedistribution
     * @apiGroup MainBody
     * @apiParam {String} id  主体ID
     * @apiParam {String} cleanerId  清洗人员ID
     * @apiParam {String} cleaner  清洗人员名字
     *@apiParamExample {json} Request-Example:
      *  {
     *    	"id":"xxx",
     *      "name":"鱼香肉丝",
	 *      "cleanerId":"yyy",
	 *      "cleaner":"张三",
	 *      "email":"123@phicomm.com"
     *    }
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.cleanRedistribution(req,res,next);
};
//人工审核退回
let manualReviewBack = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/manualReview 人工审核
     * @apiName manualReview
     * @apiGroup MainBody
     *
     * @apiParam {String} id  主体ID
     * @apiParam {Number} manualReviewStatus  人工审核状态[1.待审核,2.退回,3.审核通过]
     *@apiParamExample {json} Request-Example:
     *{
     *    'id':'xxxxx',
     *    'manualReviewStatus':3
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.manualReviewBack(req,res,next);
};
//根据deliverId获取主体列表
let getMainBodyListByDeliverId = function (req,res,next) {
    /**
     * @api {POST} /pic/manage/v1/getMainBodyListByDeliverId 根据deliverId获取主体列表
     * @apiName getMainBodyListByDeliverId
     * @apiGroup MainBody
     * @apiParam {Number} id  移交id
     * @apiParam {Number} pageSize
     * @apiParam {Number} curPage
     *@apiParamExample {json} Request-Example:
     *{
     *    'id':'xxxxx'
     *}
     * @apiSuccess {String} code  状态
     * @apiSuccess {String} data  数据
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       'code': 0',
     *       'msg': '成功',
     *       'data':{}
     *     }
     *
     * @apiError -1 失败
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       'code': -1',
     *       'msg': '失败',
     *       'data':{}
     *     }
     */
    mongo.getMainBodyListByDeliverId(req,res,next);
};

//公共接口
module.exports = {
    'POST /pic/manage/v1/getMainBody':getMainBody,        //获取主体
    'POST /pic/manage/v1/addMainBody':addMainBody ,       //新增主体
    'POST /pic/manage/v1/deleteMainBody':deleteMainBody,        //删除主体
    'POST /pic/manage/v1/updateMainBody':updateMainBody,        //修改主体
    'POST /pic/manage/v1/getMainBodyDetail':getMainBodyDetail,        //获取主体详情
    'POST /pic/manage/v1/examinationPassed':examinationPassed,        //主体通过审核
    'POST /pic/manage/v1/keywordCheck':keywordCheck,        //主体拆词检测
   /* 'POST /pic/manage/v1/addTaskId':addTaskId,        //主体关联任务ID*/
    'POST /pic/manage/v1/getBodyByTaskId':getBodyByTaskId,        //获取任务对应的主体
    'POST /pic/manage/v1/cleanDistribution':cleanDistribution,       //主体分配清洗人员
    'POST /pic/manage/v1/cleanRedistribution':cleanRedistribution,       //主体分配清洗人员
    'POST /pic/manage/v1/cleanCompleted':cleanCompleted ,      //清洗完成
    'POST /pic/manage/v1/manualReviewBack':manualReviewBack,       //人工审核退回  (人工审核通过在picResources.js中)
    'POST /pic/manage/v1/getMainBodyListByDeliverId':getMainBodyListByDeliverId     //根据deliverId获取主体列表

};