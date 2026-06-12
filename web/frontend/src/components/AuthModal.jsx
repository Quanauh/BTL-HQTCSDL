import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd] = useState('');

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regPwd, setRegPwd] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(loginEmail, loginPwd);
    setLoading(false);
    
    if (res.success) {
      onClose();
      // Clear inputs
      setLoginEmail('');
      setLoginPwd('');
    } else {
      setError(res.error || 'Tên đăng nhập hoặc mật khẩu không khớp.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await register(regEmail, regPwd, regName, regPhone, regAddress);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Đăng ký thành công! Hãy chuyển sang Đăng nhập.');
      // Clear inputs
      setRegEmail('');
      setRegPwd('');
      setRegName('');
      setRegPhone('');
      setRegAddress('');
      // Auto-switch to login tab after 2 seconds
      setTimeout(() => {
        setActiveTab('login');
        setSuccessMsg('');
      }, 2000);
    } else {
      setError(res.error || 'Không thể đăng ký tài khoản.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card fade-in modal-card">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="modal-close-btn"
        >
          <X size={20} />
        </button>

        {/* Tabs */}
        <div className="modal-tabs">
          <button 
            onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
            className={`modal-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
            className={`modal-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          >
            Đăng ký
          </button>
        </div>

        {/* Error / Success Display */}
        {error && (
          <div className="modal-error-banner">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="modal-success-banner">
            {successMsg}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="modal-form">
            <div className="modal-form-group">
              <label className="modal-form-label">
                <Mail size={14} /> Email đăng nhập
              </label>
              <input 
                type="email" 
                required
                placeholder="vidu@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="modal-form-input"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <Lock size={14} /> Mật khẩu
              </label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={loginPwd}
                onChange={(e) => setLoginPwd(e.target.value)}
                className="modal-form-input"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary modal-submit-btn"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="modal-form register-form">
            <div className="modal-form-group register-group">
              <label className="modal-form-label">
                <Mail size={14} /> Địa chỉ Email *
              </label>
              <input 
                type="email" 
                required
                placeholder="vidu@gmail.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="modal-form-input register-input"
              />
            </div>

            <div className="modal-form-group register-group">
              <label className="modal-form-label">
                <Lock size={14} /> Mật khẩu *
              </label>
              <input 
                type="password" 
                required
                placeholder="Ít nhất 6 ký tự"
                value={regPwd}
                onChange={(e) => setRegPwd(e.target.value)}
                className="modal-form-input register-input"
              />
            </div>

            <div className="modal-form-group register-group">
              <label className="modal-form-label">
                <User size={14} /> Họ và tên *
              </label>
              <input 
                type="text" 
                required
                placeholder="Nguyễn Văn A"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="modal-form-input register-input"
              />
            </div>

            <div className="modal-form-group register-group">
              <label className="modal-form-label">
                <Phone size={14} /> Số điện thoại
              </label>
              <input 
                type="text" 
                placeholder="0987654321"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="modal-form-input register-input"
              />
            </div>

            <div className="modal-form-group register-group">
              <label className="modal-form-label">
                <MapPin size={14} /> Địa chỉ giao hàng mặc định
              </label>
              <input 
                type="text" 
                placeholder="Số nhà, Tên đường, Tỉnh/Thành phố"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                className="modal-form-input register-input"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary modal-submit-btn"
            >
              {loading ? 'Đang tạo...' : 'Đăng ký tài khoản'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
