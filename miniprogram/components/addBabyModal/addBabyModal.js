// components/addBabyModal/addBabyModal.js
const {
  getChilds:getBaby
} = require("../../service/user");
const { getUuid } = require("../../service/uuid");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    date: {
      type: String,
    },
    show: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    avatar: "",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    cancel() {
      this.triggerEvent('onCancel', this.data);
      this.setData({
        show: false
      })
    },

    //添加宝宝
    confirm(e) {
      let childs = getBaby();
      let babyInfo = e.detail.value;
      babyInfo.avatar = this.data.avatar;
      let child = {
        ...babyInfo,
        childId: getUuid(),
      };
      if (!childs || (Array.isArray(childs) && childs.length == 0)) {
        child.check = true;
      }
      if (!child.name) {
        wx.showToast({
          title: '未填写昵称',
          icon: "error"
        })
        return
      }
      if (!child.date) {
        wx.showToast({
          title: '未填写出生日期',
          icon: "error"
        })
        return
      }
      this.triggerEvent('onConfirm', child);
    },
    chooseImg() {
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function (res) {
          const tempFilePaths = res.tempFilePaths
          this.setData({
            avatar: tempFilePaths[0]
          })
        }.bind(this)
      });
    },

    inputWeightChange(e) {
      let value = e.detail.value;
      this.checkInput(value);
    },
    inputHeightChange(e) {
      let value = e.detail.value;
      this.checkInput(value);
    },

    checkInput(value) {
      let result = isNaN(value);
      if (result) {
        wx.showToast({
          title: '请输入数字',
          icon: 'none',
          duration: 800,
        });
      }
    }
  },

})
