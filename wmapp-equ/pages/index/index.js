const app = getApp();
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
    page_size: 10,
    page_index: 0,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 0, //是否显示左上角图标,
      isIndex: 1,
      msgStatus: 0
    }
  },
  onLoad: function(){
    const that = this;
    request('post','get_gzh_news.php',{
      page_size: that.data.page_size,
      page_index: 0
    }).then(res=>{
      if(res.err_code != 0)
        return;
      that.setData({
        offAccData: res.data.item
      })
    })
  },
})