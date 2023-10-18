let {
  getToday,
  format,
  formatMillis,
  getDateTime,
} = require('../../service/date.js');
const record = require("../../service/record.js");
const {
  getSelectedChild,
  getChilds,
  eventBus,
  syncUserInfo,
  setUser,
} = require('../../service/user.js');
const {
  getEventList,
  getIcon
} = require('../../service/eventlist.js');

let lastSyncTime = 0;
let updateUserInfoCall;
let updateUiCallback;
let childChangeCallbcak;
let wakeEventCall;
let feedEndCall;
let hideCircleEventCall;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //小宝信息
    childs: [],
    selectChild: {},
    nickName: "",

    //当前日期
    date: getToday(),

    //数据
    records: [],

    //选中记录,传递个event-dialog参数
    record: {},
    type: "", //类型

    //弹窗
    showEventDialog: false
  },

  onPageScroll(e) {},


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //同步用户信息
    syncUserInfo(getApp()).then((res) => {
      setUser(res.result);
    }).catch((e) => {
      console.error(e)
      wx.showToast({
        title: '同步失败',
        icon: "error"
      })
    });

    //更新用户信息回调
    updateUserInfoCall = (res) => {
      let childs = getChilds();
      if (!childs) {
        return
      }
      this.setData({
        childs: childs,
        selectChild: getSelectedChild(),
      })
      this.fetchRemoteData();
    }
    //监听用户刷新事件
    eventBus.on("updateUserInfo", updateUserInfoCall);

    //更新小宝改变事件
    childChangeCallbcak = (child) => {

      let childs = getChilds();
      this.setData({
        childs: childs,
        selectChild: getSelectedChild(),
      })
      this.fetchRemoteData();

    }
    //监听child事件
    eventBus.on("childChange", childChangeCallbcak);

    //监听更新事件
    updateUiCallback = (res) => {
      //是否当前日期
      if (res.data.date != this.data.date) {
        return
      }
      let findIndex = this.data.records.findIndex((e) => e.recordId == res.data.recordId);
      if (res.type == 'delete' && findIndex != -1) { //删除事件
        this.data.records.splice(findIndex, 1);
        this.setData({
          records: this.data.records
        })
      }

      if (res.type == 'modify') {
        if (findIndex == -1) { //新增
          this.data.records.push(res.data);
        } else { //修改
          this.data.records[findIndex] = res.data;
        }
        this.updatePageUi(this.data.records)
      }
    }
    //监听record事件
    eventBus.on('updateUi', updateUiCallback);

    //监听睡醒事件
    wakeEventCall = (wakeRecord) => {
      console.log(wakeRecord);
      let now = Date.now();
      wakeRecord.sleepStatus = 'wake';
      wakeRecord.endTime = now;
      wakeRecord.endtimeFormat = format(wakeRecord.endTime);
      wakeRecord.date = format(wakeRecord.endTime, 'YYYY-MM-DD');
      wakeRecord.time = format(wakeRecord.endTime, 'HH:mm');

      wakeRecord.clientModifyTime = getDateTime();

      delete wakeRecord.record;
      delete wakeRecord.ext;
      delete wakeRecord._id;

      record.insertRecord(wakeRecord.childId, wakeRecord).then((res) => {
        if (res.result.success) {
          eventBus.emit('updateUi', {
            type: "modify",
            data: wakeRecord
          });
        } else {
          wx.showToast({
            title: '更新失败',
            icon: 'error'
          })
        }
      }).catch((e) => {
        console.error(e);
        wx.showToast({
          title: '更新失败',
          icon: "error"
        })
      });
    }
    //监听睡醒事件
    eventBus.on("wake", wakeEventCall)

    //监听喂养结束事件
    feedEndCall = (feedEndRecord) => {
      console.log("结束喂养", feedEndRecord);

      let now = Date.now();
      if (feedEndRecord.leftBreastFeeding) {
        feedEndRecord.leftBreastFeeding = false;
        feedEndRecord.leftTime += (now - feedEndRecord.lastTime);
      }
      if (feedEndRecord.rightBreastFeeding) {
        feedEndRecord.rightBreastFeeding = false;
        feedEndRecord.rightTime += (now - feedEndRecord.lastTime);
      }

      //存储上次时间
      feedEndRecord.lastTime = now;

      //需要更新到结束时间
      if (wx.getStorageSync('needUpdateEndTime')) {
        feedEndRecord.dateTime = now;
        feedEndRecord.date = format(now, 'YYYY-MM-DD');
        feedEndRecord.time = format(now, 'HH:mm');
      }
      feedEndRecord.clientModifyTime = getDateTime();

      //移除属性
      delete feedEndRecord.ext;
      delete feedEndRecord._id;
      delete feedEndRecord.record;

      record.insertRecord(feedEndRecord.childId, feedEndRecord).then((res) => {
        if (res.result.success) {
          eventBus.emit('updateUi', {
            type: "modify",
            data: feedEndRecord
          });
        } else {
          wx.showToast({
            title: '更新失败',
            icon: 'error'
          })
        }
      }).catch((e) => {
        console.error(e);
      });
    };
    eventBus.on('end_feed', feedEndCall);

    hideCircleEventCall = (data) => {
      this.hideCircleAddBtn();
    };
    //监听circle add btn 事件
    eventBus.on('hideCircleAddBtn', hideCircleEventCall)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    try {
      let childName = getSelectedChild().name;
      if (childName) {
        this.setData({
          nickName: childName,
        });
      }
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    //隐藏add按钮
    this.hideCircleAddBtn();
  },

  hideCircleAddBtn() {
    let child = this.selectComponent('#add-btn');
    if (child) {
      child.show(false);
    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log("onUnload");
    lastSyncTime = 0;
    eventBus.off("updateUserInfo", updateUserInfoCall);
    eventBus.off("updateUi", updateUiCallback);
    eventBus.off("childChange", childChangeCallbcak);
    eventBus.off("wake", wakeEventCall);
    eventBus.off('hideCircleAddBtn', hideCircleEventCall);
    eventBus.off('end_feed', feedEndCall);
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.fetchRemoteData();
  },

  //切换小宝
  onChildChange(e) {
    try {
      let index = e.detail.value;
      let childs = getChilds();
      if (!childs || (Array.isArray(childs) && childs.length == 0)) {
        return
      }
      let child = childs[index];
      if (child.childId) {
        this.setData({
          selectChild: child
        })
        //本地缓存
        wx.setStorageSync('selectChildId', child.childId)
        this.fetchRemoteData();

        eventBus.emit("childChange", child); //事件
      }

    } catch (error) {
      console.error(error);
    }
  },

  //拉取数据
  fetchRemoteData() {
    let currentTime = new Date().getTime();
    let interval = currentTime - lastSyncTime;
    if (interval < getApp().globalData.debounceTime) {
      console.log("刷新频率太快", interval);
      wx.showToast({
        title: '刷新太频繁了',
      })
      return
    }
    lastSyncTime = currentTime;
    let childId = getSelectedChild().childId;
    if (!childId) {
      this.setData({
        records: [],
      })
      wx.stopPullDownRefresh();
      wx.hideLoading();
      return
    }
    wx.showLoading({
      title: '',
    })
    this.loadData().then((res) => {
      this.updatePageUi(res);
      wx.stopPullDownRefresh();
      wx.hideLoading();
    }).catch((e) => {
      console.error(e);
      wx.stopPullDownRefresh();
      wx.hideLoading();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},

  //点击item
  onTapRecordItem(e) {

    console.log("onTapRecordItem", e);
    let index = e.currentTarget.dataset.index;
    let record = this.data.records[index];
    if (record) {
      this.setData({
        type: record.type,
        record: record,
        showEventDialog: true,
      })
    }

  },

  //加载数据
  async loadData() {
    try {
      let date = this.data.date;
      let child = getSelectedChild();
      let childId = child.childId;
      const res = await record.queryRecord(date, childId);
      let records = res.result.data;
      console.log("数据来自网络", records);
      return records;
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  //页面刷新
  updatePageUi(data) {
    try {
      //未定义
      if (!data) {
        return
      }
      //数组
      if (Array.isArray(data) && data.length > 0) {
        // 排序
        data.sort((a, b) => {
          const result = b.time.localeCompare(a.time);
          if (result != 0) {
            return result;
          }
          return b.clientModifyTime.localeCompare(a.clientModifyTime);
        });
        //更新页面
        data.forEach((ele, index) => {
          try {
            //扩展用于ui展示
            let ext = {
              x: 0, //侧滑删除归位
            };
            ele.ext = ext;
            //扩展用于ui展示
            ext.icon = getIcon(ele.type);

            ext.title = ele.event;
            ext.content = ele.event;
            ext.time = ele.time;

            //区分展示
            let type = ele.type;
            switch (type) {
              case 'feed':
                ext.title = ele.feedTitle;
                if (ele.feedType == 'breast_feed_by_self') {
                  if (ele.leftBreastFeeding || ele.rightBreastFeeding) {
                    ext.title = '亲喂中...';
                    ext.title_red = true;
                    ext.content = '结束喂养';
                    ext.content_red = true;
                  } else {
                    ext.content = '';
                    if (ele.leftTime > 0) {
                      ext.content += `左 ${formatMillis(ele.leftTime, 'mm:ss') } `
                    }
                    if (ele.rightTime > 0) {
                      ext.content += `右 ${formatMillis(ele.rightTime, 'mm:ss')} `
                    }
                    if (ele.leftTime > 0 && ele.rightTime > 0) {
                      ext.content += `总 ${formatMillis(ele.rightTime+ele.leftTime, 'mm:ss')} `
                    }
                  }
                } else {
                  ext.content = ele.volume + " 毫升";
                }
                break;
              case 'activity':
                ext.title = ele.activity.name;
                ext.content = "时长 " + formatMillis(ele.endTime - ele.startTime, 'HH:mm')
                ext.time = format(ele.startTime, 'HH:mm') + " - " + format(ele.endTime, 'HH:mm');
                break;
              case 'other':
                ext.title = '重要时刻';
                ext.content = ele.activity.name;
                break;
              case 'shit':
                ext.title = "换尿布";
                let status = ele.nbsStatus.name;
                if (!ext.content) {
                  ext.content = '';
                }
                if (status.includes('嘘嘘')) {
                  ext.content = " 嘘嘘";
                  if (ele.peeColor.name) {
                    ext.content += ` (${ele.peeColor.name})`
                  }
                }
                if (status.includes('便便')) {
                  ext.content += ` 💩`
                  if (ele.shitStatus.name) {
                    ext.content += ` (${ele.shitStatus.name})`
                  }
                  if (ele.shitAmount.name) {
                    ext.content += ` (${ele.shitAmount.name})`
                  }
                  if (ele.shitColor.name) {
                    ext.content += ` (${ele.shitColor.name})`
                  }
                }
                break;
              case 'food':
                ext.title = "辅食";
                ext.content = ele.solidFood.name;
                if (ele.volume) {
                  ext.content += " " + ele.volume;
                }
                if (ele.unit) {
                  ext.content += " " + ele.unit;
                }
                break;
              case 'sleep':
                if (ele.sleepStatus == 'sleeping') {
                  ext.title = "熟睡中😴...";
                  ext.title_red = true;
                  ext.content_red = true;
                  ext.content = "睡醒了"
                  ext.time = ele.time;
                } else {
                  ext.title = "睡醒了";
                  ext.content = "时长 " + formatMillis(ele.endTime - ele.startTime, 'HH:mm:ss')
                  ext.time = format(ele.startTime, 'HH:mm') + " - " + format(ele.endTime, 'HH:mm');
                }
                break;
              default:
                break;
            }
          } catch (error) {
            console.error(error)
          }
        });
      }
      this.setData({
        records: data
      })
      console.log("页面刷新", data);
    } catch (error) {
      console.error(error)
    }
  },

  //执行代办事项
  executeToList(e) {
    let index = e.currentTarget.dataset.index;
    let record = this.data.records[index];
    if (!record) {
      console.error('record is undefined')
      return
    }
    //睡眠中....
    if (record.type == 'sleep' && record.sleepStatus == 'sleeping') {
      eventBus.emit('wake', record)
    } else
      //亲喂中...
      if (record.type == 'feed' && record.feedType == 'breast_feed_by_self' && (record.leftBreastFeeding || record.rightBreastFeeding)) {
        eventBus.emit('end_feed', record)
      } else {
        this.onTapRecordItem(e);
      }
  },

  //修改日期，重新刷新日志
  onDateChange(e) {
    let date = e.detail.date;
    this.setData({
      date
    })
    this.fetchRemoteData();
  },


  //item侧滑展开
  onExpand(e) {
    console.log("侧滑展开", e);
    this.data.records.forEach((ele, i) => {
      if (i != e.target.dataset.index) {
        ele.ext.x = 0;
      } else {
        ele.ext.x = '-200'
      }
    });
    this.setData({
      records: this.data.records
    })
  },

  //item折叠
  onCollapse(e) {},

  //删除item
  async onDelete(e) {
    try {
      let index = e.target.dataset.index;
      let item = this.data.records[index];

      wx.showLoading();
      let childId = getSelectedChild().childId;
      let deleteResult = await record.deteleRecord(childId, item.recordId);

      if (deleteResult.result.success) {
        eventBus.emit("updateUi", {
          type: "delete",
          data: item
        });
      } else {
        wx.showToast({
          title: '删除失败',
          icon: "error"
        })
      }
      wx.hideLoading();
    } catch (error) {
      wx.showToast({
        title: '未知错误',
        icon: 'error'
      })
      wx.hideLoading();
      console.error(error)
    }
  },

  //图片预览
  previewImage(e) {
    let index = e.currentTarget.dataset.index;
    let record = this.data.records[index];
    if (!record) {
      return
    }

    let img = record.imgSrc;
    if (img) {
      wx.previewImage({
        urls: [img],
      })
    }
  },
  //监听child picker 点击事件
  onChildPickerTap() {
    let childs = getChilds();
    let disabled = !childs || childs.length == 0;
    if (disabled) {
      wx.showToast({
        title: '请先添加宝宝',
        icon: 'error'
      })
      setTimeout(() => {
        this.addChild()
      }, 300);
    }
  },
  //跳转至添加小宝页面
  addChild() {
    wx.navigateTo({
      url: '/pages/editBabyInfo/editBabyInfo?type=add',
      events: {
        onFinish: (function (data) {
          this.refreshUser();
        }).bind(this),
      },
      success(res) {}
    })
  },

  //点击选项列表
  onTapItem(e) {
    try {
      let index = e.detail.index;
      let type = getEventList()[index].type;
      console.log("点击底部+按钮", e);
      this.setData({
        type,
        showEventDialog: true,
        record: {},
      })
    } catch (error) {
      console.error(error)
    }
  },

  //点击页面其他位置，收起圆形按钮
  tapPage() {
    this.hideCircleAddBtn();
  },

  //隐藏弹框
  hide() {
    this.setData({
      showEventDialog: false
    })
  },

});