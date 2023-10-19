function tipError(e){
  wx.hideLoading();
  console.log(JSON.stringify(e))
  wx.showToast({
    title: '失败了',
    icon: "none"
  })
}

module.exports={
  tipError
}