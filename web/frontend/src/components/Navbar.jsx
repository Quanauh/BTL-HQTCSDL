import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, User, Search, LogOut, LogIn, Package } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ activeView, setActiveView, onSearch, setShowAuthModal }) {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  return (
    <header className="glass-card navbar-header">
      <div className="container navbar-container">
        {/* Logo */}
        <div 
          onClick={() => { setActiveView('shop'); onSearch(''); setSearchVal(''); }} 
          className="navbar-logo"
        >
          <span className="navbar-logo-text">
            ⚡ TechShop
          </span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="navbar-search-form">
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="navbar-search-input"
          />
          <button type="submit" className="navbar-search-btn">
            <Search size={18} />
          </button>
        </form>

        {/* Navigation Menus */}
        <nav className="navbar-nav">
          <span 
            onClick={() => setActiveView('shop')}
            className={`navbar-nav-link ${activeView === 'shop' ? 'active' : ''}`}
          >
            Sản phẩm
          </span>

          {user && (
            <span 
              onClick={() => setActiveView('orders')}
              className={`navbar-nav-link ${activeView === 'orders' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Package size={16} /> Lịch sử đơn
            </span>
          )}

          {/* Cart Icon with Badge */}
          <div 
            onClick={() => setActiveView('cart')}
            className={`navbar-cart-container ${activeView === 'cart' ? 'active' : ''}`}
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="badge navbar-cart-badge">
                {cartCount}
              </span>
            )}
          </div>

          <div className="navbar-divider"></div>

          {/* Authentication user control */}
          {user ? (
            <div className="navbar-profile">
              <div 
                onClick={() => setActiveView('profile')}
                className={`navbar-profile-link ${activeView === 'profile' ? 'active' : ''}`}
              >
                <User size={18} />
                <span className="navbar-profile-name">{user.ho_ten}</span>
              </div>
              <button 
                onClick={() => { logout(); setActiveView('shop'); }}
                className="btn btn-secondary navbar-logout-btn"
              >
                <LogOut size={14} /> Đăng xuất
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="btn btn-primary navbar-auth-btn"
            >
              <LogIn size={16} /> Đăng nhập
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
