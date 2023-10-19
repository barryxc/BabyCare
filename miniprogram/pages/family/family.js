const {
  getUser,
  defaultAvatar,
} = require("../../service/user")

const {
  afterXMinutes
} = require('../../service/date');
const {
  callServer
} = require("../../service/server");
// pages/family/family.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultAvatar: defaultAvatar,
    userInfo: {},
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
    let expire = afterXMinutes(15);
    console.log(object, "过期时间", expire);
    return {
      title: `${this.data.userInfo.name}邀请你加入我的家庭`,
      path: `/pages/index/index?inviteId=${this.data.userInfo.openId}&expire=${expire}`,
    }
  },

  async onDeleteItem(e) {
    try {
      console.log(e)
      let index = e.target.dataset.index;
      if (index == -1) {
        return
      }
      let userId = this.data.userInfo.boundUsers[index].openId;
      if (!userId) {
        return
      }
      wx.showLoading({
        title: '',
      });
      let res = await callServer({
        type: "unBoundUser",
        userId: userId,
      });
      if (res.result.success) {
        this.data.userInfo.boundUsers = this.data.userInfo.boundUsers.filter((e) => e.openId != userId);
        this.setData({
          userInfo: this.data.userInfo
        })
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '删除失败',
          icon: "none"
        })
      }
    } catch (error) {
      console.error(error)
    }
    wx.hideLoading();
  }
})