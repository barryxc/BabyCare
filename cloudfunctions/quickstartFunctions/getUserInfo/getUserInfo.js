const cloud = require("wx-server-sdk");
const {
  createIfNotExist,
  fetchUserInfo
} = require("../util/dbutils");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

async function main(event, params) {
  const tableName = "userInfo";
  //建表
  await createIfNotExist(tableName);
  //查询用户信息
  let userInfo = await fetchUserInfo();
  return userInfo;
}
exports.main = main;