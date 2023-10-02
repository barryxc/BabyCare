const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
let {
  OPENID
} = cloud.getWXContext();

async function isExist(collectionName) {
  // 获取集合的信息
  try {
    const collection = await db.collection(collectionName).get()
    // 判断集合是否存在
    if (collection.errMsg.includes('ok')) {
      console.log('集合存在')
      return true
    } else {
      console.log('集合不存在')
      return false
    }
  } catch (error) {
    console.warn(error)
  }
  return false;
}

async function createIfNotExist(collectionName) {
  try {
    let exist = await isExist(collectionName);
    if (!exist) {
      let create = await db.createCollection(collectionName);
      if (!create.errMsg.includes('ok')) {
        return false;
      }
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function fetchUserInfo() {
  let userTable = 'userInfo';
  let userInfo;
  try {
    //查询用户记录
    let query = await db.collection(userTable).where({
      openId: OPENID
    }).get();
    userInfo = query.data[0];
    //不存在，则创建一条用户记录
    if (!userInfo) {
      userInfo = {
        openId: OPENID,
        name: "",
        childs: [],
        subscribeChilds: [],
        when: new Date(),
      }
      let add = await db.collection(userTable).add({
        // data 字段表示需新增的 JSON 数据
        data: {
          ...userInfo,
        }
      });
      if (add.errMsg.includes('ok')) {
        return userInfo;
      } else {
        console.error(add);
        return {
          success: false,
          errorMsg: add.errMsg
        }
      }
    }
    return userInfo;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errorMsg: error
    };
  }

}

module.exports = {
  createIfNotExist,
  fetchUserInfo,
}