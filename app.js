    var express = require('express');
var app = express();
var instagram = require('./source/instagram')
var twitter = require('./source/twitter')
var fb = require('./source/fb')
var youtube = require('./source/youtube')
var ld = require('./source/linkedin')
var rollbar = require("rollbar");
app.use(rollbar.errorHandler('a01722f1c5b442c6bae53030cde6ebaa'));
function setup(){
  fb.login()
  // fb.login()
  // ld.login()
}

function server() {
    app.get('/instagram/followers/:user', function(req, res) {
        instagram.GetFollow(req, res, 'followers')
    })
    app.get('/instagram/following/:user', function(req, res) {
        instagram.GetFollow(req, res, 'following')
    })
    app.get('/instagram/profile/:user', function(req, res) {
        instagram.profile(req,res)
    })
    app.get('/twitter/followers/:user', function(req, res) {
        twitter.followers(req,res)
    })
    app.get('/twitter/following/:user', function(req, res) {
        twitter.following(req,res)
    })
    app.get('/twitter/profile/:user', function(req, res) {
        twitter.profile(req,res)
    })
    app.get('/facebook/likes/:user', function(req, res) {
        fb.likes(req,res)
    })
    app.get('/facebook/profile/:user', function(req, res) {
        fb.profile(req,res)
    })
    app.get('/youtube/profile/:user', function(req, res) {
        youtube.profile(req,res)
    })
    app.get('/youtube/about/:user', function(req, res) {
        youtube.about(req,res)
    })
    app.get('/youtube/videos/:user', function(req, res) {
        youtube.videos(req,res)
    })
    app.get('/linkedin/profile/:user', function(req, res) {
        ld.profile(req,res)
    })
    app.listen(3000)
}
if (process.argv[2] == 'check') {
    if(process.argv[3]=='fb'){
        fb.check()
    }else
    if(process.argv[3]=='linkedin'){
        ld.check()
    }
}else
if (process.argv[2] == 'setup') {
    setup()
} else {
    server()
}
