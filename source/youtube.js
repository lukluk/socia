var Nightmare = require('nightmare');
var request = require('request');
const realMouse = require('nightmare-real-mouse');
realMouse(Nightmare);

module.exports = {
  profile:function(req,res){
    nightmare
        .goto('https://www.youtube.com/user/' + req.params.user)
        .inject('js', 'jquery.js')
        .evaluate(function(){
          var o ={}
          o.channelName=jQuery('.qualified-channel-title-text').text()
          o.subscriber = jQuery('.yt-subscription-button-subscriber-count-branded-horizontal').first().text().replace(',','')
          return o
        })
        .end()
        .then(function(data){
           data.username = req.params.user
           res.send(data)
        })
  },
  about:function(req,res){
    nightmare
    .goto('https://www.youtube.com/user/' + req.params.user+'/about')
    .inject('js', 'jquery.js')
    .evaluate(function(){
      var data = {}
      data.desc = jQuery('.about-description').text()
      data.links =[]
      jQuery('.about-custom-links li').each(function(){
        var o = {}
        o.link = jQuery(this).find('a').attr('href')
        o.title = jQuery(this).find('a').attr('title')
      })
      return data
    })
    .end()
    .then(function(data){
      res.json(data)
    })
  },
  videos: function(req,res){
    var done = false
    function collect(){
      nightmare
      .evaluate(function() {
        return {btn : jQuery('.load-more-button').length,items:jQuery('.yt-lockup-video').length}
      })
      .then(function(data){
        if(data.items>150){
          done()
        }else
        if(data.btn>0){
          nightmare.realClick('.load-more-button').wait(1000).then(function(){
            collect()
          })
        }else{
          done()
        }
      })
    }
    nightmare
    .goto('https://www.youtube.com/user/' + req.params.user+'/videos')
    .inject('js', 'jquery.js')
    .wait('.yt-lockup-video')
    .then(function(){

      done = function(){
          nightmare.evaluate(function(){
            var items=[]
            jQuery('.yt-lockup-video').each(function(){
              var o = {}
              o.videoid = jQuery(this).attr('data-context-item-id')
              o.views = (jQuery(this).find('.yt-lockup-meta-info').first().text()+'').replace(',','')
              o.title = jQuery(this).find('.yt-lockup-title a').attr('title')
              items.push(o)
            })
            return items
          })
          .end()
          .then(function(items){
            res.json(items)
          })
      }
      collect()

    })
  }
}
