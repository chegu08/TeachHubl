import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

createRoot(document.getElementById('root')).render(
  <Router>
    <App />
  </Router>
)

if ('serviceWorker' in navigator) {
  (async function registerServiceWorker() {
    // there is no need to check if the service worker is already registered
    // the browser already does that for you
    let registration = null;
    try {
      registration = await navigator.serviceWorker.register('sw.js');
    } catch (err) {
      console.log("Cant register service worker");
      console.log(err);
    }

    // check whether the permissions for notifications already exists
    // and then if it doesnt exist , ask for permission
    if (window.Notification.permission !== 'granted') {
      try {
        const permission = await window.Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error("Permission has not been granted!")
        }
      } catch (err) {
        console.log(err);
      }
    }

  })();
};

// update indexDB with jwt in localstorage
// so it can be accessed by service worker
const jwt = localStorage.getItem("jwt");
if (jwt) {
  const decode = jwtDecode(jwt);
  const request = window.indexedDB.open("pingInfo", 1);


  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("user")) {
      console.log("No object store found initially");
      db.createObjectStore("user", { keyPath: "userId" });
      console.log("Object store created now");
    }
  }


  request.onsuccess = function (event) {
    const db = event.target.result;
    try {
      const tx = db.transaction("user", "readwrite");
      const store = tx.objectStore("user");

      const getReq = store.get(decode.userId);
      getReq.onerror = () => console.log("Failed to get user from indexDB");

      getReq.onsuccess = function () {
        const user = getReq.result;
        if (!user) {
          store.put({
            userId: decode.userId,
            jwt
          })
        }
      };
    } catch (err) {
      console.log(err);
    }
  }

  request.onerror = () => console.log("Error opening indexDb");
}
