'use strict';
const users = require('../mongodb/controllers/usersLogin');
 

//登录
const loginUser = (req, res, next)=>{
  users.usersLogin(req, res, next);
};
//登出

const logoutUser = (req, res, next) =>{
  users.usersLogout(req, res,next);
};

//修改密码

const resetPasswordUser = (req, res, next) =>{
  users.resetPassword(req, res, next);
};
module.exports ={
  'POST /pic/manage/v1/login': loginUser,
  'POST /pic/manage/v1/logout':logoutUser,
  'POST /pic.manage/v1/resetpassword':resetPasswordUser
};