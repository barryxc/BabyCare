// components/addBabyModal/addBabyModal.js
const {
  getChilds: getBaby
} = require("../../service/user");
const {
  getUuid
} = require("../../service/uuid");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    babyInfo: {
      type: Object
    },
    show: {
      type: Boolean,
      value: false,
    },
  },

  lifetimes: {
    attached: function (e) {},

    ready() {
      this.setData({
        ...this.data.babyInfo,
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    childId: "",
    avatar: '',
    date: '',
    name: '',
    gender: 0,
    weight: "",
    height: "",
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
      let value = e.detail.value;
      let child = {
        ...value
      };
      if (!this.data.childId) {
        child.childId = getUuid(); //新增
      } else {
        child.childId = this.data.childId; //编辑
      }

      child.avatar = this.data.avatar;

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

    //日期变化
    onDateChange(e) {
      console.log(e)
    },

    chooseImg() {
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function (res) {
          const tempFilePaths = res.tempFilePaths
          let avatar = tempFilePaths[0];
          this.setData({
            avatar,
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