//index.js
const app = getApp()

Page({
  data: {
    endTime: '2020-05-13 00:00:00',//2018/11/22 10:40:30这种格式也行
    canShare:true
  },

  onLoad: function() {

    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
              console.info("用户信息为：" + JSON.stringify(res.userInfo, null, 2));
              app.globalData.nickName = res.userInfo.nickName
              app.globalData.avatarUrl = res.userInfo.avatarUrl
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                nickName: res.userInfo.nickName,
                canShare:false,
                canPhoto: false
              })
            }
          })
        }
      }
    })


    var that = this;
    that.countDown();
  },


  // 倒计时
  countDown: function () {
    var that = this;
    var nowTime = new Date().getTime();//现在时间（时间戳）
    var endTime = new Date(that.data.endTime).getTime();//结束时间（时间戳）
    var time = (endTime - nowTime) / 1000;//距离结束的毫秒数
    // 获取天、时、分、秒
    let day = parseInt(time / (60 * 60 * 24));
    let hou = parseInt(time % (60 * 60 * 24) / 3600);
    let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
    let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
    // console.log(day + "," + hou + "," + min + "," + sec)
    day = that.timeFormin(day),
      hou = that.timeFormin(hou),
      min = that.timeFormin(min),
      sec = that.timeFormin(sec)
    that.setData({
      day: that.timeFormat(day),
      hou: that.timeFormat(hou),
      min: that.timeFormat(min),
      sec: that.timeFormat(sec)
    })
    // 每1000ms刷新一次
    if (time > 0) {
      that.setData({
        countDown: true
      })
      setTimeout(this.countDown, 1000);
    } else {
      that.setData({
        countDown: true
      })
    }
  },
  //小于10的格式化函数（2变成02）
  timeFormat(param) {
    return param < 10 ? '0' + param : param;
  },
  //小于0的格式化函数（不会出现负数）
  timeFormin(param) {
    return param < 0 ? 0 : param;
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  onShareAppMessage: function (res) {
    return {
      title: app.globalData.nickName + '邀请您一起围观BTC减半倒计时',
      path: '/pages/home/index',//这里是被分享的人点击进来之后的页面
    }
  },

  bindGetUserInfo: function (res) {
    console.log(res.detail.userInfo);
    console.info("用户信息为：" + JSON.stringify(res, null, 2));
    app.globalData.nickName = res.detail.userInfo.nickName
    app.globalData.avatarUrl = res.detail.userInfo.avatarUrl
    this.setData({
      avatarUrl: res.avatarUrl,
      nickName: res.nickName,
      canShare: false,
      canPhoto: false
    })
  }

})
