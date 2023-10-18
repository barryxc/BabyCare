const {
  upload
} = require('../../service/upload.js');
const {
  insertRecord
} = require("../../service/record.js");
const {
  showModal
} = require("../../service/dialog.js");
const {
  tipError
} = require('../../service/tipUtils.js');
const {
  getDate,
  getShortTime,
  getDateTime,
} = require('../../service/date.js');
const {
  getEventList,
  getIcon
} = require('../../service/eventlist.js');

const {
  getSelectedChild,
  eventBus
} = require('../../service/user.js');
const {
  getUuid
} = require('../../service/uuid.js');

let lastSumbitTime;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 事件类型
    index: 0,
    type: "",

    date: "",
    time: "",

    content: "", //备注
    imgSrc: '', //图片

    //睡觉状态
    sleepStatus: '', //0,1
    //结束时间
    wakeDate: "",
    wakeTime: "",

    //喂养
    feedType: "0", //母乳亲喂、母乳瓶喂、奶粉瓶喂
    leftBra: "",
    rightBra: "",
    feedTime: "",
    volume: "", //容量
    feedStatus: '',
    feedEndDate: "",
    feedEndTime: "",

    //尿布状态
    nbsStatus: "", //0便便 1 

    //身高：
    bodyHeight: "",
    //体重
    bodyWeight: "",
    //活动
    acvitiy: "",

  },

  onLoad(options) {
    let type = options.type;
    let index = options.index;

    let event = getEventList()[index].event;
    wx.setNavigationBarTitle({
      title: event,
    })
    this.setData({
      type,
      index
    })
  },

  onShow() {
    this.setData({
      date: getDate(),
      time: getShortTime(),
    });
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

  //新增记录
  bindsubmit(e) {
    let childId = getSelectedChild().childId;
    if (!childId) {
      wx.showToast({
        title: '请先添加宝宝信息',
        icon: 'error'
      })
      return
    }

    let interval = new Date().getTime() - lastSumbitTime;
    if (interval < getApp().globalData.debounceTime) {
      wx.showToast({
        title: '提交太频繁了',
        icon: 'error',
      })
      console.log("提交太频繁了,距离上次提交间隔", interval);
      return
    }

    lastSumbitTime = new Date().getTime();
    //表单数据
    let values = e.detail.value;
    console.log("表单数据:" + JSON.stringify(values))

    if (!this.data['date']) {
      showModal("未选择日期");
      return
    }

    if (!this.data['time']) {
      showModal("未选择时间");
      return
    }

    wx.showLoading({
      title: '',
    })
    if (!this.data['imgSrc']) {
      this.doUploadRecord(this.data)
    } else {
      upload(this.data['imgSrc'], 'record_img').then((resp) => {
        if (resp.success) {
          //本地路径
          this.data.localImgSrc = this.data.imgSrc;
          //云路径
          this.data.imgSrc = resp.fileID;

          console.log("图片上传成功" + JSON.stringify(resp));
          this.doUploadRecord(this.data)
        } else {
          wx.navigateBack();
          tipError(value.errMsg);
        }

      }).catch(e => {
        tipError(e);
        wx.navigateBack();
      });
    }
  },

  //重置
  bindreset(e) {
    this.setData({
      date: getDate(),
      time: getShortTime(),
      imgSrc: ""
    })
  },

  //通知新增记录
  sendEevent(record) {
    eventBus.emit('updateUi', {
      date: record.date,
      data: record
    });
  },

  //上传记录
  doUploadRecord(data) {
    let child = getSelectedChild();
    let childId = child.childId;
    const record = {
      recordId: getUuid(),
      event: getEventList()[data.index].event,
      day: data.date,
      time: data.time,
      clientDate: getDateTime(),
      status: "1",
      type: getEventList()[data.index].type,
      imgSrc: data.imgSrc,
      content: data.content,
      childId,
      childName: child.name,
      localImgSrc: data.localImgSrc,
    };

    console.log("记录日志", record);
    insertRecord(childId, record).then((res) => {
      if (res.errMsg.includes('ok')) {
        wx.hideLoading();
        wx.showToast({
          title: "提交成功"
        });
        console.log("数据库更新成功" + res);
        this.sendEevent(record);
        wx.navigateBack();
      } else {
        wx.hideLoading();
        wx.showToast({
          title: "提交失败",
          icon: "error"
        });
        console.error("数据库更新失败", e);
        wx.navigateBack();
      }
    }).catch(e => {
      wx.hideLoading();
      wx.showToast({
        title: "提交失败",
        icon: "error"
      });
      console.error("数据库更新失败", e);
      wx.navigateBack();
    });
  }
});