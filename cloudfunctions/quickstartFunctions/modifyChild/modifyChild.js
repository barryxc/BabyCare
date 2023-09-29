const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command
const tableName = "userInfo";

exports.main = async (event, context) => {
  let {
    OPENID
  } = cloud.getWXContext();
  try {
    //建表
    try {
      await db.createCollection(tableName);
    } catch (e) {
      console.error(e);
    }
    //查询用户记录
    let results = await db.collection(tableName).where({
      openId: OPENID
    }).get();

    let data = results.data;

    //不存在，则创建一条用户记录
    if (!data || (Array.isArray(data) && data.length == 0)) {
      let userInfo = {
        openId: OPENID,
        name: "",
        childs: [{
          ...event.data,
        }, ],
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

    let childs = data[0].childs;
    if (Array.isArray(childs)) {
      childs.forEach((e) => {
        if (e.childId == event.childId) {
          e.check = true;
        } else {
          e.check = false;
        }
      });
    } else {
      childs = [];
    }

    return db.collection(tableName).where({
      openId: OPENID,
    }).update({
      data: {
        childs: childs,
      }
    });
  } catch (e) {
    console.error(e)
  }
}