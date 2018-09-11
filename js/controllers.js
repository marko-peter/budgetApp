// controller for navbar and displaying alert messages 
app.controller('appCtrl', ['$scope', function ($scope) {

    $scope.showMessage = function(text, type) {        
        $scope.alert = true;
        $scope.alertType = type;
        $scope.alertText = text;
    }

    $scope.signOut = function() {
        firebase.auth().signOut()
            .then(() => $scope.showMessage('signed out', 'alert-success'))            
    }   
}]);


// controller for main page of the application
app.controller('mainPageCtrl', ['$scope', 'dataFactory',
    function ($scope, dataFactory) {           
    
    // ng-options for select
    $scope.months = dataFactory.getMonths();
    $scope.years = dataFactory.getYears();
    
    // reset month and year to display all records
    $scope.reset = function() {
        $scope.month = '';
        $scope.year = '';      
    }   

    // get current year and month
    $scope.currentYearAndMonth = function() {
        $scope.month = new Date().getMonth()+1;
        $scope.year = new Date().getFullYear();      
    }

    // set current year and month on page load
    $scope.currentYearAndMonth();
   
}]);


// controller for "column" directive
app.controller('columnCtrl', ['$scope', '$location', 'dataFactory', 
    function ($scope, $location, dataFactory) {
    
    // array of all expenses/incomes
    $scope.items = [];
    
    // get all expenses/incomes from DB on page load
    getItems();
    
    // represents all displayed(filtred) expenses/incomes
    $scope.results = [];  

    // calculates total amount of displayed(filtred) expenses/incomes
    $scope.$watch('results', function () {
        $scope.totalAmount = $scope.results.reduce((prev, cur) => {
            return prev + cur.amount;
          }, 0);
     });

    $scope.addItem = function() {

        // form validation
        if($scope.addForm.$invalid || $scope.year === '' || $scope.month === '') {                        
            $scope.addFormAlert = true;
            setTimeout( () => {
                $scope.addFormAlert = false;
                $scope.$apply();
            }, 3000);
            return;
        }
        if($scope.amount === 0) {            
            $scope.addFormAlertZero = true;
            setTimeout( () => {
                $scope.addFormAlertZero = false;
                $scope.$apply();
            }, 3000);
            return;
        }

        // expenses have negative sign
        // incomes have positive sign
        if($scope.type === 'expenses') {
            $scope.amount = -Math.abs($scope.amount);
        } else {
            $scope.amount = Math.abs($scope.amount);
        }

        // temporary variable
        let newItem = {
            year: $scope.year,
            month: $scope.month,
            amount: $scope.amount,
            desc: $scope.desc,
            userId: firebase.auth().currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        // add item to DB
        addItem(newItem);
        
        // reset input fields
        $scope.amount = '';
        $scope.desc = '';                   
    }

    $scope.deleteItem = function(event) {
        event.preventDefault();        
        let itemId = event.target.parentNode.parentNode.parentNode.id;        
        
        // if user click on the "a" element, but not on the "icon" element
        if (!itemId) {
            itemId = event.target.parentNode.parentNode.id;
        }
        // delete item from DB
        deleteItem(itemId)
    }

    $scope.editItem = function(event) {
        event.preventDefault();
        let itemId = event.target.parentNode.parentNode.parentNode.id;        
        
        // if user click on the "a" element, but not on the "icon" element
        if (!itemId) {
            itemId = event.target.parentNode.parentNode.id;
        }
        // redirect to edit page
        $location.path('/edit/' + $scope.type + '&' + itemId);        
    }
    
    // get all items from DB
    async function getItems() {        
        try {
            let data = await dataFactory.getAllData($scope.type);
            $scope.items = dataFactory.processData(data);                   
            $scope.$apply();              
        } catch (error) {
            $scope.showMessage({text:error.code, type:'alert-danger'});              
            $scope.$apply();        
        }   
    }

    // add item to DB
    async function addItem(item) {   
        try {
            let data = await dataFactory.addItem($scope.type, item);                  
            getItems();     
        } catch(error) {
            $scope.showMessage({text:error.code, type:'alert-danger'});
            $scope.$apply();          
        }
    }

    // delete item from DB
    async function deleteItem(id) {
        try {
            await dataFactory.deleteItem($scope.type, id);            
            getItems();
        } catch(error) {          
            $scope.showMessage({text:error.code, type:'alert-danger'});
            $scope.$apply(); 
        }
    }  
}]);


// controller for "edit item" page
app.controller('editItemCtrl', ['$scope', '$location', '$routeParams', 'dataFactory',    
    function ($scope, $location, $routeParams, dataFactory) {   
    
    // split route parameters into array
    let params = $routeParams.id.split('&');
    let collection = params[0];
    let itemID = params[1];
        
    // get data from DB on page load
    getItem();
    
    // ng-options for select
    $scope.months = dataFactory.getMonths();   
    $scope.years = dataFactory.getYears();
    
    $scope.updateItem = function() {

        // Ensure that expenses has always negative sign
        // and incomes always positive sign.
        if(collection === 'expenses') {
            $scope.newItem.amount = -Math.abs($scope.newItem.amount);
        } else if(collection === 'incomes') {
            $scope.newItem.amount = Math.abs($scope.newItem.amount);
        }

        updateItem($scope.newItem);
    }

    // get an item from DB and update $scope.newItem
    async function getItem() {   
        try {            
            let data = await dataFactory.getItem(collection, itemID);   
            let item = data.data();              
            $scope.newItem = {
                year: item.year,
                month: item.month,
                amount: item.amount,
                desc: item.desc
            };            
            $scope.$apply();            
        } catch(error) {
            $scope.showMessage(error.code, 'alert-danger');
            $scope.$apply();
        }
    }    

    // update an item in DB
    async function updateItem(newItem) {   
        try {            
            let data = await dataFactory.updateItem(collection, itemID, newItem);   
            $scope.showMessage('Successfully updated', 'alert-success');
            $location.path('/main');
            $scope.$apply();         
        } catch(error) {
            $scope.showMessage(error.code, 'alert-danger');            
            $scope.$apply();
        }
    }        
}]);


// controller for login page
app.controller('loginCtrl', ['$scope', function ($scope) {   

    $scope.logIn = function() {          
        firebase.auth().signInWithEmailAndPassword($scope.email, $scope.password)
        .then( () => {
            $scope.showMessage('Logged in successfully', 'alert-success')
        })
        .catch( (error) => {
            $scope.showMessage(error.message, 'alert-danger');
            $scope.$apply();           
        });          
    }
}]);


// controller for register page
app.controller('registerCtrl', ['$scope', '$location', function ($scope, $location) {   

    $scope.register = function() {          
        firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.password)
        .then( () => {
            $location.path("/login");            
            $scope.showMessage('Registration successful', 'alert-success');
            $scope.$apply();        
        })
        .catch( (error) => {
            $scope.showMessage(error.message, 'alert-danger');
            $scope.$apply();          
        });           
    }
}]);