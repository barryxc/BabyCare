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
  userInfo.childs.forEach((e) => {
    if (e.check) {
      child = e;
    }
  });
  return child;
}

function addChild(child) {
  userInfo.childs.push(child);
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
  if (internal < 5000) {
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