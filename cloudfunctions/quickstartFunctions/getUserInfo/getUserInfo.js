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

    //被邀請了,排除自己点击的情况和过期的情况
    if (event.expire && event.inviteId && event.inviteId != userInfo.openId) {
      let now = Date.now();
      let expire = new Date(event.expire).getTime();

      //未过期
      if (now < expire) {
        //绑定邀请人
        let bind = userInfo.bind;
        if (!bind) {
          bind = [];
        }
        let set = new Set(bind);
        set.add(event.inviteId);
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

        //双向绑定
        //获取邀请的用户信息
        let inviteUser = await fetchUserInfo(event.inviteId);
        let bound = inviteUser.bound;
        if (!bound) {
          bound = [];
        }
        set = new Set(bound);
        set.add(OPENID);
        bound = [...set];

        bindResult = await db.collection(tableName).where({
          openId: event.inviteId,
        }).update({
          data: {
            bound: bound
          }
        });

        if (!bindResult.errMsg.includes('ok')) {
          console.error('更新失败', bindResult);
          return userInfo;
        }
      }
    }




    //把绑定的账号下的childs都追加到当前用户上
    let bind = userInfo.bind;
    if (bind && Array.isArray(bind)) {
      for (const ele of bind) {
        let inviteUser = await fetchUserInfo(ele);
        if (!inviteUser) {
          continue;
        }
        if (!inviteUser.childs) {
          continue;
        }
        //打上标记
        for (const child of inviteUser.childs) {
          child.shared = true;
          child.creator = {
            name: inviteUser.name,
            openId: inviteUser.openId,
          };
        }
        if (!userInfo.childs) {
          userInfo.childs = [...childs];
          continue
        }
        userInfo.childs = [...userInfo.childs, ...inviteUser.childs];
      }
    }

    //把訂閱的用戶掛連上
    let bound = userInfo.bound;
    if (bound) {
      let boundUsers = [];
      for (const ele of bound) {
        let boundUser = await fetchUserInfo(ele);
        boundUsers.push(boundUser);
      }
      userInfo.boundUsers = boundUsers;
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