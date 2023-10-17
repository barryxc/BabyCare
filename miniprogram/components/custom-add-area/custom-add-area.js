// components/custom-add-area/custom-add-area.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: [{
        name: "测试1",
      }, {
        name: "测试2",
      }]
    },
    editable: {
      type: Boolean,
      value: true
    },
    selectIndex: {
      type: Number,
      value: -1
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    //点击选中
    onClick(e) {
      let index = e.currentTarget.dataset.index;
      let data;
      if (this.data.selectIndex == index) {
        index = -1; //取消点击
        data = {};
      } else {
        data = this.data.data[index];
      }
      this.setData({
        selectIndex: index
      })

      this.triggerEvent("change", {
        index,
        data,
      });
    },

    //获取选中的item
    getSelect() {
      if (selectIndex) {
        return this.data.data[selectIndex];
      }
    },

    //点击＋按钮
    clickAddBtn(e) {
      this.setData({
        showAddDialog: true,
        addContent: ""
      })
    },

    //提交
    submit(e) {
      let content = e.detail.value.content;
      if (!content) {
        console.log("内容不能为空");
        return
      }
      let data = this.data.data;
      if (!data) {
        data = [];
      }
      let index = data.findIndex((e) => e.name == content);
      if (index == -1) {
        let add = {
          name: content
        };
        data.push(add);
        this.setData({
          data
        })
        this.triggerEvent('onItemsChanged', this.data.data);
      }

      this.setData({
        showAddDialog: false
      })
    },

    //取消
    reset(e) {
      this.setData({
        showAddDialog: false
      })
    },

    //删除item
    deleteItem(e) {
      let data = this.data.data;
      let index = e.currentTarget.dataset.index;
      if (data) {
        data.splice(index, 1);
        this.setData({
          data
        })
        this.triggerEvent('onItemsChanged', this.data.data)
      }



    }
  }
})