Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#c8c8ff",
    list: [{
      pagePath: "/pages/index/index",
      iconPath: "../images/home_light.svg",
      selectedIconPath: "../images/home_fill_light.svg",
      text: "首页"
    }, {
      pagePath: "/pages/stastics/stastics",
      iconPath: "../images/statistics-outlined.svg",
      selectedIconPath: "../images/statistics-filled.svg",
      text: "统计"
    }, {
      pagePath: "/pages/my/my",
      iconPath: "../images/my_light.svg",
      selectedIconPath: "../images/my_fill_light.svg",
      text: "我的"
    }]
  },
  attached() {
  },

  methods: {
    switchTab(e) {
      const value = e.currentTarget.dataset;
      const url = value.path;
      wx.switchTab({
        url
      });
      this.setData({
        selected: value.index
      });
    }
  }
})