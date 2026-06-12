// ===== Firebaseの設定 =====
// Firebaseコンソール（https://console.firebase.google.com/）で
// プロジェクトを作成し、ウェブアプリを追加すると下記の値が表示されます。
// その値をここに貼り付けてください。Firestore（テストモード可）を有効にしてから使ってください。

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

let cloudDb = null;
if (firebaseConfig.apiKey !== 'YOUR_API_KEY') {
  firebase.initializeApp(firebaseConfig);
  cloudDb = firebase.firestore();
}
