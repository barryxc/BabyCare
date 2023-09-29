function showModal(content,showCancel=false){
  wx.showModal({
    content,
    showCancel
  });
}
module.exports={
  showModal
}