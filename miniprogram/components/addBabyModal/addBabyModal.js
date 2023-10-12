// components/addBabyModal/addBabyModal.js
const {
  getDate
} = require("../../service/date");
const {
  defaultAvatar
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
    }
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
    defaultAvatar: defaultAvatar,
    childId: "",
    avatar: '',
    date: '',
    name: '',
    gender: 0,
    weight: "",
    height: "",
    endDay: getDate(),
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
      let weight = child.weight;
      if (weight && (Number.isNaN(Number(weight)) || child.weight > 100)) {
        wx.showToast({
          title: '体重不符合要求',
          icon: "error"
        })
        return
      }

      let height = child.height;
      if (height && (Number.isNaN(Number(height)) || height > 200)) {
        wx.showToast({
          title: '身高不符合要求',
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

    //选择头像
    chooseImg() {
      if (this.data.babyInfo.shared) {
        return
      }
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