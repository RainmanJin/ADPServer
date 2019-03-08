'use strict';
const mongoose = require('mongoose');

const tokenModel = mongoose.model('usersToken');
const { resData } = require('../../util/common');


const tokenSave = async (tokenInfo)=>{
  console.log(tokenInfo);
  try{
    let result = '';
    let code,msg;
    result = await tokenModel.find({'userName':tokenInfo.userName});
    console.log(result);
    if(result.length === 0){
      let inResult = await tokenModel.collection.insert(tokenInfo);
      console.log('---初始化登录----');
      console.log(inResult);
      if(inResult.result.ok === 1){
        code = 0;
        msg = '插入数据成功';
      }else{
        code = -1;
        msg = '插入数据失败';
      }
    }else{
      let conditions = {userName:tokenInfo.userName};
      let updates = {$set:{token:tokenInfo.token}};
      let updateResult = await tokenModel.update(conditions,updates);
      console.log(updateResult);
      if(updateResult.ok === 1){
        code = 0;
        msg = '更新数据成功';
      }else{
        code = -1;
        msg = '更新数据失败';
      }
    }
    return resData(code,msg);
  }
  catch(error){
    return resData(-1,'数据异常');
  }
};
module.exports = {
  tokenSave
};