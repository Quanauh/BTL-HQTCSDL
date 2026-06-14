import React from 'react';
import { X, Save } from 'lucide-react';

export default function UserModal({
  userEmail,
  setUserEmail,
  userRole,
  setUserRole,
  userHoTen,
  setUserHoTen,
  userSdt,
  setUserSdt,
  userDiaChi,
  setUserDiaChi,
  handleSaveUser,
  onClose
}) {
  return (
    <div className="admin-modal-overlay">
      <div className="glass-card admin-modal-card fade-in">
        <button onClick={onClose} className="admin-modal-close">
          <X size={18} />
        </button>
        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
          Sửa tài khoản người dùng: {userEmail}
        </h3>
        
        <form onSubmit={handleSaveUser} className="admin-form">
          <div className="admin-form-group">
            <label className="admin-form-label">Email tài khoản *</label>
            <input 
              type="email" 
              required
              placeholder="Ví dụ: user@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Vai trò hệ thống *</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="admin-form-select"
              required
            >
              <option value="customer">Khách hàng (customer)</option>
              <option value="admin">Quản trị viên (admin)</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Họ và tên khách hàng *</label>
            <input 
              type="text" 
              required
              placeholder="Ví dụ: Nguyễn Văn A"
              value={userHoTen}
              onChange={(e) => setUserHoTen(e.target.value)}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Số điện thoại liên hệ</label>
            <input 
              type="text" 
              placeholder="Ví dụ: 0912345678"
              value={userSdt}
              onChange={(e) => setUserSdt(e.target.value)}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Địa chỉ giao hàng mặc định</label>
            <input 
              type="text" 
              placeholder="Ví dụ: 123 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội"
              value={userDiaChi}
              onChange={(e) => setUserDiaChi(e.target.value)}
              className="admin-form-input"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ height: '44px', gap: '6px', marginTop: '10px' }}>
            <Save size={16} /> Lưu tài khoản
          </button>
        </form>
      </div>
    </div>
  );
}
