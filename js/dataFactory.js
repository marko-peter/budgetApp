// create service(factory) for data manipulation
app.factory('dataFactory', [ function() {
    
    var dataFactory = {};

    // get all data from firestore database
    dataFactory.getAllData = function(coll) {        
        let user = firebase.auth().currentUser;
        return db.collection(coll)
                    .where("userId", "==", user.uid)
                    .orderBy('createdAt',"asc")
                    .get();     
    }

    // get single item from firestore database
    dataFactory.getItem = function(coll, id) {
        return db.collection(coll).doc(id).get();
    }

    // add an item to firestore database
    dataFactory.addItem = function(coll, item) {        
        return db.collection(coll).add(item);     
    }

    // delete an item from firestore database
    dataFactory.deleteItem = function(coll, id) {
        return db.collection(coll).doc(id).delete();
    }
    
    // update an item in firestore database
    dataFactory.updateItem = function(coll, id, newItem) {
        return db.collection(coll).doc(id).update(newItem);
    }

    // process data from firestore to an array of objects
    dataFactory.processData = function(data) {      
        let array = [];
        data.forEach(doc => {            
            let item = {                
                year: doc.data().year,
                month: doc.data().month,
                amount: doc.data().amount,
                desc: doc.data().desc,
                id: doc.id
            };                 
            array.push(item);
        });        
        return array;
    }

    // function returns an object with all months
    dataFactory.getMonths = function() {
        return {
            '1': 'January',
            '2': 'February',
            '3': 'March',
            '4': 'April',
            '5':'May',
            '6': 'Jun',
            '7': 'July',
            '8': 'August',
            '9': 'September',
            '10': 'October',
            '11': 'November',
            '12': 'December'
        };
    }

    // function returns an array of all available years
    dataFactory.getYears = function() {
        return [
            2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021
        ];
    }
    
    return dataFactory;
}]);