const {
  format
} = require("../../service/date")

// components/nbs-comp/nbs-comp.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    record: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

    dateTime: Date.now(),
    dateTimeFormat: format(Date.now()),
    //尿不湿状态
    nbsStatusData: [{
      name: "便便"
    }, {
      name: "嘘嘘"
    }, {
      name: "嘘嘘+便便"
    }],
    nbsStatus: {},
    nbsIndex: -1,


    //尿尿颜色
    peeColors: [{
      name: "乳白色"
    }, {
      name: "粉色"
    }, {
      name: "正常"
    }, {
      name: "黄色"
    }, {
      name: "红色"
    }, {
      name: "浓茶色"
    }],
    peeColor: {},
    peeColorIndex: -1,


    //便便状态
    shitStatusData: [{
      name: "正常"
    }, {
      name: "偏稀"
    }, {
      name: "偏硬"
    }, {
      name: "泡沫样"
    }, {
      name: "有奶瓣"
    }, {
      name: "蛋花样"
    }, {
      name: "羊屎便"
    }, {
      name: "含血便"
    }],
    shitStatus: {},
    shitStatusIndex: -1,

    //便便量
    shitAmountData: [{
      name: "量少"
    }, {
      name: "量中等"
    }, {
      name: "量多"
    }],
    shitAmount: {},
    shitAmountIndex: -1,

    //便便颜色
    shitColors: [{
        name: "黑色"
      },
      {
        name: "绿色"
      },
      {
        name: "黄色"
      },
      {
        name: "棕色"
      },
      {
        name: "红色"
      },
      {
        name: "灰白色"
      },
    ],
    shitColor: {},
    shitColorIndex: -1
  },

  lifetimes: {
    ready() {
      this.setData({
        dateTime: Date.now(),
        ...this.data.record
      })
    },
  },

  observers: {
    dateTime: function (data) {
      this.setData({
        dateTimeFormat: format(data)
      })
    },
    // 'nbsIndex': function (data) {
    //   if (data==-1) {
    //     return
    //   }
    //   this.setData({
    //     nbsStatus: this.data.nbsStatusData[data]
    //   })
    // },
    // 'peeColorIndex': function (data) {
    //   this.setData({
    //     peeColor: this.data.peeColors[data]
    //   })
    // },
    // 'shitStatusIndex': function (data) {
    //   this.setData({
    //     shitStatus: this.data.shitStatusData[data]
    //   })
    // },
    // 'shitAmountIndex': function (data) {
    //   this.setData({
    //     shitAmount: this.data.shitAmountData[data]
    //   })
    // },
    // 'shitColorIndex': function (data) {
    //   this.setData({
    //     shitColor: this.data.shitColors[data]
    //   })
    // }

  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindreset() {
      this.triggerEvent('cancel')
    },

    bindsubmit(e) {
      if (!this.data.nbsStatus) {
        wx.showToast({
          title: '未选中尿布状态',
          icon: "error"
        })
        return
      }
      let data = {
        ...this.data,
        date: format(this.data.dateTime, 'YYYY-MM-DD'),
        time: format(this.data.dateTime, "HH:mm"),
      }
      this.triggerEvent('submit', data)

    },
    selectImg() {
      // 让用户选择一张图片
      wx.chooseImage({
        count: 1,
        success: chooseResult => {
          this.setData({
            imgSrc: chooseResult.tempFilePaths[0]
          });
        },
        fail: res => {
          console.log(res.errMsg);
        }
      });
    },

    //事件切换
    onChange(e) {
      let index = e.detail.index;
      let data = e.detail.data;
      let dataType = e.currentTarget.dataset.type;
      switch (dataType) {
        case 'nbsStatusData':

          this.setData({
            nbsStatus: data,
            nbsIndex: index
          })
          //便便
          if (index == 0) {
            this.setData({
              peeColor: {},
              peeColorIndex: -1,
            })
            //嘘嘘
          } else if (index == 1) {
            this.setData({
              shitStatus: {},
              shitStatusIndex: -1,

              shitAmount: {},
              shitAmountIndex: -1,

              shitColor: {},
              shitColorIndex: -1
            })
          }
          break;
        case 'peeColors':
          //为便便状态时
          if (this.data.nbsIndex == 0) {
            this.showPeeToast();
            this.setData({
              peeColor: {},
              peeColorIndex: -1
            })
            return
          }
          this.setData({
            peeColor: data,
            peeColorIndex: index
          })
          break;
        case 'shitStatusData':
          //为嘘嘘状态时
          if (this.data.nbsIndex == 1) {
            this.showShitToast();
            this.setData({
              shitStatus: {},
              shitStatusIndex: -1
            })
            return
          }
          this.setData({
            shitStatus: data,
            shitStatusIndex: index
          })
          break;
        case 'shitAmountData':
          if (this.data.nbsIndex == 1) {
            this.showShitToast();
            this.setData({
              shitAmount: {},
              shitAmountIndex: -1
            })
            return
          }
          this.setData({
            shitAmount: data,
            shitAmountIndex: index
          })
          break;
        case 'shitColors':
          if (this.data.nbsIndex == 1) {
            this.showShitToast();
            this.setData({
              shitColor: {},
              shitColorIndex: -1
            })
            return
          }
          this.setData({
            shitColor: data,
            shitColorIndex: index
          })
          break;
        default:
          break;
      }
    },

    showPeeToast() {
      wx.showToast({
        title: '便便状态下无法选择',
        icon: 'none'
      })
    },
    showShitToast() {
      wx.showToast({
        title: '嘘嘘状态下无法选择',
        icon: 'none'
      })
    }
  }
})