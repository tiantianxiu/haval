const app = getApp()
Component({
  properties: {
    navfarData: { //navfarData   由父页面传递的数据，变量名字自命名
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {}
    }
  },
  data: {
    showAuthorization: false,
    navfarData: {
      position: 'index',
    },
  },
  attached: function() {
    const that = this
    // 获取是否是通过分享进入的小程序
    // 定义导航栏的高度   方便对齐
    that.setData({
      heightMt: app.globalData.heightMt
    })
    that.setData({
      share: app.globalData.share
    })
    if (app.globalData.share)
      app.globalData.share = false
  },
  methods: {
    // 返回上一页面
    backtap() {
      wx.navigateBack({
        delta: 1
      })
    },
    //返回到首页
    hometap() {
      const that = this;
      
      wx.switchTab({
        url: '/pages/index/index'
      });
    },
    sharetap() {
      const that = this
      let headerShare = {}
      that.triggerEvent('headerShare', headerShare) //myevent自定义名称事件，父组件中使用
    },
    hideShareBox: function() {
      this.setData({
        showShareBox: false,
        showReply: false
      })
    },
    squareTap: function(){
      this.triggerEvent('squareTap');
    },
    squareLong: function(){
      this.triggerEvent('squareLong');
    },
    showAdd(){
      this.setData({
        show_add: !this.data.show_add
      })
    },
    swiTap(e){
      const item = e.currentTarget.dataset.item
      let pages = getCurrentPages(), //获取加载的页面
       currentPage = pages[pages.length - 1], //获取当前页面的对象
       url = currentPage.route; //当前页面url
      if (url.split('/')[2] == 'index' && item == 'index'){
        this.triggerEvent('switchTapFt', {'currentTab': 0});
        return;
      }
      if(item == 'index')
        app.globalData.currentTab = 0;
      wx.switchTab({
        url: `/pages/${item}/${item}`
      })
      
    },
    navTap(e){
      const item = e.currentTarget.dataset.item;
      app.canAddThread().then(res=>{
        console.log(res)
        if(res)
          wx.navigateTo({
            url: `/pages/${item}/${item}`
          });
      }).catch(rej=>{
        this.showAuthorization();
      })
    },
    showAuthorization: function(){
      this.setData({
        showAuthorization: true
      })
    },
    noneTap(){
      wx.showToast({
        title: '功能开发中~',
        icon: 'none'
      })
    }

  }

})