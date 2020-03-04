//app.js

import {
  request
} from 'utils/util.js'

App({
  onLaunch: function(options) {
    const that = this;
    wx.hideTabBar({}); //隐藏导航栏（自带）
    that.windowHeight(options);
    that.wxGetUpdateManager(); //立即更新
  },
  // 获取token
  get_token: function() {
    const that = this;
    return new Promise(function(resolve, reject) {
      that.get_code().then((code) => {
        request('post', 'get_token.php', {
          code: code,
        }).then((res) => {
          wx.setStorage({
            key: 'token',
            data: res.data.token
          });
          wx.setStorage({
            key: 'uid',
            data: res.data.uid
          });
          wx.setStorage({
            key: 'has_login',
            data: res.data.has_login
          });
          wx.setStorage({
            key: 'has_phone',
            data: res.data.has_phone
          });
          that.globalData.restart = 1
          resolve(res.data)
        })
      })
    })
  },
  get_code: function() {
    const that = this
    return new Promise(function(resolve, reject) {
      wx.login({
        success: function(res) {
          resolve(res.code)
        },
        fail: function() {
          // that.showSvrErrModal('do_wx_login_fail')
        }
      });
    })
  },
  toAddNotice: function (e) {
    wx.navigateTo({
      url: '/pages/addNotice/addNotice',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', e.tip)
      }
    })
  },
  wxGetUserInfo: function() {
    const that = this
    return new Promise(function(resolve, reject) {
      wx.getSetting({
        success: function(res) {
          if (res.authSetting['scope.userInfo']) {
            //已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.getUserInfo({
              withCredentials: true,
              success: function(res) {
                let username = res.userInfo.nickName,
                 avatar_url = res.userInfo.avatarUrl,
                 gender = res.userInfo.gender,
                 encryptedData = res.encryptedData,
                 iv = res.iv;
                if (username && avatar_url) {
                  that.globalData.username = username;
                  that.globalData.avatar_url = avatar_url;
                  that.globalData.gender = gender;
                  that.globalData.encryptedData = encryptedData;
                  that.globalData.iv = iv;
                  wx.navigateTo({
                    url: '/pages/getPhone/getPhone?getlogin=1'
                  })

                }
              },
              fail: function(res) {
                resolve(res)
                wx.showModal({
                  title: '警告',
                  content: '授权登录后才能和哈弗新能源车主们一起玩耍哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮',
                })
              }
            })
          }
        },
        fail: function(res) {
          console.log(res);
        }
      })
    })
  },
  saveMyPhone(e) {
    const that = this;
    return new Promise(function(resolve, reject) {
      request('post', 'save_my_phone.php', {
        token: wx.getStorageSync("token"),
        phone: e.phone,
        code: e.code
      }).then(res => {
        resolve(res);
        if (res.err_code != 0)
          return;
        that.get_token().then(res => {
          wx.navigateBack({
            delta: 1
          })
        });

      })
    })
  },
  getWexinLogin(e) {
    const that = this;
    request('POST', 'wx_login.php', {
      token: wx.getStorageSync("token"),
      username: that.globalData.username,
      avatar_url: that.globalData.avatar_url,
      encryptedData: that.globalData.encryptedData,
      iv: that.globalData.iv,
      gender: that.globalData.gender,
      phone: e.phone,
      code: e.code
    }).then((res) => {
      if (res.err_code != 0)
        return
      wx.setStorage({
        key: 'token',
        data: res.data.token,
      });
      that.get_token().then(res => {
        wx.navigateBack({
          delta: 1
        })
      });
  
    })
  },
  // 是否弹出授权框
  isShowAuthorization: function() {
    const that = this
    const hasLogin = wx.getStorageSync("has_login");
    const hasPhone = wx.getStorageSync("has_phone");
    return new Promise(function(resolve, reject) {
      if (hasLogin == 1 && hasPhone == 1) {
        resolve(2);
      } else if (hasLogin == 1) {
        wx.navigateTo({
          url: '/pages/getPhone/getPhone'
        })
      } else {
        resolve(1);
      }
    })
  },
  // 是否被禁言了
  canAddThread: function(e) {
    const that = this;
    return new Promise(function(resolve, reject) {
      that.isShowAuthorization().then(re => {
        if (re == 2) {
          request('post', 'is_can_add_thread.php', {
            token: wx.getStorageSync("token")
          }).then((res) => {
            if (res.err_code != 0)
              return
            const status = res.data.status;
            wx.setStorageSync('is_admin', res.data.is_admin);
            if (status == 0) {
              const contentText = res.data.msg;
              wx.showModal({
                title: '提示',
                content: contentText,
                showCancel: false,
                success(res) {
                  console.log(res);
                }
              });
              resolve(false);
            } else {
              resolve(true);
            }
          })
        } else if (re == 1) {
          reject(1)
        }
      })
    })
  },

  getUserInfo: function() {
    const that = this
    return new Promise(function(resolve, reject) {
      request('post', 'get_user_info.php', {
        token: wx.getStorageSync("token"),
        uid: wx.getStorageSync('uid')
      }).then((res) => {
        resolve(res.data);
        wx.setStorage({
          key: 'is_admin',
          data: res.data.is_admin
        })
        wx.setStorage({
          key: 'username',
          data: res.data.username,
        })
      })
    })
  },


  // 是否允许授权
  bindGetUserInfo: function(e) {
    const that = this
    return new Promise(function(resolve, reject) {
      if (e.detail.userInfo != '' && e.detail.userInfo != undefined) {
        setTimeout(() => {
          that.wxGetUserInfo().then((res) => {
            console.log(res)
          })
        }, 100)
        resolve(1)
      } else {
        setTimeout(() => {
          that.wxGetUserInfo().then((res) => {
            console.log(res)
          })
        }, 100)
        resolve(0)
        // console.log('拒绝授权');
      }
    })
  },

  showSvrErrModal: function(resp) {
    if (resp.data.err_code != 0 && resp.data.err_msg) {
      this.showErrModal(resp.data.err_msg);
    } else {
      wx.request({
        url: getApp().globalData.svr_url + 'report_error.php',
        method: 'POST',
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: {
          token: wx.getStorageSync("token"),
          error_log: resp.data,
          svr_url: getApp().globalData.svr_url,
        },
        success: function(resp) {
          console.log(resp);
        }
      })
    }
  },

  showErrModal: function(err_msg) {
    return new Promise(function(resolve, reject) {
      wx.showModal({
        content: err_msg,
        showCancel: false,
        success() {
          resolve(true)
        }
      })
    })
  },

  /* 封装微信缓存 Api */
  putSt: function(k, v, t) {
    wx.setStorageSync(k, v)
    var seconds = parseInt(t);
    if (seconds > 0) {
      var timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000 + seconds;
      wx.setStorageSync(k + 'dtime', timestamp + "")
    } else {
      wx.removeStorageSync(k + 'dtime');
    }
  },

  getSt: function(k, def) {
    var deadtime = parseInt(wx.getStorageSync(k + 'dtime'))
    if (deadtime) {
      if (parseInt(deadtime) < Date.parse(new Date()) / 1000) {
        if (def) {
          return def;
        } else {
          return;
        }
      }
    }
    var res = wx.getStorageSync(k);
    if (res) {
      return res;
    } else {
      return def;
    }
  },

  setTabBarBadge: function() {
    const that = this
    return new Promise(function(resolve, reject) {
      if (wx.getStorageSync('has_login') == 1 && wx.getStorageSync('has_phone') == 1) {
          request('post', 'get_my_msg_num.php', {
            token: wx.getStorageSync("token")
          }).then((res) => {
            if (res.err_code != 0)
              return
            resolve(true)
            that.globalData.msg_status = res.data.msg_status
          })
        }
    })
  },
  // 关注
  followBtn: function(e) {
    return new Promise(function(resolve, reject) {
      request('post', 'add_follow.php', {
        token: wx.getStorageSync("token"),
        followuid: e.followuid,
      }).then((res) => {
        if (res.err_code != 0)
          return
        resolve(res)
      })
    })
  },
  toDialogue(e) {
    const that = this
    return new Promise(function(resolve, reject) {
      let uid = e.currentTarget.dataset.uid
      let name = e.currentTarget.dataset.name
      wx.navigateTo({
        url: `/pages/dialogue/dialogue?uid=${uid}&name=${name}`,
        success(e) {
          resolve(true)
        }
      })
    })
  },
  wxGetUpdateManager: function() {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function() {
      updateManager.applyUpdate()
    })
    updateManager.onUpdateFailed(function() {
      // 新版本下载失败
    })
  },
  windowHeight: function(options) {
    var that = this

    // 判断是否由分享进入小程序
    if (options.scene == 1011 || options.scene == 1012 || options.scene == 1013) {
      this.globalData.share = true
    } else {
      this.globalData.share = false
    };
    that.globalData.userVersion = __wxConfig.envVersion
    return new Promise(function(resolve, reject) {
      wx.getSystemInfo({
        success: function(res) {
          if (res.platform == "android")
            that.globalData.is_android = 1
          resolve(res.windowHeight)
          that.globalData.windowHeight = res.windowHeight
          that.globalData.windowWidth = res.windowWidth
          //获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
          that.globalData.heightMt = res.statusBarHeight
        }
      })
    })
  },

  //删除
  deleteNormal: function(data, url, isJump) {
    var that = this
    return new Promise(function(resolve, reject) {
      that.showSelModal('确定要删除？', true).then((res) => {
        if (res) {
          request('post', url, data).then((res) => {
            if (res.err_code == 0) {
              if (res.data.status != 1) {
                that.wxShowToast(res.data.message, 1500, 'none')
                return
              }
              that.wxShowToast(res.data.message, 1500, '').then((re) => {
                if (isJump) {
                  setTimeout(() => {
                    wx.navigateBack({
                      delta: 1
                    })
                  }, 1500)
                } else {
                  resolve(res.data)
                }
              })
            } else {
              that.wxShowToast(res.data.message)
            }
          })
        }
      })
    })
  },


  //显示消息提示框
  wxShowToast: function(msg, dur, icon) {
    return new Promise(function(resolve, reject) {
      wx.showToast({
        title: msg,
        icon: icon || 'success',
        duration: dur || 1500,
        success(res) {
          resolve(res)
        }
      })
    })
  },
  //判断框
  showSelModal: function(err_msg, bool) {
    return new Promise(function(resolve, reject) {
      wx.showModal({
        content: err_msg,
        showCancel: bool || false,
        success(res) {
          if (res.confirm) {
            resolve(true)
          } else if (res.cancel) {
            resolve(false)
          }
        }
      })
    })
  },
  previewImage(e) {
    let current = e.currentTarget.dataset.current,
     list = e.currentTarget.dataset.list;
    if (!list || list.length == 0)
      list = [current]
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: list // 需要预览的图片http链接列表
    })
  },
  toUserDetail: function(e) { //跳转到用户界面
    wx.navigateTo({
      url: `/user/pages/user_detail/user_detail?id=${e.currentTarget.dataset.uid}`,
    })
  },
  picTap: function(e) {
    const that = this
    let id = e.currentTarget.dataset.typeid
    let subject = e.currentTarget.dataset.class_name
    let fid = e.currentTarget.dataset.fid
    wx.navigateTo({
      url: `/pages/square_pic/square_pic?id=${id}&subject=${subject}&fid=${fid}`
    })
  },
  toDetail(e) {
    let tid = e.currentTarget.dataset.tid,
     hidden = parseInt(e.currentTarget.dataset.hidden),
     fa_item,
     item;
    switch (hidden) {
      case 0:
        item = 'detail'
        break;
      case 1:
        fa_item = 'praise'
        item = 'praise_user'
        break;
      case 2:
        fa_item = 'question'
        item = 'quest_detail'
        break;
      case 3:
        item = 'square_detail'
        break;
      case 200:
        fa_item = 'question'
        item = 'poll'
        break;
    }
    if (fa_item) {
      wx.navigateTo({
        url: `/${fa_item}/pages/${item}/${item}?id=${tid}`
      })
      return
    }
    wx.navigateTo({
      url: `/pages/${item}/${item}?id=${tid}`
    });
  },
  globalData: {
    shareTitle: '哈弗小程序',
    base_url: 'http://www.e-power.vip/',
    // svr_url: 'https://testapi.e-power.vip/v1/',
    svr_url: 'https://api.e-power.vip/',
    forum_head_url: 'https://cdn.e-power.vip/forum/',
    userInfo: null,
    lite_switch: false,
    windowHeight: '',
    windowWidth: '',
    share: false, //判断是否从分享过来的
    heightMt: 0,
    carType: '',
    num: 0, //限制访问次数 util用到
    is_android: 0,
    restart: 0,
    currentTab: 100,
    nickname: '', //修改昵称
    bio: '', //修改签名
    msg_status: 0, //消息通知数
    userVersion: '', //开发版、测试版、正式版
    backShow: false,
    tmplIds: ['-179EGl_tkzLlQZtUlqOxKUXFMExe-XXrWoUu783wpg', 'xUk7Ze6lwHLh2V4SFs6iCRszKATMAaXvyd2Cm09w5P8'], //订阅消息模板
    web_url: '',
    amapKey: 'a26ac081b94e90d9d9e6443ebe399085' //高德地图key
  },
  getToken: {
    num: 0
  },
  // 购买地
  district: {
    id: 0,
    name: '',
    province: ''
  },

  //获取用户地理位置权限
  getPermission: function(obj) {
    wx.chooseLocation({
      success: function(res) {
        obj.setData({
          addr: res.address //调用成功直接设置地址
        })
      },
      fail: function() {
        wx.getSetting({
          success: function(res) {
            var statu = res.authSetting;
            if (!statu['scope.userLocation']) {
              wx.showModal({
                title: '是否授权当前位置',
                content: '获得您当前的位置，以便查询您附近的充电桩',
                success: function(tip) {
                  if (tip.confirm) {
                    wx.openSetting({
                      success: function(data) {
                        if (data.authSetting["scope.userLocation"] === true) {
                          wx.showToast({
                            title: '授权成功',
                            icon: 'success',
                            duration: 1000
                          })
                          //授权成功之后，再调用chooseLocation选择地方
                          wx.chooseLocation({
                            success: function(res) {
                              obj.setData({
                                addr: res.address
                              })
                            },
                          })
                        } else {
                          wx.showToast({
                            title: '授权失败',
                            icon: 'success',
                            duration: 1000
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          },
          fail: function(res) {
            wx.showToast({
              title: '调用授权窗口失败',
              icon: 'success',
              duration: 1000
            })
          }
        })
      }
    })
  }
})