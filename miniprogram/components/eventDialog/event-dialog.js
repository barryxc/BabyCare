const {
  getDateTime
} = require("../../service/date");
const {
  insertRecord
} = require("../../service/record");
const {
  upload
} = require("../../service/upload")
const {
  getSelectedChild,
  eventBus
} = require("../../service/user");
const {
  getUuid
} = require("../../service/uuid");
const {
  showModal
} = require("../../service/dialog");
const {
  getIcon,
  getEventTitle
} = require("../../service/eventlist");

let lastSumbitTime;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //类型
    type: {
      type: String,
      value: ""
    },
    record: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    star: false,
    icon: "",
    event: "",
  },

  lifetimes: {
    attached() {
      console.log("event dialog on ready");
      let event = getEventTitle(this.data.type);
      let icon = getIcon(this.data.type);
      //设置星标
      if (this.data.record.star) {
        this.setData({
          star: this.data.record.star
        })
      }
      this.setData({
        icon,
        event,
      })
    },
    error() {

    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //取消
    cancel() {
      this.dismiss();
    },
    dismiss() {
      eventBus.emit("hideCircleAddBtn", {});
      this.triggerEvent("hide", {});
    },
    //关闭
    close() {
      this.dismiss();
    },
    stop() {},
    star(e) {
      let star = !this.data.star
      this.setData({
        star,
      })
      if (star) {
        wx.showToast({
          title: '重要',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '取消',
          icon: 'none'
        })
      }
    },

    submit(e) {
      console.log("提交", e)
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
      //数据
      let data = e.detail;
      console.log("记录数据:" + JSON.stringify(data))

      if (!data.date) {
        showModal("未选择日期");
      }

      if (!data.time) {
        showModal("未选择时间");
        return
      }

      wx.showLoading({
        title: '',
      })
      //不存在图片直接上传记录
      if (!data.imgSrc) {
        this.doUploadRecord(data)
      } else {
        //先上传图片
        upload(data.imgSrc, 'record_img').then((resp) => {
          if (resp.success) {
            //云路径
            data.imgSrc = resp.fileID;
            this.doUploadRecord(data)
          } else {
            this.dismiss();
            wx.showToast({
              title: '上传失败',
              icon: "error"
            })
          }
        }).catch(e => {
          console.error(e);
          wx.showToast({
            title: '上传失败',
            icon: "error"
          })
          this.dismiss();
        });
      }
    },

    //上传记录
    doUploadRecord(data) {
      let child = getSelectedChild();
      let childId = child.childId;
      const record = {
        //id
        recordId: getUuid(),
        //数据
        ...data, //编辑情况下，recordId 会覆盖掉

        //事件
        event: this.data.event,
        type: this.data.type,

        //是否星标
        star: this.data.star,
        //客户端时间戳
        clientModifyTime: getDateTime(),

        //孩子信息
        childId,
        childName: child.name,

      };

      //删除属性
      delete record.record;
      delete record._id;
      delete record.ext;

      console.log("记录日志", record);
      insertRecord(childId, record).then((res) => {
        if (res.result.success) {
          wx.hideLoading();
          wx.showToast({
            title: "提交成功"
          });
          console.log("数据库更新成功" + res);
          this.sendEevent(record);
          this.dismiss();
        } else {
          wx.hideLoading();
          wx.showToast({
            title: "提交失败",
            icon: "error"
          });
          console.error("提交失败");
          this.dismiss();
        }
      }).catch(e => {
        wx.hideLoading();
        wx.showToast({
          title: "提交失败",
          icon: "error"
        });
        console.error("数据库更新失败", e);
        this.dismiss();
      });
    },
    //通知新增记录
    sendEevent(record,type) {
      eventBus.emit('updateUi', {
        type: "modify",
        data: record
      });
    },
  },

})