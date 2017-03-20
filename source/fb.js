var Nightmare = require('nightmare');
var request = require('request');
const realMouse = require('nightmare-real-mouse');
realMouse(Nightmare);

module.exports = {
    login: function() {
        var nightmare = Nightmare({
            show: false
        })
        nightmare
            .goto('https://www.facebook.com/')
            .type('#email', 'luklukaha@gmail.com')
            .type('#pass', 'Cipc0pmimi')
            .screenshot('fblogin.png')
            .realClick('#loginbutton')
            .wait('div[data-click=profile_icon]')
            .end()
            .run(function(err) {
                console.log('success')
                if (err) console.log(err)
            })
    },    
    check: function() {
        var nightmare = Nightmare({
            show: true
        })
        nightmare
            .goto('https://www.facebook.com/')
            .screenshot('fb-check.png')
            .end()
            .then(function(err) {
                console.log('success')
              
            })
    },  
    likes:function(req,res){
      var nightmare = Nightmare({
          show: true
      })
      var profile = {}
      nightmare
          .goto('https://www.facebook.com/' + req.params.user+'/likes')
          .inject('js', 'jquery.js')
          .evaluate(function(){
            var mention = jQuery('div[role=main] div[data-reactroot]').first().text()+''
            mention = mention.replace(/\D/g, '')
            var likesweek = jQuery('div[role=main] div[data-reactroot] div:contains("Suka Baru")').first().text();
            var ar = likesweek.split('Suka Baru')
            likesweek = ar[0]
            return {
              mention : mention,
              likethisweek:likesweek
            }
          })
          .end()
          .then(function(data) {
            console.log(data)
            res.json(data)
          })
    },
    profile: function(req, res) {
        var nightmare = Nightmare({
            show: true
        })
        var self = this
        var htmlToText = require('html-to-text');
        var profile = {}
        nightmare
            .goto('https://www.facebook.com/' + req.params.user)
            .inject('js', 'jquery.js')
            .run(function(err) {
                console.log("collectPost")
                console.log(err)
                collectPost()
            })

        function postscroll(cb) {
            nightmare
                .evaluate(function() {
                    var items = document.querySelectorAll('.userContentWrapper').length
                    if (items < 150) {
                        var objDiv = document.querySelector('body')
                        var percent = (objDiv.scrollTop / objDiv.scrollHeight) * 100
                        if (percent < 95) {
                            objDiv.scrollTop = objDiv.scrollHeight;
                        }
                    }
                    return items
                })
                .then(function(tot) {
                    console.log("==>" + tot)
                    if (tot >= 5) {
                        console.log('DONE')
                        cb()
                    } else {
                        setTimeout(function() {
                            postscroll(cb)
                        }, 1000)
                    }
                })
        }

        function aboutProfile(cb) {
            nightmare
                .goto('https://www.facebook.com/' + req.params.user + '/about')
                .wait('[role=main]')
                .evaluate(function() {
                    return document.querySelector('[role=main]').innerHTML
                })
                .end()
                .then(function(data) {
                    var text = htmlToText.fromString(data, {
                        wordwrap: 130
                    });
                    profile.about = text
                    cb && cb()
                })
                .catch(function(error) {
                    console.error('err', error);
                });
        }

        function collectPost() {
            postscroll(function() {
                nightmare.evaluate(function() {
                        var items = {}
                        items.status = []
                        items.total_likes = 0
                        items.total_comments = 0
                        items.total_share = 0
                        items.total_videoviews = 0

                        jQuery('.userContentWrapper').each(function() {
                            var o = {}
                            o.text = jQuery(this).find('.userContent').text()
                            var image = jQuery(this).find('.userContent').next().find('.uiScaledImageContainer img').length
                            var video = jQuery(this).find('.userContent').next().find('video').length
                            if (image > 0) {
                                o.image = jQuery(this).find('.userContent').next().find('.uiScaledImageContainer img').attr('src')
                            }
                            if (video > 0) {
                                o.video = jQuery(this).find('.userContent').next().find('video').attr('src')
                                o.videoviews = (jQuery(this).find('.userContent').next().find('div.clearfix').last().text() + '').replace('Tayangan', '').trim()
                                o.videoviews = parseInt(o.videoviews.replace('.', ''))
                                items.total_videoviews = items.total_videoviews + o.videoviews
                            }
                            o.like = jQuery(this).find('.UFILikeSentence span').last().text() + ''
                            o.like = parseInt(o.like.replace('rb', '000').replace(',', '.').replace('.', ''))
                            items.total_likes = items.total_likes + o.like
                            console.log(jQuery(this).find('.UFIPagerLink').length)
                            if (jQuery(this).find('.UFIPagerLink').length > 0) {
                                console.log("blabla")
                                console.log((jQuery(this).find('.UFIPagerLink').text() + ''))
                                console.log((jQuery(this).find('.UFIPagerLink').text() + '').replace(/\D/g, ''))
                                o.comment = parseInt((jQuery(this).find('.UFIPagerLink').text() + '').replace(/\D/g, ''))
                                items.total_comments = items.total_comments + o.comment
                            } else
                            if (jQuery(this).find('.UFIPagerCount').length > 0) {
                                o.comment = parseInt(((jQuery(this).find('.UFIPagerCount').text() + '').split('dari')[1] + '').replace('.', ''))
                                items.total_comments = items.total_comments + o.comment
                            } else {
                                o.comment = jQuery(this).find('.UFICommentContent').length
                                items.total_comments = items.total_comments + o.comment
                            }
                            if (jQuery(this).find('.UFIShareLink').length > 0) {
                                o.share = parseInt((jQuery(this).find('.UFIShareLink').text() + '').replace(/\D/g, ''))
                                items.total_share = items.total_share + o.share
                            }
                            items.status.push(o)
                        })
                        return items
                    })                    
                    .then(function(data) {
                        
                        self.profileUser(req,res,data)
                    })
                    .catch(function(error) {
                        console.error('err', error);
                    });
            })
        }



    },
    profileUser: function(req, res,data) {
        var nightmare = Nightmare({
            show: true
        })
        var profile = {}
        profile.posts = data
        profile.about = {}
        profile.username = req.params.user


        function aboutEducation(cb) {
            nightmare
                .goto('https://www.facebook.com/' + req.params.user + '/about?section=education&pnref=about')
                .wait('#pagelet_edit_eduwork')
                .evaluate(function() {
                    var jobs = []
                    var arr = document.querySelectorAll('[data-pnref=work] li.experience');
                    for (var i = 0; i < arr.length; i++) {
                        var ele = arr[i]
                        var job = ele.innerText.split('\n')
                        var title = job[2].split(' · ')
                        title = title[0]
                        job = job[1]
                        jobs.push(title + ' at ' + job)
                    }
                    var edus = []
                    var arr = document.querySelectorAll('[data-pnref=edu] li.experience');
                    for (var i = 0; i < arr.length; i++) {
                        var ele = arr[i]
                        var job = ele.innerText.split('\n')
                        var title = job[2]
                        job = job[1]
                        edus.push(title + ' at ' + job)
                    }

                    return {
                        job: jobs,
                        edu: edus
                    }
                })                
                .then(function(data) {
                    profile.about.eduAndJob = data
                    console.log('edu', data)
                    cb && cb()
                })
        }

        function aboutLiving(cb) {
            nightmare
                .goto('https://www.facebook.com/' + req.params.user + '/about?section=living&pnref=about')
                .wait('#pagelet_hometown')
                .evaluate(function() {
                    var living = {}
                    living.current_city = document.querySelector('#current_city a').innerText
                    arr = document.querySelectorAll('[data-pnref=about] ul a[data-hovercard]')
                    living.city = []
                    for (var i = 0; i < arr.length; i++) {
                        living.city.push(arr[i].innerText)
                    }
                    return living
                })
                .then(function(data) {
                    profile.about.living = data
                    console.log('living', data)
                    cb && cb()
                })
        }

        function aboutContact(cb) {
            nightmare
                .goto('https://www.facebook.com/' + req.params.user + '/about?section=contact-info&pnref=about')
                .wait('#pagelet_contact')
                .screenshot('test.png')
                .evaluate(function() {
                    var info = {}
                    var a = document.querySelectorAll('ul.fbProfileEditExperiences')
                    for (var i = 0; i < a.length; i++) {
                        var b = a[i].querySelectorAll('li')
                        for (var n = 0; n < b.length; n++) {
                            var row = b[n].querySelectorAll('.clearfix div')
                            if (row.length > 0)
                                info[row[1].innerText.trim().replace(' ', '_')] = row[0].innerText.replace(row[1].innerText, '').replace('\n', '').replace('\n', '')
                        }
                    }
                    return info
                })
                .end()
                .then(function(data) {
                    profile.about.contact = data
                    console.log('contact', data)
                    cb && cb()
                })
        }
        aboutEducation(function() {
            aboutLiving(function() {
                aboutContact(function() {
                    console.log(profile)
                    res.json(profile)
                })
            })
        })
    }
}
