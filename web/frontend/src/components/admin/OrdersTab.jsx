import React from 'react';

export default function OrdersTab({
  orders,
  orderSearchInput,
  setOrderSearchInput,
  orderPage,
  setOrderPage,
  orderTotalPages,
  setOrderSearch,
  handleUpdateOrderStatus,
  formatPrice
}) {
  const triggerSearch = () => {
    setOrderPage(1);
    setOrderSearch(orderSearchInput);
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Quản lý Đơn hàng Khách hàng</h2>
        <div className="admin-search-wrapper">
          <input
            type="text"
            placeholder="Tìm mã đơn hoặc khách..."
            value={orderSearchInput}
            onChange={(e) => setOrderSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') triggerSearch(); }}
            className="admin-search-input"
          />
          <button onClick={triggerSearch} className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>Tìm</button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày đặt</th>
              <th>Khách hàng</th>
              <th>Địa chỉ giao</th>
              <th>Thành tiền</th>
              <th>Trạng thái hiện tại</th>
              <th>Cập nhật trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.don_hang_id}>
                <td style={{ fontWeight: 700 }}>{order.ma_don}</td>
                <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {new Date(order.ngay_dat).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{order.ho_ten}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.email}</span>
                  </div>
                </td>
                <td style={{ maxWidth: '200px', fontSize: '13px' }}>{order.dia_chi_giao}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(order.tong_tien)}</td>
                <td>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: order.trang_thai === 'Đã giao' ? '#d1fae5' : order.trang_thai === 'Hủy' ? '#f3f4f6' : order.trang_thai === 'Đang giao' ? '#dbeafe' : '#fef3c7',
                    color: order.trang_thai === 'Đã giao' ? '#065f46' : order.trang_thai === 'Hủy' ? '#374151' : order.trang_thai === 'Đang giao' ? '#1e40af' : '#92400e'
                  }}>
                    {order.trang_thai}
                  </span>
                </td>
                <td>
                  <select
                    value={order.trang_thai}
                    onChange={(e) => handleUpdateOrderStatus(order.don_hang_id, e.target.value)}
                    className="admin-form-select"
                    style={{ padding: '4px 8px', fontSize: '13px', minWidth: '120px' }}
                  >
                    <option value="Chờ xử lý">Chờ xử lý</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Đã giao">Đã giao</option>
                    <option value="Hủy">Hủy đơn</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button
          disabled={orderPage <= 1}
          onClick={() => setOrderPage(prev => prev - 1)}
          className="btn btn-secondary btn-sm"
        >
          Trước
        </button>
        <span className="pagination-info">Trang {orderPage} / {orderTotalPages}</span>
        <button
          disabled={orderPage >= orderTotalPages}
          onClick={() => setOrderPage(prev => prev + 1)}
          className="btn btn-secondary btn-sm"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
