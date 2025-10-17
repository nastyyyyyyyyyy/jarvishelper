// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';

type ExtendedUser = User & {
  uid: string;
  name?: string;
  avatar?: string;
  birth?: string;
  city?: string;
};

export function useAuth() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const unsubscribeProfile = onSnapshot(userRef, (snap) => {
        const profile = snap.data();
        setUser({
          ...currentUser,
          name: profile?.name ?? '',
          avatar: profile?.avatar ?? '',
          birth: profile?.birth ?? '',
          city: profile?.city ?? '',
        });
        setLoading(false);
      });

      return unsubscribeProfile;
    });

    return () => unsubscribeAuth(); // 清理监听器
  }, []);

  return { user, loading };
}
