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
    if (!childs || !Array.isArray(childs)) {
      return {
        success: true
      }
    }

    //删除小宝下面的所有历史记录，无论小宝是否存在
    let deleteResult = await db.collection(records).where({
      openId: OPENID,
      childId: event.childId
    }).remove();

    if (!deleteResult.errMsg.includes('ok')) {
      return {
        success: false,
        errMsg: deleteResult
      }
    }

    let index = childs.findIndex((e, i) => e.childId == event.childId);
    let child = childs[index];

    //不存在小宝的情况直接返回成功
    if (!child) {
      return {
        success: true
      }
    }

    //如果小宝存在头像
    if (child.avatar) {
      let deleteFileResult = await cloud.deleteFile({
        fileList: [child.avatar]
      })
      if (!deleteFileResult.errMsg.includes('ok')) {
        return {
          success: false,
          errMsg: deleteFileResult
        }
      }
    }

    //删除小宝
    childs = childs.filter((e) => {
      return e.childId != event.childId
    });
    let result = await db.collection(tableName).where({
      openId: OPENID,
    }).update({
      data: {
        childs: childs,
      }
    });
    if (!result.errMsg.includes('ok') || result.stats.updated <= 0) {
      return {
        success: false,
        errMsg: result
      }
    }

    //返回成功
    return {
      success: true,
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      errMsg: e
    }
  }
}