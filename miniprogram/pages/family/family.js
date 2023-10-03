const {
  getUser
} = require("../../service/user")

// pages/family/family.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let currentUser = getUser();
    this.setData({
      userInfo: currentUser,
    })

    wx.showShareMenu({
      withShareTicket: true, // 是否使用带 shareTicket 的转发
      success(res) {
        console.log(res);
      }
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
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(object) {
    console.log(object);
    return {
      title: `${this.data.userInfo.name}邀请你加入我的家庭`,
      path: `/pages/index/index?inviteId=${this.data.userInfo.openId}`,
    }
  },
})