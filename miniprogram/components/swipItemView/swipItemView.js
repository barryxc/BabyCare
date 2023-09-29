// components/swipItemView/swipItemView.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    width: {
      type: String
    },
    height: {
      type: String
    },
    showDelete: {
      type: Boolean,
      value: true,
    },
    showEdit: {
      type: Boolean,
      value: false,
    },
    index: {
      type: Number,
    },
    x: {
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    startX: 0, // 起始触摸点的横坐标
    originalX: 0, //触摸前的初始横向位置
    hideWidth: 0,
  },

  lifetimes: {
    attached() {
      if (this.data.showDelete) {
        this.createSelectorQuery().select('.delete-button').boundingClientRect((rect) => {
          if (rect) {
            this.setData({
              hideWidth: this.data.hideWidth + rect.width,
            })
          }
        }).exec();
      }
      if (this.data.showEdit) {
        this.createSelectorQuery().select('.delete-button').boundingClientRect((rect) => {
          if (rect) {
            this.setData({
              hideWidth: this.data.hideWidth + rect.width,
            })
          }
        }).exec();
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {

    onMovableChange(e) {},

    //滑动监听
    onSlide(e) {},
    //触摸开始
    touchStart(e) {
      this.setData({
        originalX: this.data.x,
        startX: e.changedTouches[0].clientX,
      });
    },
    // 触摸结束
    async touchEnd(e) {
      const currentX = e.changedTouches[0].clientX;
      const offsetX = currentX - this.data.startX;

      // 超过40%
      if (Math.abs(offsetX) >= this.data.hideWidth * 0.4) {
        // 左滑，展开布局
        if (offsetX < 0) {
          this.setData({
            x: `-${this.data.hideWidth}`,
          });
          this.triggerEvent('expand', e);
        } else {
          // 右滑，折叠布局
          this.setData({
            x: 0,
          });
          this.triggerEvent('collapse', e);
        }
      } else {
        // 恢复原状
        this.setData({
          x: this.data.originalX
        })
      }
    },

    onDelete(e) {
      console.log("删除事件", e);
      this.triggerEvent('onDelete', e);
    }
  }
})