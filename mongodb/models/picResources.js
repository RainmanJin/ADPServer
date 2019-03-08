/*
 * @Author: jiapei.qiu 
 */
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const picSchema = new Schema({
  'subject_name': String,
  'id_subject': String,
  'id_task': String,
  'img_name': String,
  'saveAddress': String,
  'absAddress': String,
  'website': String,
  'status': Number, // 1保留、2删除
  'deliverStatus': Number, //移交状态 0：未移交； 1：已移交
  'des': String,
  'group': Number,
  'trainOrTest': {
    type: Number,
    default: 0
  }, // 0无状态、1训练集、2测试集
});
picSchema.pre('save', function (next) {
  next();
});
picSchema.statics = {
  // findById: async function (picId) {
  //   var picInfo = await this.findById(picId).exec();
  //   return picInfo;
  // }
};
picSchema.methods = {

};

mongoose.model('pictureResource', picSchema);