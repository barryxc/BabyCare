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
    avatar: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on('acceptDataFromOpenerPage', function (data) {
        console.log(data);
      });
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
      console.log("触发添加宝宝👶🏻事件", child);
      wx.showLoading({
        title: '',
      })
      let addResult;
      console.log(child.avatar);
      if (!child.avatar) {
        addResult = await this.newChildAdd(child);
      } else {
        let uploadResult = await this.uploadImg(child.avatar)
        if (uploadResult.fileID) {
          child.avatar = uploadResult.fileID;
        }
        addResult = await this.newChildAdd(child);
      }
      if (addResult.result.stats.updated > 0) {

        user.addChild(child);
        user.getChilds().forEach((e, index) => {
          if (e.date) {
            e.age = date.diffDays(e.date);
          }
          //恢复，隐藏删除按钮
          e.offsetX = 0;
        });

        this.setData({
          babyArr: user.getChilds(),
        });
      }else{
        wx.showToast({
          title: '添加失败',
          icon:"error"
        })
      }
      wx.navigateBack();
      wx.hideLoading();
    } catch (error) {
      console.error(error);
      wx.hideLoading();
    }
  },

  newChildAdd(child) {
    return childModule.addChild(child);
  },

  uploadImg(filepath) {
    return uploadCore.upload(filepath);
  },

  //保存
  onAddConfirm(e) {
    let childs = user.getChilds();
    let babyInfo = e.detail;
    babyInfo.avatar = this.data.avatar;
    let child = {
      ...babyInfo,
      childId: getUuid(),
    };
    if (!childs || (Array.isArray(childs) && childs.length == 0)) {
      child.check = true;
    }
    if (!child.name) {
      wx.showToast({
        title: '未填写昵称',
        icon: "error"
      })
      return
    }
    if (!child.date) {
      wx.showToast({
        title: '未填写出生日期',
        icon: "error"
      })
      return
    }
    this.save(child);
  }
})