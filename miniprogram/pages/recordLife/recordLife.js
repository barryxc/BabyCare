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
  getDay,
  getShortTime,
  getDate,
} = require('../../service/date.js');
const {
  getEventList,
  getIcon
} = require('../../service/eventlist.js');

const {
  getSelectedChild
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
    index: 0,
    icon: "",
    date: "",
    time: "",
    content: "",
    showUploadTip: false,
    haveGetImgSrc: false,
    envId: 'cloud1-3gt9kvvh7349fcdc',
    imgSrc: '',
    range: getEventList(),
  },

  onLoad(options) {

  },

  onShow() {
    this.setData({
      icon: getIcon(getEventList()[0].type),
      date: getDay(),
      time: getShortTime(),
      index: 0,
    }, () => {
      console.log("envId:" + this.data.envId);
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

  binEventChange(event) {
    let value = event.detail.value;
    console.log(value);
    let list = getEventList();
    this.setData({
      icon: getIcon(list[value].type)
    });
  },

  bindsubmit(e) {
    let childId = getSelectedChild().childId;
    if (!childId) {
      showModal("未绑定宝宝");
      return
    }
    let interval = new Date().getTime() - lastSumbitTime;
    if (interval <= 1000) {
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
    console.log("模型数据:" + JSON.stringify(this.data))
    if (this.data.index == undefined) {
      showModal("未填写事件标题");
      return
    }
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
      upload(this.data['imgSrc']).then((resp) => {
        if (resp.fileID) {
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

  bindreset(e) {
    console.log("重置" + JSON.stringify(e))
    this.setData({
      index: 0,
      icon: getIcon(getEventList()[0].type),
      date: getDay(),
      time: getShortTime(),
      imgSrc: ""
    })
  },

  bindcDateChange(e) {
    console.log("日期变化了")
  },

  bindTimeChange(e) {
    console.log("时间变化了")
  },

  //发送事件
  sendEevent(record) {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit("addRecord", {
      data: record
    });
  },

  //新增记录
  doUploadRecord(data) {
    let child = getSelectedChild();
    let childId = child.childId;
    const record = {
      recordId: getUuid(),
      event: getEventList()[data.index].event,
      day: data.date,
      time: data.time,
      clientDate: getDate(),
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