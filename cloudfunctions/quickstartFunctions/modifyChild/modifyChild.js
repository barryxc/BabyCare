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

exports.main = async (event, context) => {
  let {
    OPENID
  } = cloud.getWXContext();
  try {
    //建表
    await createIfNotExist(tableName);
    //查询用户记录
    let userinfo = await fetchUserInfo();
    let childs = userinfo.childs;

    if (!childs || childs.length == 0) {
      return {
        success: false,
        errMsg: 'not exist'
      }
    }

    let index = childs.findIndex((e) => e.childId == event.childId);
    if (index == -1) {
      return {
        success: false,
        errMsg: 'not exist'
      }
    }
    let oldChildInfo = childs[index];

    //存在头像，则删除头像
    if (oldChildInfo.avatar) {
      let deleteResult = await cloud.deleteFile({
        fileList: [oldChildInfo.avatar]
      })
      if (!deleteResult.errMsg.includes('ok')) {
        return {
          success: false,
          errMsg: deleteResult
        }
      }
    }
    
    //更新小宝信息
    childs[index] = event.child;

    let result = await db.collection(tableName).where({
      openId: OPENID,
    }).update({
      data: {
        childs: childs,
      }
    });

    //修改失败
    if (!result.errMsg.includes('ok') && result.stats.updated <= 0) {
      return {
        success: false,
        errMsg: result
      }
    }
    //修改成功
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