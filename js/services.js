angular.module('app.services', [])

.service('userAPI', function ($rootScope, $q) {
   var userAPI = {
      getUser: function (id, token) {
         var deferred = $q.defer(),
            data = {id: id, token: token};
         var hash = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(JSON.stringify(data), $rootScope.credentials.user.secret));

         $.ajax({
            type: "POST",
            url: $rootScope.servers.user + '/api/v1/user',
            dataType: 'json',
            data: data,
            headers: {
               'Ow-Auth-Id': $rootScope.credentials.user.id,
               'Ow-Auth-Hash': hash
            },
            success: function (data, textStatus, jqXHR) {
               deferred.resolve(data);
            },
            error: function () {
               deferred.reject();
            }
         });

         return deferred.promise;
      },

      getUserBasic: function (user) {

         var deferred = $q.defer();

         $.ajax({
            type: "GET",
            url: $rootScope.servers.user + '/api/v1/user/' + user,
            success: function (data, textStatus, jqXHR) {
               deferred.resolve(data);
            },
            error: function () {
               deferred.reject();
            }
         });

         return deferred.promise;
      }
   };
   return userAPI;
})

.service('quizAPI', function ($rootScope, $q) {
   var quizAPI = {
      getQuiz: function () {
         var deferred = $q.defer(),
            code = $rootScope.credentials.self.code;

         $.ajax({
            type: "GET",
            url: $rootScope.servers.self + '/api/v1/quiz',
            headers: {
               'Ow-Auth-Code': code
            },
            success: function (data, textStatus, jqXHR) {
               deferred.resolve(data);
            },
            error: function () {
               deferred.reject();
            }
         });

         return deferred.promise;
      },

      addChoice: function () {
         var deferred = $q.defer(),
            code = $rootScope.credentials.self.code;
         var data = $rootScope.choice;
         data.user = $rootScope.user.id;
         data.quiz = $rootScope.quiz._id;

         $.ajax({
            type: "POST",
            url: $rootScope.servers.self + '/api/v1/choice',
            dataType: 'json',
            data: data,
            headers: {
               'Ow-Auth-Code': code
            },
            success: function (data, textStatus, jqXHR) {
               deferred.resolve(data);
            },
            error: function () {
               deferred.reject();
            }
         });

         return deferred.promise;
      },

      getHistory: function () {
         var deferred = $q.defer(),
            code = $rootScope.credentials.self.code;
         var user = null;

         if($rootScope.user) {
            user = $rootScope.user.id;
         }

         if(user) {

            $.ajax({
               type: "GET",
               url: $rootScope.servers.self + '/api/v1/history/' + user,
               headers: {
                  'Ow-Auth-Code': code
               },
               success: function (data, textStatus, jqXHR) {
                  deferred.resolve(data);
               },
               error: function () {
                  deferred.reject();
               }
            });
         } else {
            deferred.reject();
         }

         return deferred.promise;
      },


      chartDay: function () {
         var deferred = $q.defer(),
            code = $rootScope.credentials.self.code;

         $.ajax({
            type: "GET",
            url: $rootScope.servers.self + '/api/v1/day',
            headers: {
               'Ow-Auth-Code': code
            },
            success: function (data, textStatus, jqXHR) {
               deferred.resolve(data);
            },
            error: function () {
               deferred.reject();
            }
         });

         return deferred.promise;
      }

   };
   return quizAPI;
})

.service('radioAPI', function ($rootScope, $http, $q) {
   var radioAPI = {
      getTNHN: function () {
         var deferred = $q.defer();

         $http.get($rootScope.servers.radio + '/api/api-v3/index.php/audio-category/tinh-nguyen-hang-ngay/1/1').then(function (res) {
            var id = res.data[0].id;
            $http.get($rootScope.servers.radio + '/api/api-v3/index.php/audio-item/' + id).then(function (res) {
               deferred.resolve(res.data);
            }, function () {
               deferred.reject();
            });
         }, function () {
            deferred.reject();
         });

         return deferred.promise;
      }
   };
   return radioAPI;
})


.service('helperAPI', function () {

   var Base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

   var helperAPI = {
      base64: Base64
   };
   return helperAPI;
});
