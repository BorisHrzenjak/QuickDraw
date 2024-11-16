const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Initialize Firebase with environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function removeDuplicates() {
  try {
    const likedImagesRef = collection(db, 'likedImages');
    const snapshot = await getDocs(likedImagesRef);
    
    // Create a map to track images by userId and imageData
    const imageMap = new Map();
    const duplicatesToDelete = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const key = `${data.userId}_${data.imageData}`;
      
      if (imageMap.has(key)) {
        // This is a duplicate, mark for deletion
        duplicatesToDelete.push(doc.id);
      } else {
        // First occurrence, add to map
        imageMap.set(key, doc.id);
      }
    });

    // Delete duplicates
    console.log(`Found ${duplicatesToDelete.length} duplicates. Removing...`);
    for (const docId of duplicatesToDelete) {
      await deleteDoc(doc(db, 'likedImages', docId));
      console.log(`Deleted duplicate with ID: ${docId}`);
    }
    
    console.log('Cleanup complete!');
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
  }
}

removeDuplicates();
