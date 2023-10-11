const cloud = require('wx-server-sdk');
const {
  createIfNotExist,
  fetchUserInfo
} = require('../util/dbutils');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command
const tableName = "userInfo";
const records = 'records';

exports.main = async (event, context) => {
  let {
    OPENID
  } = cloud.getWXContext();
  try {
    //建表
    await createIfNotExist(tableName);
    await createIfNotExist(records);
    //查询用户记录
    let userinfo = await fetchUserInfo();

    let childs = userinfo.childs;

    //删除小宝下面的所有历史记录
    let deleteResult =await db.collection(records).where({
      openId: OPENID,
      childId: event.childId
    }).remove();

    if (!deleteResult.errMsg.includes('ok')) {
      return {
        success: false,
        errMsg: deleteResult
      }
    }

    if (Array.isArray(childs)) {
      childs = childs.filter((e) => {
        return e.childId != event.childId
      });
    }

    return db.collection(tableName).where({
      openId: OPENID,
    }).update({
      data: {
        childs: childs,
      }
    });

  } catch (e) {
    console.error(e)
  }
}