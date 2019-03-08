/*
 * @Author: jiapei.qiu 
 */
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const configSchema = new Schema({
  'trainRatio': {
    type: Number,
    default: 0.7,
  },
});
configSchema.pre('save', function (next) {
  next();
});
configSchema.statics = {
  // findById: async function (picId) {
  //   var picInfo = await this.findById(picId).exec();
  //   return picInfo;
  // }
};
configSchema.methods = {

};

mongoose.model('config', configSchema);