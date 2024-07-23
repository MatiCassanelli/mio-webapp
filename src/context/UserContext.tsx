import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { auth } from 'firestore/config';

export interface UserContextProps {
  user: User | null;
  loading: boolean;
  setLoading: (param: boolean) => void;
}
export const UserContext = createContext<UserContextProps>({
  user: null,
  loading: false,
  setLoading: () => {},
});

const UserProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const authValue = {
    user,
    setLoading,
    loading,
  };

  return (
    <UserContext.Provider value={authValue}>{children}</UserContext.Provider>
  );
};

export default UserProvider;
