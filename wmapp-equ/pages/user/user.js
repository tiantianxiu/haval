// user.js
var app = getApp()
import {
  request,
  countDown, //倒计时
  transformPHPTime,
  transformPHPTimeArr
} from '../../utils/util.js'

var setIntArr = []
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasLogin: '',
    thread_data: {
      cover_image: 'https://cdn.e-power.vip/default/user_cover_image.jpg',
      avatar: "http://cdn.e-power.vip/resources/image/user_icon.png",
      username: "游客",
      uid: 0,
      level: '游客',
      extcredits2: 0,
      following: 0,
      follower: 0,
      bio: '',
      gender: '保密'
    },
    show_opera: false,
    date_square: '',
    year_square: '',
    date_quest: '',
    year_quest: '',
    year_post: '',
    date_post: '',
    type: 100,
    special: 0,
    page_size: 10,
    page_index: 0,
    my_thread_data: [],
    loading_hidden: true,
    loading_msg: '加载中...',
    msg_status: '',
    showAuthorization: false,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 0, //是否显示左上角图标,
      transparent: 1,
      title: ' ', //导航栏 中间的标题
    },
    navfarData: {
      position: 'user'
    },
    voteLi: [],
    voteidxLi: [],
    pollId: 0,
  },

  onLoad: function() {
    const that = this;
    if (wx.getStorageSync('has_login') == 1 && wx.getStorageSync('has_phone') == 0) {
      that.verAuthorization().then(res => {
        that.reloadIndex()
      })
    }

    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#ff0000'
    })
    let type = that.data.type
    if (type > 90)
      return
    that.getMyThread()

  },
  onShow() {
    const that = this
    if (wx.getStorageSync('has_login') == 1 && wx.getStorageSync('has_phone') == 0) {
      return;
    }
    that.verAuthorization().then(res => {
      that.reloadIndex()
    })
  },
  showAuthorization: function() {
    this.setData({
      showAuthorization: true
    })
  },
  reloadIndex() {
    const that = this
    // 获取用户基本信息
    request('post', 'get_user_info.php', {
      token: wx.getStorageSync('token'),
      uid: 0
    }).then((res) => {
      var extcredits2 = res.data.extcredits2 + ''
      var extcredits2_arr = extcredits2.split('')

      that.setData({
        hasUserInfo: true,
        thread_data: res.data

      })
    })
  },
  messageTap(e) {
    const that = this
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `../${item}/${item}`
    })
  },
  navTap(e) {
    const that = this;
    that.verAuthorization().then(res => {
      that.navList(e);
    })
  },
  verAuthorization: function() {
    return new Promise((resolve, reject) => {
      app.isShowAuthorization().then(res => {
        if (res == 2) {
          resolve(true);
        } else if (res == 1) {
          this.showAuthorization();
        }
      })
    })
  },
  navList(e) {
    const that = this;
    let type = e.currentTarget.dataset.type || 0,
     special = e.currentTarget.dataset.special || 0;
    if (!type)
      return;
    if (special == that.data.special && type == that.data.type)
      return;
    for (let i in setIntArr) {
      clearInterval(setIntArr[i]);
    }
    that.setData({
        type: type,
        special: special,
        page_index: 0,
        have_data: false,
        nomore_data: false,
        date_square: '',
        year_square: '',
        date_quest: '',
        year_quest: '',
        year_post: '',
        date_post: '',
        my_thread_data: []
      },
      () => {
        if (type < 90) {
          that.setData({
            loading_hidden: false
          })
          that.getMyThread()
        }
      }
    )
  },
  onReachBottom: function() {
    const that = this
    const type = that.data.type
    let have_data = that.data.have_data
    let nomore_data = that.data.nomore_data

    let page_index = that.data.page_index + 1
    if (nomore_data || have_data)
      return
    that.setData({
        have_data: true,
        page_index: page_index
      },
      () => {
        that.getMyThread()
      }
    )
  },

  getMyThread() {
    const that = this
    let type = that.data.type
    let page_index = that.data.page_index
    let page_size = that.data.page_size

    let special = that.data.special
    request('post', 'get_my_thread.php', {
      token: wx.getStorageSync('token'),
      uid: 0,
      type: type,
      special: special,
      page_size: page_size,
      page_index: page_index
    }).then((res) => {
      that.setData({
        loading_hidden: true
      })

      if (res.err_code != 0)
        return
      let res_my_thread_data = res.data.my_thread_data
      let year = 'year_square'
      let date = 'date_square'
      if (type == 2 && special == 0) {
        year = 'year_quest'
        date = 'date_quest'
      } else if (type == 2 && special == 1) {
        year = 'year_note'
        date = 'date_note'
      } else if (type == 0) {
        year = 'year_post'
        date = 'date_post'
      }
      for (let i in res_my_thread_data) {
        if (special == 1) {
          if (res_my_thread_data[i].vote.poll && res_my_thread_data[i].vote.poll.is_vote){
            res_my_thread_data[i].vote.poll.is_vote = res_my_thread_data[i].vote.poll.is_vote.split('\t');
          }
          res_my_thread_data[i].time = transformPHPTime(res_my_thread_data[i].dateline)
        } else {
          res_my_thread_data[i].time = transformPHPTimeArr(res_my_thread_data[i].dateline)
          if (res_my_thread_data[i].time.year == that.data[`${year}`] || res_my_thread_data[i].time.year == '2019') {
            res_my_thread_data[i].time.year = ''
          } else {
            that.setData({
              [`${year}`]: res_my_thread_data[i].time.year
            })
          }
          if (res_my_thread_data[i].time.date + res_my_thread_data[i].time.month == that.data[`${date}`]) {
            res_my_thread_data[i].time.date = ''
            res_my_thread_data[i].time.month = ''
          } else {
            that.setData({
              [`${date}`]: res_my_thread_data[i].time.date + res_my_thread_data[i].time.month
            })
          }
        }
      }
      let my_thread_data = that.data.my_thread_data.concat(res_my_thread_data)
      that.setData({
          my_thread_data: my_thread_data,
          page_index: page_index,
          have_data: false,
          nomore_data: res_my_thread_data.length < page_size
        }
        // () => {
        //   if (special == 1) {
        //     let setInt
        //     for (let i in res_my_thread_data) {
        //       if (res_my_thread_data[i].vote.poll.is_expiration == 0) {
        //         setInt = setInterval(() => {
        //           if (countDown(res_my_thread_data[i].vote.poll.expiration)) {
        //             that.setData({
        //               [`my_thread_data[${i}].count_down`]: countDown(res_my_thread_data[i].vote.poll.expiration)
        //             })
        //           } else {
        //             that.setData({
        //               [`my_thread_data[${i}].vote.poll.is_expiration`]: 1
        //             })
        //           }
        //         }, 1000)
        //         if (setIntArr.indexOf(setInt) == -1)
        //           setIntArr.push(setInt)
        //       }
        //     }
        //   }
        // }
      )

    })
  },
  votePut: function (e) {
    const that = this;
    let tid = +e.currentTarget.dataset.tid,
      idx = e.currentTarget.dataset.idx,
      polloptionid = +e.currentTarget.dataset.polloptionid,
      voteLi = that.data.voteLi,
      voteidxLi = that.data.voteidxLi,
      multiple = e.currentTarget.dataset.multiple,
      maxchoices = e.currentTarget.dataset.maxchoices;
    if (that.data.pollId != tid) {
      voteLi.length = 0;
      voteidxLi.length = 0;
    }
    let indexof = voteLi.indexOf(polloptionid);
    if (multiple == 0) {
      voteLi.length = 0;
      voteidxLi.length = 0;
      indexof > -1 ? '' : voteLi.push(polloptionid), voteidxLi.push(idx);
    } else {
      if (indexof > -1) {
        voteLi.splice(indexof, 1);
        voteidxLi.splice(indexof, 1);
      } else {
        maxchoices <= voteLi.length ? wx.showToast({
          title: `此投票最多选${maxchoices}个`,
          icon: 'none'
        }) : voteLi.push(polloptionid), voteidxLi.push(idx);
      }
    }
    that.setData({
      voteLi: voteLi,
      pollId: voteLi.length == 0 ? 0 : tid
    });
  },
  // 投票
  voteTap(e) {
    const that = this
    let index = e.currentTarget.dataset.index,
      voteidxLi = that.data.voteidxLi,
      tid = e.currentTarget.dataset.tid,
      optionid = that.data.voteLi.join(',');
    wx.showModal({
      title: '投票',
      content: '是否确认提交？',
      success(re) {
        if (re.confirm) {
          request('post', 'add_vote.php', {
            token: wx.getStorageSync('token'),
            tid: tid,
            optionid: optionid
          }).then((res) => {
            that.setData({
              voteLi: [],
              voteidxLi: [],
              pollId: 0,
            });
            if (res.err_code != 0)
              return;
           
            if (res.data.status == -1) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
              return
            }
            wx.showToast({
              title: '投票成功',
              icon: 'none'
            })
            that.setData({
              [`my_thread_data[${index}].vote.poll.is_vote`]: optionid.split(','),
              [`my_thread_data[${index}].vote.poll.voters`]: +that.data.my_thread_data[index].vote.poll.voters + 1
            })
            for (let i in voteidxLi) {
              that.setData({
                [`my_thread_data[${index}].vote.polloption[${voteidxLi[i]}].votes`]: parseInt(that.data.my_thread_data[index].vote.polloption[voteidxLi[i]].votes) + 1
              })
            }
          })
        }
      }
    })
  },

  rejectAuthorizeFun: function() {
    // console.log('不同意授权')
    const that = this
    return
  },
  agreeAuthorizeFun: function() {
    // console.log('同意授权')
    const that = this
    wx.switchTab({
      url: '../index/index'
    })
  },
  onPageScroll(e) {
    const that = this
    const scrollTop = e.scrollTop

    if (that.data.res_top_scroll < scrollTop && that.data.navbarData.transparent == 0)
      return
    if (that.data.res_top_scroll > scrollTop && that.data.navbarData.transparent == 1)
      return
    const query = wx.createSelectorQuery()
    query.select("#thread-content-cell").boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function(res) {
      let res_top = res[0].top // #the-id节点的上边界坐标
      let res_scrollTop = res[1].scrollTop // 显示区域的竖直滚动位置
      that.data.res_top_scroll = res_top + res_scrollTop - that.data.heightMt
      if (res_top + res_scrollTop - that.data.heightMt < scrollTop) {
        that.setData({
          'navbarData.transparent': 0,
          'navbarData.title': '自己'
        })
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '#ff0000'
        })
      } else {
        that.setData({
          'navbarData.transparent': 1,
          'navbarData.title': ''
        })

        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#ff0000'
        })
      }
    })
  },

  toQuest(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/question/pages/quest_detail/quest_detail?id=' + id
    })
  },
  toVote(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/question/pages/poll/poll?id=' + id
    })
  },
  selfLink(e) {
    const that = this;
    that.verAuthorization().then(res => {
      let item = e.currentTarget.dataset.item;
      let id = e.currentTarget.dataset.id;
      let navString = id ? `/user/pages/${item}/${item}?id=${id}` : `/user/pages/${item}/${item}`;
      wx.navigateTo({
        url: navString
      });
    })

  },
  toFriends(e) {
    this.verAuthorization().then(res => {
      let type = e.currentTarget.dataset.type;
      wx.navigateTo({
        url: '/user/pages/friends/friends?type=' + type
      });
    })

  },
  toFriend(e) {
    this.verAuthorization().then(res => {
      let type = e.currentTarget.dataset.type;
      wx.navigateTo({
        url: '/user/pages/friend/friend?type=' + type
      })
    })
  },
  operationTap() {
    const that = this
    that.verAuthorization().then(res => {
      if (that.data.show_opera) {
        that.setData({
          show_opera: false
        })
        return
      }
      that.getApplyType().then((res) => {
        if (res.typeClass) {
          that.toAuthe(res)
        } else {
          that.setData({
            show_opera: true
          })
        }
      })
    })


  },
  getApplyType: function() {
    const that = this
    return new Promise(function(resolve, reject) {
      request('post', 'get_apply_type.php', {
        token: wx.getStorageSync("token")
      }).then((res) => {
        if (res.err_code != 0)
          return
        let data = {
          typeClass: res.data.type
        }
        resolve(data)
      })
    })
  },
  toAuthe(e) {
    const that = this
    console.log(e)
    let type = e.typeClass
    if (!type) {
      type = e.currentTarget.dataset.item
      that.operationTap()
    }
    wx.navigateTo({
      url: `../authe/authe?item=${type}`
    })
  },
  walletTap() {
    this.verAuthorization().then(res => {
      wx.navigateTo({
        url: '/user/pages/wallet/wallet'
      })
    })
  },
  toDetail(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../detail/detail?id=${id}`,
    })
  },
  toSquare(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../square_detail/square_detail?id=${id}`,
    })
  },
  adminTap() {
    wx.navigateTo({
      url: '/user/pages/examine_index/examine_index'
    })
  },
  coverTap() {
    const that = this
    that.verAuthorization().then(res => {
      wx.showModal({
        title: '提示',
        content: '是否更换背景？',
        success(e) {
          if (e.confirm) {
            wx.chooseImage({
              count: 1,
              success(res) {
                that.uploadImg({
                  imgUrl: res.tempFilePaths[0]
                })
              }
            })
          }
        }
      })
    })
  },

  uploadImg: function(e) {
    const that = this
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    wx.uploadFile({
      url: app.globalData.svr_url + 'add_image_of_user_cover.php',
      filePath: e.imgUrl,
      name: 'myfile',
      method: 'post',
      formData: {
        token: wx.getStorageSync("token")
      },
      success(res) {
        that.setData({
          loading_hidden: true,
        })
        var res = JSON.parse(res.data)
        if (res.err_code == 0) {
          that.setData({
            'thread_data.cover_image': res.data.read_file_url
          })
        } else {
          getApp().showErrModal(res.err_msg)
        }
      }
    })
  },
  /* 下拉刷新 */
  onPullDownRefresh: function() {
    const that = this
    that.onShow()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 300)
  },
  outTap() {
    let url = 'https://img.e-power.vip/forum.php'
    wx.navigateTo({
      url: `/pages/out/out?url=${url}`,

    })
  }

})