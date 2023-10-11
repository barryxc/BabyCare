const {
  callServer
} = require("../../service/server");
const {
  getUser
} = require("../../service/user");

// pages/setting/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultAvatar: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
    avatarUrl: '',
    name: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      avatarUrl: getUser().avatarUrl,
      name: getUser().name,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      avatarUrl: getUser().avatarUrl,
      name: getUser().name
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  },

  onChooseAvatar(e) {
    let avatarUrl = e.detail.avatarUrl;
    console.log("选择头像：", avatarUrl);
    if (avatarUrl) {
      callServer({
        avatarUrl: avatarUrl,
        type: "updateUserInfo",
      }).then((res) => {
        let user = getUser();
        user.avatarUrl = avatarUrl;
        this.setData({
          avatarUrl: avatarUrl,
        })
      }).catch((e) => {
        console.error(e);
      })
    }
  },
  bindnicknamereview(e) {
    console.log("bindnicknamereview",e, this.data.name);
  },
  //失去焦点
  onBlur(e) {
    console.log("失去焦点", e);
    let value = e.detail.value;
    if (value) {
      callServer({
        name: value,
        type: "updateUserInfo",
      }).then((res) => {
        let user = getUser();
        user.name = value;
        this.setData({
          name: value,
        })
      }).catch((e) => {
        console.error(e);
      })
    }
  },
  //输入昵称
  bindInput(e) {
    console.log("输入昵称", e, this.data.name);
  },

})