const {
  diffDays
} = require("../../service/date");
const {
  eventBus,
  syncUserInfo,
  setUser,
  getSelectedChild,
  getUser,
  getChilds,
  defaultAvatar,
} = require("../../service/user")

// pages/my/my.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    defaultAvatar: defaultAvatar,
    baby: {},
    userInfo: {},
    childs: [{
      name: "aa"
    }],
    disableChildPicker: true
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
    eventBus.on("childChange", (child) => {
      this.refreshUser();
    });
    eventBus.on("setUserInfo", (child) => {
      this.refreshUser();
    });
    this.refreshUser();
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
  },

  refreshUser() {
    let childs = getChilds();
    let exist = childs && (Array.isArray(childs) && childs.length > 0);

    this.setData({
      disableChildPicker: !exist,
    })

    let child = getSelectedChild();
    let age = diffDays(child.date);
    if (exist && age >= 0) {
      child.age = age + 1;
    }
    this.setData({
      baby: child,
      childs: childs
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
  onShareAppMessage() {},

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

  //预览头像
  previewImage() {
    if (!this.data.baby.avatar) {
      return
    }
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
  },

  //picker点击监听
  onChildPickerTap(e) {
    console.log("onChildPickerTap");
    if (this.data.disableChildPicker) {
      this.toAddChild();
    }
  },

  //提醒添加小宝
  toAddChild() {
    wx.showToast({
      title: '请先添加宝宝',
      icon:'error'
    })
    setTimeout(() => {
      this.addChild()
    }, 300);
   
  },

  //切换小宝
  onChildChange(e) {
    try {
      let childs = getChilds();
      if (!childs || (Array.isArray(childs) && childs.length == 0)) {
        return
      }
      let child = childs[e.detail.value];
      if (child.childId) {
        this.setData({
          selectChild: child
        })
        //本地缓存
        wx.setStorageSync('selectChildId', child.childId)
        this.refreshUser();

        eventBus.emit("childChange", child); //事件
      }

    } catch (error) {
      console.error(error);
    }
  },

  //编辑
  editChildInfo(e) {
    let child = getSelectedChild();
    if (!child || !child.childId) {
      this.toAddChild();
      return
    }
    wx.navigateTo({
      url: '/pages/editBabyInfo/editBabyInfo?type=edit',
      events: {
        onFinish: (function (data) {
          this.refreshUser();
        }).bind(this),
      },
      success(res) {
        res.eventChannel.emit('babyInfo', child);
      }
    })
  },

  addChild(e) {
    wx.navigateTo({
      url: '/pages/editBabyInfo/editBabyInfo?type=add',
      events: {
        onFinish: (function (data) {
          this.refreshUser();
        }).bind(this),
      },
      success(res) {
      }
    })
  }

})