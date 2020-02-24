
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function request(method, url, data) {
  const that = this
  const app = getApp()
  return new Promise(function(resolve, reject) {
    wx.request({
      url: getApp().globalData.svr_url + url,
      method: method,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      data: data,
      success: function(res) {
        if (res.data.err_code == 0) {
          resolve(res.data)
          if (url != 'get_token.php'){
            app.globalData.num = 0
          }
        }
        //限制次数大于1，就禁止
        else if (app.globalData.num < 2 && res.data.err_code == 10003 || app.globalData.num < 2 && app.globalData.num < 2 && res.data.err_code == 10004 || app.globalData.num < 2 && res.data.err_code == 10011) {
          console.log(app.globalData.num)
          app.globalData.num = app.globalData.num + 1 //限制次数增加
          app.get_token().then((res) => {
              data.token = res.token
              request(method, url, data).then((res) => {
                if (res.err_code == 0) {
                  resolve(res)
                } else {
                  resolve(res)
                  // getApp().showSvrErrModal(res)
                }
              })
            });
        } else if (app.globalData.num >= 2) {
          resolve(res)
        } else {
          resolve(res)
          if (res.data.err_code != 10001)
            app.showSvrErrModal(res)
        }
      },
      fail: function(err) {

        app.showErrModal("请求超时，请检查您的网络！")
          .then(() => {
           
            request(method, url, data).then((res) => {
              if (res.err_code == 0) {
                resolve(res)
              } else {
                resolve(res)
              }
            })
          })
      }
    })
  })
}

function uploadFile(method, url, filePath, name, formData) {
  const that = this
  return new Promise(function(resolve, reject) {
    const uploadTask = wx.uploadFile({
      url: getApp().globalData.svr_url + url,
      method: method,
      filePath: filePath,
      name: name,
      formData: formData,
      success: function(res) {
        var res = JSON.parse(res.data)

        if (res.err_code == 0) {
          resolve(res)
          if (url != 'get_token.php') 
            getApp().globalData.num = 0
          
        } else if (res.err_code == 10001 && getApp().globalData.num < 2 || res.err_code == 10003 && getApp().globalData.num < 2) {
          getApp().globalData.num++ //限制次数增加

            getApp().get_token().then((res) => {
              formData.token = res.token
              uploadFile(method, url, filePath, name, formData).then((res) => {
                if (res.err_code == 0) {
                  resolve(res)
                } else {
                  resolve(res)
                }
              });
            });
        } else {
          getApp().showErrModal(res.err_msg || '上传失败，请重新上传');
          resolve('err')
        }
      },
      fail: function(res) {
        resolve('err')
        getApp().showErrModal('上传失败，请重新上传');
      }
    })

  })
}
//时间戳转年月日 时钟分钟秒数
function getLocalTime(nS) {
  return new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
} 
// 几个小时前的提示字样
function transformPHPTimeArr(time) {
  var now = new Date()

  var timestamp = now.getFullYear() * 365 + (now.getMonth() + 1) * 30 + now.getDate()  //当前时间戳
  var times = new Date(time * 1000)
  var timestime = times.getFullYear() * 365 + (times.getMonth() + 1) * 30 + times.getDate()
  var disparity = timestamp - timestime

  if (disparity == 0) {
    //今天
    return { date: '今天', year: times.getFullYear() }
  }
  // getMonth()
  if (disparity < 7) {
    if (disparity == 1)
      // return '昨天'
      return { date: '昨天', year: times.getFullYear() }
    if (disparity == 2)
      return { date: '前天', year: times.getFullYear() }
    return { date: disparity + '天前', year: times.getFullYear() }
  } else {
    return { month: times.getMonth() + 1 + '月', date: times.getDate(), year: times.getFullYear() }
  }
}

// 几个小时前的提示字样
function transformPHPTimes(time) {
  var timestamp = Date.parse(new Date()); //当前时间戳
  var timestime = time * 1000
  var disparity = timestamp - timestime
  if (disparity < 3600000) {
    if (parseInt(disparity / 60000) == 0)
      return '刚刚'
    return parseInt(disparity / 60000) + '分钟前'
  }
  if (disparity < 86400000) {
    return parseInt(disparity / 3600000) + '小时前'
  }
  if (disparity < 86400000 * 8 && disparity > 86400000 * 1) {
    if (parseInt(disparity / 86400000) == 1)
      return '昨天'
    if (parseInt(disparity / 86400000) == 2)
      return '前天'
    return parseInt(disparity / 86400000) + '天前'
  }
  return '一周前'
}


// 去除空格
function myTrim(x) {
  return x.replace(/^(\s*)|(\s*)$/g, '');
}


//添加某个class
function addClass(el, className) {
  if (hasClass(el, className)) {
    return
  }
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

//判断是否有某个class
function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

//数组中是否存在某个元素
function contains(arr, obj) {
  let i = arr.length;
  while (i--) {
    if (arr[i] === obj) {
      return i + 1;
    }
  }
  return false;
}
// JS中时间戳转日期格式（YYYY - MM - dd HH: mm: ss）
function uTS(unixtimestamp) {
  var unixtimestamp = new Date(unixtimestamp * 1000);
  var year = 1900 + unixtimestamp.getYear();
  var month = "0" + (unixtimestamp.getMonth() + 1);
  var date = "0" + unixtimestamp.getDate();
  return year + "-" + month.substring(month.length - 2, month.length) + "-" + date.substring(date.length - 2, date.length)
}

/// 几个小时前的提示字样
function transformPHPTime(time) {
  var timestamp = Date.parse(new Date()); //当前时间戳
  var timestime = time * 1000
  var disparity = timestamp - timestime
  if (disparity < 3600000) {
    if (parseInt(disparity / 60000) == 0)
      return '刚刚'
    return parseInt(disparity / 60000) + '分钟前'
  }
  if (disparity < 86400000) {
    return parseInt(disparity / 3600000) + '小时前'
  }
  if (disparity < 86400000 * 8 && disparity > 86400000 * 1) {
    if (parseInt(disparity / 86400000) == 1)
      return '昨天'
    if (parseInt(disparity / 86400000) == 2)
      return '前天'
    return parseInt(disparity / 86400000) + '天前'
  }
  var date = new Date(timestime)
  let Y = date.getFullYear() + '-';
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  let D = date.getDate() + ' ';
  return Y + M + D
}

// 图片适配（aspectFill）
function aspectFill(imageSize, w, h) {
  // console.log(imageSize, w, h)
  if (imageSize.width < w) {
    if (imageSize.height < h) {
      var scale1 = imageSize.height / imageSize.width;
      var scale2 = h / imageSize.height;
      if (scale1 > scale2) {
        imageSize.height = imageSize.height / imageSize.width * w;
        imageSize.width = w
      } else {
        imageSize.width = imageSize.width / imageSize.height * h;
        imageSize.height = h
      }
    } else {
      imageSize.height = imageSize.height / imageSize.width * w;
      imageSize.width = w
    }
  }
  else if (imageSize.height < h) {
    if (imageSize.width < w) {
      var scale1 = imageSize.height / imageSize.width;
      var scale2 = h / imageSize.height;
      if (scale1 > scale2) {
        imageSize.height = imageSize.height / imageSize.width * w;
        imageSize.width = w
      } else {
        imageSize.width = imageSize.width / imageSize.height * h;
        imageSize.height = h
      }
    } else {
      imageSize.width = imageSize.width / imageSize.height * h;
      imageSize.height = h
    }
  }
  else {
    var scale1 = imageSize.height / imageSize.width;
    var scale2 = h / imageSize.height;
      imageSize.height = imageSize.height / imageSize.width * w;
      imageSize.width = w
  }
  // console.log('改变imageSize', imageSize.width, imageSize.height)
  return imageSize;
}

// JS中时间戳转日期格式（YYYY - MM - dd HH: mm: ss）
function uTS(unixtimestamp) {
  var unixtimestamp = new Date(unixtimestamp * 1000);
  var year = 1900 + unixtimestamp.getYear();
  var month = "0" + (unixtimestamp.getMonth() + 1);
  var date = "0" + unixtimestamp.getDate();
  return year + "-" + month.substring(month.length - 2, month.length) + "-" + date.substring(date.length - 2, date.length)
}
function tow(n) {
  return n >= 0 && n < 10 ? '0' + n : '' + n;
}
// 倒计时
function countDown(time) {
  var oDate = new Date();//获取日期对象
  var oldTime = oDate.getTime();//现在距离1970年的毫秒数
  var newDate = new Date(time * 1000)
  var newTime = newDate.getTime();//截止距离1970年的毫秒数
  if (oldTime >= newTime)
    return ''
  var second = Math.floor((newTime - oldTime) / 1000);
  //未来时间距离现在的秒数
  var hour = Math.floor(second / 3600);
  //整数部分代表小时；
  second %= 3600; //余数代表 剩下的秒数；
  var minute = Math.floor(second / 60);
  second %= 60;
  var str = tow(hour) + ':'
    + tow(minute) + ':'
    + tow(second) + '';
  // console.log(str)
  return str
}

//获取当前月份和之前的月份
//过去一年的时间
function getMonth() {
  var date = new Date();
  var nowDate = new Date();
  let nowMonth = date.getMonth()
  let nowYear = date.getFullYear()
  console.log(nowMonth)
  let arrDate = []
  for (let i = 0; i < 12; i++) {

    date.setMonth(nowMonth - i >= 0 ? nowMonth - i : (nowMonth - i + 12))
    if (nowMonth - i < 0) {
      date.setYear(nowYear - 1)
    }
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    arrDate.push(year + '' + month)
  }
  return arrDate
}

module.exports = {
  formatTime,
  request,
  addClass,
  hasClass,
  myTrim,
  uploadFile,
  contains,
  uTS,
  transformPHPTime,
  aspectFill,
  countDown, //倒计时
  transformPHPTimes,
  transformPHPTimeArr,
  getLocalTime,
  getMonth //过去一年的月份
}