/*
 * @Author: jiapei.qiu 
 */
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  'userName':String,
  'token':String
});

mongoose.model('usersToken',tokenSchema);