import {
  request,
  transformPHPTime,
  aspectFill
} from '../../utils/util.js'
const app = getApp();
Component({
  properties: {
    addPosts: {
      type: Object,
      value: {}
    },
    showGoHome: {
      type: Boolean,
      value: false
    },

    showToTop: {
      type: Boolean,
      value: false
    },

    author: {
      type: String,
      value: ''
    },

    avatar: {
      type: String,
      value: ''
    },
    time: {
      type: String,
      value: ''
    },
    views: {
      type: String,
      value: ''
    },
    hidden: {
      type: Number,
      value: 0
    },
    replies: {
      type: String,
      value: ''
    },
    level: {
      type: String,
      value: ''
    },
    extcredits2: {
      type: String,
      value: ''
    },
    scrollTop: {
      type: Number,
      value: 0,
      observer: function(newVal, oldVal, changedPath) {
        const that = this
        if (newVal >= 300) {
          that.setData({
            scroll_show: true
          })
        }
        // else {
        //   that.setData({
        //     scroll_show: false
        //   })
        // }
      }
    },
    showZan: {
      type: Boolean,
      value: false
    },
    showCai: {
      type: Boolean,
      value: false
    },
    showShare: {
      type: Boolean,
      value: false
    },
    share_type: {
      type: Number,
      value: 0
    },
    tid: { //文章tid
      type: String,
      value: '',
    },

    showReplyBtn: {
      type: Boolean,
      value: false
    },
    showReply: {
      type: Boolean,
      value: false
    },
    isAdmin: {
      type: Number,
      value: 0
    },
    thisModerator: {
      type: Number,
      value: 0
    },
    is_zan: { //0没有 1赞 2踩
      type: String,
      value: 0,
    },
    zan: {
      type: Number,
      value: 0,
    },
    vip: {
      type: Boolean,
      value: false
    },
    cai: {
      type: Number,
      value: 0,
    },
    totalNum: { //回复数
      type: Number,
      value: 0
    },
    showSet: { //点开设置
      type: Boolean,
      value: false
    },
    showToPost: {
      type: Boolean,
      value: false
    },
    showToPraise: {
      type: Boolean,
      value: false
    },
    messagePid: { //从消息通知那里进帖子详情
      type: Number,
      value: 0
    },
    showCopy: {
      type: Boolean,
      value: false
    }

  },
  data: {
    loading_hidden: true,
    loading_msg: '加载中..',
    scroll_show: false,
    showShareBox: false,
    showShareCanvasBox: false,
    showShareCanvasInner: false,
    shareImageSrc: '',
    shareEPower: '../../resources/image/user/e-power.png',
    shareQrText: '长按识别小程序“码”查看详情',
    shareTitle: '',
    shareImg: '',
    shareQrcode: '',
    shareContent: '',
    replyScrollH: 0, //评论高度
    page_size: 5, //查询评论数
    page_index: 0,
    pid: 0, //回复哪个帖子的记录
    scrBottom: 1,
    heightMt: app.globalData.heightMt + 20 * 2
  },
  ready: function() {
    const that = this
  },
  methods: {
    // 回复后评论增加
    addPost: function() {
      const that = this
      that.setData({
        totalNum: that.data.totalNum + 1
      })
      if (that.data.articleList)
        that.getComment()

    },
    toSet: function() {
      this.triggerEvent('toSet')
    },
    toPost: function() { //发帖
      wx.navigateTo({
        url: '/question/pages/add_article/add_article'
      })
    },
    toPraise: function() {
      const that = this
      app.canAddThread(true).then((re) => {
        if (re) {
          if (re.data) {
            if (re.data.name) {
              let name = re.data.name,
                car_2 = re.datacar_2,
                car_3 = re.datacar_3
              wx.navigateTo({
                url: `/praise/pages/praise_appear/praise_appear?name=${name}&car_2=${car_2}&car_3=${car_2}`,
              })
              return
            }
          }
          wx.navigateTo({
            url: '/praise/pages/praise_appear/praise_appear',
          })
        }
      })
    },
    //点击查看评论回复
    toReply: function() {
      const that = this
      if (that.data.tid == that.data.id && that.data.articleList) {
        that.setData({
          showReply: true
        })
        return
      }
      that.getComment().then((res) => {
        let totalNum = res;
        let num;

        if (totalNum < 2) {
          totalNum = 1.2, num = 2
        } else if (totalNum == 2) {
          totalNum = 2, num = 3
        } else if (totalNum >= 3) {
          totalNum = 3, num = 4
        }

        that.setData({
          replyScrollH: 140 * totalNum,
          showReply: true,
          scrBottom: num
        })
      })
    },

    cloceReply: function() {
      const that = this
      that.setData({
        showReply: false
      })
    },
    // 评论回复
    replyComment: function(e) {
      const that = this
      const pid = e.currentTarget.dataset.pid
      const focus = e.currentTarget.dataset.focus
      const tid = that.data.tid
      const hidden = that.data.hidden
      app.isShowAuthorization().then((res) => {
        if (res == 2) {
          if (hidden == 3) {
            const uppid = e.currentTarget.dataset.uppid
            const reply_pid = e.currentTarget.dataset.pid
            const author = e.currentTarget.dataset.author
            that.setData({
              uppid: uppid,
              reply_pid: reply_pid,
              to_author: author
            })
            that.selectComponent("#replyTail").showreplyFormFun()
            return
          }
          if (focus) {
            wx.navigateTo({
              url: `../reply_detail/reply_detail?pid=${pid}&tid=${tid}&focus=${focus}`
            })
          } else {
            wx.navigateTo({
              url: `../reply_detail/reply_detail?pid=${pid}&tid=${tid}`
            })
          }
        } else if (res == 1) {
          that.showAuthorization();
        }
      })
    },
    // 评论回复传给父组件
    replyCommentCld: function(e) {
      const that = this
      const pid = e.currentTarget.dataset.pid
      let faReply = {
        pid: pid
      }
      that.triggerEvent('faReply', faReply)
    },

    //删除评论  再给父组件
    replyDel: function(e) {
      const that = this
      let index = e.currentTarget.dataset.index,
        pid = e.currentTarget.dataset.pid,
        data = {
          token: wx.getStorageSync("token"),
          pid: pid
        }
      app.deleteNormal(data, 'del_reply.php').then((res) => {
        if (res.status < 0)
          return
        that.data.articleList.splice(index, 1)
        that.setData({
          articleList: that.data.articleList,
          totalNum: that.data.totalNum - 1
        })
      })
    },
    // 点赞文章
    toZan: function(e) {
      const that = this
      const type = e.currentTarget.dataset.type //1赞 2踩
      app.isShowAuthorization().then((res) => {
        if (res == 2) {
          var is_zan = that.data.is_zan
          if (is_zan == 0) {
            request('post', 'add_zan.php', {
              token: wx.getStorageSync("token"),
              tid: that.data.tid,
              type: type
            }).then((res) => {
              if (res.err_code != 0)
                return

              if (type == 1) {
                this.setData({
                  is_zan: 1,
                  zan: parseInt(that.data.zan) + parseInt(1)
                })
              } else {
                this.setData({
                  is_zan: 2,
                  cai: parseInt(that.data.cai) + parseInt(1)
                })
              }
              wx.showToast({
                title: res.data.credits ? '已评价，电量+' + res.data.credits : '评价成功！',
                icon: 'success',
              })
            })
          } else {
            wx.showToast({
              title: '你已经评价过啦！',
              icon: 'none',
            })
          }
        } else if (res == 1) {
          that.showAuthorization();
        }
      })
    },
    // 点赞评论
    clickZhan: function(e) {
      const that = this
      const type = e.currentTarget.dataset.type //1赞 2踩
      const is_zan = e.currentTarget.dataset.iszan
      const pid = e.currentTarget.dataset.pid
      const index = e.currentTarget.dataset.index
      const number = e.currentTarget.dataset.number
      const one_man = e.currentTarget.dataset.one_man
      app.isShowAuthorization().then((res) => {
        if (res == 2) {
          if (is_zan == 0) {
            request('post', 'add_zan_post.php', {
              token: wx.getStorageSync("token"),
              tid: that.data.tid,
              type: type,
              pid: pid
            }).then((res) => {
              let articleListIndex, indexNum

              if (type == 1) {
                articleListIndex = one_man ? 'replyList[' + index + '].zan' : 'articleList[' + index + '].zan'
                indexNum = 1
              } else {
                articleListIndex = one_man ? 'replyList[' + index + '].cai' : 'articleList[' + index + '].cai'
                indexNum = 2
              }

              let artIndexIs = one_man ? 'replyList[' + index + '].is_zan' : 'articleList[' + index + '].is_zan'
              that.setData({
                [artIndexIs]: indexNum,
                [articleListIndex]: parseInt(number) + parseInt(1)
              })
              if (!one_man) {
                let faZan = {
                  artIndexIs: artIndexIs,
                  articleListIndex: articleListIndex,
                  indexNum: indexNum,
                  number: number
                } // detail对象，提供给事件监听函数
                that.triggerEvent('faZan', faZan)
              }
              wx.showToast({
                title: res.data.credits ? '已评价，电量+' + res.data.credits : '评价成功！',
                icon: 'success',
              })
            })
          } else {
            wx.showToast({
              title: '你已经评价过啦！',
              icon: 'none',
            })
          }
        } else if (res == 1) {
          that.showAuthorization();
        }
      })
    },
    toUserDetail: function(e) {
      app.toUserDetail(e)
    },
    //访问评论接口
    getComment: function() {
      const that = this
      let page_size = that.data.page_size
      that.data.page_index = 0
      return new Promise(function(resolve, reject) {
        request('post', 'get_post_detail_comment.php', {
          token: wx.getStorageSync("token"),
          tid: that.data.tid,
          page_size: page_size,
          page_index: 0,
          pid: that.data.messagePid || 0
        }).then((res) => {
          let post_list_length = res.data.post_list.length,
            totalNum = res.data.total_num,
            postList = res.data.reply,
            replyList = res.data.reply,
            post_list = res.data.post_list
          if (that.data.messagePid && replyList.length == 0) {
            app.wxShowToast('该回复已被删除', 1500, 'none')
          }
          if (replyList.lenght && replyList[0].dateline)
            replyList[0].time = transformPHPTime(replyList[0].dateline)
          for (let i in post_list) {
            var extcredits2 = post_list[i].extcredits2 + ''
            post_list[i].extcredits2_arr = extcredits2.split('')
            post_list[i].time = transformPHPTime(post_list[i].dateline)
          }

          that.setData({
            id: that.data.tid,
            page_index: 0,
            articleList: post_list,
            replyList: postList, //有人回复你
            // totalNum: totalNum,
            nomore_data: post_list_length < page_size ? true : false
          })
          resolve(totalNum)
        })
      })
    },
    getClipboard: function() {
      this.triggerEvent('getClipboard')
      this.hideShareBox()
    },
    //评论滑动到底部加载
    onReplyReachBottom: function() {
      const that = this
      let page_size = that.data.page_size
      let page_index = that.data.page_index + 1
      if (that.data.nomore_data == true)
        return
      that.setData({
        have_data: true
      })
      setTimeout(() => {
        request('post', 'get_post_detail_comment.php', {
          token: wx.getStorageSync("token"),
          tid: that.data.tid,
          page_size: page_size,
          page_index: page_index
        }).then((res) => {

          let tmpArticleList = that.data.articleList;
          let respArticleList = res.data.post_list;

          for (let i in respArticleList) {
            var extcredits2 = respArticleList[i].extcredits2 + ''
            respArticleList[i].extcredits2_arr = extcredits2.split('')
            respArticleList[i].time = transformPHPTime(respArticleList[i].dateline)
          }
          let newArticleList = tmpArticleList.concat(respArticleList)
          let post_list_length = res.data.post_list.length
          that.setData({
            have_data: post_list_length < page_size ? false : true,
            articleList: newArticleList,
            page_index: page_index,
            nomore_data: post_list_length < page_size ? true : false,
          }, 100)
        })
      })
    },
    // 这里是一个自定义方法
    toHome: function() {
      wx.switchTab({
        url: `/pages/index/index`,
      })
    },
    scrollToTop: function() {
      const that = this
      if (wx.pageScrollTo) {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 600
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
      that.setData({
        scroll_show: false
      })
    },

    showShareBox: function() {
      const that = this
      that.setData({
        showShareBox: true
      })
    },

    hideShareBox: function() {
      const that = this
      that.setData({
        showShareBox: false,
        showReply: false
      })
    },
    shareImg: function() {
      const that = this;
      app.isShowAuthorization().then(re => {
        if (re == 2) {
          that.setData({
            timeStamp: +new Date()
          })
          that.hideShareBox()
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
              wx.hideLoading();
              return;
            }
            that.setData({
              shareTitle: res.data.subject,
              shareContent: res.data.message
            });

            let urls = [res.data.img, res.data.qrcode]

            that.getImageInfo(res.data.img).then((r) => {
              that.setData({
                shareImg: r
              });
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
    showAuthorization: function(){
      this.setData({
        showAuthorization: true
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
            console.log(that.data.widthImage, that.data.heightImage)
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
      const views = that.data.views
      const replies = that.data.replies
      const zan = that.data.zan
      const time = '发表于' + that.data.time
      const title = that.data.shareTitle || ''
      const level = that.data.level || ''
      const hidden = that.data.hidden
      const extcredits2 = that.data.extcredits2 ? that.data.extcredits2 + '度' : ''

      const content = that.data.shareContent
      const ePower = that.data.shareEPower
      const qrText = that.data.shareQrText
      const logoCanvas = '../../resources/image/canvas-draw/canvas-logo.png'
      const avatarCanvas = that.data.shareAvatar || '../../resources/image/canvas-draw/avatar.jpg'
      const viewsCanvas = '../../resources/image/canvas-draw/views.png'
      const repliesCanvas = '../../resources/image/canvas-draw/replies.png'
      const zanCanvas = '../../resources/image/canvas-draw/zan-grey.png'
      const tipsCanvas = '../../resources/image/canvas-draw/tips.png'
      const vipCanvas = '../../resources/image/canvas-draw/vip.png'
      const powerCanvas = '../../resources/image/canvas-draw/lightning.png'

      var canvasCtx = wx.createCanvasContext(`shareCanvas${that.data.timeStamp}`, that)
      that.setData({
        showShareCanvasBox: true,
        showShareCanvasInner: false
      })
      //为了防止标题过长，分割字符串,每行18个
      let yOffset = 144
      if (hidden == 501)
        yOffset = 134
      let titleArray = []
      for (let i = 0; i < title.length / 16; i++) {
        if (i > 1) {
          yOffset = 144
          if (hidden == 501)
            yOffset = 134
          break
        }
        titleArray.push(title.substr(i * 16, 16))
      }
      const top_mask_h = 108 - 50 + titleArray.length * 28 //上遮罩的高度

      let cOffset = 318
      let contentArray = []
      for (let i = 0; i < content.length / 18; i++) {
        if (i > 1) {
          cOffset = 318
          break
        }
        contentArray.push(content.substr(i * 18, 18));
      }

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

      if (hidden == 501) {
        that.radiusImg(canvasCtx, img, 22, 134 + 32 * 2, 233, 122, 6)
      } else {
        that.radiusImg(canvasCtx, img, 22, 174, 233, 122, 6)
      }
      // 上下遮罩图片
      if (hidden < 100) {
        that.roundRectColor(canvasCtx, 22, 64, 234, top_mask_h, 0)
        that.roundRectColor(canvasCtx, 22, 318 + 18 * 2, 234, 414 + 16 * 3 - 318 - 18 * 2, 0)
      }
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
        canvasCtx.fillText(level, 205 - level_width - 8, 58 + 17 + 14)
      }

      if (extcredits2) {
        canvasCtx.setFillStyle('#7f7979')
        canvasCtx.setFontSize(9)
        let extcredits2_width = canvasCtx.measureText(extcredits2).width
        canvasCtx.fillText(extcredits2, 205 - author_width - 8 - extcredits2_width - 6, 73)
        canvasCtx.drawImage(powerCanvas, 205 - author_width - 8 - extcredits2_width - 6 - 25 + 12, 64, 10, 10)
      }
      // 浏览数、回复数、点赞数
      canvasCtx.drawImage(viewsCanvas, 26, 96, 13, 13)
      canvasCtx.drawImage(repliesCanvas, 78, 96, 13, 13)
      canvasCtx.drawImage(zanCanvas, 119, 96, 13, 13)
      canvasCtx.setFillStyle('#b9d7d7')
      canvasCtx.setFontSize(8)
      canvasCtx.fillText(views, 43, 106)
      canvasCtx.fillText(replies, 96, 106)
      canvasCtx.fillText(zan, 135, 106)
      // 时间
      canvasCtx.setFillStyle('#000000')
      let time_width = canvasCtx.measureText(time).width
      canvasCtx.fillText(time, 249 - time_width, 106)
      //绘制分享的标题文字
      canvasCtx.setFillStyle('#000000')
      titleArray.forEach(function(value) {
        canvasCtx.setFontSize(15);
        canvasCtx.fillText(value, 32, yOffset, 206);
        yOffset += 24
      });

      //绘制分享的文字描述
      // contentArray.forEach(function(value) {
      //   canvasCtx.setFontSize(12);
      //   canvasCtx.setFillStyle('#525353');
      //   canvasCtx.setTextAlign('left');
      //   canvasCtx.fillText(value, 32, cOffset, 245);
      //   cOffset += 23;
      // });
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
          canvasId: `shareCanvas${that.data.timeStamp}`,
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
        loading_hidden: true,
        loading_msg: '加载中...',
      })
      wx.saveImageToPhotosAlbum({
        filePath: that.data.shareImageSrc,
        success(res) {
          that.setData({
            loading_hidden: true,
            loading_msg: '加载完毕',
          })
          wx.showModal({
            title: '存图成功',
            content: '图片成功保存到相册了，去发圈噻~',
            showCancel: false,
            confirmText: '好哒',
            confirmColor: '#72B9C3',
            success: function(res) {
              if (res.confirm) {
                that.hideShareBox()
              }
              that.closeCanvas()

            }
          })
        }
      })
    }
  },

})