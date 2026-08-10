import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ username: 'admin', fullName: 'JN Ceylon Admin', role: 'ADMIN' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user info
    axios.get('/api/auth/me')
      .then(res => {
        if (res.data) setUser(res.data);
      })
      .catch(() => {
        // Fallback default dev admin
        setUser({ username: 'admin', fullName: 'JN Ceylon Admin', role: 'ADMIN' });
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password });
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
