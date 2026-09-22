import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const googleProvider = new GoogleAuthProvider();

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  try {
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      createdAt: new Date().toISOString(),
      preferredLanguage: 'en',
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore profile creation deferred:', err);
  }
  return result.user;
}

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  try {
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore profile sync deferred:', err);
  }
  return result.user;
}

export async function loginAsDemoUser() {
  const demoUser = {
    uid: 'demo_cookies_user',
    email: 'demo@cookies-safety.org',
    displayName: 'Safety Citizen (Demo)',
    photoURL: null,
    language: 'en',
    simpleMode: true,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem('cookies_demo_user', JSON.stringify(demoUser));
  return demoUser;
}

export async function logout(): Promise<void> {
  localStorage.removeItem('cookies_demo_user');
  try {
    await firebaseSignOut(auth);
  } catch {
    // Ignore signout errors in offline/demo mode
  }
}
