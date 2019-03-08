/**
 * Created by weijian.lin on 2018/5/21.
 */
'use strict';
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const MainBody = mongoose.model('MainBody');
let resData = require('../../util/common').resData;
/*
* 补0函数
* */

async function  addPreZero(num,slice_num){
    return ('0000000000000'+num).slice(-slice_num);
}
/*
* 获取serialNumberArray
* */
async function  getMaxSerialNumber(array,level){
    let data = [];
    let maxSerialNumber = 0;
    for(let i = 0 ; i < array.length ; i++){
        let str = array[i].serial_number;
        if(level == 1 || level == 2){
            data.push(str.substr(str.length-3,3))
        }else if(level == 3)  {
            data.push(str.substr(str.length-5,5))
        }
    }
    if(data.length > 0){
        maxSerialNumber = Math.max.apply( Math, data );
    }
    return maxSerialNumber;
}
/*
*
* 测试mongodb的数据承载能力
* */
/*async function  inputData(level){
    for(let i = 1 ; i < 5000 ; i++){
        let params = {
            name:'二级名字'+i,
            level:level,
            parent_id:'5b2367b738e3e01624a0fc9e'
        };
        try {
            console.log(JSON.stringify(params));
            await  Category.create(params);
        } catch (error) {
            console.log(error);
        }
    }

}*/
/**数据统一发送格式
 * @code      {Number}           请求状态
 * @msg      {String}           解释信息
 * @data       {Array/Object}     返回数据
 */
exports.addCategory = async (req,res,next)=> {
    let params = {
        name:req.body.name,
        level:req.body.level,
        parent_id:req.body.parentId
    };
    if(!req.body || !params.name || params.level == '' || params.parent_id == null || params.parent_id == undefined){
        res.send(resData('-1','参数不能为空',{}));
        return;
    }
    let duplicatedFlag = await  Category.duplicatedName(params.name,params.parent_id);
    if(duplicatedFlag){
        res.send(resData('-1','已经存在'+params.name+'这个名字',{}));
        return;
    }
    let serial_num_1='',serial_num_2='',serial_num_3='';
    if(params.level == 3){
        let level1Array = await Category.find({parent_id: params.parent_id}).exec();
        //找出serial_number最大值
        let level3MaxSerialNumber =await getMaxSerialNumber(level1Array,3);
        serial_num_3 =await addPreZero(level3MaxSerialNumber+1,5) ;
        let parentObj =  await Category.find({_id: params.parent_id}).exec();
        serial_num_2 = parentObj[0].serial_number;
    }else if(params.level == 2){
        let level2Array = await Category.find({parent_id: params.parent_id}).exec();
        //找出serial_number最大值
        let level2MaxSerialNumber = await getMaxSerialNumber(level2Array,3);
        serial_num_2 =await addPreZero(level2MaxSerialNumber+1,3) ;
        let rootObj =  await Category.find({_id:  params.parent_id}).exec();
        serial_num_1 = rootObj[0].serial_number;
    }else if(params.level == 1){
        let level1Array = await Category.find({level: params.level}).exec();
        //找出serial_number最大值
        let level1MaxSerialNumber = await getMaxSerialNumber(level1Array,3);
        serial_num_1 = 'T'  + await addPreZero(level1MaxSerialNumber+1,3) ;
    }
    if(params.parent_id !=0 && params.parent_id != null ){
        let fatherLeaf= await Category.find({_id: params.parent_id}).exec();
        params.parent_name = fatherLeaf[0].name;
    }
    params.serial_number = serial_num_1+serial_num_2+serial_num_3;
    try {
        await  Category.create(params);
        res.send(resData('0','保存成功',{}));
    } catch (error) {
        res.send(resData('-1','保存失败',{}));
    }
};
exports.updateCategory = async (req,res,next)=> {
    let  conditions = {
        _id:req.body.id
    };
    let params = {
        name:req.body.name,
        parent_id:req.body.parentId
    };
    if(!req.body || !params.name || !conditions._id){
        res.send(resData('-1','参数不能为空',{}));
        return;
    }
    let duplicatedFlag = await  Category.duplicatedName(params.name,params.parent_id,conditions._id);
    if(duplicatedFlag){
        res.send(resData('-1','已经存在'+params.name+'这个名字',{}));
        return;
    }
    try {
        await  Category.update(conditions,{$set: params});
        let childList = await  Category.find({parent_id:conditions._id});
        for (let i = 0 ; i < childList.length  ; i++){
            await  Category.update({_id:childList[i]._id},{$set: {parent_name:params.name}});
        }
        res.send(resData('0','保存成功',{}));
    } catch (error) {
        res.send(resData('-1','保存失败',{}));
    }
};
exports.getCategory =async (req,res,next)=> {
    //await inputData(2);
    try{
        var list = await  Category.list();
        res.send(resData('0','成功',list));
    } catch (error){
        res.send(resData('-1','失败',{}));
    }
};
exports.deleteCategory = async (req,res,next)=> {
    let  conditions = {
        _id:req.body.id
    };
    if(!req.body || !conditions._id){
        res.send(resData('-1','参数不能为空',{}));
        return;
    }
    let isExist = await Category.find({_id: conditions._id}).exec();
    //如果删除的时候没有这个ID，则直接返回错误
    if(isExist.length < 1){
        res.send(resData('-1','没有找到ID,可能已被其他终端删除',{}));
        return;
    }
    let mainBodyList = await MainBody.find({category_id: conditions._id}).limit(1).exec();
    if(mainBodyList.length > 0){
        res.send(resData('-1','此项分类已经挂载了主体，不能删除！',{}));
        return;
    }
    try {
        let delFlag = await Category.removeById(conditions);
        if(!delFlag){
            res.send(resData('-1','分类下有子分类不能删除',{}));
        }else {
            res.send(resData('0','删除成功',{}));
        }
    } catch (error) {
        res.send(resData('-1','删除失败',{}));
    }
};
