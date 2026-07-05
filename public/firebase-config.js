const firebaseConfig = {
    apiKey: "AIzaSyBue8nwSXtBDOxTDBlKjl0NmMbyB9tMlgY",
    authDomain: "duenhotel-bbf03.firebaseapp.com",
    projectId: "duenhotel-bbf03",
    storageBucket: "duenhotel-bbf03.appspot.com",
    messagingSenderId: "1066985664344",
    appId: "1:1066985664344:web:1c7536f0d184faa749bf2d",
    measurementId: "G-X06DV737HC"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

if (typeof firebase.firestore === 'function') {
    db.settings({ timestampsInSnapshots: true });
    db.enablePersistence().catch(function(err) {
        if (err && err.code === 'failed-precondition') {
            console.log('La persistance des données a échoué car plusieurs onglets sont ouverts.');
        } else if (err && err.code === 'unimplemented') {
            console.log('La persistance des données n\'est pas prise en charge par le navigateur.');
        }
    });
}