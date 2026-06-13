import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, CreditCard, Truck, Package, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import './Orders.css';

export default function Orders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'x-customer-id': user.khach_hang_id.toString()
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleViewDetails = async (orderId) => {
    if (selectedOrder && selectedOrder.don_hang_id === orderId) {
      setSelectedOrder(null);
      return;
    }

    setDetailsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'x-customer-id': user.khach_hang_id.toString()
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
      }
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('giao') || s.includes('thành công')) return { background: '#d1fae5', color: '#065f46' };
    if (s.includes('hủy')) return { background: '#f3f4f6', color: '#374151' };
    if (s.includes('chờ') || s.includes('xử lý')) return { background: '#fef3c7', color: '#92400e' };
    return { background: '#dbeafe', color: '#1e40af' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Lịch sử đặt hàng</h2>

      {orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Chưa có đơn hàng nào</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Bạn chưa thực hiện bất kỳ giao dịch nào. Các đơn hàng đã đặt sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => {
            const isExpanded = selectedOrder && selectedOrder.don_hang_id === order.don_hang_id;
            return (
              <div key={order.don_hang_id} className="glass-card order-card">
                
                {/* Summary Row */}
                <div className="order-summary-row">
                  <div className="order-meta">
                    <div className="order-id-row">
                      <span className="order-id-title">
                        Đơn hàng: {order.ma_don}
                      </span>
                      <span className="order-status-badge" style={getStatusStyle(order.trang_thai)}>
                        {order.trang_thai}
                      </span>
                    </div>
                    <span className="order-date-text">
                      <Calendar size={14} /> {formatDate(order.ngay_dat)}
                    </span>
                  </div>

                  <div className="order-amount-section">
                    <div className="order-amount-wrapper">
                      <span className="order-amount-label">Tổng thanh toán</span>
                      <div className="order-amount-value">
                        {formatPrice(order.tong_tien)}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleViewDetails(order.don_hang_id)}
                      className="btn btn-secondary order-detail-toggle-btn"
                    >
                      <Eye size={16} /> 
                      {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="fade-in order-expanded-details">
                    
                    {/* Items table list */}
                    <div>
                      <h4 className="order-items-section-title">
                        <Package size={16} /> Chi tiết sản phẩm mua
                      </h4>
                      <div className="order-items-list">
                        {selectedOrder.items?.map(item => (
                          <div key={item.ctdh_id} className="order-item-row">
                            <div>
                              <span className="order-item-name">{item.ten_san_pham}</span>
                              <span className="order-item-qty">x {item.so_luong}</span>
                            </div>
                            <span className="order-item-subtotal">{formatPrice(item.don_gia * item.so_luong)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Payment details section */}
                    <div className="order-details-grid">
                      {/* Shipping Tracking */}
                      {selectedOrder.van_chuyen && (
                        <div className="order-detail-card">
                          <h4 className="order-detail-card-title">
                            <Truck size={16} /> Vận chuyển & Giao nhận
                          </h4>
                          <div className="order-detail-card-content">
                            <div>Đơn vị: <strong className="order-detail-card-highlight">{selectedOrder.van_chuyen.don_vi_vc}</strong></div>
                            <div>Mã vận đơn: <strong className="order-detail-card-highlight">{selectedOrder.van_chuyen.ma_vc_cua_don}</strong></div>
                            <div>Trạng thái: 
                              <span className="order-detail-card-status">
                                {selectedOrder.van_chuyen.trang_thai}
                              </span>
                            </div>
                            {selectedOrder.van_chuyen.du_kien_giao && (
                              <div>Dự kiến giao: <strong className="order-detail-card-highlight">{formatDate(selectedOrder.van_chuyen.du_kien_giao)}</strong></div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Payment Tracking */}
                      {selectedOrder.thanh_toan && (
                        <div className="order-detail-card">
                          <h4 className="order-detail-card-title">
                            <CreditCard size={16} /> Thanh toán giao dịch
                          </h4>
                          <div className="order-detail-card-content">
                            <div>Phương thức: 
                              <strong className="order-detail-card-highlight" style={{ marginLeft: '6px' }}>
                                {selectedOrder.thanh_toan.phuong_thuc === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
                              </strong>
                            </div>
                            <div>Trạng thái thanh toán: 
                              <span style={{
                                marginLeft: '6px',
                                fontWeight: 700,
                                color: selectedOrder.thanh_toan.trang_thai.includes('Đã') ? 'var(--success)' : 'var(--warning)'
                              }}>
                                {selectedOrder.thanh_toan.trang_thai}
                              </span>
                            </div>
                            <div>Địa chỉ giao hàng: <strong className="order-detail-card-highlight">{order.dia_chi_giao}</strong></div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
