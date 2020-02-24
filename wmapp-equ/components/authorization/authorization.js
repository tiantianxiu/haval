var app = getApp()
Component({
  properties: {
    showAuthorization: {
      type: Boolean,
      value: true,
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {}
  },
  methods: {
    // 这里是一个自定义方法
    hideAuthorization: function() {
      const that = this
      that.setData({
        showAuthorization: false
      }) 
      that.triggerEvent('rejectAuthorizeFun')
    },
    authorization: function(e) {
      const that = this
      app.bindGetUserInfo(e).then((res) => {
        that.hideAuthorization()
      //res==1:同意授权；res==0:拒绝授权
        if (res == 1) {
          that.triggerEvent('agreeAuthorizeFun')
        } else {
          that.triggerEvent('rejectAuthorizeFun')
        }
      })

    }
  }
})