const app = getApp();

var amapFile = require('../../amap/amap-wx.js'); //如：..­/..­/libs/amap-wx.js
console.log(amapFile);

import {
  request,
  transformPHPTime,
  countDown, //倒计时

} from '../../utils/util.js';

import {
  Encrypt,
  Decrypt
} from '../../utils/public.js'
const winWidth = app.globalData.windowWidth,
  winHeight = app.globalData.windowHeight,
  shuaHeight = 40;

let setIntArr = [];
let setIntThArr = [];

Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    page_size: 10,
    page_index: 0,
    heightMt: app.globalData.heightMt + 20 * 2,
    offAccData: [],
    navbarData: {
      showCapsule: 0, //是否显示左上角图标,
      isIndex: 1,
      msgStatus: 0
    }
  },
  onLoad: function() {
    const that = this;
    that.getNews();
    that.getLocation();
  },
  getLocation: function() {
    const that = this;
    let myAmapFun = new amapFile.AMapWX({
      key: app.globalData.amapKey
    });
    // var weather = new amapFile.Weather();

    myAmapFun.getWeather({

      success: function(data) {
        console.log(data);
        that.setData({
          weather: data
        });
      },
      fail: function(info) {
        wx.showModal({
          title: info.errMsg
        })
      }
    })

  },
  showMarkerInfo: function(data, i) {
    var that = this;
    that.setData({
      textData: {
        name: data[i].name,
        desc: data[i].address
      }
    });
  },
  changeMarkerColor: function(data, i) {
    var that = this;
    var markers = [];
    for (var j = 0; j < data.length; j++) {
      if (j == i) {
        data[j].iconPath = "选中 marker 图标的相对路径"; //如：..­/..­/img/marker_checked.png
      } else {
        data[j].iconPath = "未选中 marker 图标的相对路径"; //如：..­/..­/img/marker.png
      }
      markers.push(data[j]);
    }
    that.setData({
      markers: markers
    });
  },

  getNews: function() {
    const that = this;
    let page_index = that.data.page_index;
    that.setData({
      loading_hidden: false
    })
    request('post', 'get_gzh_news.php', {
      page_size: that.data.page_size,
      page_index: page_index
    }).then(res => {
      that.setData({
        loading_hidden: true
      })
      if (res.err_code != 0) {
        that.data.page_index = page_index == 0 ? 0 : page_index - 1;
        return;
      }
      let newOffAccData = res.data.item,
        thatOffAccData = that.data.offAccData;

      newOffAccData = page_index != 0 ? thatOffAccData.concat(newOffAccData) : newOffAccData;

      that.setData({
        offAccData: newOffAccData
      })
    })
  },

  toOff: function(e) {
    let url = e.currentTarget.dataset.url;
    app.globalData.web_url = url;
    wx.navigateTo({
      url: `../offiAc/offiAc`
    })

  },

  uncompileStr(code) {
    code = unescape(code);
    var c = String.fromCharCode(code.charCodeAt(0) - code.length);
    for (var i = 1; i < code.length; i++) {
      c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
    }
    return c;
  },

  onReachBottom: function() {
    const that = this;
    if (!that.data.loading_hidden) {
      return;
    }
    that.data.page_index++;
    that.getNews();
  },

})