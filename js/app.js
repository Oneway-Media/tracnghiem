angular.module('app', [
   'ngSanitize',
   'app.services',
   'app.controllers',
   'ui.router',
   'LocalStorageModule'
])

.run(function ($rootScope, $state, $sce, helperAPI) {

   // Loading
   var spinner = new Spinner({color: '#000'}).spin(document.getElementById('loading-spiner'));

   $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      $('#loading-container').fadeIn();
   });

   $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams){
      setTimeout(function () {
         $('#loading-container').fadeOut();
      }, 500);
   });

   $rootScope.$on('$viewContentLoaded', function(event, viewConfig){
      setTimeout(function () {
         $('#loading-container').fadeOut();
      }, 500);
   });




   // Client credential
   $rootScope.credentials = {
      user: {
         id: 'trac-nghiem-tnhn',
         secret: 'TkQq92d9XC2dhZW2CXPyS4hGczQryRwF',
      },
      self: {
			code: '6MTYyUdKRUGkcrASwwNbgUbFVp8XSq88'
		}
   };

   // api servers
   $rootScope.servers = {
	  user: 'http://user.oneway.vn', //  user center
	  self: 'http://radio.oneway.vn:3000', // backend
	  radio: 'http://oneway.vn' // oneway radio
   };

   // helpers
   $rootScope.helpers = {
      base64: helperAPI.base64,
      checkLogin: function () {
         if(!$rootScope.user) {
            $state.go('home', {}, {location: 'replace'});
         }
         return;
      },
      trustSrc: function(src) {
         return $sce.trustAsResourceUrl(src);
      },
      toDate: function (date) {
         return (new Date(date)).toUTCString();
      },
      invertDate: function (date) {
         var date = date.split('/');
         return date[1] + '/' + date[0] + '/' + date[2];
      }
   };

   // tnhn
   $rootScope.tnhn = null;

   // user
   $rootScope.user = null;

   // today quiz
   $rootScope.quiz = null;

   // choice
   $rootScope.choice = {
      userId: null,
      quizId: null,
      one: null,
      two: null,
      three: null,
      timing: 0
   };

   // already done the quiz
   $rootScope.alreadyDone = null;

})

.config(function($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider) {

   // router
   $urlRouterProvider.otherwise('/trang-chu');

   $stateProvider
   .state('home', {
      url: '/trang-chu',
      templateUrl: 'templates/home.html',
      controller: 'HomeCtrl as homeCtrl'
   })
   .state('login', {
      url: '/dang-nhap/:base',
      // templateUrl: 'templates/login.html',
      controller: 'LoginCtrl as loginCtrl'
   })
   .state('register', {
      url: '/dang-ky',
      templateUrl: 'templates/register.html',
      controller: 'RegisterCtrl as registerCtrl'
   })
   .state('quiz', {
      url: '/bai-tap',
      templateUrl: 'templates/quiz.html',
      controller: 'QuizCtrl as quizCtrl'
   })
   .state('profile', {
      url: '/tai-khoan',
      templateUrl: 'templates/profile.html',
      controller: 'ProfileCtrl as profileCtrl'
   })
   .state('history', {
      url: '/lich-su',
      templateUrl: 'templates/history.html',
      controller: 'HistoryCtrl as historyCtrl'
   })
   .state('chart', {
      url: '/bang-xep-hang',
      templateUrl: 'templates/chart.html',
      controller: 'ChartCtrl as chartCtrl'
   });

   $locationProvider.hashPrefix('!');


   // localstorage
   localStorageServiceProvider.setPrefix('tnhn');
});
