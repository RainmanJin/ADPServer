'use strict';
const mongoose = require('mongoose');
const app = require('express');
const User = mongoose.model('User');
const tokenModel = mongoose.model('usersToken');
const {tokenSave} = require('./usersToken');

const jwt = require('jsonwebtoken');
const {
  resData
} = require('../../util/common');

//登录
const usersLogin = async (req, res ,next)=> {

  let {userName,passWord} = req.body;
  console.log(req.header);
  let userInfoDb = await User.findOne({username:userName}).lean().exec();
  if(userInfoDb === null){
    return res.send(resData(-1,'用户名输入错误'));
  }
  if(passWord === userInfoDb.password){
    console.log('------------------------生成token---------------------');
    let token  = jwt.sign(userInfoDb,'superSecret',{expiresIn : '1h'});
    console.log(token);

    let decoded  = jwt.verify(token,'superSecret');
    console.log(decoded);
    let result = await tokenSave({userName,token});
    console.log(result);
    if(result.code === 0){
      return res.send(resData(0,'登陆成功',{userName,token}));
    }else{  
      return res.send(resData(-1,'登陆失败'));
    }
  }else{
    return res.send(resData(-1,'密码输入错误'));
  }
};
// 登出
const usersLogout = async (req,res,next) =>{
  let token = req.headers.authorization;
  console.log(token);
  try{
    // let userInfo = jwt.verify(token,'superSecret');
    // console.log(userInfo);
    // let result = await tokenModel.remove({'token':token});    
    return res.send(resData(-11,'退出登录'));
  }catch (error){
    return res.send(resData(-1,error));
  }

};
// 修改密码

const resetPassword = async (req, res, next) =>{

};

module.exports = {
  usersLogin:usersLogin,
  usersLogout:usersLogout,
  resetPassword:resetPassword
};