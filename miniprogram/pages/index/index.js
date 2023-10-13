let {
  getDate,
  addDay,
  weekDay,
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
    childs: [],
    selectChild: {},
    nickName: "",
    day: getDate(),
    week: weekDay(),
    cache: {},
    records: [],
    showModalDialog: false,
    record: {},
    index: '',
    eventList: [],
    navigationBarHeight: 0,
    showDateAddBtn: false,
    opacity: 0.3,
    endDay: getDate(),
  },

  onPageScroll(e) {
    const scrollTop = e.scrollTop; // 获取滚动的位置
    console.log("页面滚动距离", scrollTop);
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.refreshData(getSelectedChild().childId);
    eventBus.on("setUserInfo", () => {
      let childs = getChilds();
      this.setData({
        childs: childs,
        selectChild: getSelectedChild(),
      })
      this.refreshData(getSelectedChild().childId);
    });

    eventBus.on("childChange", (child) => {
      let childs = getChilds();
      this.setData({
        childs: childs,
        selectChild: getSelectedChild(),
      })
      this.refreshData(getSelectedChild().childId);
    });
    this.setData({
      eventList: getEventList(),
    })

    eventBus.on('addRecord', (res) => {
      console.log("监听新增记录", res)
      if (!this.data.cache[res.date]) {
        this.date.cache[res.date] = [];
      }
      //新增记录添加到缓存
      this.data.cache[res.date].push(res.data)

      //如果新增记录的是当前页面所选择的日期，则刷新页面
      if (res.date == this.data.day) {
        this.rearrange(this.data.cache[res.date]);
      }

    });
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
    this.refreshData(getSelectedChild().childId);
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
        this.refreshData(getSelectedChild().childId);

        eventBus.emit("childChange", child); //事件
      }

    } catch (error) {
      console.error(error);
    }
  },

  //刷新页面
  refreshData(childId) {
    if (!childId) {
      this.setData({
        records: [],
      })
      wx.stopPullDownRefresh();
      wx.hideLoading();
      return
    }
    this.loadData().then((res) => {
      this.rearrange(res);
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
    let record = e.currentTarget.dataset.record;
    let index = e.currentTarget.dataset.index;
    this.setData({
      record: record,
      index: index,
      showModalDialog: true,
    })
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
      return this.data.cache[this.data.day]
    }

    lastSyncTime = currentTime;
    let day = this.data.day;
    let child = getSelectedChild();
    let childId = child.childId;
    try {
      const res = await record.queryRecord(day, childId);
      let records = res.result.data;
      console.log("数据来自网络:", records);
      return records;
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  //页面刷新
  rearrange(data) {
    if (data && Array.isArray(data) && data.length > 0) {
      // 排序
      data.sort((a, b) => {
        const result = b.time.localeCompare(a.time);
        if (result != 0) {
          return result;
        }
        return b.clientDate.localeCompare(a.clientDate);
      });
      //设置图标,显示时间
      data.forEach((ele, index) => {
        ele.icon = getIcon(ele.type);
        ele.displayTime = this.displayTime(ele.time);
        //左滑删除--归位
        ele.x = 0;
      });
    }
    if (data) {
      //缓存数据
      this.data.cache[this.data.day] = data;
    }
    console.log("页面刷新：", data);
    this.setData({
      records: data ? data : [],
    });
  },

  //格式化时间
  displayTime(time, showHour = true) {
    if (showHour) {
      return time;
    }
    let timeStr = String(time);
    return timeStr.substr(3, 2);
  },

  //修改日期，重新刷新日志
  onDateChange(e) {
    this.refreshData();
    this.setData({
      week: weekDay(this.data.day),
    })
    let date = this.data.day;
    let currentDay = getDate();

    if (date >= currentDay) {
      this.setData({
        opacity: 0.3
      })
    } else {
      this.setData({
        opacity: 1
      })
    }

  },
  //+1天
  onDateAdd(e) {
    let diff = e.currentTarget.dataset.diff;
    let date = addDay(this.data.day, diff);
    console.log("date", date);
    let currentDay = getDate();
    if (date >= currentDay) {
      this.setData({
        opacity: 0.3
      })
    } else {
      this.setData({
        opacity: 1
      })
    }

    if (date <= currentDay) {
      this.setData({
        day: date,
        week: weekDay(date)
      })
      wx.showLoading({
        title: '',
      })
      let childId = getSelectedChild().childId;
      this.refreshData(childId);
    }
  },

  //记录
  recordEvent(e) {
    console.log("点击底部+按钮", e);
    wx.navigateTo({
      url: '/pages/recordLife/recordLife',
    })
  },

  //item侧滑展开
  onExpand(e) {
    console.log("侧滑展开事件", e);
    this.data.records.forEach((ele, i) => {
      if (i != e.target.dataset.index) {
        ele.x = 0;
      } else {
        ele.x = '-100'
      }
    });
    this.setData({
      records: this.data.records
    })
  },
  //item折叠
  onCollapse(e) {
    console.log("侧滑折叠事件", e);
  },

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
        this.setData({
          records: dataset,
        })
        eventBus.emit("deleteRecord", item);
      } else {
        wx.showToast({
          title: '删除失败',
          icon: "error"
        })
      }
      wx.hideLoading();
      this.setData({
        showModalDialog: false
      })
    } catch (error) {
      console.error(error)
    }
  },

  //图片预览
  displayImg(e) {
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
  //添加小宝
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
  }
});