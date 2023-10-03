const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const {
  createIfNotExist,
  fetchUserInfo
} = require("../util/dbutils");

async function main(event, params) {
  let {
    OPENID
  } = cloud.getWXContext();
  const db = cloud.database();

  try {
    const tableName = "userInfo";
    //建表
    await createIfNotExist(tableName);
    //查询用户信息
    let userInfo = await fetchUserInfo();
    if (!event.inviteId && !userInfo.bind) {
      return userInfo;
    }

    let bind = userInfo.bind;
    if (!bind) {
      bind = [];
    }
    let set = new Set(bind);
    if (event.inviteId) {
      set.add(event.inviteId);
    }
    bind = [...set];
    let bindResult = await db.collection(tableName).where({
      openId: OPENID
    }).update({
      data: {
        bind: bind
      }
    });
    if (!bindResult.errMsg.includes('ok')) {
      console.error('更新失败', bindResult);
      return userInfo;
    }

    if (Array.isArray(bind)) {
      for (const ele of bind) {
        let query = await db.collection(tableName).where({
          openId: ele
        }).get();
        let inviteUser = query.data[0];
        if (!inviteUser) {
          continue;
        }
        if (!inviteUser.childs) {
          continue;
        }
        //打上标记
        for (const child of inviteUser.childs) {
          child.shared = true;
        }
        if (!userInfo.childs) {
          userInfo.childs = [...childs];
          continue
        }
        userInfo.childs = [...userInfo.childs, ...inviteUser.childs];
      }
    }

    return userInfo;

  } catch (error) {
    console.error(error);
  }
  return {
    success: false,
  }
}
exports.main = main;