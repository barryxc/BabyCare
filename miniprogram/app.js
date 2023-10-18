// app.js
const {
  syncUserInfo,
  setUser
} = require("./service/user");

App({

  onLaunch: function (options) {
    console.log("小程序启动", options)
    this.globalData = {
      title: "记录宝宝成长",
      envId: "cloud1-3gt9kvvh7349fcdc",
      debounceTime: 500
    };

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1',
        traceUser: true,
      });

      wx.authorize({
        scope: 'scope.userInfo',
        success() {
          wx.getUserInfo()
        }
      })
    };
  },
  onShow(options) {
    //判断来源
    console.log("小程序显示", options)
    if (options.query.inviteId) {
      console.log('从分享中打开')
      this.globalData.inviteId = options.query.inviteId
      this.globalData.expire = options.query.expire
      wx.getShareInfo({
        shareTicket: options.shareTicket,
        success(res) {
          console.log(res)
        }
      })
    };
  }
});