// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBue8nwSXtBDOxTDBlKjl0NmMbyB9tMlgY",
    authDomain: "duenhotel-bbf03.firebaseapp.com",
    projectId: "duenhotel-bbf03",
    storageBucket: "duenhotel-bbf03.appspot.com",
    messagingSenderId: "1066985664344",
    appId: "1:1066985664344:web:1c7536f0d184faa749bf2d",
    measurementId: "G-X06DV737HC"
};

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();
const db = firebase.firestore();

firebase.firestore().settings({
    timestampsInSnapshots: true
});

firebase.firestore().enablePersistence()
    .catch(function(err) {
        if (err.code == 'failed-precondition') {
            console.log('La persistance des données a échoué car plusieurs onglets sont ouverts.');
        } else if (err.code == 'unimplemented') {
            console.log('La persistance des données n\'est pas prise en charge par le navigateur.');
        }
    });