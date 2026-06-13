import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, ArrowLeft, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import './ProductDetail.css';

export default function ProductDetail({ productId, onBack, setShowAuthModal }) {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [productId]);

  const handleQtyChange = (val) => {
    const nextVal = qty + val;
    if (nextVal >= 1) setQty(nextVal);
  };

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const res = await addToCart(product.san_pham_id, qty);
    if (res.success) {
      showToast(`Đã thêm ${qty} ${product.ten} vào giỏ hàng!`);
    } else {
      showToast(res.error || 'Lỗi thêm sản phẩm', true);
    }
  };

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', fontWeight: 600 }}>Không thể tải thông tin chi tiết sản phẩm.</p>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '20px' }}>
          <ArrowLeft size={16} /> Quay lại cửa hàng
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: toast.isError ? 'var(--danger)' : 'var(--success)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      {/* Back button */}
      <button 
        onClick={onBack} 
        className="btn btn-secondary detail-back-btn" 
      >
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>

      {/* Main detail card layout */}
      <div className="glass-card detail-card-grid">
        
        {/* Brand visual panel */}
        <div className="detail-brand-panel">
          <h2 className="detail-brand-logo">{product.ten_hang}</h2>
          <span className="detail-brand-tag">
            Hãng sản xuất: {product.ten_hang}
          </span>
        </div>

        {/* Content details panel */}
        <div className="detail-content-panel">
          <div>
            <h1 className="detail-title">
              {product.ten}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {product.con_hang ? (
                <span className="detail-stock-status in-stock">
                  <Check size={16} /> Còn hàng sẵn tại kho
                </span>
              ) : (
                <span className="detail-stock-status out-of-stock">
                  <AlertCircle size={16} /> Hết hàng tạm thời
                </span>
              )}
            </div>
          </div>

          <div className="detail-divider"></div>

          <div>
            <h3 className="detail-section-title">Mô tả sản phẩm</h3>
            <p className="detail-text">{product.mo_ta}</p>
          </div>

          {product.mo_ta_hang && (
            <div>
              <h3 className="detail-section-title">Về thương hiệu</h3>
              <p className="detail-brand-desc">{product.mo_ta_hang}</p>
            </div>
          )}

          <div className="detail-divider"></div>

          <div className="detail-footer-row">
            <div>
              <span className="detail-price-label">Giá bán lẻ đề xuất</span>
              <div className="detail-price">
                {formatPrice(product.gia)}
              </div>
            </div>

            {/* Actions: quantity and cart button */}
            <div className="detail-actions-row">
              {product.con_hang && (
                <div className="detail-qty-adjuster">
                  <button 
                    onClick={() => handleQtyChange(-1)} 
                    className="detail-qty-btn"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="detail-qty-number">
                    {qty}
                  </span>
                  <button 
                    onClick={() => handleQtyChange(1)} 
                    className="detail-qty-btn"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}

              <button 
                onClick={handleAddToCart}
                disabled={!product.con_hang}
                className="btn btn-primary detail-cart-btn"
              >
                <ShoppingCart size={20} /> Thêm vào giỏ hàng
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
