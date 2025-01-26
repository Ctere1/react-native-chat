import PropTypes from 'prop-types';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useMemo, useState, useEffect, createContext } from 'react';

import { auth } from '../config/firebase';

export const AuthenticatedUserContext = createContext({});

export const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser || null);
    });
    return unsubscribeAuth;
  }, []);

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);

  return (
    <AuthenticatedUserContext.Provider value={value}>{children}</AuthenticatedUserContext.Provider>
  );
};

AuthenticatedUserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
