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
  try {
    await createIfNotExist(tableName);
    //查询
    let recordId = event.record.recordId;
    let queryResult = await db.collection(tableName)
      .where({
        recordId,
      }).get();

    //查询失败
    if (!queryResult.errMsg.includes('ok')) {
      return {
        success: false
      }
    }
    //查询存在
    if (queryResult.data.length != 0) {
      let setResult = await db.collection(tableName).where({
        recordId,
      }).update({
        data: {
          ...event.record,
          lastModifyTime: Date.now(),
          creatorId: OPENID,
          appId: APPID,
        }
      });

      if (!setResult.errMsg.includes("ok")) {
        return {
          success: false
        }
      }
      return {
        success: true
      }
    }

    //查询不存在
    // data 字段表示需新增的 JSON 数据
    let addResult = await db.collection(tableName).add({
      data: {
        ...event.record,
        lastModifyTime: Date.now(),
        creatorId: OPENID,
        appId: APPID,
      }
    });
    if (!addResult.errMsg.includes("ok")) {
      return {
        success: false
      }
    }

    return {
      success: true
    };
  } catch (error) {
    console.error(error);
    return {
      success: false
    };
  }
}