const {
  getUuid
} = require("./uuid");

function upload(filepath, prefix) {
  let fileName;
  if (prefix) {
    fileName = prefix + "_upload_" + getUuid() + ".png";
  } else {
    fileName = "upload_" + getUuid() + ".png";
  }
  return wx.cloud.uploadFile({
    // 指定上传到的云路径
    cloudPath: fileName,
    // 指定要上传的文件的小程序临时文件路径
    filePath: filepath,
    config: {
      env: getApp().globalData.envId
    }
  })
}


module.exports = {
  upload
}