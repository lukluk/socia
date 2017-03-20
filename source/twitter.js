var Twit = require("twit")
var request = require("request")
var cheerio = require('cheerio')

var T = new Twit({
    consumer_key: '86xj1gvU9z508IZt1iIA',
    consumer_secret: 'G1VZxlTnU6un2z69TogOfjn57rtOReBEUhyGN1Q',
    access_token: '47299432-9nWe0EbW4x536VeO8opdASMiWPaKwG2CHEkUZMDgI',
    access_token_secret: 'dr8aNNEl3nb3SlClEr8DJ6DBAE9qjre2Zi0DkuqgpFIRX',
    timeout_ms: 60 * 1000,
})
module.exports = {
    profile: function(req, res) {
        T.get('users/show', {
            screen_name: req.params.user
        }, function(err, data, response) {
            if (err) {
                res.json({
                    error: true
                })
                return false
            }
            var profile = {}
                //console.log(data)
            request('https://twitter.com/' + req.params.user, function(rerr, resp, page) {
                if (rerr) {
                    res.json({
                        error: true
                    })
                    return false
                }
                var $ = cheerio.load(page)
                profile.birthday = $('.ProfileHeaderCard-birthdate .js-tooltip').text()
                profile.birthday = (profile.birthday + '').replace('Lahir', '').trim()
                profile.birthday = (profile.birthday + '').replace('Born on ', '').trim()
                profile.lists = $('.ProfileNav-item--lists .ProfileNav-value').text()
                profile.tweets = $('.ProfileNav-item--tweets .ProfileNav-value').text()
                profile.likes = $('.ProfileNav-item--favorites .ProfileNav-value').text()
                profile.status = data.description
                profile.location = data.location
                var o = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/g
                var ex = o.exec(data.description)
                if (ex)
                    profile.link = ex[0]
                profile.followers = data.followers_count
                profile.following = data.friends_count
                profile.retweet_count = 0
                T.get('users/show', {
                    screen_name: req.params.user,
                    count: 150,
                    include_rts: false
                }, function(err, data, response) {
                    if (err) {
                        res.json({
                            error: true
                        })
                        return false
                    }
                    var items = []
                    for (var n in data) {
                        var o = {}
                        o.text = data[n].text
                        o.created_at = data[n].created_at
                        o.retweet_count = data[n].retweet_count
                        profile.retweet_count = profile.retweet_count + parseInt(o.retweet_count)
                        items.push(o)
                    }
                    profile.tweet = items
                    res.json(profile)
                })

            })
        })
    },
    following: function(req, res) {
        T.get('friends/list', {
            screen_name: req.params.user,
            count: 100,
            skip_status: true,
            include_user_entities: false
        }, function(err, data, response) {
            var followers = []
            for (var i in data.users) {
                followers.push(data.users[i].name)
            }
            res.json(followers)
        })
    },
    followers: function(req, res) {
        T.get('followers/list', {
            screen_name: req.params.user,
            count: 100,
            skip_status: true,
            include_user_entities: false
        }, function(err, data, response) {
            var followers = []
            for (var i in data.users) {
                followers.push(data.users[i].name)
            }
            res.json(followers)
        })
    }
}
