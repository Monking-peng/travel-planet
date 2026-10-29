App({
  globalData:{cloudReady:false,music:null,musicPlaying:false},
  onLaunch(){if(wx.cloud){wx.cloud.init({traceUser:false});this.globalData.cloudReady=true;}},
  toggleMusic(){let audio=this.globalData.music;if(!audio){audio=wx.createInnerAudioContext();audio.src='/assets/lakeside.mp3';audio.loop=true;audio.volume=.28;audio.obeyMuteSwitch=true;audio.onError(()=>{this.globalData.musicPlaying=false;wx.showToast({title:'配乐暂时无法播放',icon:'none'});});this.globalData.music=audio;}
    if(this.globalData.musicPlaying){audio.pause();this.globalData.musicPlaying=false;}else{audio.play();this.globalData.musicPlaying=true;}return this.globalData.musicPlaying;
  },
  onHide(){if(this.globalData.music){this.globalData.music.pause();this.globalData.musicPlaying=false;}}
});
