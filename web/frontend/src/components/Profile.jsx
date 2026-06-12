import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Phone, MapPin, Mail, Save } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const [hoTen, setHoTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      setHoTen(user.ho_ten || '');
      setSoDienThoai(user.so_dien_thoai || '');
      setDiaChi(user.dia_chi || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hoTen.trim()) {
      alert('Họ và tên không được để trống');
      return;
    }
    setLoading(true);
    const res = await updateProfile(hoTen, soDienThoai, diaChi);
    setLoading(false);
    if (res.success) {
      showToast('Cập nhật thông tin tài khoản thành công!');
    } else {
      showToast(res.error || 'Cập nhật thất bại', true);
    }
  };

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  if (!user) {
    return (
      <div className="glass-card fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', fontWeight: 600 }}>Vui lòng đăng nhập để xem thông tin cá nhân.</p>
      </div>
    );
  }

  return (
    <div className="fade-in profile-wrapper">
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

      <div className="glass-card profile-card">
        <h2 className="profile-title">
          <User size={24} style={{ color: 'var(--primary)' }} /> Thông tin cá nhân khách hàng
        </h2>

        <form onSubmit={handleSubmit} className="profile-form">
          
          {/* Email (Read only) */}
          <div className="profile-form-group">
            <label className="profile-form-label">
              <Mail size={14} /> Địa chỉ Email (Không thể thay đổi)
            </label>
            <input 
              type="email" 
              disabled
              value={user.email || ''}
              className="profile-input-readonly"
            />
          </div>

          {/* Full name */}
          <div className="profile-form-group">
            <label className="profile-form-label">
              <User size={14} /> Họ và tên khách hàng *
            </label>
            <input 
              type="text" 
              required
              placeholder="Nhập họ và tên..."
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              className="profile-input-field"
            />
          </div>

          {/* Phone number */}
          <div className="profile-form-group">
            <label className="profile-form-label">
              <Phone size={14} /> Số điện thoại liên hệ
            </label>
            <input 
              type="text" 
              placeholder="Nhập số điện thoại..."
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              className="profile-input-field"
            />
          </div>

          {/* Address */}
          <div className="profile-form-group">
            <label className="profile-form-label">
              <MapPin size={14} /> Địa chỉ nhận hàng mặc định
            </label>
            <textarea 
              rows={3}
              placeholder="Nhập địa chỉ giao hàng..."
              value={diaChi}
              onChange={(e) => setDiaChi(e.target.value)}
              className="profile-textarea-field"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary profile-submit-btn"
          >
            <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
