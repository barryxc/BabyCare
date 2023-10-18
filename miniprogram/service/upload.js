const {
  getUuid
} = require("./uuid");

async function upload(filepath, prefix) {
  if (filepath.startsWith("cloud")) {
    return {
      success: true,
      fileID: filepath,
    }
  }
  let fileName;
  if (prefix) {
    fileName = prefix + "_upload_" + getUuid() + ".png";
  } else {
    fileName = "upload_" + getUuid() + ".png";
  }
  let uploadResult = await wx.cloud.uploadFile({
    // 指定上传到的云路径
    cloudPath: fileName,
    // 指定要上传的文件的小程序临时文件路径
    filePath: filepath,
    config: {
      env: getApp().globalData.envId
    }
  })
  if (uploadResult.fileID) {
    return {
      success: true,
      fileID: uploadResult.fileID,
    }
  }
  return {
    success: false,
    errMsg: "上传失败"
  }
}


module.exports = {
  upload
}