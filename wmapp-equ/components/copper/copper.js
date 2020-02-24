import {request} from '../../utils/util.js'
// 手机的宽度
var windowWRPX = 750
// 拖动时候的 pageX
var pageX = 0
// 拖动时候的 pageY
var pageY = 0
 
var pixelRatio = wx.getSystemInfoSync().pixelRatio
 
// 调整大小时候的 pageX
var sizeConfPageX = 0
// 调整大小时候的 pageY
var sizeConfPageY = 0
 
var initDragCutW = 0
var initDragCutL = 0
var initDragCutH = 0
var initDragCutT = 0
 
// 移动时 手势位移与 实际元素位移的比
var dragScaleP = 2

Component({
  properties: {
 
  },
  data: {
    headImg:'', //头像上传
    imageFixed:false, //裁剪浮层
    // imageSrc: 'http://topmdrt-static.oss-cn-shenzhen.aliyuncs.com/images/testimg2.jpeg',
    imageSrc: '', //要裁剪的图片
    returnImage: '',
    isShowImg: false,
    // 初始化的宽高
    cropperInitW: windowWRPX,
    cropperInitH: windowWRPX,
    // 动态的宽高
    cropperW: windowWRPX,
    cropperH: windowWRPX,
    // 动态的left top值
    cropperL: 0,
    cropperT: 0,
 
    // 图片缩放值
    scaleP: 0,
    imageW: 0,
    imageH: 0,
 
    // 裁剪框 宽高
    cutW: 400,
    cutH: 400,
    cutL: 0,
    cutT: 0,
  },
  ready: function() { 
    const that = this

  },
  methods: {
    // 拖动时候触发的touchStart事件
    contentStartMove: function (e) {
      pageX = e.touches[0].pageX
      pageY = e.touches[0].pageY
    },
   
    // 拖动时候触发的touchMove事件
    contentMoveing: function (e) {
      var that = this
      // that.data.cutL + (e.touches[0].pageX - pageX)
      var dragLengthX = (pageX - e.touches[0].pageX) * dragScaleP
      var dragLengthY = (pageY - e.touches[0].pageY) * dragScaleP
      var minX = Math.max(that.data.cutL - (dragLengthX), 0)
      var minY = Math.max(that.data.cutT - (dragLengthY), 0)
      var maxX = that.data.cropperW - that.data.cutW
      var maxY = that.data.cropperH - that.data.cutH
      this.setData({
        cutL: Math.min(maxX, minX),
        cutT: Math.min(maxY, minY),
      })
      pageX = e.touches[0].pageX
      pageY = e.touches[0].pageY
    },
   
    // 获取图片
    getImageInfo: function () {
      var that = this
      wx.showLoading({
        title: '图片生成中...',
      })
      // wx.downloadFile({
      //   url:that.data.imageSrc, //仅为示例，并非真实的资源     
      //   success: function (res) {
          // 将图片写入画布             
          const ctx = wx.createCanvasContext('myCanvas',that)
          // ctx.drawImage(res.tempFilePath)
          ctx.drawImage(that.data.imageSrc)
           
          ctx.draw(true, () => {
            // 获取画布要裁剪的位置和宽度   均为百分比 * 画布中图片的宽度    保证了在微信小程序中裁剪的图片模糊  位置不对的问题
            var canvasW = (that.data.cutW / that.data.cropperW) * (that.data.imageW / pixelRatio)
            var canvasH = (that.data.cutH / that.data.cropperH) * (that.data.imageH / pixelRatio)
            var canvasL = (that.data.cutL / that.data.cropperW) * (that.data.imageW / pixelRatio)
            var canvasT = (that.data.cutT / that.data.cropperH) * (that.data.imageH / pixelRatio)
            
            setTimeout(function () {
                wx.canvasToTempFilePath({
                    x: canvasL,
                    y: canvasT,
                    width: canvasW,
                    height: canvasH,
                    destWidth: canvasW,
                    destHeight: canvasH,
                    canvasId: 'myCanvas',
                    success: function (res) {
                       wx.hideLoading()
                      // 成功获得地址的地方
                      that.setData({
                        imageFixed: false,
                        headImg: res.tempFilePath
                      })
                      const uploadImgOption = {
                        imgUrl:res.tempFilePath
                      }

                      that.triggerEvent('uploadImg', uploadImgOption)
                    },
                    fail: function (res) {
                        console.log(res)
                    }
                },that)
            }, 1000);

          })
      //   }
   
   
      // })
    },
   
    // 设置大小的时候触发的touchStart事件
    dragStart: function(e) {
      var that = this
      sizeConfPageX = e.touches[0].pageX
      sizeConfPageY = e.touches[0].pageY
      initDragCutW = that.data.cutW
      initDragCutL = that.data.cutL
      initDragCutT = that.data.cutT
      initDragCutH = that.data.cutH
    },
    
    // 设置大小的时候触发的touchMove事件
    dragMove: function (e) {
      var that = this
      var dragType = e.target.dataset.drag
      switch (dragType) {
        case 'right':
          var dragLength = (sizeConfPageX - e.touches[0].pageX) * dragScaleP
          if (initDragCutW >= dragLength) {
            // 如果 移动小于0 说明是在往下啦  放大裁剪的高度  这样一来 图片的高度  最大 等于 图片的top值加 当前图片的高度  否则就说明超出界限
            if (dragLength < 0 && that.data.cropperW > initDragCutL + that.data.cutW) {
              this.setData({
                cutW: initDragCutW - dragLength
              })
            }
            // 如果是移动 大于0  说明在缩小  只需要缩小的距离小于原本裁剪的高度就ok
            if (dragLength > 0) {
              this.setData({
                cutW: initDragCutW - dragLength
              })
            }
            else {
              return
            }
          } else {
            return
          }
          break;
        case 'left':
          var dragLength = (dragLength = sizeConfPageX - e.touches[0].pageX) * dragScaleP
          if (initDragCutW >= dragLength && initDragCutL > dragLength) {
            if (dragLength < 0 && Math.abs(dragLength) >= initDragCutW) return
            this.setData({
              cutL: initDragCutL - dragLength,
              cutW: initDragCutW + dragLength
            })
          } else {
            return;
          }
          break;
        case 'top':
          var dragLength = (sizeConfPageY - e.touches[0].pageY) * dragScaleP
          if (initDragCutH >= dragLength && initDragCutT > dragLength) {
            if (dragLength < 0 && Math.abs(dragLength) >= initDragCutH) return
            this.setData({
              cutT: initDragCutT - dragLength,
              cutH: initDragCutH + dragLength
            })
          } else {
            return;
          }
          break;
        case 'bottom':
          var dragLength = (sizeConfPageY - e.touches[0].pageY) * dragScaleP
         
          // 必须是 dragLength 向上缩小的时候必须小于原本的高度
          if (initDragCutH >= dragLength) {
            // 如果 移动小于0 说明是在往下啦  放大裁剪的高度  这样一来 图片的高度  最大 等于 图片的top值加 当前图片的高度  否则就说明超出界限
            if (dragLength < 0 && that.data.cropperH > initDragCutT + that.data.cutH) {
              this.setData({
                cutH: initDragCutH - dragLength
              })
            }
            // 如果是移动 大于0  说明在缩小  只需要缩小的距离小于原本裁剪的高度就ok
            if (dragLength > 0) {
              this.setData({
                cutH: initDragCutH - dragLength
              })
            }
            else{
              return
            }
          } else {
            return
          }
          break;
        case 'rightBottom':
          var dragLengthX = (sizeConfPageX - e.touches[0].pageX) * dragScaleP
          var dragLengthY = (sizeConfPageY - e.touches[0].pageY)  * dragScaleP
          if (initDragCutH >= dragLengthY && initDragCutW >= dragLengthX) {
            // bottom 方向的变化
            if ((dragLengthY < 0 && that.data.cropperH > initDragCutT + that.data.cutH) || (dragLengthY > 0)) {
              this.setData({
                cutH: initDragCutH - dragLengthY
              })
            }
   
            // right 方向的变化
            if ((dragLengthX < 0 && that.data.cropperW > initDragCutL + that.data.cutW) || (dragLengthX > 0)) {
              this.setData({
                cutW: initDragCutW - dragLengthX
              })
            }
            else {
              return
            }
          } else {
            return
          }
          break;
        default:
          break;
      }
    },

    upEwm: function(e){
      var that = this
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths;
          that.setData({
            imageFixed: true,
            imageSrc: tempFilePaths.join()
          })
          // start
          wx.getImageInfo({
            src: that.data.imageSrc,
            success: function success(res) {
              var innerAspectRadio = res.width / res.height;
              // 根据图片的宽高显示不同的效果   保证图片可以正常显示
            
               
              if (innerAspectRadio == '1') {
                that.setData({
                  imageFixed: false,
                  headImg: tempFilePaths.join()
                })
                const uploadImgOption = {
                  imgUrl:that.data.headImg
                }
                that.triggerEvent('uploadImg', uploadImgOption)
              
              } else if (innerAspectRadio > 1) {
                that.setData({
                  cropperW: windowWRPX,
                  cropperH: windowWRPX / innerAspectRadio,
                  // 初始化left right
                  cropperL: Math.ceil((windowWRPX - windowWRPX) / 2),
                  cropperT: Math.ceil((windowWRPX - windowWRPX / innerAspectRadio) / 2),
                  // 裁剪框  宽高 
                  // cutW: windowWRPX - 200,
                  // cutH: windowWRPX / innerAspectRadio - 200,
                  cutL: Math.ceil((windowWRPX - windowWRPX + 340) / 2),
                  cutT: Math.ceil((windowWRPX / innerAspectRadio - (windowWRPX / innerAspectRadio - 20)) / 2),
                  // 图片缩放值
                  scaleP: res.width * pixelRatio / windowWRPX,
                  // 图片原始宽度 rpx
                  imageW: res.width * pixelRatio,
                  imageH: res.height * pixelRatio
                })
              } else {
                that.setData({
                  cropperW: windowWRPX * innerAspectRadio,
                  cropperH: windowWRPX,
                  // 初始化left right
                  cropperL: Math.ceil((windowWRPX - windowWRPX * innerAspectRadio) / 2),
                  cropperT: Math.ceil((windowWRPX - windowWRPX) / 2),
                  // 裁剪框的宽高
                  // cutW: windowWRPX * innerAspectRadio - 66,
                  // cutH: 400,
                  cutL: Math.ceil((windowWRPX * innerAspectRadio - (windowWRPX * innerAspectRadio - 20)) / 2),
                  cutT: Math.ceil((windowWRPX - 340) / 2),
                  // 图片缩放值
                  scaleP: res.width * pixelRatio / windowWRPX,
                  // 图片原始宽度 rpx
                  imageW: res.width * pixelRatio,
                  imageH: res.height * pixelRatio
                })
              }
              that.setData({
                isShowImg: true
              })
              wx.hideLoading()
            }
          })
   
          // end
        }
      })
    },

  }
})