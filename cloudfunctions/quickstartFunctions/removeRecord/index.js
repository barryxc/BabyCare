const cloud = require('wx-server-sdk');
const {
  createIfNotExist
} = require('../util/dbutils');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const tableName = "records";

// 创建集合云函数入口函数
exports.main = async (event, context) => {
  let {
    OPENID,
    APPID,
  } = cloud.getWXContext()
  //建表
  await createIfNotExist(tableName);

  let result = await db.collection('records').where({
    childId: event.childId,
    recordId: event.recordId,
    appId: APPID,
  }).get();

  if (!result.errMsg.includes('ok')) {
    return {
      success: false,
      errMsg: result
    }
  }

  let records = result.data;
  //记录不存在
  if (!records || records.length == 0) {
    return {
      success: true
    }
  }

  for (const item of records) {
    //如果存在图片
    if (item.imgSrc) {
      let deleteFileResult = await cloud.deleteFile({
        fileList: [item.imgSrc]
      })
      if (!deleteFileResult.errMsg.includes('ok')) {
        return {
          success: false,
          errMsg: deleteFileResult
        }
      }
    }
  }

  // data 字段表示需新增的 JSON 数据
  try {
    let result = await db.collection('records').where({
      childId: event.childId,
      recordId: event.recordId,
      appId: APPID,
    }).remove();

    if (result.errMsg.includes('ok') && result.stats.removed > 0) {
      return {
        success: true,
      }
    }
    return {
      success: false,
      errMsg: result
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errMsg: error
    };
  }
}