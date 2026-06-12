import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for active session on load
    const storedUser = localStorage.getItem('ecom_customer_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('ecom_customer_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, mat_khau) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, mat_khau })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      setUser(data.user);
      localStorage.setItem('ecom_customer_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (email, mat_khau, ho_ten, so_dien_thoai, dia_chi) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, mat_khau, ho_ten, so_dien_thoai, dia_chi })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (ho_ten, so_dien_thoai, dia_chi) => {
    if (!user) return { success: false, error: 'Chưa đăng nhập' };
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-customer-id': user.khach_hang_id.toString()
        },
        body: JSON.stringify({ ho_ten, so_dien_thoai, dia_chi })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Cập nhật profile thất bại');
      }

      const updatedUser = { ...user, ho_ten, so_dien_thoai, dia_chi };
      setUser(updatedUser);
      localStorage.setItem('ecom_customer_user', JSON.stringify(updatedUser));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ecom_customer_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
