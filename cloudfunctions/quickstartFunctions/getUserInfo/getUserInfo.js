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
      name:"",
      childs:[],
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

  return data[0];
}
exports.main = main;