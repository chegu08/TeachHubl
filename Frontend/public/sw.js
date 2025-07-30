VAPID_PUBLIC_KEY='BG2tcg_N5fvs583SwQx9STDHwLgJzmg8gmySZBOopWqr3RukFXewllEIE9XL29_WVV4ywETJqK84fjquGWZTofw';

function urlBase64ToUintArray(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray;
}

async function getAuthTokenInIndexDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("pingInfo", 1);

    request.onerror = () => {
      reject(new Error("Couldn't open indexedDB so can't fetch auth details"));
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction("user", "readonly");
      const store = tx.objectStore("user");

      const getAllReq = store.getAll();  // since you may not know the key

      getAllReq.onsuccess = () => {
        if (getAllReq.result.length > 0) {
          const user = getAllReq.result[0];
          resolve({
            userId: user.userId,
            auth_token: user.jwt,
          });
        } else {
          reject(new Error("No user found in indexedDB"));
        }
      };

      getAllReq.onerror = () => {
        reject(new Error("Can't access elements in store"));
      };
    };
  });
}


self.addEventListener('activate',async ()=>{
    try {
        const options={
            userVisibleOnly:true,
            applicationServerKey:urlBase64ToUintArray(VAPID_PUBLIC_KEY)
        }
        const subscription=await self.registration.pushManager.subscribe(options);
        const {userId,auth_token}=await getAuthTokenInIndexDB();
        fetch('http://localhost:4001/save-subscription',{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                subscription,
                userId,
                auth_token
            })
        }).then(res=>res.json()).then(res=>console.log(res)).catch(err=>console.log(err));
    } catch(err) {
        console.log(err);
    }
});

self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json(); // parses JSON string sent from backend
        console.log('📬 Push received:', data);

        const { title, message } = data;

        event.waitUntil(
            self.registration.showNotification(title, {
                body: message,
                icon: '/WhatsApp Image 2025-02-19 at 20.32.04_9336c379.jpg' 
            })
        );
    } else {
        console.log('⚠️ Push event received but no data was sent');
    }
});
