const firebaseConfig = {
  apiKey: "AIzaSyBue8nwSXtBDOxTDBlKjl0NmMbyB9tMlgY",
  authDomain: "duenhotel-bbf03.firebaseapp.com",
  projectId: "duenhotel-bbf03",
  storageBucket: "duenhotel-bbf03.appspot.com",
  messagingSenderId: "1066985664344",
  appId: "1:1066985664344:web:1c7536f0d184faa749bf2d",
  measurementId: "G-X06DV737HC"
};

if (typeof firebase === 'undefined') {
    console.error('Firebase SDK non chargé.');
} else {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    // auth et db sont initialisés dans le code principal
}