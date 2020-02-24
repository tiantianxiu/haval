var app = getApp()
import {
  request,
  uploadFile,
  myTrim,
  aspectFill
} from '../../utils/util.js'
Component({
  properties: {
    isAdmin: {
      type: Number,
      value: 0
    },
    message: {
      type: String,
      value: '',
    },
    focus: {
      type: Boolean,
      value: false
    },
    tid: { //文章tid
      type: String,
      value: '',
    },
    idtype: {
      type: String,
      value: 'tid',
    },
    isreplyPost: {
      type: Boolean,
      value: false
    },
    //点击回复是否显示另外一个回复框 
    isShowReplyForm: {
      type: Boolean,
      value: false
    },

    //是否显示赞
    showZhan: {
      type: Boolean,
      value: false
    },
    is_zan: { //0没有 1赞 2踩
      type: String,
      value: 0,
    },
    zan: {
      type: Number,
      value: 0,
    },
    cai: {
      type: Number,
      value: 0,
    },
    replies: {
      type: Number,
      value: 0,
    },
    //是否显示回复条数
    showReplies: {
      type: Boolean,
      value: false
    },
    showZan: {
      type: Boolean,
      value: false
    },
    //是否显示踩  
    showCai: {
      type: Boolean,
      value: false
    },

    replyTop: {
      type: Number,
      value: 0
    },
    is_praise: {
      type: Boolean,
      value: false
    },
    hideSmiley: { //是否隐藏表情
      type: Boolean,
      value: false
    },
    to_author: {
      type: String,
      value: ''
    },

    hidden: {
      type: Number,
      value: 0
    },
    author: {
      type: String,
      value: ''
    },
    avatar: {
      type: String,
      value: ''
    },
    question_price: {
      type: String,
      value: ''
    },
    time: {
      type: String,
      value: ''
    },
    extcredits2: {
      type: String,
      value: ''
    },
    reward_type: {
      type: Number,
      value: 3
    },
    level: {
      type: String,
      value: ''
    },
    vip: {
      type: Boolean,
      value: false
    },

  },
  data: {
    showreplyForm: false,

    imageList: [],
    imageUrls: [],
    textContent: '',
    aidList: [],
    bigCode: [],
    // 这里是一些组件内部数据
    loading_hidden: true,
    loading_msg: '加载中...',
    progress: 0,
    showProgress: false,

    // 弹出键盘后bottom值设置
    height: 'auto',
    height_01: '',
    adjustPosition: false,

    //自定义表情包
    showEmoji: false,
    indicatorDots: true,

    emojiScrollLeft: 0,
    screenW: 375,
    touchStartX: '',

    // 触摸开始时间
    touchStartTime: 0,
    // 触摸结束时间
    touchEndTime: 0,

    isAndroid: app.globalData.is_android
  },

  methods: {
    //输入回复信息
    inputMessage: function(e) {
      const that = this
      that.setData({
        message: e.detail.value
      });
    },
    // 回复贴子
    submitMessage: function(e) {
      var that = this
      app.canAddThread(true).then((re) => {
        if (!re)
          return
        let message = myTrim(that.data.message);
        const imageList = that.data.imageList
        const aidList = that.data.aidList
        let attachment = 0
        if (imageList.length > 0) {
          let codeList = ""
          for (var i = imageList.length - 1; i >= 0; i--) {
            const code = imageList[i].code
            codeList += code
          }
          message += codeList
          attachment = 2
        }

        let bigCode = that.data.bigCode
        if (bigCode.length > 0)
          for (let i in bigCode) {
            message += bigCode[i].code
          }
        console.log(message)
        if (!message) {
          getApp().showErrModal('评论内容不能为空');
          that.setData({
            focus: true,
            message: ''
          })
          return
        }
        var addPostDetail = {
          message: message,
          aidList: aidList,
          attachment: attachment
        } // detail对象，提供给事件监听函数 
        that.triggerEvent('addPost', addPostDetail)
      }).catch(rej => {
        that.showAuthorization();
      })
    },
    getClipboard: function() {
      this.triggerEvent('getClipboard')
      this.showShareBox()
    },
    // 点赞文章
    toZan: function(e) {
      const that = this
      const type = e.currentTarget.dataset.type //1赞 2踩
      app.isShowAuthorization().then((res) => {
        if (res == 2) {
          var is_zan = that.data.is_zan

          request('post', 'add_zan.php', {
            token: wx.getStorageSync("token"),
            tid: that.data.tid,
            type: type
          }).then((res) => {
            if (res.err_code != 0)
              return

            if (type == 1) {
              that.setData({
                is_zan: is_zan == type ? 0 : 1,
                zan: is_zan == type ? parseInt(that.data.zan) - 1 : parseInt(that.data.zan) + 1,
                cai: is_zan == 2 ? parseInt(that.data.cai) - 1 : that.data.cai
              })
            } else {
              that.setData({
                is_zan: is_zan == type ? 0 : 2,
                cai: is_zan == type ? parseInt(that.data.cai) - 1 : parseInt(that.data.cai) + 1,
                zan: is_zan == 1 ? parseInt(that.data.zan) - 1 : that.data.zan
              })
            }

          })

        } else if (res == 1) {
          that.showAuthorization();
        }
      })
    },
    showAuthorization: function(){
      this.setData({
        showAuthorization: true
      })
    },

    clickReply: function() {
      const that = this
      that.queryTop().then((res) => {
        wx.pageScrollTo({ //滑动
          scrollTop: res[0].top + res[1].scrollTop, //滑动到回复高度
          duration: 0
        })
      })
    },
    //获取评论的高度
    queryTop: function() {
      const query = wx.createSelectorQuery(),
        that = this
      return new Promise(function(resolve, reject) {
        query.select('#reply-title').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function(res) {
          resolve(res) // #reply-title节点的上边界坐标
        })
      })
    },
    showreplyFormFun: function(e) {
      const that = this
      app.canAddThread(true).then((re) => {
        if (re) {
          that.setData({
            showreplyForm: true,
            focus: true
          })
          if (!that.data.hideSmiley)
            that.getSmiley()
        }
      }).catch(rej => {
        that.showAuthorization();
      })
    },
    delSmil(e) {
      const that = this
      let index = e.currentTarget.dataset.index
      // let code = e.currentTarget.dataset.code
      let bigCode = this.data.bigCode
      if (index < bigCode.length)
        bigCode.splice(index, 1)
      that.setData({
        bigCode: bigCode
      })
      console.log(bigCode)
    },
    delImg: function(e) {
      var index = e.currentTarget.dataset.index
      var code = e.currentTarget.dataset.code
      var imageList = this.data.imageList
      var aidList = this.data.aidList
      var imageUrls = this.data.imageUrls
      if (index < imageList.length) {
        imageList.splice(index, 1)
        aidList.splice(index, 1)
        imageUrls.splice(index, 1)
      }
      this.setData({
        imageList: imageList,
        aidList: aidList,
        imageUrls: imageUrls
      })
    },
    chooseImage: function(e) {
      const that = this
      let imageList_length = that.data.imageList.length + that.data.bigCode.length
      if (imageList_length >= 4) {
        wx.showToast({
          title: '不能超过4张',
          icon: 'none'
        })
        return
      }
      wx.chooseImage({
        count: 4 - imageList_length,
        // sizeType:["original"],
        success: function(res) {
          var tempFilePaths = res.tempFilePaths
          var tmpImageList = that.data.imageList;
          var tmpAidList = that.data.aidList;
          const tmpimageUrls = that.data.imageUrls
          for (var i = 0; i < res.tempFilePaths.length; i++) {
            that.setData({
              loading_hidden: false,
              loading_msg: '加载中...',
            })
            var localFilePath = res.tempFilePaths[i]
            const uploadTask = uploadFile('post', 'add_image.php', localFilePath, 'myfile', {
              token: wx.getStorageSync("token"),
            }).then((resp) => {
              if (resp != 'err') {
                tmpAidList.push(resp.data.aid);
                tmpimageUrls.push(resp.data.read_file_url);
                var o1 = {
                  url: resp.data.read_file_url
                };
                var o2 = {
                  type: 'img'
                }
                var o3 = {
                  code: resp.data.code
                }
                var tmpObj = Object.assign(o1, o2, o3);
                tmpImageList.push(tmpObj);
                that.setData({
                  // loading_hidden: true,
                  aidList: tmpAidList,
                  imageUrls: tmpimageUrls,
                  imageList: tmpImageList,
                  focus: true,
                  loading_hidden: true,
                  loading_msg: '加载完毕',
                })
              } else {

                that.setData({
                  loading_hidden: true,
                  loading_msg: '加载完毕',
                })
              }
            })
          }
        }
      })
    },
    chooseVedio: function(e) {
      const that = this
      wx.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 30,
        camera: 'back',
        success: function(res) {
          var tempFilePath = res.tempFilePath
          var tmpImageList = that.data.imageList;
          var tmpAidList = that.data.aidList;
          const tmpimageUrls = that.data.imageUrls;

          const uploadTask = wx.uploadFile({
            url: app.globalData.svr_url + 'add_video.php',
            filePath: tempFilePath,
            name: 'myfile',
            method: 'POST',
            formData: {
              token: wx.getStorageSync("token"),
            },
            success: function(resp) {
              var resp_dict = JSON.parse(resp.data)
              if (resp_dict.err_code == 0) {
                tmpAidList.push(resp_dict.data.aid);
                tmpimageUrls.push(resp_dict.data.read_file_url);
                var o1 = {
                  url: resp_dict.data.read_file_url
                };
                var o2 = {
                  type: 'vedio'
                }
                var o3 = {
                  code: resp_dict.data.code
                }
                var tmpObj = Object.assign(o1, o2, o3);
                tmpImageList.push(tmpObj);
                that.setData({

                  aidList: tmpAidList,
                  imageList: tmpImageList,
                  imageUrls: tmpimageUrls,
                  focus: true,
                  loading_hidden: true,
                  showProgress: false,
                  progress: 0
                })
              } else {
                app.showErrModal('上传失败，请重新上传');
                that.setData({
                  showProgress: false,
                })
                uploadTask.abort()
              }
            },
            fail: function(resp) {
              app.showErrModal('上传失败，请重新上传');
              that.setData({
                showProgress: false,
              })
              uploadTask.abort()
            }
          })
          uploadTask.onProgressUpdate((res) => {
            if (res.progress == 100) {
              that.setData({
                showProgress: false,
                progress: res.progress
              })
            } else {
              that.setData({
                showProgress: true,
                progress: res.progress
              })
            }
          })
        }
      })
    },
    chooseEmoji: function(e) {
      const that = this
      that.setData({
        showEmoji: true
      })
    },
    //长按父节点
    showGifFather: function(e) {
      const that = this
      let fatherIndex = e.currentTarget.dataset.idx
      that.setData({
        fatherIndex: fatherIndex
      })
    },
    //长按显示动图
    showGif: function(e) {
      const that = this
      setTimeout(() => {
        let fatherIndex = that.data.fatherIndex,
          long_index = parseInt(e.currentTarget.dataset.index),
          emojiListGroup = that.data.emojiListGroup,
          emojiGif = emojiListGroup[0].list[fatherIndex][long_index].show,
          gifLeft = e.currentTarget.offsetLeft * 2 - 40,
          gifBottom = 356 - e.currentTarget.offsetTop * 2 + 118
        that.setData({
          is_show_gif: 1,
          emojiGif: emojiGif,
          gifLeft: gifLeft,
          gifBottom: gifBottom
        })
      })

    },
    //按钮触摸开始触发的事件
    touchStart: function(e) {
      const that = this
      that.data.touchStartTime = e.timeStamp
    },
    /// 按钮触摸结束触发的事件
    touchEnd: function(e) {
      const that = this
      that.setData({
        touchEndTime: e.timeStamp,
        is_show_gif: 0
      })
    },
    chooseEmojiItem: function(e) {
      const that = this
      if (that.data.touchEndTime - that.data.touchStartTime > 350)
        return
      const emojiCode = e.currentTarget.dataset.code

      let typeid = e.currentTarget.dataset.typeid
      if (typeid == 5) {
        let bigCode = that.data.bigCode
        let imageList = that.data.imageList
        if (bigCode.length + imageList.length >= 4) {
          wx.showToast({
            title: '不能超过4张',
            icon: 'none'
          })
          return
        }
        const url = e.currentTarget.dataset.url
        let imageRes = {
          url: url,
          code: emojiCode
        }
        bigCode.push(imageRes)
        that.setData({
          bigCode: bigCode
        })
        return
      }

      let message = that.data.message
      message += emojiCode

      that.setData({
        message: message,
      })
    },

    bindfocus: function(e) {
      let that = this;
      let height = '';
      let height_02 = 0;
      wx.getSystemInfo({
        success: function(res) {
          height_02 = res.windowHeight;
          height = e.detail.height
          setTimeout(() => {
            that.setData({
              height: height,
              showEmoji: false
            })
          }, 100)

        }
      })
    },
    //监听input失去焦点
    bindblur: function(e) {
      this.setData({
        height: 0
      });
    },
    hideReplyForm: function() {
      const that = this
      that.setData({
        focus: false,
        showreplyForm: false
      })
      that.triggerEvent('hideReplyForm')
    },
    toReply(e) {
      const that = this
      let myEventDetail = {
        id: '#reply-title'
      }
      that.triggerEvent('scrollToBottom', myEventDetail) //myevent自定义名称事件，父组件中使用
    },
    resetData: function() {
      const that = this
      that.setData({
        focus: false,
        showreplyForm: false,
        imageList: [],
        imageUrls: [],
        textContent: '',
        aidList: [],
        bigCode: [],
        message: '',
      })
    },

    //自定义表情包处理
    // 获取表情包数据
    getSmiley: function() {
      const that = this
      let emojiListSt = app.getSt('emojiList'),
        emojiListGroupSt = app.getSt('emojiListGroup')
      if (emojiListSt && emojiListGroupSt) {
        that.setData({
          emojiList: emojiListSt,
          emojiListGroup: emojiListGroupSt
        })
        return
      }
      request('post', 'get_smiley.php', {
        token: wx.getStorageSync("token"),
      }).then((res) => {
        const emojiListGroup = []
        const emojiList = res.data.common_smiley

        for (var i = 0; i < emojiList.length; i++) {
          const a1 = {
            icon: emojiList[i].icon
          };
          const a2 = {
            typeid: emojiList[i].typeid
          }

          const a3 = {
            list: []
          }
          const emojiListArr = Object.assign(a1, a2, a3);

          const emojiListGroupItem = emojiList[i].list
          if (emojiListArr.typeid == 1) {
            for (var j = 0; j < emojiListGroupItem.length; j += 24) {
              emojiListArr.list.push(emojiListGroupItem.slice(j, j + 24));
            }
          } else {
            for (var j = 0; j < emojiListGroupItem.length; j += 8) {
              emojiListArr.list.push(emojiListGroupItem.slice(j, j + 8));
            }
          }
          emojiListGroup.push(emojiListArr);
        }

        that.setData({
          emojiList: emojiList,
          emojiListGroup: emojiListGroup
        })
        console.log(emojiList)
        app.putSt('emojiList', emojiList, 86400) //表情缓存set
        app.putSt('emojiListGroup', emojiListGroup, 86400) //表情缓存set

      })
    },
    chanegEmojiTab: function(e) {
      const that = this
      const screenW = that.data.screenW
      const idx = e.currentTarget.dataset.idx
      that.setData({
        emojiScrollLeft: screenW * idx
      })
    },
    // 
    emojitouchstart: function(e) {
      const that = this
      that.setData({
        touchStartX: e.changedTouches[0].pageX
      })

    },
    emojitouchend: function(e) {
      const that = this
      const idx = e.currentTarget.dataset.idx
      const groupIdx = e.currentTarget.dataset.groupidx
      const listLength = that.data.emojiListGroup[groupIdx].list.length
      const screenW = that.data.screenW

      const touchEndX = e.changedTouches[0].l
      let tx = touchEndX - this.data.touchStartX
      //左右方向滑动
      if (tx < -screenW * 0.3) {
        // console.log('向左滑动')
        if (idx == listLength - 1) {
          if (groupIdx == that.data.emojiListGroup.length - 1) {
            return
          } else {
            const setLeft = screenW * (groupIdx + 1)
            that.setData({
              emojiScrollLeft: setLeft
            })
          }
        }
      } else if (tx > screenW * 0.3) {
        // console.log('向右滑动')
        if (idx == 0) {
          if (groupIdx == 0) {
            return
          } else {
            const setLeft = screenW * (groupIdx - 1)
            that.setData({
              emojiScrollLeft: setLeft
            })
          }
        }
      } else {
        // console.log('滑动幅度不够哦！')
      }
    },
    toSet: function() {
      this.triggerEvent('toSet')
    },
    showShareBox: function() {
      const that = this
      that.setData({
        showShareBox: !that.data.showShareBox
      })
    },
    shareImg: function() {
      const that = this;
      app.isShowAuthorization().then(re => {
        if (re == 2) {
          that.setData({
            timeStamp: +new Date()
          })
          that.showShareBox()
          wx.showLoading({
            title: '图片生成中...',
            mask: true
          })
          request('post', 'get_friends_circle.php', {
            token: wx.getStorageSync("token"),
            type: that.data.hidden,
            typeid: that.data.tid
          }).then((res) => {
            if (res.err_code != 0) {
              wx.hideLoading()
              return
            }
            that.setData({
              shareTitle: res.data.subject,
              shareContent: res.data.message
            })
            let urls = [res.data.img, res.data.qrcode]
            that.getImageInfo(res.data.img).then((r) => {
              that.setData({
                shareImg: r
              })
              that.downloadImgs(res.data.qrcode).then((r) => {
                that.setData({
                  shareQrcode: r,
                })
                if (!that.data.avatar) {
                  wx.hideLoading()
                  that.drawSharePic()
                  return
                }
                that.downloadImgs(that.data.avatar).then((r) => {
                  that.setData({
                    shareAvatar: r
                  })
                  wx.hideLoading()
                  that.drawSharePic()
                })
              })
            })
          })
        } else if (re == 1) {
          that.showAuthorization();
        }
      })
    },
    downloadImgs: function(img) {
      const that = this
      return new Promise(function(resolve, reject) {
        const downloadTaskImg = wx.downloadFile({
          url: img,
          success(res) {
            resolve(res.tempFilePath)
          }
        })
      })
    },
    getImageInfo(img) {
      const that = this
      return new Promise(function(resolve, reject) {
        wx.getImageInfo({
          src: img,
          success: function success(res) {
            that.data.widthImage = res.width
            that.data.heightImage = res.height
            resolve(res.path)
          }
        })
      })
    },
    roundRectColor(context, x, y, w, h, r) { //绘制圆角矩形（纯色填充）
      context.save();
      context.setFillStyle("#ffffff");
      context.setStrokeStyle('#ffffff')
      context.setLineJoin('round'); //交点设置成圆角
      context.setLineWidth(r);
      context.strokeRect(x + r / 2, y + r / 2, w - r, h - r);
      context.fillRect(x + r, y + r, w - r * 2, h - r * 2);
      context.stroke();
      context.closePath();
    },
    radiusImg(context, img, x, y, w, h, r) { //绘制圆角矩形（纯色填充）
      context.save();
      context.beginPath() //开始创建一个路径
      context.setFillStyle("#ffffff");
      context.setLineJoin('round'); //交点设置成圆角
      context.setLineWidth(r);
      context.strokeRect(x + r / 2, y + r / 2, w - r, h - r);
      context.stroke();
      var imageSize = aspectFill({
        width: this.data.widthImage,
        height: this.data.heightImage
      }, w, h)
      var y_i_height = y - (imageSize.height - h) / 2.0
      context.drawImage(img, x - (imageSize.width - w) / 2.0, y_i_height < 64 ? 64 : y_i_height, imageSize.width, imageSize.height > 400 ? 400 : imageSize.height)
      context.closePath()
    },
    circleImg(ctx, img, x, y, r) {
      ctx.save();
      var d = 2 * r;
      var cx = x + r;
      var cy = y + r;
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(img, x, y, d, d)
      ctx.restore();
    },

    drawSharePic: function() {
      const that = this
      const qrcode = that.data.shareQrcode
      const img = that.data.shareImg
      const author = that.data.author
      const question_price = !that.data.question_price || that.data.question_price == '0.00' ? '' : '￥' + that.data.question_price
      const time = '发表于' + that.data.time
      const title = that.data.shareTitle || ''
      const level = that.data.level || ''
      const extcredits2 = that.data.extcredits2 ? that.data.extcredits2 + '度' : ''

      const content = that.data.shareContent
      const ePower = that.data.shareEPower
      const qrText = that.data.shareQrText
      const logoCanvas = '../../resources/image/canvas-draw/canvas-logo.png'
      const avatarCanvas = that.data.shareAvatar || '../../resources/image/canvas-draw/avatar.jpg'
      const tipsCanvas = '../../resources/image/canvas-draw/tips_quest.png'
      const vipCanvas = '../../resources/image/canvas-draw/vip.png'
      const powerCanvas = '../../resources/image/canvas-draw/lightning.png'

      var canvasCtx = wx.createCanvasContext(`shareCanvas${that.data.timeStamp}`, that)
      that.setData({
        showShareCanvasBox: true,
        showShareCanvasInner: false
      })
      //为了防止标题过长，分割字符串,每行18个
      let yOffset = 140
      let titleArray = []
      for (let i = 0; i < title.length / 18; i++) {
        if (i > 1) {
          yOffset = 140
          break
        }
        titleArray.push(title.substr(i * 18, 18))
      }
      const top_mask_h = 100 - 50 + titleArray.length * 26 //上遮罩的高度

      let cOffset = 320
      if (content.length <= 18)
        cOffset = 320 + 18
      let contentArray = []
      console.log(cOffset)
      for (let i = 0; i < content.length / 18; i++) {
        if (i > 1) {
          cOffset = 320
          break
        }
        contentArray.push(content.substr(i * 18, 18));
      }
      const bottom_mask_y = 300 + 50 - contentArray.length * 26 //下遮罩的y定位

      canvasCtx.save(); // 先保存状态 已便于画完圆再用
      canvasCtx.beginPath(); //开始绘制

      //绘制背景
      const grad = canvasCtx.createLinearGradient(0, 0, 300, 0)
      grad.addColorStop(0, "#57afc7"); //定义渐变色颜色
      grad.addColorStop(1, "#77d9b2");
      canvasCtx.fillStyle = grad; //设置fillStyle为当前的渐变对象
      canvasCtx.fillRect(0, 0, 275, 490);
      // 绘制logo
      canvasCtx.drawImage(logoCanvas, 17, 19, 190, 31);
      // 白色背景
      that.roundRectColor(canvasCtx, 14, 58, 248, 414, 16);
      // 图片
      // that.circleImg(canvasCtx, img, 136, 174, 10)
      that.radiusImg(canvasCtx, img, 22, 174, 233, 122, 6)
      // 上遮罩图片
      that.roundRectColor(canvasCtx, 22, 64, 234, top_mask_h, 0);
      // 下遮罩图片
      that.roundRectColor(canvasCtx, 22, bottom_mask_y, 234, 414 + 16 * 3 - bottom_mask_y, 0);
      // 文章作者
      canvasCtx.setFillStyle('#000000')
      canvasCtx.setFontSize(12)
      let author_length = author.length
      let author_width = canvasCtx.measureText(author).width
      if (that.data.vip) {
        canvasCtx.drawImage(vipCanvas, 205 - 20, 62, 14, 14)
        author_width = author_width + 14
      }
      canvasCtx.fillText(author, 205 - author_width - 8, 56 + 17)
      if (level) {
        canvasCtx.setFillStyle('#b9d7d7')
        canvasCtx.setFontSize(9)
        let level_width = canvasCtx.measureText(level).width
        canvasCtx.fillText(level, 205 - level_width - 8, 58 + 17 + 12)
      }
      if (extcredits2) {
        canvasCtx.setFillStyle('#7f7979')
        canvasCtx.setFontSize(9)
        let extcredits2_width = canvasCtx.measureText(extcredits2).width
        canvasCtx.fillText(extcredits2, 205 - author_width - 8 - extcredits2_width - 6, 73)
        canvasCtx.drawImage(powerCanvas, 205 - author_width - 8 - extcredits2_width - 6 - 25 + 12, 64, 10, 10)
      }

      // 时间
      canvasCtx.setFillStyle('#000000')
      let time_width = canvasCtx.measureText(time).width
      canvasCtx.setFontSize(9)
      canvasCtx.fillText(time, 249 - time_width, 110)
      // 问答奖赏钱
      if (question_price) {
        canvasCtx.setFillStyle('#dd0908')
        let price_width = canvasCtx.measureText(question_price).width
        canvasCtx.setFontSize(16)
        canvasCtx.fillText(question_price, 35, 110)
      }
      //绘制分享的标题文字
      canvasCtx.setFillStyle('#000000')
      titleArray.forEach(function(value) {
        canvasCtx.setFontSize(14);
        canvasCtx.fillText(value, 35, yOffset, 220);
        yOffset += 20
      });
      //绘制分享的文字描述
      contentArray.forEach(function(value) {
        canvasCtx.setFontSize(12);
        canvasCtx.setFillStyle('#525353');
        canvasCtx.setTextAlign('left');
        canvasCtx.fillText(value, 32, cOffset, 250);
        cOffset += 23;
      });
      // 画线
      canvasCtx.setFillStyle('#e8f5ef')
      canvasCtx.fillRect(28, 360, 220, 1)
      //绘制二维码
      canvasCtx.drawImage(qrcode, 42, 380, 70, 70);
      // 绘制长按提示
      canvasCtx.drawImage(tipsCanvas, 130, 380, 96, 72);
      // 作者头像
      canvasCtx.beginPath() //开始创建一个路径
      canvasCtx.arc(205 + 27, 36 + 27, 27, 0, 2 * Math.PI, false) //画一个圆形裁剪区域
      canvasCtx.setLineWidth(6)
      canvasCtx.stroke();
      canvasCtx.clip() //裁剪
      canvasCtx.drawImage(avatarCanvas, 205, 36, 54, 54)
      canvasCtx.closePath()

      canvasCtx.draw();
      //绘制之后加一个延时去生成图片，如果直接生成可能没有绘制完成，导出图片会有问题。
      that.canvasToTempFilePath()
    },
    canvasToTempFilePath() {
      const that = this
      setTimeout(function() {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 550,
          height: 900,
          destWidth: 750,
          destHeight: 1334,
          canvasId: 'shareCanvas',
          success: function(res) {
            that.setData({
              shareImageSrc: res.tempFilePath,
              showShareCanvasInner: true
            })
          },
          fail: function(res) {
            console.log(res)
          }
        }, that)
      }, 1000)
    },
    closeCanvas: function() {
      const that = this
      that.setData({
        showShareCanvasBox: false
      })
    },
    saveCanvas: function() {
      const that = this
      that.setData({
        loading_hidden: false
      })
      console.log(that.data.shareImageSrc)
      wx.saveImageToPhotosAlbum({
        filePath: that.data.shareImageSrc,
        success(res) {
          console.log(res)
          that.setData({
            loading_hidden: true
          })
          wx.showModal({
            title: '存图成功',
            content: '图片成功保存到相册了，去发圈噻~',
            showCancel: false,
            confirmText: '好哒',
            confirmColor: '#72B9C3',
            success: function(res) {
              if (res.confirm) {
                that.showShareBox()
              }
              that.closeCanvas()

            }
          })
        },
        complete(res) {
          console.log(res)
        }
      })
    },

  }
})