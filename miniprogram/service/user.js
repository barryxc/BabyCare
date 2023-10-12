const {
  callServer
} = require("./server");

let defaultAvatar = "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";

let eventBus = {
  // 事件总线对象
  _events: {},
  // 触发事件
  emit: function (eventName, data) {
    if (this._events[eventName]) {
      this._events[eventName].forEach(callback => {
        callback(data);
      });
    }
  },
  // 监听事件
  on: function (eventName, callback) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(callback);
  },
  // 取消监听事件
  off: function (eventName, callback) {
    if (this._events[eventName]) {
      this._events[eventName] = this._events[eventName].filter(cb => cb !== callback);
    }
  }
};

// 用户信息
let userInfo = {
  name: "",
  childs: [],
};

function getChilds() {
  return userInfo.childs;
}

function getSelectedChild() {
  let childs = getChilds();
  if (!childs) {
    childs = [];
  }
  let child = {};
  if (childs.length > 0) {
    child = childs[0];
  }
  let childId = wx.getStorageSync('selectChildId');
  if (childId) {
    childs.forEach((e) => {
      if (e.childId == childId) {
        child = e;
      }
    });
  }
  return child;
}

function addChild(child) {
  let index = userInfo.childs.findIndex((e, i) => {
    return e.childId == child.childId;
  });
  if (index !== -1) {
    userInfo.childs[index] = child;
  } else {
    userInfo.childs.push(child);
  }
  eventBus.emit("childChange", child.childId);
}


function removeChild(childId) {
  userInfo.childs = userInfo.childs.filter((e) => childId != e.childId);
  eventBus.emit("childChange", childId);
}

function setUserInfo(info) {
  userInfo = {
    ...info,
  };
  eventBus.emit("setUserInfo", userInfo);
}

function getUserInfo() {
  return userInfo;
}

let lastSyncTime = 0;
async function syncUserInfo(app) {
  try {
    let inviteId = app.globalData.inviteId;
    let expire = app.globalData.expire;
    let currentTime = new Date().getTime();
    let internal = currentTime - lastSyncTime;
    if (internal < 800) {
      console.log("获取用户信息太频繁了...", internal);
      return
    }
    lastSyncTime = currentTime;
    let result = await callServer({
      type: "getUserInfo",
      inviteId: inviteId,
      expire: expire
    });
    return result;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  defaultAvatar,
  eventBus,

  setUser: setUserInfo,
  getUser: getUserInfo,

  getChilds: getChilds,
  addChild: addChild,
  getSelectedChild,
  deleteChild: removeChild,

  syncUserInfo,
};