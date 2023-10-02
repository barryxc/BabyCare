const cloud = require("wx-server-sdk");
const {
  createIfNotExist,
  fetchUserInfo
} = require("../util/dbutils");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

async function main(event, params) {
  const db = cloud.database();
  const tableName = "userInfo";
  const {
    OPENID
  } = cloud.getWXContext();

  //创建表
  createIfNotExist(tableName);

  let userInfo = await fetchUserInfo();

  let name = userInfo.name;
  let avatarUrl = userInfo.avatarUrl;

  if (event.avatarUrl) {
    avatarUrl = event.avatarUrl;
  }
  if (event.name) {
    name = event.name;
  }
  return db.collection(tableName).where({
    openId: OPENID,
  }).update({
    data: {
      name,
      avatarUrl,
    }
  });
}
exports.main = main;