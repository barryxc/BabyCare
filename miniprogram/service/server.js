const env = "cloud1-3gt9kvvh7349fcdc";

async function callServer(data) {
  console.log("server param ", data);
  let result;
  try {
    result = await wx.cloud.callFunction({
      config: {
        env,
      },
      name: "quickstartFunctions",
      data: data
    });
    wx.hideLoading();
  } catch (e) {
    wx.hideLoading();
    console.error("callServer error ", data, e);
  }
  return result;
}

module.exports = {
  callServer,
}