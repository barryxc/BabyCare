const {
  diffDays
} = require("../../service/date");
const {
  register,
  syncUserInfo,
  setUser,
  getSelectedChild,
  getUser
} = require("../../service/user")

// pages/my/my.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    baby: {},
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //支持转发群聊
    wx.showShareMenu({
      withShareTicket: true
    })
    this.data.userInfo = getUser();
    register((userinfo) => {
      this.refreshUser();
    })
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }

    this.refreshUser();
  },

  refreshUser() {
    let child = getSelectedChild();
    this.setData({
      baby: child
    })
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
    syncUserInfo(getApp()).then((res) => {
      setUser(res.result);
      wx.stopPullDownRefresh();
    }).catch((e) => {
      wx.stopPullDownRefresh();
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: `${this.data.userInfo.name}邀请你加入我的家庭`,
      path: `/pages/index/index?inviteId=${this.data.userInfo.openId}`,
    }
  },

  //设置
  gotoSettingPage() {
    wx.navigateTo({
      url: '/pages/setting/setting',
    })
  },

  gotoAddChildPage() {
    wx.navigateTo({
      url: "/pages/addbaby/addbaby",
    })
  },

  shareWithFamily() {
    wx.navigateTo({
      url: '/pages/family/family',
    })
  },

  previewImage() {
    if (this.data.baby.avatar) {
      wx.previewImage({
        urls: [this.data.baby.avatar],
        showmenu: true,
        current: 0,
        success() {
          console.log("预览图片成功");
        },
        fail() {
          console.error("预览图片失败");
        },
      })
    }
  }
})