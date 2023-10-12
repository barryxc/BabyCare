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

  try {
    //创建表
    await createIfNotExist(tableName);

    let userInfo = await fetchUserInfo();

    let name = userInfo.name;
    let avatarUrl = userInfo.avatarUrl;

    //更新了头像
    if (event.avatarUrl && event.avatarUrl != avatarUrl) {
      let deleteResult = await cloud.deleteFile({
        fileList: [avatarUrl]
      });
      if (!deleteResult.errMsg.includes('ok')) {
        return {
          success: false,
          errMsg: deleteResult
        }
      }
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
  } catch (error) {
    console.error(error)
  }


}
exports.main = main;