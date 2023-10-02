const cloud = require('wx-server-sdk');
const {
  createIfNotExist,
  fetchUserInfo
} = require('../util/dbutils');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

const userTable = "userInfo";

exports.main = async (event, context) => {
  let {
    OPENID
  } = cloud.getWXContext();
  try {
    //不存在则建表
    createIfNotExist(userTable);
    //获取用户信息
    let userInfo = await fetchUserInfo();
    let childs = userInfo.childs;
    if (!childs) {
      childs = [];
    }
    childs.push(event.child);
    return db.collection(userTable).where({
      openId: OPENID,
    }).update({
      data: {
        childs: childs,
      }
    });
  } catch (e) {
    console.error(e)
  }
  return {
    success: false
  };
}