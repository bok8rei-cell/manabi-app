// ===== Firebaseの設定 =====
// Firebaseコンソール（https://console.firebase.google.com/）で
// プロジェクトを作成し、ウェブアプリを追加すると下記の値が表示されます。
// その値をここに貼り付けてください。Firestore（テストモード可）を有効にしてから使ってください。

const firebaseConfig = {
  apiKey: 'AIzaSyDVpd6JakmCDSGVyommmcK8SU4xoUBodbE',
  authDomain: 'manabinodesu.firebaseapp.com',
  projectId: 'manabinodesu',
  storageBucket: 'manabinodesu.firebasestorage.app',
  messagingSenderId: '636007933889',
  appId: '1:636007933889:web:61849b07ac76ebb5e8b140'
};

let cloudDb = null;
if (firebaseConfig.apiKey !== 'YOUR_API_KEY') {
  firebase.initializeApp(firebaseConfig);
  cloudDb = firebase.firestore();
}
