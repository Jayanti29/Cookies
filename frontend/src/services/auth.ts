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
  // Create user profile in firestore
  await setDoc(doc(db, 'users', result.user.uid), {
    uid: result.user.uid,
    email: result.user.email,
    createdAt: new Date().toISOString(),
    preferredLanguage: 'en',
  }, { merge: true });
  return result.user;
}

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await setDoc(doc(db, 'users', result.user.uid), {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return result.user;
}

export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}
