// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAU9vdZk0v8Vxndwlz6V8gie0eL0xOd6II",
    authDomain: "duenhotel.firebaseapp.com",
    projectId: "duenhotel",
    storageBucket: "duenhotel.appspot.com",
    messagingSenderId: "16305045903",
    appId: "1:16305045903:web:e6ac803e6d3e94416b8bfa",
    measurementId: "G-8T9Y3T0PKC"
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
  
   
  
  
  
  