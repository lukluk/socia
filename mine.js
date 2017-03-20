var media = {}
media['0'] = _sharedData.entry_data.ProfilePage[0].user.media.nodes
jQuery('body').append('<mediax style="display:none">{}</mediax>')
jQuery('mediax').html(JSON.stringify(media))
  function replaceXHR(){
      (function(window,debug){

          function args(a){
              var s = "";
              for(var i = 0; i < a.length; i++) {
                  s += "\t\n[" + i + "] => " + a[i];
              }
              return s;
          }
          var _XMLHttpRequest = window.XMLHttpRequest;

          window.XMLHttpRequest = function() {
              this.xhr = new _XMLHttpRequest();
          }

          // proxy ALL methods/properties
          var methods = [
              "open",
              "abort",
              "setRequestHeader",
              "send",
              "addEventListener",
              "removeEventListener",
              "getResponseHeader",
              "getAllResponseHeaders",
              "dispatchEvent",
              "overrideMimeType"
          ];
          methods.forEach(function(method){
              window.XMLHttpRequest.prototype[method] = function() {
                  if (debug) console.log("ARGUMENTS", method, args(arguments));
                  if (method == "open") {
                      this._url = arguments[1];
                  }
                  return this.xhr[method].apply(this.xhr, arguments);
              }
          });

          // proxy change event handler
          Object.defineProperty(window.XMLHttpRequest.prototype, "onreadystatechange", {
              get: function(){
                  // this will probably never called
                  console.log('get')
                  return this.xhr.onreadystatechange;
              },
              set: function(onreadystatechange){
                console.log('set')
                  var that = this.xhr;
                  var realThis = this;
                  that.onreadystatechange = function(){
                      // request is fully loaded
                      if (that.readyState == 4) {
                          if (debug) console.log("RESPONSE RECEIVED:", typeof that.responseText == "string" ? that.responseText.length : "none");
                          // there is a response and filter execution based on url
                          if (that.responseText && realThis._url.indexOf("whatever") != -1) {
                              window.myAwesomeResponse = that.responseText;
                          }
                      }
                      onreadystatechange.call(that);
                  };
              }
          });

          var otherscalars = [
              "onabort",
              "onerror",
              "onload",
              "onloadstart",
              "onloadend",
              "onprogress",
              "readyState",
              "responseText",
              "responseType",
              "responseXML",
              "status",
              "statusText",
              "upload",
              "withCredentials",
              "DONE",
              "UNSENT",
              "HEADERS_RECEIVED",
              "LOADING",
              "OPENED"
          ];
          otherscalars.forEach(function(scalar){
              Object.defineProperty(window.XMLHttpRequest.prototype, scalar, {
                  get: function(){
                      if(this.xhr.responseText)
                      {
                        var o = JSON.parse(this.xhr.responseText)
                        if(o && o.media.page_info)
                        media[o.media.page_info.start_cursor]=o.media.nodes
                        jQuery('mediax').html(JSON.stringify(media))
                      }
                      return this.xhr[scalar];
                  },
                  set: function(obj){

                      this.xhr[scalar] = obj;
                  }
              });
          });
      })(window,false);
  }
  replaceXHR()
