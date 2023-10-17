// components/date-time-picker/date-time-picker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    value: {
      value: Date.now(),
    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    now: Date.now(),
    maxDate:Date.now(),
  },

  lifetimes: {
    ready() {
      this.setData({
        maxDate: Date.now(),
        now: Date.now(),
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClose() {
      console.log("关闭")
      this.setData({
        show: false
      })
    },
    onConfirm(e) {
      let value = e.detail;
      console.log("确认", e);
      this.onClose();
      this.setData({
        value,
      })
      this.triggerEvent("onConfirm", {
        ts: e.detail
      })
    },
    onCancel(e) {
      this.onClose()
    },
    showPicker(e) {
      console.log("显示datetime picker", );
      this.setData({
        show: true,
      })

    },
  },

})