const {
  getEventList
} = require("../../service/eventlist");

// components/addBtnDrop/AddBtnDrop.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    open: false,
    data: {
      type: Object,
      value: [{
        desc: '喂养',
        icon: "../../images/formula.svg",
        width: 60,
      }, {
        desc: '换尿布',
        icon: "../../images/nbs.svg",
        width: 60,
      }, {
        desc: '辅食',
        icon: "../../images/food.svg",
        width: 60,
      }, {
        desc: '笔记',
        icon: "../../images/note.svg",
        width: 60,
      }],
    }
  },

  lifetimes: {
    attached() {
      this.setData({
        data: getEventList()
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    touch(e) {

    },
    //切换按钮
    clickAddBtn(e) {
      let open = !this.data.open;
      this.setData({
        open
      })
    },

    onItemClick(e) {
      let index = e.currentTarget.dataset.index;
      let value = this.data.data[index];
      console.log("点击了", index, value);
      this.triggerEvent("onTapItem", {
        index,
        value
      });
    },

    show(show) {
      this.setData({
        open: show,
      })
    }
  }
})