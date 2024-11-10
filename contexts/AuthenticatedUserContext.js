import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

export const AuthenticatedUserContext = createContext({});

export const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, authenticatedUser => {
      setUser(authenticatedUser || null);
    });
    return unsubscribeAuth;
  }, []);

  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};
