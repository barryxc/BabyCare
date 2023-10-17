const {
  format,
  formatMillis
} = require("../../service/date")
let leftIntervalId;
let rightIntervalId;

// components/feed-comp/feed-comp.js
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

    //第一次为当前时间，第二次进入时属于保存时间
    dateTime: Date.now(),
    dateTimeFormat: format(Date.now()),

    leftTime: 0,
    rightTime: 0,

    leftTimeFormat: "00:00:00",
    rightTimeFormat: "00:00:00",

    totalTimeFormat: "00:00:00",

    imgSrc: '',
    content: "",
    //容量
    volume: "",

    feedType: "breast_feed_by_self",
    feedTitle: "母乳亲喂",

    leftBreastFeeding: false,
    rightBreastFeeding: false,


  },

  observers: {

    'dateTime': function (data) {
      this.setData({
        dateTimeFormat: format(data),
      })
    },

    'leftTime': function (data) {
      this.setData({
        leftTimeFormat: formatMillis(data, 'HH:mm:ss'),
        totalTimeFormat: formatMillis(data + this.data.rightTime, 'HH:mm:ss')
      })
    },

    'rightTime': function (data) {
      console.log(data);
      this.setData({
        rightTimeFormat: formatMillis(data, 'HH:mm:ss'),
        totalTimeFormat: formatMillis(this.data.leftTime + data, 'HH:mm:ss')
      })
    },
  },

  lifetimes: {
    ready() {
      console.log('onReady')
      this.setData({
        dateTime: Date.now(),
        ...this.data.record
      })

      //恢复计时器状态
      if (this.data.leftBreastFeeding) {
        let diff = Date.now() - this.data.dateTime;
        if (diff > 0) {
          this.setData({
            leftTime: (this.data.leftTime + diff)
          })
        }
        this.startLeftInterval()
      }

      //恢复计时器状态
      if (this.data.rightBreastFeeding) {
        let diff = Date.now() - this.data.dateTime;
        if (diff > 0) {
          this.setData({
            rightTime: (this.data.rightTime + diff)
          })
        }
        this.startRightInterval()
      }

    },
    detached() {
      console.log('detached')
      this.clearTimer();
      this.setData({
        leftBreastFeeding: false
      })
      this.setData({
        rightBreastFeeding: false
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindreset() {
      this.clearTimer()
      this.triggerEvent('cancel')
    },
    bindsubmit(e) {
      //表单数据
      let volume = e.detail.value.volume;
      let content = e.detail.value.content;

      //亲喂的情况下需要校验时长
      if (this.data.feedType == 'breast_feed_by_self') {
        if (this.data.leftTime + this.data.rightTime == 0) {
          if (!this.data.leftBreastFeeding && !this.data.rightBreastFeeding) {
            wx.showToast({
              title: '未点击开始',
              icon: 'error'
            })
          }
          return
        }
      }

      //瓶喂的情况下需要校验容量
      if (this.data.feedType != 'breast_feed_by_self' && (!volume || volume === 0)) {
        wx.showToast({
          title: '容量不能为空',
          icon: 'error'
        })
        return
      }
      let now = Date.now();
      let item = {
        ...this.data,

        //重要
        dateTime: now, //记录保存的时间

        date: format(now, 'YYYY-MM-DD'),
        time: format(now, 'HH:mm'),

        volume,
        content,
      }

      this.triggerEvent('submit', {
        ...item
      })
    },
    onChange(e) {
      let name = e.detail.name;
      let title = e.detail.title;

      this.setData({
        feedType: name,
        feedTitle: title
      })
    },

    countLeft() {
      let feeding = !this.data.leftBreastFeeding;
      this.setData({
        leftBreastFeeding: feeding
      })
      if (feeding) {
        this.startLeftInterval()
      } else {
        clearInterval(leftIntervalId);
      }
    },

    countRight() {
      let feeding = !this.data.rightBreastFeeding;
      this.setData({
        rightBreastFeeding: feeding
      })
      if (feeding) {
        this.startRightInterval()
      } else {
        clearInterval(rightIntervalId);
      }
    },

    //左定时器
    startLeftInterval() {
      leftIntervalId = setInterval(() => {
        this.setData({
          leftTime: this.data.leftTime + 1000,
        })
      }, 1000)
    },

    //右定时器
    startRightInterval() {
      rightIntervalId = setInterval(() => {
        this.setData({
          rightTime: this.data.rightTime + 1000,
        })
      }, 1000);
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

    //清空定时器
    clearTimer() {
      if (leftIntervalId) {
        clearInterval(leftIntervalId)
      }
      if (rightIntervalId) {
        clearInterval(rightIntervalId)
      }
    }
  }
})