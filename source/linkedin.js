var Nightmare = require('nightmare');
var request = require('request');
const realMouse = require('nightmare-real-mouse');
realMouse(Nightmare);
var fs = require('fs')
var striptags = require('striptags');
var nightmare = Nightmare({ show: false });

module.exports = {
    login: function() {
        var nightmare = Nightmare({
            show: true
        })
        nightmare
            .goto('https://www.linkedin.com/uas/login')
            .type('#session_key-login', 'luklukaha@gmail.com')
            .type('#session_password-login', 'Cipc0pmimip')
            .realClick('#btn-primary')
            .wait('.account-toggle')
            .end()
            .run(function(err) {
                console.log('success')
                if (err) console.log(err)
            })
    },
    profile :function(req,res){
    nightmare
      .goto('https://www.linkedin.com/in/'+req.params.user)  
      .evaluate(function () {  
        // now we're executing inside the browser scope.
        return document.querySelector('html').innerHTML;
       })    
      .end()
      .then(function (result) {
        function findBracket(str,key){
          var res = []
        var a = str.indexOf(key)
          while(a>-1){
          
            var a1=a
            var a2=a
            var br = ''
            while(br != '{'){       
              br = str[a1]
              a1--
            }
            var br = ''
            while(br != '}'){       
              br = str[a2]
              a2++
            }     
            var found = str.substring(a1+1,a2)  
            res.push(found)
            str= str.replace(found,'')
            a = str.indexOf(key)
            console.log('a',a)
          }
          return res
        }
        function findStringBetween(str, first, last) {
          var r = new RegExp(first + '(.*?)' + last, 'gm');
          return str.match(r);
      }
      fs.writeFileSync('log.txt',result,'utf-8')

      var obj = findBracket(result,'"companyName":')
      console.log(obj)
      
      var pic = findStringBetween(result,'"croppedImage":"','"')
      if(typeof pic !== 'string'){
        console.log(pic)
        if(pic)
        pic = pic[0]
        if(!pic){
          pic=''
        }
      }
      pic = 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/'+pic.substring(17,pic.length-1)
      console.log(pic)
      
      var now = findStringBetween(result,'<h2 class="pv-top-card-section__headline','</h2>')
      if(typeof now !== 'string'){
        if(now)
        now = now[0]
      }
      now = striptags(now)
      var name = findStringBetween(result,'<h1 class="pv-top-card-section__name','</h1>')
      if(typeof now !== 'string'){
        if(now)
        now = now[0]
      }
      name = striptags(name)
      

      var resp = []
      if(obj){
        for(var i=0;i<obj.length;i++){
          var o = JSON.parse(obj[i])
          console.log('item',o) 
          var periodid=o.timePeriod.split(',')[1].replace(/\D/g,'');
          console.log('periodid',periodid)
          var period = ''   
          if(periodid>0){     
            var p = result.indexOf(periodid+'),timePeriod,endDate')
            var timeend = false
            if(p>0){
            p = p - 125     
            timeend = result.substring(p,p+125)
            
            p = timeend.indexOf('"$type')
            timeend = timeend.substring(0,p-1)      
            timeend = '{'+timeend+'}'
            timeend = timeend.replace('{,','{')
            console.log('SJON',timeend)
            timeend = JSON.parse(timeend)
            }
            var timestart = false
            var p = result.indexOf(periodid+'),timePeriod,startDate')
            if(p>0){
            p = p - 125     
            timestart = result.substring(p,p+125)
            console.log('DEBUG',timestart)
            p = timestart.indexOf('"$type')
            timestart = timestart.substring(0,p-1)
            console.log('DEBUG',timestart)
            timestart = '{'+timestart+'}'
            timestart = timestart.replace('{,','{')
            console.log('JSON',timestart)
            timestart = JSON.parse(timestart)
            console.log('timestart',timestart)
            }
              
          }          
          var ob = {}
          ob.title = o.title
          ob.company = o.companyName
          ob.timePeriod = {timestart,timeend};   
          ob.description = o.description          
          resp.push(ob)
        }
      }
      var RES={
        name:name,
        current:now,
        pic:pic,        
        experience:resp
        
      }
      res.json(RES)
      })
      .catch(function (error) {
        console.error('Search failed:', error);
        res.sendjson({error:true,message:error})
      });
    }

  }
