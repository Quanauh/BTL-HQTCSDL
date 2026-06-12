import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Plus, Minus, CreditCard, MapPin, ShoppingBag, CheckCircle } from 'lucide-react';
import './Cart.css';

export default function Cart({ setActiveView, setShowAuthModal }) {
  const { user } = useContext(AuthContext);
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, checkout } = useContext(CartContext);

  const [diaChiGiao, setDiaChiGiao] = useState('');
  const [phuongThuc, setPhuongThuc] = useState('COD');
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // stores { ma_don }

  // Sync shipping address from user profile on load
  useEffect(() => {
    if (user && user.dia_chi) {
      setDiaChiGiao(user.dia_chi);
    }
  }, [user]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!diaChiGiao.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng');
      return;
    }
    setOrdering(true);
    const res = await checkout(diaChiGiao, phuongThuc);
    setOrdering(false);
    if (res.success) {
      setOrderSuccess({ ma_don: res.ma_don });
    } else {
      alert(res.error || 'Đặt hàng thất bại');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (!user) {
    return (
      <div className="glass-card fade-in cart-auth-box">
        <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Bạn chưa đăng nhập</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Đăng nhập tài khoản khách hàng để xem giỏ hàng và tiến hành đặt mua sản phẩm.
        </p>
        <button onClick={() => setShowAuthModal(true)} className="btn btn-primary btn-block">
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="glass-card fade-in cart-success-box">
        <CheckCircle size={64} style={{ color: 'var(--success)' }} />
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>Đặt hàng thành công!</h2>
        <div className="cart-success-badge">
          Mã đơn hàng: {orderSuccess.ma_don}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
          Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi! Đơn hàng của bạn đã được tiếp nhận và đang được chuyển đến bộ phận vận chuyển để chuẩn bị giao hàng.
        </p>
        
        <div className="cart-success-actions">
          <button 
            onClick={() => { setOrderSuccess(null); setActiveView('orders'); }} 
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            Xem lịch sử đơn hàng
          </button>
          <button 
            onClick={() => { setOrderSuccess(null); setActiveView('shop'); }} 
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="glass-card fade-in cart-auth-box">
        <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Giỏ hàng trống</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Bạn chưa chọn sản phẩm nào. Hãy khám phá và thêm sản phẩm yêu thích vào giỏ hàng nhé.
        </p>
        <button onClick={() => setActiveView('shop')} className="btn btn-primary btn-block">
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Giỏ hàng của bạn</h2>

      <div className="cart-grid-layout">
        
        {/* Left column: Cart item lists */}
        <div className="cart-items-column">
          {cartItems.map(item => (
            <div 
              key={item.gio_hang_id} 
              className="glass-card cart-item-card"
            >
              {/* Brand Tag Icon Badge (since no images) */}
              <div className="cart-item-placeholder">
                {item.ten_hang}
              </div>

              {/* Product meta info */}
              <div className="cart-item-meta">
                <h4 className="cart-item-name">{item.ten}</h4>
                <div className="cart-item-meta-row">
                  <span className="cart-item-brand-tag">
                    {item.ten_hang}
                  </span>
                  <span className="cart-item-price">
                    {formatPrice(item.gia)}
                  </span>
                </div>
              </div>

              {/* Quantity Adjuster */}
              <div className="cart-item-qty-adjuster">
                <button 
                  onClick={() => updateQuantity(item.gio_hang_id, item.so_luong - 1)}
                  disabled={item.so_luong <= 1}
                  className="cart-item-qty-btn"
                >
                  <Minus size={14} />
                </button>
                <span className="cart-item-qty-number">
                  {item.so_luong}
                </span>
                <button 
                  onClick={() => updateQuantity(item.gio_hang_id, item.so_luong + 1)}
                  className="cart-item-qty-btn"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Price subtotal */}
              <div className="cart-item-subtotal">
                <span className="cart-item-subtotal-price">
                  {formatPrice(item.gia * item.so_luong)}
                </span>
              </div>

              {/* Remove action */}
              <button 
                onClick={() => removeFromCart(item.gio_hang_id)}
                className="cart-item-remove-btn"
              >
                <Trash2 size={18} />
              </button>

            </div>
          ))}
        </div>

        {/* Right column: Checkout info */}
        <div className="glass-card cart-summary-panel">
          <h3 className="cart-summary-title">
            Thông tin thanh toán
          </h3>

          {/* Pricing summary */}
          <div className="cart-summary-details">
            <div className="cart-summary-line">
              <span>Tổng số lượng</span>
              <span style={{ fontWeight: 600 }}>{cartCount} sản phẩm</span>
            </div>
            <div className="cart-summary-line">
              <span>Phí vận chuyển</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Miễn phí</span>
            </div>
            <div className="cart-summary-divider"></div>
            <div className="cart-summary-total-line">
              <span>Thành tiền</span>
              <span className="cart-summary-total-price">{formatPrice(cartTotal)}</span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="cart-checkout-form">
            
            {/* Address */}
            <div className="cart-form-group">
              <label className="cart-form-label">
                <MapPin size={14} /> Địa chỉ nhận hàng
              </label>
              <textarea 
                required
                rows={3}
                placeholder="Nhập địa chỉ giao hàng chi tiết..."
                value={diaChiGiao}
                onChange={(e) => setDiaChiGiao(e.target.value)}
                className="cart-form-textarea"
              />
            </div>

            {/* Payment method */}
            <div className="cart-form-group">
              <label className="cart-form-label">
                <CreditCard size={14} /> Phương thức thanh toán
              </label>
              <select
                value={phuongThuc}
                onChange={(e) => setPhuongThuc(e.target.value)}
                className="cart-form-select"
              >
                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                <option value="ChuyenKhoan">Chuyển khoản ngân hàng</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={ordering}
              className="btn btn-primary btn-block" 
              style={{ height: '48px', marginTop: '12px' }}
            >
              {ordering ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
