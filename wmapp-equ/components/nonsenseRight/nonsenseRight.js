const app = getApp();
import {
  request,
  uploadFile,
  aspectFill
} from '../../utils/util.js'

Component({
  properties: {
    tid: {
      type: Number,
      value: 0
    },
    hidden: {
      type: Number,
      value: 0
    },
    showShare: {
      type: Boolean,
      value: false
    },
    hideSmiley: { //是否隐藏表情
      type: Boolean,
      value: false
    }
  },
  data: {
    showShareBox: false
  },

  methods: {
    getImageInfo(img) {
      const that = this
      return new Promise(function(resolve, reject) {
        wx.getImageInfo({
          src: img,
          success: function(res) {
            that.data.widthImage = res.width;
            that.data.heightImage = res.height;
            resolve(res.path);
          }
        })
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
            typeid: that.data.tid || 1
          }).then((res) => {
            if (res.err_code != 0) {
              wx.hideLoading()
              return
            }
            that.setData({
              views: res.data.views,
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
                  shareQrcode: r
                })
                wx.hideLoading()
                that.drawSharePic()
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
      const title = that.data.shareTitle || ''
      const views = that.data.views
      const content = that.data.shareContent
      const ePower = that.data.shareEPower
      const qrText = that.data.shareQrText
      const tipsCanvas = '../../resources/image/canvas-draw/tips.png'
      const viewsCanvas = '../../resources/image/canvas-draw/views.png'
      const nonsenseCanvas = '../../resources/image/canvas-draw/nonsense.png'
      const logoCanvas = '../../resources/image/canvas-draw/canvas-logo.png'

      var canvasCtx = wx.createCanvasContext(`shareCanvas${that.data.timeStamp}`, that)
      that.setData({
        showShareCanvasBox: true,
        showShareCanvasInner: false
      })
      //为了防止标题过长，分割字符串,每行18个


      let yOffset = 150
      if (title.length <= 18)
        yOffset = 150 + 18
      let titleArray = []
      for (let i = 0; i < title.length / 18; i++) {
        if (title.length / 18 == i) {
          yOffset = 150
          break;
        }
        titleArray.push(title.substr(i * 18, 18));
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
      console.log(yOffset)
      that.radiusImg(canvasCtx, img, 22, yOffset + (titleArray.length - 1) * 25, 233, 122, 6)
      // Epai图片
      canvasCtx.drawImage(nonsenseCanvas, 262 - 94, 85, 94, 34)
      // 浏览数
      canvasCtx.drawImage(viewsCanvas, 26, 100, 13, 13)
      canvasCtx.setFillStyle('#b9d7d7')
      canvasCtx.setFontSize(9)
      canvasCtx.fillText(views, 43, 110)


      //绘制分享的标题文字
      canvasCtx.setFillStyle('#000000')
      titleArray.forEach(function(value) {
        canvasCtx.setFontSize(15);
        canvasCtx.fillText(value, 30, yOffset, 220);
        yOffset += 23
      });

      // 画线
      canvasCtx.setFillStyle('#e8f5ef')
      canvasCtx.fillRect(28, 360, 220, 1)

      //绘制二维码
      canvasCtx.drawImage(qrcode, 42, 380, 70, 70);

      // 绘制长按提示
      canvasCtx.drawImage(tipsCanvas, 130, 380, 96, 72);

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
      wx.saveImageToPhotosAlbum({
        filePath: that.data.shareImageSrc,
        success(res) {
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
                that.hideShareBox()
              }
              that.closeCanvas()

            }
          })
        }
      })
    },

    chooseImage: function(e) {
      const that = this
      wx.chooseImage({
        count: 1,
        success: function(res) {
          var tempFilePaths = res.tempFilePaths
          var tmpImageList = that.data.imageList;
          var tmpAidList = that.data.aidList;
          const tmpimageUrls = that.data.imageUrls
          for (var i = 0; i < res.tempFilePaths.length; i++) {

            var localFilePath = res.tempFilePaths[i]
            const uploadTask = uploadFile('post', 'add_image.php', localFilePath, 'myfile', {
              token: wx.getStorageSync("token"),
              type: 'question'
            }).then((resp) => {
              if (resp == 'err')
                return
              let addPostDetail = {
                message: resp.data.code,
                aid_list: resp.data.aid,
                attachment: 2
              } // detail对象，提供给事件监听函数 
              that.triggerEvent('addPost', addPostDetail)

            })
          }
        }
      })
    },

    squareTap: function() {
      const that = this
      that.triggerEvent('squareTap')
    },
    squareLong: function() {
      const that = this
      that.triggerEvent('squareLong')
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
      })
    },
    getClipboard: function() {
      this.triggerEvent('getClipboard')
    },
  }
})