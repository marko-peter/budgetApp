// initialize Firebase
var config = {
    apiKey: "AIzaSyCskokn0em2sjyken4f10Du8OnuHttA5js",
    authDomain: "ng-app-368a1.firebaseapp.com",
    databaseURL: "https://ng-app-368a1.firebaseio.com",
    projectId: "ng-app-368a1",
    storageBucket: "ng-app-368a1.appspot.com",
    messagingSenderId: "754653751936"
  };
firebase.initializeApp(config);
const db = firebase.firestore();
db.settings({timestampsInSnapshots: true});


// create AngularJS module
var app = angular.module('budgetApp', ['ngRoute']);


// create router
app.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'views/spinner.html'
        })   
        .when('/main', {
            controller: 'mainPageCtrl',
            templateUrl: 'views/main.html',          
        })
        .when('/register', {
            controller: 'registerCtrl',
            templateUrl: 'views/register.html'
        })
        .when('/login', {
            controller: 'loginCtrl',
            templateUrl: 'views/login.html'
        })
        .when('/edit/:id', {
            controller: 'editItemCtrl',
            templateUrl: 'views/edit.html'
        })        
        .otherwise({ redirectTo: '/main' });
}]);


// $routeChangeStart listener
// controls which route can be accessed
// if use is logged in, he cannot access login/register page
// if user is not logged in, he cannot access main/edit page
app.run(['$rootScope', '$location', function ($rootScope, $location) {                
    $rootScope.$on("$routeChangeStart", function (event, next, prev) {  
        
        // if no user is logged in, user variable is null
        let user = firebase.auth().currentUser;
        
        // After refresh(page loading) 'prev' object is undefined
        // and spinner page is displayed
        if(!prev) {           
            $location.path("/"); 

        } else if(next.$$route.originalPath == '/main') {            
            if(!user) {
                $location.path("/login");                  
            }            
        } else if(next.$$route.originalPath == '/edit/:id') {            
            if(!user) {
                $location.path("/login");                  
            } else if (!(next.params.id.includes('&') && next.params.id.length > 8)) {
                event.preventDefault();
            }
        } else if(next.$$route.originalPath == '/login') {            
            if(user) {                
                event.preventDefault();
            }
        } else if(next.$$route.originalPath == '/register') {            
            if(user) {                
                event.preventDefault();
            }
        } else if(next.$$route.originalPath == '/') {            
            event.preventDefault();        
        }
    });
}]);


// On page load(refresh page) 'firebase.auth().currentUser' is 'null'
// and if any user is logged in, it changes the state after a while.
// It also redirects after log in/sign out.
app.run(function($rootScope, $location){
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is logged in                   
            $location.path("/main");
            $rootScope.loggedIn = true;
            $rootScope.userEmail = user.email;
            $rootScope.$apply();
        } else {
            // No user is logged in                       
            $location.path("/login");
            $rootScope.loggedIn = false;
            $rootScope.$apply();           
        }
    });
})

// create custom directive
app.directive('column', function() {
    return {
        restrict: 'E',
        scope: {
            type: '=',            
            year: '=',
            month: '=',
            months: '=',
            showMessage: '&'      
        },
        templateUrl: "directives/column.html",
        controller: 'columnCtrl'
    }
});