const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

async function main(event, params) {
  const db = cloud.database();
  const tableName = "userInfo";
  const {
    OPENID
  } = cloud.getWXContext();
  //建表
  try {
    await db.createCollection(tableName);
  } catch (e) {
    console.error(e);
  }
  //查询用户记录
  let results = await db.collection("userInfo").where({
    openId: OPENID
  }).get();

  let data = results.data;

  //不存在，则创建一条用户记录
  if (!data || (Array.isArray(data) && data.length == 0)) {
    let userInfo = {
      openId: OPENID,
      name: event.name,
      avatarUrl: event.avatarUrl,
      childs: [],
    }

    db.collection(tableName).add({
      // data 字段表示需新增的 JSON 数据
      data: {
        ...userInfo,
        when: new Date(),
      }
    })
    return userInfo;
  }

  let userInfo = data[0];
  let name = userInfo.name;
  let avatarUrl = userInfo.avatarUrl;

  if (event.avatarUrl) {
    avatarUrl = event.avatarUrl;
  }
  if (event.name) {
    name = event.name;
  }

  db.collection(tableName).where({
    openId: OPENID,
  }).update({
    data: {
      name,
      avatarUrl,
    }
  });
  return userInfo;

}
exports.main = main;