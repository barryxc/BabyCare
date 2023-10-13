const cloud = require("wx-server-sdk");
const {
  createIfNotExist,
  fetchUserInfo
} = require("../util/dbutils");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const tableName = "userInfo";

const SUCCESS = {
  success: true
}

async function main(event, params) {
  const {
    OPENID
  } = cloud.getWXContext();

  try {
    //创建表
    await createIfNotExist(tableName);
    let userInfo = await fetchUserInfo();

    let userId = event.userId;
    if (!userId) {
      return {
        success: false,
        errMsg: "userId is undefined"
      };
    }

    let bound = userInfo.bound;
    //没有bound的用户
    if (!bound || bound.length == 0) {
      return SUCCESS;
    }

    let index = bound.findIndex((e) => e == userId);
    if (index == -1) {
      return SUCCESS;
    }

    bound = bound.filter((e) => e != userId);
    let unBoundResult = await db.collection(tableName).where({
      openId: OPENID,
    }).update({
      data: {
        bound,
      }
    });

    if (!unBoundResult.errMsg.includes('ok')) {
      return {
        success: false,
        errMsg: unBoundResult,
      }
    }

    //解除双向绑定
    let bindUser = await fetchUserInfo(userId);
    if (!bindUser) {
      return SUCCESS;
    }

    let bind = bindUser.bind;
    if (!bind || bind.length == 0) {
      return SUCCESS;
    }

    if (!Array.isArray(bind)) {
      return SUCCESS;
    }

    let bindIndex = bind.findIndex((e) => e == OPENID);

    if (bindIndex == -1) {
      return SUCCESS;
    }

    bind = bind.filter((e) => e != OPENID);

    let updateResult = await db.collection(tableName).where({
      openId: userId
    }).update({
      data: {
        bind,
      }
    });

    if (!updateResult.errMsg.includes("ok")) {
      return {
        success: false,
        errMsg: updateResult,
      }
    }

    return SUCCESS;
  } catch (error) {
    console.error(error)
  }
}
exports.main = main;