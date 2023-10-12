const childModule = require("../../service/child");
const date = require("../../service/date");
const uploadCore = require("../../service/upload");
const user = require("../../service/user");
const {
  getUuid
} = require("../../service/uuid");


// pages/editBabyInfo/editBabyInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: "",
    babyInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("params:" + JSON.stringify(options));
    this.data.type = options.type;
    if (options.type == 'edit') {
      wx.setNavigationBarTitle({
        title: '编辑',
        success: (res) => {},
        fail: (res) => {},
        complete: (res) => {},
      })
    }
    if (options.type == 'add') {
      wx.setNavigationBarTitle({
        title: '新增',
      })
    }

    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on('babyInfo', (function (data) {
        this.setData({
          babyInfo: data,
        })
        //来自分享
        if (data.shared) {
          wx.setNavigationBarTitle({
            title: '预览',
          })
        }
      }).bind(this));
    }
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

  onCancel() {
    wx.navigateBack();
  },

  async save(e) {
    try {
      let child = e;
      console.log("触发宝宝👶🏻事件", child);
      wx.showLoading({
        title: '',
      })
      let addResult;
      console.log('👶🏻头像', child.avatar);
      if (!child.avatar) {
        addResult = await this.editOrAdd(child);
      } else {
        let str = child.avatar;
        if (!(typeof str === "string" && str.startsWith("cloud"))) {
          let uploadResult = await this.uploadImg(child.avatar)
          if (uploadResult.fileID) {
            child.avatar = uploadResult.fileID;
          }
        }

        addResult = await this.editOrAdd(child);
      }
      if (addResult.result.stats.updated >= 0) {
        user.addChild(child);
        user.getChilds().forEach((e, index) => {
          if (e.date) {
            e.age = date.diffDays(e.date);
          }
          //恢复，隐藏删除按钮
          e.offsetX = 0;
        });

        this.getOpenerEventChannel().emit('onFinish', child)
        wx.navigateBack();
      } else {
        wx.showToast({
          title: '保存失败',
          icon: "error"
        })
      }
      wx.hideLoading();
    } catch (error) {
      console.error(error);
      wx.showToast({
        title: '保存失败',
        icon: "error"
      })
      wx.hideLoading();
    }
  },

  editOrAdd(child) {
    const type = this.data.type;
    if (type) {
      if (type == 'edit') {
        return childModule.modifyChildInfo(child);
      }
      if (type == 'add') {
        return childModule.addChild(child);
      }
    }
  },

  uploadImg(filepath) {
    return uploadCore.upload(filepath);
  },

  //保存
  onConfirm(e) {
    let child = e.detail;
    this.save(child);
  }
})