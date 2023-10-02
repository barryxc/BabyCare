const {
  callServer
} = require("./server");

const subscribers = [];

// 用户信息
var userInfo = {
  _name: "",

  get name() {
    return this._name;
  },
  set name(value) {
    this._name = value;
    this.onChange(this);
  },

  onChange(params) {
    notify(params);
  },

  _childs: [],

  get childs() {
    return this._childs;
  },
  set childs(value) {
    this._childs = value;
    this.onChange(this);
  }
};


function getChilds() {
  return userInfo.childs;
}

function getSelectedChild() {
  let child = {};
  let childs = getChilds();
  if (childs && (Array.isArray(childs) && childs.length > 0)) {
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
  notify(userInfo);
}

function removeChild(childId) {
  userInfo.childs = userInfo.childs.filter((e) => childId != e.childId);
  notify(userInfo);
}

function setUserInfo(info) {
  userInfo = {
    ...info,
  };
  notify(userInfo);
}

function getUserInfo() {
  return userInfo;
}

let lastSyncTime = 0;
async function syncUserInfo(params) {
  let currentTime = new Date().getTime();
  let internal = currentTime - lastSyncTime;
  if (internal < 1000) {
    console.log("获取用户信息太频繁了...", internal);
    return
  }
  lastSyncTime = currentTime;
  let result;
  try {
    result = await callServer({
      type: "getUserInfo",
    });
  } catch (error) {
    console.error(error);
  }
  return result;
}



function register(listener) {
  subscribers.push(listener)
}

function unRegister(listener) {
  subscribers = subscribers.filter(sub => sub !== listener);
}

function notify() {
  subscribers.forEach(sub => sub(userInfo));
}

module.exports = {
  setUser: setUserInfo,
  getUser: getUserInfo,

  getChilds: getChilds,
  addChild: addChild,
  getSelectedChild,
  deleteChild: removeChild,

  register,
  unRegister,
  notify,


  syncUserInfo,
};