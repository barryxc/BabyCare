const selectRecord = require('./selectRecord/index');
const updateRecord = require('./updateRecord/index');
const insertRecord = require('./insertRecord/index');
const removeRecord = require('./removeRecord/index');

const getUserInfo = require("./getUserInfo/getUserInfo");
const updateUserInfo = require("./updateUserInfo/updateUserInfo");

const addChild = require("./addChild/addChild");
const deleteChild = require("./deleteChild/deleteChild");
const modifyChild = require("./modifyChild/modifyChild");


// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    //查询
    case 'selectRecord':
      return await selectRecord.main(event, context);
      //更新
    case 'updateRecord':
      return await updateRecord.main(event, context);
      //添加
    case 'insertRecord':
      return await insertRecord.main(event, context);
      //删除
    case 'deleteRecord':
      return await removeRecord.main(event, context);


      //获取用户信息
    case 'getUserInfo':
      return await getUserInfo.main(event, context);
      //修改用户信息
    case 'updateUserInfo':
      return await updateUserInfo.main(event, context);


      //添加宝宝
    case 'addChild':
      return await addChild.main(event, context);
      //删除宝宝
    case 'deleteChild':
      return await deleteChild.main(event, context);
      //修改宝宝信息
    case 'modifyChildInfo':
      return await modifyChild.main(event, context);
  }
};