const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
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

async function fetchUserInfo(userId) {
  //踩坑，只能放在函数中调用，在全局调用获取不到 OPENID
  let {
    OPENID
  } = cloud.getWXContext();
  if (!userId) {
    userId = OPENID;
  }
  let userTable = 'userInfo';
  let userInfo;
  try {
    //查询用户记录
    let query = await db.collection(userTable).where({
      openId: userId
    }).get();
    userInfo = query.data[0];
    //不存在，则创建一条用户记录
    if (!userInfo) {
      userInfo = {
        openId: userId,
        name: "",
        childs: [],
        bind: [], //绑定
        bound: [], //被绑定
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
          errorMsg: add
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