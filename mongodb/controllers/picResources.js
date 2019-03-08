

/*
 * @Author: jiapei.qiu
 */
'use strict';
const mongoose = require('mongoose');
const PictureResource = mongoose.model('pictureResource');
const MainBody = mongoose.model('MainBody');
const globalConfig = require('./globalConfig');

const request = require('request');
const { isArray } = require('util');
const { resData } = require('../../util/common');
const log = require('../../util/logger').getLogger('system');
const main = require('./mainBody');


const picListBak = {
  totalCount: '',
  data: [],
  websiteCount: [],
  picStatus: []
};
const PIC_STATUS = [{
  'k': '保留',
  'val': 1
}, {
  'k': '删除',
  'val': 2
}];
// 获取图片资源
const getPicResourcesFromDb = async (req, res, next) => {

  let idWebsite = req.query.idWebsite; //网址id
  let idSubject = req.query.idSubject; //主体id
  let nameWebsites = []; //包含网站
  let picStatus = req.query.status; //图片状态(1:保留，2:删除)
  let deliverStatus = req.query.deliverStatus; //图片移交状态(0：未移交，1:已移交)
  let currentPage = req.query.currentPage || 1;
  let pageSize = req.query.pageSize || 100;
  let start = (parseInt(currentPage) - 1) * parseInt(pageSize);

  let options = {};
  let webArr = [],
    picStatusArr = [];

  if (idSubject === undefined || idSubject === '') {
    return res.send(resData(-1, '参数不正确'));
  }
  if (picStatus === undefined) {
    return res.send(resData(-1, '参数不正确'));
  }
  if (deliverStatus === undefined) {
    return res.send(resData(-1, '参数不正确'));
  }
  if (idWebsite === undefined) {
    return res.send(resData(-1, '参数不正确'));
  }
  if (picStatus === '' && idWebsite === '') {
    options['id_subject'] = idSubject;
  } else if (idWebsite === '' && picStatus !== '') {
    options['id_subject'] = idSubject;
    options['status'] = picStatus;
    // options['deliverStatus'] = deliverStatus;
  } else if (picStatus === '' && idWebsite !== '') {
    options['id_subject'] = idSubject;
    options['website'] = idWebsite;
  } else {
    options['id_subject'] = idSubject;
    options['website'] = idWebsite;
    options['status'] = picStatus;
  }
  try {
    let websites = await MainBody.findById(
      idSubject
    ).exec();

    nameWebsites = websites.websites;
    console.log(nameWebsites);
    for (let i = 0; i < nameWebsites.length; i++) {
      let webObj = {};
      let count = await PictureResource
        .count({
          'id_subject': idSubject,
          'website': nameWebsites[i].name
        });
      let retentionCount = await PictureResource
        .count({
          'id_subject': idSubject,
          'website': nameWebsites[i].name,
          'status': 1
        });
      webObj.name = nameWebsites[i].name;
      webObj.count = count;
      webObj.retentionCount = retentionCount;
      webArr.push(webObj);
    }

    for (let j = 0; j < PIC_STATUS.length; j++) {
      let count = await PictureResource.count({
        'id_subject': idSubject,
        'status': PIC_STATUS[j].val
      });
      picStatusArr.push({
        'label': PIC_STATUS[j].k,
        'count': count
      });
    }
    let totalCount = await PictureResource
      .count({
        'id_subject': idSubject
      });

    let deliverCount =  await PictureResource
    .count({
      'id_subject': idSubject,
      'status': 1,
      'deliverStatus': deliverStatus,
    }); 

    let docs = await PictureResource
      .find(options)
      .skip(start)
      .limit(parseInt(pageSize))
      .lean()
      .exec();

    picListBak.totalCount = totalCount;
    picListBak.deliverCount = deliverCount;
    picListBak.websiteCount = webArr;
    picListBak.picStatus = picStatusArr;
    picListBak
      .data = docs;
    return res.send(resData(0, 'request success', picListBak));
  } catch (error) {
    return res.send(resData(-1, '服务器异常'));
  }
};

const addPicResources = async (options) => {
  // console.log('排查--1：数据入库部分');
  let originData = options;
  if (originData.name) {
    let source = originData.source;
    let docs = [];
    for (let i = 0; i < source.length; i++) {
      let picList = source[i].list;
      for (let j = 0; j < picList.length; j++) {
        docs.push({
          'subject_name': originData.name,
          'id_subject': originData.subjectId,
          'id_task': originData.taskId,
          'img_name': picList[j],
          'saveAddress': originData.saveAddress,
          'absAddress': originData.absAddress,
          'website': source[i].fileName,
          'status': 1, // 默认状态
          'deliverStatus': 0,   //默认没移交
          'des': '',
          'group': 0, // 默认状态
        });
      }
    }
    try {
      var insertResult = await PictureResource
        .collection
        .insert(docs);
      if (insertResult.error) {
        return {
          code: -1,
          msg: '数据入库失败：' + JSON.stringify(insertResult.error)
        };
      }
      return {
        code: 0,
        msg: '数据入库成功'
      };
    } catch (error) {
      return {
        code: -1,
        msg: '数据入库失败：' + JSON.stringify(error)
      };
    }

  } else {
    return {
      code: -1,
      msg: '数据入库失败'
    };
  }
};

// 清洗图片跟新图片状态 删除、恢复
const uploadPicStatus = async (req, res, next) => {
  let status = req.body.status;
  let picId = req.body.id;
  let totalClean = req.body.totalClean;
  let subjectId = req.body.subjectId;

  if (!status || !picId || !totalClean || !subjectId) {
    res.send(resData(1002, '缺少参数', null));
    return;
  }

  PictureResource.findById(picId, async function(err, data) {
    if (data) {
      // console.log('xxxx', subjectId, ',', totalClean, MainBody);
      await main.updateMainBodyAfterClean({subjectId, totalClean});
      data.status = status;
      data.save(function(error, data) {
        if (error) {
          return res.send(resData(-1, '操作失败!'));
        }
        return res.send(resData(0, 'success!'));
      });
    } else {
      return res.send(resData(-1, '操作失败!'));
    }
  });
};

// 算法非主体图片去除后的回调函数
const afterFilterSubject = async (req, res, next) => {

  var queryParams = req.body;
  if(!queryParams.subjectId || !queryParams.subjectName || !queryParams.picList){
      res.send(resData(1002,'缺少参数',null));
      return;
  }
  if(!isArray(queryParams.picList)){
    res.send(resData(1003,'参数格式不正确：picList必须为数组',null));
    return;
  }
  
  // console.log('queryParams.picList==', queryParams.subjectName, 'sdfsdlf', queryParams.picList);
  for(let i=0,len=queryParams.picList.length;i<len;i++){
    try {
      let updateResult = await PictureResource.findOneAndUpdate({
        img_name:queryParams.picList[i].picName
      },{
        $set:{
          status:queryParams.picList[i].picNoSubject
        }
      });
    } catch (error) {
      log.error('[算法]更新资源表清洗状态失败;DETAILS-'+JSON.stringify(error));
      continue;
    }
    
  }
  res.send(resData(0,'success',null));
};

// 清洗审核时：移交主体图片到算法服务器
const picCopyToAlgorithm = async (req, res, next) => {
  let subjectId = req.body.subjectId;
  let classify = req.body.classify; // 类别：删除、保留
  let manualReviewStatus = req.body.manualReviewStatus; // 人工审核状态[0.全部,1.待审核,2.退回,3.审核通过]

  let picList = [];
  let subjectName = '';
  let subjectPicPath = '';
  if (!subjectId || !classify) {
    res.send(resData(1002, '缺少参数', null));
    return;
  }
  let _filter ={
    $and : [
      { id_subject: subjectId },
      { status: classify }
    ]
  };
  // 获取移交配置比例
  let trainRatio = await globalConfig.trainRatio();
  // 人工审核通过，修改主体的审核状态
  await main.manualReview({subjectId, manualReviewStatus});

  PictureResource.find(_filter, async function(err, data) {
    if (data) {
      let count = data.length;
      let trainPicCount = Math.floor(count*trainRatio); // 计算训练集的图片数量
      for (let i = 0; i < count; i++) {
        if (i === 1) {
          subjectName = data[i].subject_name;
          subjectPicPath = data[i].saveAddress;
        }
        data[i].trainOrTest = i < trainPicCount ? 1 : 2;
        data[i].save();
        picList.push(`${data[i].website}/${data[i].img_name}`);
      }

      // 请求算法参数整理
      let param = {
        requestId: Date.parse( new Date()),
        subjectName,
        subjectPicPath,
        picList
      };

      request({
        url: 'http://172.30.144.24:8620/algorithm/v1/fetchSubjectPic',
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: param,
      }, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log('body', body);
          }
      });

      return res.send(resData(0, 'success'));
    } else {
      return res.send(resData(-1, 'error!'));
    }
  });
};



module.exports = {
  getPicResourcesFromDb: getPicResourcesFromDb,
  addPicResources: addPicResources,
  uploadPicStatus: uploadPicStatus,
  afterFilterSubject: afterFilterSubject,
  picCopyToAlgorithm: picCopyToAlgorithm
};