const app = getApp()
import {
  request
} from '../../utils/util.js'
Component({
  properties: {
    isBrand: {
      type: Boolean,
      value: false
    },
    carModelShow: {
      type: Boolean,
      value: false
    },
    hasPraise: {
      type: Boolean,
      value: false
    },
    isPraise: {
      type: Boolean,
      value: false
    },
    hasQuest: {
      type: Boolean,
      value: false
    },
    wantList: {
      type: Boolean,
      value: false
    }
  },
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    level: 1,
    upid: 0,
    brandList: '', //车品牌
    systemList: '', //车系
    ModelList: '',
    base_url: getApp().globalData.base_url,
    windowHeight: '',
    otherHeight: 70,
    fixedTabScrollTop: 0,
    scrollToId: '',
    arr: [],
    car_1: '',
    car_2: '',
    car_3: '',
    heightMt: app.globalData.heightMt + 20 * 2,
    type: 1
  },
  ready: function() {
    const that = this
    if (that.data.isPraise) {
      that.setData({
        type: 0
      })
    }
    that.getCarsFun()
    that.getSystemInfo()
  },
  methods: {
    getSystemInfo: function() {
      const that = this
      wx.getSystemInfo({
        success: function(res) {
          // console.log(app.globalData.windowHeight)
          that.setData({
            windowHeight: app.globalData.windowHeight - 40 - that.data.heightMt
          })
        }
      })
    },
    selectCarSystem: function(e) {
      const that = this,
        id = e.currentTarget.dataset.id,
        name = e.currentTarget.dataset.name,
        icon = e.currentTarget.dataset.icon;
      if (that.data.isBrand) {
        let carModelBrand = {
          car_1id: id,
          car_1: name,
          icon: icon
        }
        that.triggerEvent('carModelBrand', carModelBrand);
        that.hideFixedTab();
        return;
      }

      that.setData({
        level: 2,
        upid: id,
        car_1: name
      });
      that.getCarsFun();
    },
    //车型
    hasPraise: function(e) { //是否已发表过该车型的口碑
      const that = this,
        car_2 = e;
      return new Promise((resolve, reject) => {
        request('post', 'is_add_reputation.php', {
          token: wx.getStorageSync("token"),
          car_2: car_2
        }).then((res) => {
          if (res.err_code != 0)
            return
          if (res.data.status == 1) {
            resolve(res)
          } else {
            app.wxShowToast(res.data.msg, 1000, 'none')
            resolve(false)
          }

        })
      })
    },
    selectCarModel: function(e) {
      const that = this
      const id = e.currentTarget.dataset.id
      const name = e.currentTarget.dataset.name
      const type_category = e.currentTarget.dataset.type_category
      const icon = e.currentTarget.dataset.icon

      if (that.data.hasPraise) { //是否已发表过该车型的口碑
        that.hasPraise(id).then((res) => {
          if (!res)
            return
          that.setData({
            level: 3,
            upid: id,
            car_2: name,
            ident: res.data.ident,
            type_category: type_category
          })
          that.getCarsFun()
        })
        return
      }
      if (that.data.hasQuest) {
        let carModelInfo = {
          car_1id: that.data.upid,
          car_2id: id,
          car_1: that.data.car_1,
          car_2: name,
          icon: icon
        }
        if (that.data.wantList) {
          that.triggerEvent('carModelList', carModelInfo);
        } else {
          that.triggerEvent('carModelInfo', carModelInfo);
        }
        return
      }
      that.setData({
        level: 3,
        upid: id,
        car_2: name,
        type_category: type_category
      })
      that.getCarsFun()
    },
    getCarsFun: function() {
      const that = this
      const upid = that.data.upid
      const level = that.data.level
      that.setData({
        loading_hidden: false,
        loading_msg: '加载中...'
      })
      request('post', 'get_cars.php', {
        token: wx.getStorageSync("token"),
        upid: upid,
        type: that.data.type
      }).then((res) => {
        that.setData({
          loading_hidden: true,
          loading_msg: '加载完毕...',
        })
        if (level == 1) {
          that.setData({
            brandList: res.data,
            arr: Object.keys(res.data),
          })

        } else if (level == 2) {
          that.setData({
            systemList: res.data
          })
        } else if (level == 3) {
          that.setData({
            ModelList: res.data
          })
        }
      });
    },
    handlerStart: function(e) {
      const that = this
      let idx = e.target.dataset.idx
      that.setData({
        scrollToId: idx
      })
    },
    handlerMove: function(e) {
      const that = this
      // let brandList = that.data.brandList
      let heightMt = that.data.heightMt
      const arr = that.data.arr
      let pageY = e.touches[0].pageY
      let idx = Math.floor((pageY - 65 - heightMt) / 20)
      idx = Math.min(arr.length - 1, Math.max(idx, 0))
      if (that.data.scrollToId == arr[idx])
        return
      that.setData({
        scrollToId: arr[idx]
      })
    },
    hideFixedTab: function() {
      const that = this;
      that.setData({
        carModelShow: false
      })
      that.triggerEvent('addCar');
    },
    saveCarModel: function(e) {
      const that = this;
      const id = e.currentTarget.dataset.id
      const car_3 = e.currentTarget.dataset.name
      that.setData({
        carModelShow: false,
        car_3: car_3,
        level: 1
      })
      const carModelInfo = {
        car_1: that.data.car_1,
        car_2: that.data.car_2,
        car_3: car_3,
        car_2id: that.data.upid,
        car_3id: id,
        type_category: that.data.type_category
      }

      if (!that.data.ident && that.data.hasPraise) {
        app.showSelModal('您未认证该车型，点击取消，跳转到认证页面！点击确定，继续发口碑，但所发口碑不会影响口碑分值！', true).then((res) => {
          if (res) {
            that.triggerEvent('carModelInfo', carModelInfo)
          } else {
            wx.switchTab({
              url: '../carOwner/carOwner'
            })
          }

        })
        return
      }
      that.triggerEvent('carModelInfo', carModelInfo)

    },
    goback: function(e) {
      this.setData({
        level: this.data.level - 1
      })
    }
  }
})