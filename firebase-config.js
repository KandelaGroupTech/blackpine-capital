// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCg9GVVN_zHPJbpmG7RygfFAONwSf4pgUQ",
    authDomain: "blackpineportal.firebaseapp.com",
    projectId: "blackpineportal",
    storageBucket: "blackpineportal.firebasestorage.app",
    messagingSenderId: "85194056022",
    appId: "1:85194056022:web:f6b7a881a8ed0db6bff6f7",
    measurementId: "G-VG9WM5Q5V7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Helper function to check if user is admin
async function isAdmin(user) {
    if (!user) return false;
    try {
        const adminDoc = await db.collection('admins').doc(user.uid).get();
        return adminDoc.exists;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Helper function to get current user
function getCurrentUser() {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
}
