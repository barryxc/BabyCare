// components/editRecord/EditRecordModal.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    record: {
      type: Object,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    icon: ""
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onCancel() {
      this.setData({
        show: false,
      })
    },

    onConfirm(e) {
      console.log("触发确认事件", e);
      this.triggerEvent('onConfirm', e);
    },
    onDelete(e) {
      console.log("触发刪除事件", e);
      this.triggerEvent("onDelete", e);
    },
    previewImg(e) {
      if (this.data.record.imgSrc) {
        wx.previewImage({
          urls: [this.data.record.imgSrc],
        })
      }
    },
    dismiss() {
      this.setData({
        show: false
      })
    },
    stopPropagation(e) {
    }
  }
})