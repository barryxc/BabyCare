const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const tableName = "records";

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
  let {
    OPENID,
    APPID,
  } = cloud.getWXContext()
  try {
    await db.createCollection(tableName);
  } catch (e) {
    console.error(e);
  }
  if (!event.childId) {
    return [];
  }
  return await db.collection(tableName).where({
    day: event.day,
    childId: event.childId,
    openId: OPENID,
    appId: APPID
  }).limit(100).get();

};