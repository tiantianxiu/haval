// pages/luckDraw/luckDraw.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    luckNum: 0,
    winNum: 3
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  settimeout: function(t) {
    const that = this;
    if (!t)
      return;
    setTimeout(() => {
      that.setData({
        luckNum: that.data.luckNum != 7 ? that.data.luckNum + 1 : 0
      })
      that.settimeout(t - 1);
    }, 400)
  },
  fackTimeOut: function (t) {
    const that = this;
    if(!t){
      that.settimeout(8 - that.data.luckNum + that.data.winNum);
      return;
    }
    setTimeout(() => {
      that.setData({
        luckNum: that.data.luckNum != 7 ? that.data.luckNum + 1 : 0
      })
      that.fackTimeOut(t-1)
    }, 160)
  },
  draw: function() {
    this.fackTimeOut(11);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})