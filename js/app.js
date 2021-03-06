/**
 * Created by Jack on 16/6/17.
 */


var rootApp = angular.module('rootApp', [
    'indexModelCtrl',
    'userModelCtrl',
    'blogModelCtrl',
    'userModelService',
    'blogModelService',
    'uiRouter',
    'uiRouter.blogs',
    'ngAnimate',
    'summernote',
    'ui.router',
    'ngCookies',
    'ngResource',
    'toastr',
    'monospaced.qrcode'
])
.run(function ($rootScope, $state, $stateParams, $http, $location, $anchorScroll, $cookies, toastr) {
    $rootScope.LeanCloudId = 'vAMFua5yim32gEb0BgyaUPtw-gzGzoHsz';
    $rootScope.LeanCloudKey = 'nsyfA4qrY3UQsOe7JP6xvUxo';
    $rootScope.domain = 'https://api.leancloud.cn/1.1';
    $rootScope.message_title = 'Celine Blog';
    $rootScope.Admin = 'Celine';
    $rootScope.AdminId = '5764eff42e958a00581a6fd2';
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeSuccess",  function(event, to, toParams, from, fromParams) {
        var github_callback = $location.absUrl().match(/code=(\w{20})/i);
        if (github_callback != null && !$cookies.get('SessionToken')) {
            // for local test
            //var url =  "http://localhost:3000/api/github?code=" + github_callback[1] + "&callback=JSON_CALLBACK";
            var url =  "http://jalpc-a.leanapp.cn/api/github?code=" + github_callback[1] + "&callback=JSON_CALLBACK";
            $http.jsonp(url).success(function (data) {
                //console.log(data);
                if (data.status == 200) {
                    var username = 'gh_' + data.login;
                    var req = {
                    method: 'POST',
                    url: $rootScope.domain + '/users',
                    headers: {
                        'X-LC-Id': $rootScope.LeanCloudId,
                        'X-LC-Key': $rootScope.LeanCloudKey,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        "authData": {
                            "github": {
                                "uid": data.id.toString(),
                                "username": username
                            }
                        }
                    }};
                    $http(req).then(function successCallback(resp){
                        $cookies.put('SessionToken', resp.data.sessionToken);
                        toastr.success('Welcome Github user! ' + username, $rootScope.message_title);
                    }, function errorCallback(resp){
                        toastr.error(resp.data.error, $rootScope.message_title);
                    });
                }
            });
        }
        from.name && $cookies.put('PreviousStateName', from.name);
        fromParams && $cookies.put('PreviousParamsName', JSON.stringify(fromParams));
        //$location.hash('top');
        $anchorScroll();
    });
    $rootScope.back = function() {
        $state.go($cookies.get('PreviousStateName'), JSON.parse($cookies.get('PreviousParamsName')));
    };
})
.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
});

rootApp.controller('rootCtrl', function ($rootScope) {
    $rootScope.landing_page = false;
    $rootScope.gray_bg = false;
});

rootApp.filter("sanitize", function($sce) {
    return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  }
});

angular.module('uiRouter', ['ui.router'])
.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('index', {
            url: '/',
            templateUrl: 'tpls/index.html',
            controller: 'indexCtrl'
        })
        .state('user', {
            url: '/user',
            template: '<div ui-view></div>',
            // controller: function ($state, $rootScope) {
            // $rootScope.currentUser = AV.User.current();
            // console.log($rootScope.currentUser.getEmail());
            // if ($rootScope.sessionToken) {$state.go('user.resetpassword');}
            // else {$state.go('user.login');}
            // }
        })
        .state('user.login', {
            url: '/login',
            templateUrl: 'tpls/user/login.html',
            controller: 'loginCtrl'
        })
        .state('user.register', {
            url: '/register',
            templateUrl: 'tpls/user/register.html',
            controller: 'registerCtrl'
        })
        .state('user.forgotpassword', {
            url: '/forgot_password',
            templateUrl: 'tpls/user/forgot_password.html',
            controller: 'forgotpasswordCtrl'
        })
        .state('user.resetpassword', {
            url: '/reset_password',
            templateUrl: 'tpls/user/reset_password.html',
            controller: 'resetpasswordCtrl'
        })
});

angular.module('uiRouter.blogs', ['ui.router', 'ngSanitize', 'toastr'])
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('blogs', {
            abstract: true,
            url: '/blogs',
            templateUrl: 'tpls/blog/blog.html',
            resolve: {
                blogs: function (blogs) {
                        return blogs.all();
                    }
            },
            controller: 'blogsCtrl'
        })
        .state('blogs.add', {
            url: '/add',
            templateUrl: 'tpls/blog/blog_add.html',
            controller: 'addblogCtrl'
        })
        .state('blogs.detail', {
            url: '/{blogId:[0-9a-z]{24}}',
            templateUrl: 'tpls/blog/blog_detail.html',
            controller: 'blogCtrl'
        })
        .state('blogs.edit', {
            url: '/edit/{blogId:[0-9a-z]{24}}',
            templateUrl: 'tpls/blog/blog_edit.html',
            controller: 'editblogCtrl'
        })
        .state('blogs.list', {
            url: '',
            templateUrl: 'tpls/blog/blog_list.html'
        })
});
