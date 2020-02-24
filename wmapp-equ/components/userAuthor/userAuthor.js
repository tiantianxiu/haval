const app = getApp()
import {
  request
} from '../../utils/util.js'
Component({
  properties: {
    avatar: { //头像
      type: String,
      value: '',
    },
    big_avatar: { //大头像
      type: String,
      value: '',
    },
    zan_operate: { //点赞、点踩
      type: Boolean,
      value: false
    },
    tid: {
      type: Number,
      value: 0
    },
    pid: {
      type: Number,
      value: 0
    },
    zan: {
      type: Number,
      value: 0
    },
    cai: {
      type: Number,
      value: 0
    },
    is_zan: {
      type: Number,
      value: 0
    },
    cate: {
      type: String,
      value: '',
    },
    author: { //作者
      type: String,
      value: 'E派的持币待购',
    },
    is_follow: {
      type: Number,
      value: 0,
    },
    follow: {
      type: Boolean,
      value: false
    },
    friend_follow: {
      type: Boolean,
      value: false
    },
    price: {
      type: String,
      value: ''
    },
    question_price: {
      type: String,
      value: ''
    },
    is_vip: {
      type: Number,
      value: 0
    },
    friend_type: {
      type: Number,
      value: 0
    },
    is_self: {
      type: Number,
      value: 0
    },
    third_point: {
      type: Boolean,
      value: false
    },
    index: {
      type: Number,
      value: 0
    },
    is_carvip: {
      type: Number,
      value: 0,
    },
    uid: {
      type: Number,
      value: 0,
    },
    index: {
      type: Number,
      value: 0
    },
    level: {
      type: String,
      value: '',
    },
    diaMessage: {
      type: String,
      value: '',
    },
    position: {
      type: String,
      value: 'index',
    },
    extcredits2: {
      type: String,
      value: '0'
    },
    time: {
      type: String,
      value: ''
    },
    no_cover: {
      type: Boolean,
      value: false
    },
    friend: {
      type: Boolean,
      value: false
    },
    is_top: { //置顶
      type: Boolean,
      value: false
    },
    isPostZan: {
      type: Boolean,
      value: false
    },
    hidden: {
      type: Number,
      value: 0
    },
    questTime: {
      type: String,
      value: ''
    }

  },
  data: {

  },

  methods: {

    toUserDetail(e) {
      const that = this;
      app.isShowAuthorization().then(res=>{
        if(res == 2){
          app.toUserDetail(e)
        }else if(res == 1){
          that.showAuthorization();
        }
      })
    },
    
    showAuthorization: function(){
      this.setData({
        showAuthorization: true
      })
    },
    // 关注与取消关注
    followBtn: function(e) {
      const that = this

      app.isShowAuthorization().then((res) => {
        if (res == 2){
        let followStatus = that.data.is_follow //0未关注 1已关注 2互相关注
        let friendType = that.data.friend_type
        let el = {
          followuid: e.currentTarget.dataset.uid
        }
        app.followBtn(el).then((r) => {

          that.setData({
            is_follow: followStatus == 0 ? friendType == 2 ? 2 : 1 : 0
          })
        
        })
        }else if (res == 1){
          that.showAuthorization();
        }
      })
    },
    operationTap(e) {
      app.isShowAuthorization().then(res=>{
        if(res == 2){
          this.triggerEvent('operationTap', e)
        }else if(res == 1){
          this.showAuthorization();
        }
      })
       //myevent自定义名称事件，父组件中使用
    },
    // 点赞文章
    toZan: function(e) {
      const that = this
      const type = e.currentTarget.dataset.type //1赞 2踩
      let zan = that.data.zan * 1
      let cai = that.data.cai * 1
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
            that.setData({
              is_zan: type == is_zan ? 0 : type,
              zan: is_zan == 1 ? zan - 1 : type == 1 ? zan + 1 : zan,
              cai: is_zan == 2 ? cai - 1 : type == 2 ? cai + 1 : cai
            })
          })
        }else if(res == 1){
          that.showAuthorization();
        }
      })
    },
    // 评论点赞
    clickZan: function(e) {
      const that = this
      const type = e.currentTarget.dataset.type //1赞 2踩
      const is_zan = that.data.is_zan
      const pid = that.data.pid
      const zan = that.data.zan
      const cai = that.data.cai
      const index = e.currentTarget.dataset.index
      const cate = e.currentTarget.dataset.cate
      app.isShowAuthorization().then((res) => {
        if (res == 2) {
          request('post', 'add_zan_post.php', {
            token: wx.getStorageSync("token"),
            tid: that.data.tid,
            type: type,
            pid: pid
          }).then((res) => {
            if (res.err_code != 0)
              return
            let zan_data = is_zan == 1 ? zan - 1 : type == 1 ? zan + 1 : zan
            let cai_data = is_zan == 2 ? cai - 1 : type == 2 ? cai + 1 : cai
            let is_zan_data = type == is_zan ? 0 : type
            that.setData({
              zan: zan_data,
              cai: cai_data,
              is_zan: is_zan_data
            })
            let clickZanData = {
              zan: zan_data,
              cai: cai_data,
              is_zan: is_zan_data,
              index: index,
              cate: cate
            }
            that.triggerEvent('clickZan', clickZanData)
          })
        }else if(res == 1){
          that.showAuthorization();
        }
      })
    },


  }

})