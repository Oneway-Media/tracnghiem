angular.module('app.controllers', [])


.controller('AppCtrl', function ($rootScope, localStorageService, $state, userAPI) {

   // check if login information availble in localstorage
   if(localStorageService.isSupported) {
      var login = localStorageService.get('login');
      if( login ) {
         login = JSON.parse(login);

         // get the user
         userAPI.getUser(login.id, login.token).then(function (data) {
            $rootScope.user = data;
            // console.log(data);
         }, function () {
            console.log('Cannot get the user.');
         });
      }
   }

   // logout method
   this.logout = function () {
      if(localStorageService.isSupported) {
         localStorageService.remove('login'); // remove local user
         window.location.replace($rootScope.servers.user + '/account/logout?continue=' + $rootScope.credentials.user.id); // redirect to account logout
         // $state.go('home', {}, {location: 'replace'});
      }
   }

})

.controller('HomeCtrl', function ($rootScope, radioAPI) {
   var _this = this;

   if($rootScope.tnhn) {
      _this.tnhn = $rootScope.tnhn;
   } else {
      radioAPI.getTNHN().then(function (data) {
         _this.tnhn = data[0];
         $rootScope.tnhn = _this.tnhn;
      }, function () {
         console.log('Cannot get today TNHN.');
      });
   }
})

.filter('filterTitle', function(){
   return function(x){
      var i, c, txt = "";
      var string = x.split(": ");
      var getEle = document.querySelector(".tnhn-title");
      return getEle.innerHTML = string[0] + ": " + "<span style='color:#0ee3e4;'>" + string[1] + "</span>"
   };

})

.filter('datetime', function($filter) {
    return function(input) {
     if(input == null){ return ""; } 
     var _date = $filter('date')(new Date(input), 'dd-MM-yyyy -- HH:mm:ss');
     return _date.toUpperCase();
    };
})

.controller('LoginCtrl', function ($rootScope, $stateParams, $state, localStorageService, userAPI) {

   var base = $stateParams.base;
      base = base || 'none';

   // Define the string
   var base = base.substring(base.length - 32, base.length) + base.substring(0, base.length - 32) + '==';
   // Decode the String
   var data = JSON.parse($rootScope.helpers.base64.decode(base) + '"}');

   // save request information to localstorage
   if(localStorageService.isSupported) {
      localStorageService.set('login', JSON.stringify(data));
   }

   // get the user
   userAPI.getUser(data.id, data.token).then(function (data) {
      $rootScope.user = data;
      $state.go('home', {}, {location: 'replace'});
   }, function () {
      console.log('Cannot get the user.');
   });

})

.controller('QuizCtrl', function ($rootScope, $state, localStorageService, quizAPI, radioAPI) {
   var _this = this;

   // check if
   // $rootScope.helpers.checkLogin();

   // get tnhn
   if($rootScope.tnhn) {
      _this.tnhn = $rootScope.tnhn;
   } else {
      radioAPI.getTNHN().then(function (data) {
         _this.tnhn = data[0];
         $rootScope.tnhn = _this.tnhn;
      }, function () {
         console.log('Cannot get today TNHN.');
      });
   }


   // check if user can submit result
   function canBeFinish() {
      if($rootScope.choice &&
         $rootScope.choice.one &&
         $rootScope.choice.two &&
         $rootScope.choice.three
      ) {
         _this.canBeFinish = true;
      } else {
         _this.canBeFinish = null;
      }
   }

   function checkLocalStorage() {
      if(localStorageService.isSupported) {

         // get done from local storage
         var done = localStorageService.get('done');

         if(done) {
            done = JSON.parse(done);
            if(done.quizId === $rootScope.quiz._id && $rootScope.user && done.userId === $rootScope.user.id) {
               $rootScope.alreadyDone = true;

               $state.go('home', {}, {location: 'replace'});
            }
         }

         // get choice from localstorage if available
         var choice = localStorageService.get('choice');
         if(choice){
            choice = JSON.parse(choice);
            if($rootScope.quiz &&
            choice.quizId === $rootScope.quiz._id &&
            (($rootScope.user &&
            choice.userId === $rootScope.user.id) || !choice.userId )) {
               $rootScope.choice = choice;
            }
            canBeFinish();
         }
      }

   }


   function activeTiming() {
      if(!_this.timingInterval) {
         _this.timingInterval = setInterval(function () {
            $rootScope.choice.timing++;

            // save choice to localstorage
            if(localStorageService.isSupported) {
               localStorageService.set('choice', JSON.stringify($rootScope.choice));
            }

            if(!$rootScope.$$phase) {
               $rootScope.$digest();
            }
         }, 1000);
      }
   }

   // check if this quiz was done before
   if($rootScope.quiz) {
      checkLocalStorage();
   }


   // get quiz from server or available from root scope
   if(!$rootScope.quiz) {
      quizAPI.getQuiz().then(function (data) {

         if(JSON.stringify(data) === '{}') {
            $rootScope.quiz = null;
         } else {
            $rootScope.quiz = data;
         }

         checkLocalStorage();
      }, function () {
         console.log('Cannot get quiz.');
      });
   }



   // choose an answer
   _this.choose = function (q, a) {
      if(!$rootScope.choice.quizId) {
         $rootScope.choice.quizId = $rootScope.quiz._id;
      }
      if($rootScope.user && !$rootScope.choice.userId) {
         $rootScope.choice.userId = $rootScope.user.id;
      }
      $rootScope.choice[q] = a;
      canBeFinish(); // check if user finish all quiz

      // save choice to localstorage
      if(localStorageService.isSupported) {
         localStorageService.set('choice', JSON.stringify($rootScope.choice));
      }

      // count the time
      activeTiming();
   }

   // finish the quiz
   _this.finish = function () {

      if(!$rootScope.user) {
         _this.needToLoginBeforeSubmit = true;
         return;
      } else {
         _this.needToLoginBeforeSubmit = null;

         // stop timing
         if(_this.timingInterval) {
            clearInterval(_this.timingInterval);
         }

         // send result to server
         quizAPI.addChoice().then(function (data) {
            // hide confirm modal
            $('.bs-confirm-modal-sm').modal('hide').on('hidden.bs.modal', function (e) {
               if(localStorageService.isSupported) {
                  $rootScope.alreadyDone = true;
                  localStorageService.set('done', JSON.stringify({
                     userId: $rootScope.user.id,
                     quizId: $rootScope.quiz._id,
                  }));

                  if(!$rootScope.$$phase) {
                     $rootScope.$digest();
                  }
               }
            });
         }, function () {
            console.log('Cannot add choice.');
         });

      }
   }

})

.controller('HistoryCtrl', function ($rootScope, quizAPI) {
   var _this = this;

   // check if user login
   $rootScope.helpers.checkLogin();


   quizAPI.getHistory().then(function (data) {
      _this.history = data;
      console.log(data);
   }, function () {
      console.log('Get history fail!');
   });


   _this.viewDetail = function (id) {
      console.log(_this.history, id);
      for (var i = 0; i < _this.history.length; i++) {
         if(_this.history[i]._id === id) {
            _this.detailHistory = _this.history[i];
         }
      }

      console.log(_this.detailHistory);
   }
})


.controller('ChartCtrl', function (quizAPI, userAPI) {
   var _this = this;

   function addUserData(user, data) {
      for (var i = 0; i < _this.chartDay.length; i++) {
         if (_this.chartDay[i].user === data.id)
         {
            _this.chartDay[i].userData = data;
         }
      }
   }

   quizAPI.chartDay().then(function (data) {
      _this.chartDay = data.slice(0, 10);

      for (var i = 0; i < _this.chartDay.length; i++) {
         userAPI.getUserBasic(_this.chartDay[i].user).then(function (user) {
            addUserData(user.id, user);
         }, function () {
            addUserData(user.id, {
               id: user.id,
               name: 'N/A',
               email: 'n/a'
            })
         });
      }

   }, function () {
      console.log('Something went wrong!');
   });
});
