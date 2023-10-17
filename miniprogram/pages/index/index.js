let {
  getToday,
  formatDiff,
  format,
  formatMillis,
} = require('../../service/date.js');
const record = require("../../service/record.js");
const {
  getSelectedChild,
  getChilds,
  eventBus,
} = require('../../service/user.js');
const {
  getEventList,
  getIcon
} = require('../../service/eventlist.js');

let lastSyncTime = 0;

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
    cache: {},
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
    this.fetchRemoteData();
    eventBus.on("setUserInfo", () => {
      let childs = getChilds();
      this.setData({
        childs: childs,
        selectChild: getSelectedChild(),
      })
      this.fetchRemoteData();
    });

    eventBus.on("childChange", (child) => {
      let childs = getChilds();
      this.setData({
        childs: childs,
        selectChild: getSelectedChild(),
      })
      this.fetchRemoteData();
    });

    eventBus.on('addRecord', (res) => {
      try {
        console.log("监听新增记录", res)
        if (!this.data.cache[res.date]) {
          this.data.cache[res.date] = [];
        }
        //新增记录添加到缓存
        let fromCache = this.data.cache[res.date];
        let index = fromCache.findIndex((e) => e.recordId == res.data.recordId);
        if (index != -1) {
          fromCache[index] = res.data;
        } else {
          fromCache.push(res.data)
        }

        //如果新增记录的是当前页面所选择的日期，则刷新页面
        if (res.date == this.data.date) {
          this.updatePageUi(this.data.cache[res.date]);
        }
      } catch (error) {
        console.error(error);
      }

    });

    eventBus.on('hideCircleAddBtn', (data) => {
      this.hideCircleAddBtn();
    })
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
  onUnload() {},


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

  //刷新页面
  fetchRemoteData() {
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
    let currentTime = new Date().getTime();
    let interval = currentTime - lastSyncTime;
    if (interval < getApp().globalData.debounceTime) {
      console.log("刷新频率太快", interval);
      wx.showToast({
        title: '刷新太频繁了',
      })
      //从缓存中取数据
      console.log("数据取自缓存", this.data.cache);
      return this.data.cache[this.data.date]
    }

    lastSyncTime = currentTime;
    let date = this.data.date;
    let child = getSelectedChild();
    let childId = child.childId;
    try {
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
      if (data && Array.isArray(data) && data.length > 0) {
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

            let type = ele.type;
            switch (type) {
              case 'feed':
                if (ele.feedType == 'breast_feed_by_self') {
                  if (ele.leftBreastFeeding || ele.rightBreastFeeding) {
                    ext.title = '亲喂中...';
                    break
                  }
                }
                ext.title = ele.feedTitle;
                break;
              case 'activity':
                ext.title = ele.activity.name;
                break;
              case 'other':
                ext.title = '重要时刻';
                break;
              case 'shit':
                ext.title = "换尿布";
                break;
              case 'food':
                ext.title = "辅食";
                break;
              case 'sleep':
                if (ele.sleepStatus == 'sleeping') {
                  ext.title = "熟睡中😴...";
                } else {
                  ext.title = "睡醒了";
                }
                break;
              default:
                ext.title = ele.event;
                break;
            }

            switch (type) {
              case 'feed':
                if (ele.feedType != 'breast_feed_by_self') {
                  ext.content = ele.volume + " 毫升";
                } else {
                  if (ele.leftBreastFeeding || ele.rightBreastFeeding) {
                    ext.content = '结束喂养';
                    ext.content_clickable = true
                  } else {
                    ext.content_clickable = false
                    ext.content = '左(' + formatMillis(ele.leftTime, 'mm:ss') + ") 右(" + formatMillis(ele.rightTime, 'mm:ss') + ') 总(' + formatMillis(ele.leftTime + ele.rightTime, 'mm:ss') + ")";
                  }
                }
                break;
              case 'activity':
                ext.content = "时长 " + formatDiff(ele.endTime, ele.startTime, 'HH:mm')
                break;
              case 'sleep':
                if (ele.sleepStatus == 'sleeping') {
                  ext.content_clickable = true;
                  ext.content = "睡醒了"
                } else {
                  ext.content = "时长 " + formatDiff(ele.startTime, ele.endTime, 'HH:mm')
                }
                break;
              case 'other':
                ext.content = ele.activity.name;
                break;
              case 'shit':
                let status = ele.nbsStatus.name;
                if (status.includes('嘘嘘')) {
                  ext.content = " 嘘嘘";
                  if (ele.peeColor.name) {
                    ext.content += ` (${ele.peeColor.name})`
                  }
                }
                if (status.includes('便便')) {
                  ext.content = ` 💩`
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
                ext.content = ele.solidFood.name;
                if (ele.volume) {
                  ext.content += " " + ele.volume;
                }
                if (ele.unit) {
                  ext.content += " " + ele.unit;
                }
                break;
              default:
                ext.content = ele.event;
                break;
            }


            switch (type) {
              case 'activity':
                ext.time = format(ele.startTime, 'HH:mm') + "-" + format(ele.endTime, 'HH:mm');
                break;
              default:
                ext.time = ele.time;
                break;
            }
          } catch (error) {
            console.error(error)
          }

        });
      }
      if (data) {
        //缓存数据
        this.data.cache[this.data.date] = data;
      }
      console.log("页面刷新", data);
      if (data) {
        this.setData({
          records: data
        });
      } else {
        this.setData({
          records: []
        })
      }
    } catch (error) {
      console.error(error)
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
        const dataset = this.data.records.filter((record, i) => i != index);
        this.data.cache[this.data.date] = dataset;
        this.setData({
          records: dataset,
          cache: this.data.cache
        })
        eventBus.emit("deleteRecord", item);
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

  hide() {
    this.setData({
      showEventDialog: false
    })
  },

});