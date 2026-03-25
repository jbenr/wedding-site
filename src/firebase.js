import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, runTransaction } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBnhDg0vB098g8JDx_QMY7Yfpxt0l41x7M",
  authDomain: "ben-emily-wedding.firebaseapp.com",
  databaseURL: "https://ben-emily-wedding-default-rtdb.firebaseio.com",
  projectId: "ben-emily-wedding",
  storageBucket: "ben-emily-wedding.firebasestorage.app",
  messagingSenderId: "143796846787",
  appId: "1:143796846787:web:188ffe0c0f434609e1e276"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const clickCountRef = ref(db, "clickCount");
const hoosierCountRef = ref(db, "goHoosiersCount");
const deepTrackRef = (photoId) => ref(db, `deepTracks/${photoId}`);
const deepTrackLikesRef = (photoId) => ref(db, `deepTracks/${photoId}/likes`);
const deepTrackCommentsRef = (photoId) => ref(db, `deepTracks/${photoId}/comments`);

const goofyLikesRef = (photoId) => ref(db, `goofyLikes/${photoId}`);
const goofyCommentsRef = (photoId) => ref(db, `goofyComments/${photoId}`);
const hoosierLikesRef = (photoId) => ref(db, `hoosierLikes/${photoId}`);
const hoosierCommentsRef = (photoId) => ref(db, `hoosierComments/${photoId}`);

export {
  db,
  clickCountRef,
  hoosierCountRef,
  deepTrackRef,
  deepTrackLikesRef,
  deepTrackCommentsRef,
  goofyLikesRef,
  goofyCommentsRef,
  hoosierLikesRef,
  hoosierCommentsRef,
  ref,
  push,
  onValue,
  runTransaction
};
