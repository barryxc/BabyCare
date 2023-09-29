const {
  diffDays
} = require("../../service/date");
const {
  getChilds,
  register,
  syncUserInfo,
  setUser
} = require("../../service/user")

// pages/my/my.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    babyArr: getChilds(),
    baby: {
      avatar: "",
      age: "0",
      name: "--",
      height: "--",
      weight: "--",
    },
    confirmCallback: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.refresh();
    register((userinfo) => {
      this.refresh();
    });
  },

  refresh() {
    let childs = getChilds();
    if (Array.isArray(childs) && childs.length > 0) {
      childs.forEach((e) => {
        if (e.check) {
          this.setData({
            baby: e
          });
        }
      })
    } else {
      this.reset();
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  reset() {
    this.setData({
      baby: {
        avatar: "../../images/boy.svg",
        age: "0",
        name: "--",
        height: "--",
        weight: "--",
      }
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
    syncUserInfo().then((res) => {
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

  },

  //设置
  gotoSetting() {
    wx.navigateTo({
      url: '/pages/setting/setting',
    })
  },

  // 添加宝宝
  addBaby() {
    showModal.call(this);
  },

  onAddConfirm: (function (res) {
    console.log(res)
    if (!res) {
      return;
    }
    if (!res.name) {
      wx.showToast({
        title: '未填写昵称',
        icon: "error"
      })
      return
    }
    if (!res.date) {
      wx.showToast({
        title: '未填写出生日期',
        icon: "error"
      })
      return
    }
    let childs = getChilds();
    childs.push(res);
    let count = childs.length;

    if (count == 1) {
      baby = childs[0];
      baby.check = true;
    };

    childs.forEach((e, index) => {
      if (e.date) {
        e.age = diffDays(e.date);
      }
    });
    this.setData({
      babyArr: childs,
      baby: baby,
    });
    dismiss.call(this)
  }),
  gotoAdd() {
    wx.navigateTo({
      url: "/pages/addbaby/addbaby",
    })
  }

})