const cloud = require('wx-server-sdk');

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
    UNIONID
  } = cloud.getWXContext()
  //建表
  try {
    await db.createCollection(tableName);
  } catch (e) {
    console.error(e);
  }
  // data 字段表示需新增的 JSON 数据
  return await db.collection('records').add({
    data: {
      ...event.record,
      serverDate: new Date(),
      openId: OPENID,
      appId: APPID,
      unionId: UNIONID,
    }
  });
}