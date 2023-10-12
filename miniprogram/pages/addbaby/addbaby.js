// pages/addbaby/addbaby.js
const childModule = require("../../service/child");
const date = require("../../service/date");
const uploadCore = require("../../service/upload");
const user = require("../../service/user");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    babyArr: [],
    showModal: false,
    confirmCallback: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let childs = user.getChilds();
    childs.forEach(e => {
      let age = date.diffDays(e.date);
      if (age >= 0) {
        e.age = age + 1;
      }

    });
    this.setData({
      babyArr: childs,
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
  onShareAppMessage() {

  },

  //添加宝宝
  addBaby() {
    wx.navigateTo({
      url: '/pages/editBabyInfo/editBabyInfo?type=add',
      events: {
        onFinish: (function (data) {
          console.log("callback", data);
          this.setData({
            babyArr: user.getChilds(),
          })
        }).bind(this)
      },
      success(res) {

      }
    })
  },

  //显示添加对话框
  showModal() {
    this.setData({
      showModal: true,
    })
  },

  // 取消弹窗
  dismiss() {
    this.setData({
      showModal: false,
    })
  },

  editBaby(e) {
    console.log("选择", e)
    let index = e.currentTarget.dataset.index;
    let childs = user.getChilds();
    let child = childs[index];
    wx.navigateTo({
      url: '/pages/editBabyInfo/editBabyInfo?type=edit',
      events: {
        onFinish: (function (data) {
          this.setData({
            babyArr: user.getChilds(),
          })
        }).bind(this),
      },
      success(res) {
        res.eventChannel.emit('babyInfo', child);
      }
    })
  },

  onDelete(e) {
    console.log("onDelete", e);
    let childs = user.getChilds();
    wx.showModal({
      title: '',
      content: '会删除宝宝所有历史记录，确定删除？',
      complete: (res) => {
        if (res.cancel) {

        }
        if (res.confirm) {
          let index = e.target.dataset.index;
          if (index !== undefined) {
            let childId = childs[index].childId;
            wx.showLoading({
              title: '',
            })
            childModule.removeChild(childId).then((res) => {
              debugger
              if (res.result.success) {
                console.log('删除成功', res);
                user.deleteChild(childId);
                this.setData({
                  babyArr: user.getChilds(),
                })
              } else {
                console.log('删除失败', res);
              }
              wx.hideLoading();
            }).catch((e) => {
              console.error(e);
              wx.hideLoading();
            });
          }
        }
      }
    })

  }
})