let {
  getDay,
  addDay,
} = require('../../service/date.js');
const record = require("../../service/record.js");
const {
  getSelectedChild,
  register,
  getChilds,
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
    day: getDay(),
    cache: {},
    records: [],
    showModalDialog: false,
    record: {},
    eventList: [],
    navigationBarHeight: 0,
    disabled: true,
    value: 0,
  },

  onPageScroll(e) {
    const scrollTop = e.scrollTop; // 获取滚动的位置
    console.log("页面滚动距离", scrollTop);
    // if (scrollTop >= 0) {
    //   // 当滚动位置超过组件顶部时，说明组件已经达到固定位置
    //   this.setData({
    //     fixed: 'sticky',
    //   })
    //   // 执行其他操作，比如改变组件的样式
    // } else {
    //   // 执行其他操作
    //   this.setData({
    //     fixed: 'relative',
    //   })
    // }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.refreshData(getSelectedChild().childId);
    register((userinfo) => {
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

    // 获取胶囊信息
    const rect = wx.getMenuButtonBoundingClientRect();
    const capsuleHeight = rect.height;
    const capsuleTop = rect.top;
    // 设置胶囊信息到 data 中
    this.setData({
      navigationBarHeight: (capsuleHeight + capsuleTop)
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
      let childs = getChilds();
      if (!childs) {
        return
      }
      let child = childs[e.detail.value];
      if (child.childId) {
        this.setData({
          selectChild: child
        })
        //本地缓存
        wx.setStorageSync('selectChildId', child.childId)
        this.refreshData(getSelectedChild().childId);
      }

    } catch (error) {
      console.error(error);
    }
  },

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

  onTapRecordItem(e) {
    console.log("onTapRecordItem", e);
    let record = e.currentTarget.dataset.data;
    this.setData({
      record: record,
      showModalDialog: true,
    })
  },

  //加载数据
  async loadData() {
    let currentTime = new Date().getTime();
    let interval = currentTime - lastSyncTime;
    if (interval < 2000) {
      console.log("刷新频率太快", interval);
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

        ele.showBottomAxis = true;
        ele.showTopAxis = true;

        if (index == 0) {
          ele.showTopAxis = false;
        }
        if (index == data.length - 1) {
          ele.showBottomAxis = false;
        }
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
  },
  //+1天
  onDateAdd(e) {
    let diff = e.currentTarget.dataset.diff;
    let date = addDay(this.data.day, diff);
    console.log("date", date);
    this.setData({
      day: date
    })
    wx.showLoading({
      title: '',
    })
    let childId = getSelectedChild().childId;
    this.refreshData(childId);
  },

  //记录
  recordEvent(e) {
    console.log("点击底部+按钮", e);
    wx.navigateTo({
      url: '/pages/recordLife/recordLife',
      events: {
        addRecord: (res) => {
          console.log("监听新增的记录")
          this.data.records.push(res.data);
          console.log(this.data.records);
          this.rearrange(this.data.records);
        },
      }
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
  onCollapse(e) {
    console.log("侧滑折叠事件", e);
  },

  async onDelete(e) {
    try {
      let index = e.target.dataset.index;
      let item = this.data.records[index];

      wx.showLoading();
      let childId = getSelectedChild().childId;
      let deleteResult = await record.deteleRecord(childId, item.recordId);

      if (deleteResult.result.stats.removed > 0) {
        const dataset = this.data.records.filter((record, i) => i != index);
        this.setData({
          records: dataset,
        })
      } else {
        wx.showToast({
          title: '删除失败',
          icon: "error"
        })
      }
      wx.hideLoading();
    } catch (error) {
      console.error(error)
    }
  },

  onTapDatePicker(e) {}
});