import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useStore } from '../store';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    // Check for demo user session
    const savedDemo = localStorage.getItem('cookies_demo_user');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setUser(parsed);
        setLoading(false);
      } catch {
        // ignore JSON parse error
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          language: 'en',
          simpleMode: true,
          createdAt: new Date().toISOString(),
        });
      } else if (!localStorage.getItem('cookies_demo_user')) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  const hasDemo = typeof window !== 'undefined' && !!localStorage.getItem('cookies_demo_user');
  return { currentUser, loading, isAuthenticated: !!currentUser || hasDemo };
}
