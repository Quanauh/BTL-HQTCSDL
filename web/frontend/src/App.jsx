import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Profile from './components/Profile';
import AuthModal from './components/AuthModal';

function AppContent() {
  const [activeView, setActiveView] = useState('shop'); // 'shop' | 'detail' | 'cart' | 'orders' | 'profile'
  const [activeProductId, setActiveProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setActiveView('shop'); // Go to catalog when searching
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'shop':
        return (
          <ProductList 
            searchQuery={searchQuery} 
            onSelectProduct={(id) => {
              setActiveProductId(id);
              setActiveView('detail');
            }}
            setShowAuthModal={setShowAuthModal}
          />
        );
      case 'detail':
        return (
          <ProductDetail 
            productId={activeProductId} 
            onBack={() => setActiveView('shop')}
            setShowAuthModal={setShowAuthModal}
          />
        );
      case 'cart':
        return (
          <Cart 
            setActiveView={setActiveView}
            setShowAuthModal={setShowAuthModal}
          />
        );
      case 'orders':
        return <Orders />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <ProductList 
            searchQuery={searchQuery} 
            onSelectProduct={(id) => {
              setActiveProductId(id);
              setActiveView('detail');
            }}
            setShowAuthModal={setShowAuthModal}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Sticky Top Header */}
      <Navbar 
        activeView={activeView}
        setActiveView={setActiveView}
        onSearch={handleSearch}
        setShowAuthModal={setShowAuthModal}
      />

      {/* Main Container Viewport */}
      <main className="container" style={{ flexGrow: 1, paddingBottom: '40px' }}>
        {renderActiveView()}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border)',
        padding: '24px 0',
        backgroundColor: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        fontSize: '14px',
        color: 'var(--text-secondary)'
      }}>
        <div className="container">
          <p>© 2026 E-Commerce Customer Portal. Built with React, Express, and SQL Server.</p>
        </div>
      </footer>

      {/* Popup Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

// App component wrapping contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
