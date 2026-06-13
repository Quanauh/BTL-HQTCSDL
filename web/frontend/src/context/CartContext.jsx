import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync cart from backend when user logs in/changes
  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'x-customer-id': user.khach_hang_id.toString()
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      return { success: false, requireLogin: true };
    }
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-customer-id': user.khach_hang_id.toString()
        },
        body: JSON.stringify({
          san_pham_id: productId,
          so_luong: quantity
        })
      });
      const data = await response.json();
      if (response.ok) {
        await fetchCart();
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Lỗi khi thêm sản phẩm');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (!user) return { success: false };
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-customer-id': user.khach_hang_id.toString()
        },
        body: JSON.stringify({
          gio_hang_id: cartItemId,
          so_luong: newQty
        })
      });
      const data = await response.json();
      if (response.ok) {
        await fetchCart();
        return { success: true };
      } else {
        throw new Error(data.message || 'Lỗi khi cập nhật số lượng');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!user) return { success: false };
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'x-customer-id': user.khach_hang_id.toString()
        }
      });
      const data = await response.json();
      if (response.ok) {
        await fetchCart();
        return { success: true };
      } else {
        throw new Error(data.message || 'Lỗi khi xóa sản phẩm');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const checkout = async (diaChiGiao, phuongThucThanhToan) => {
    if (!user) return { success: false, error: 'Chưa đăng nhập' };
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-customer-id': user.khach_hang_id.toString()
        },
        body: JSON.stringify({
          dia_chi_giao: diaChiGiao,
          phuong_thuc_thanh_toan: phuongThucThanhToan
        })
      });
      const data = await response.json();
      if (response.ok) {
        setCartItems([]); // Local clear
        return { success: true, orderId: data.orderId, ma_don: data.ma_don };
      } else {
        throw new Error(data.message || 'Lỗi khi đặt hàng');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.so_luong, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.gia * item.so_luong), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      checkout,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
