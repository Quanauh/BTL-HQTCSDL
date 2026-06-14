import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Tag, Laptop, ShoppingBag, LogOut, Users } from 'lucide-react';
import './AdminDashboard.css';

// Modular Admin sub-components
import OverviewTab from './admin/OverviewTab';
import BrandsTab from './admin/BrandsTab';
import ProductsTab from './admin/ProductsTab';
import OrdersTab from './admin/OrdersTab';
import UsersTab from './admin/UsersTab';
import BrandModal from './admin/BrandModal';
import ProductModal from './admin/ProductModal';
import UserModal from './admin/UserModal';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'brands' | 'products' | 'orders' | 'users'
  
  // Data states
  const [reports, setReports] = useState(null);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]); // for select options dropdown
  const [paginatedBrands, setPaginatedBrands] = useState([]); // for the Brand Management tab
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Pagination & Search states
  const [brandPage, setBrandPage] = useState(1);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandSearchInput, setBrandSearchInput] = useState('');
  const [brandTotalPages, setBrandTotalPages] = useState(1);

  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState('');
  const [productSearchInput, setProductSearchInput] = useState('');
  const [productTotalPages, setProductTotalPages] = useState(1);

  const [orderPage, setOrderPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSearchInput, setOrderSearchInput] = useState('');
  const [orderTotalPages, setOrderTotalPages] = useState(1);

  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Modal states
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [brandDesc, setBrandDesc] = useState('');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodBrandId, setProdBrandId] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodConHang, setProdConHang] = useState(true);

  // User Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('customer');
  const [userHoTen, setUserHoTen] = useState('');
  const [userSdt, setUserSdt] = useState('');
  const [userDiaChi, setUserDiaChi] = useState('');

  // Headers helper
  const getAdminHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'x-account-id': user?.tai_khoan_id?.toString() || '999',
      'x-role': 'admin'
    };
  };

  // --- API FETCHERS ---
  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/reports', { headers: getAdminHeaders() });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/brands');
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPaginatedBrands = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/brands?page=${brandPage}&limit=8&search=${brandSearch}`, { headers: getAdminHeaders() });
      if (response.ok) {
        const data = await response.json();
        setPaginatedBrands(data.brands || []);
        setBrandTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products?page=${productPage}&limit=8&search=${productSearch}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setProductTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders?page=${orderPage}&limit=8&search=${orderSearch}`, { headers: getAdminHeaders() });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setOrderTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users?page=${userPage}&limit=8&search=${userSearch}`, { headers: getAdminHeaders() });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setUserTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sync tab loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'overview') {
        await fetchReports();
      } else if (activeTab === 'brands') {
        await fetchPaginatedBrands();
      } else if (activeTab === 'products') {
        await fetchBrands(); // need brands list for options
        await fetchProducts();
      } else if (activeTab === 'orders') {
        await fetchOrders();
      } else if (activeTab === 'users') {
        await fetchUsers();
      }
      setLoading(false);
    };
    loadData();
  }, [activeTab, brandPage, brandSearch, productPage, productSearch, orderPage, orderSearch, userPage, userSearch]);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  // --- BRAND ACTIONS ---
  const handleOpenBrandModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandName(brand.ten);
      setBrandDesc(brand.mo_ta || '');
    } else {
      setEditingBrand(null);
      setBrandName('');
      setBrandDesc('');
    }
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    const url = editingBrand 
      ? `http://localhost:5000/api/admin/brands/${editingBrand.hang_id}`
      : 'http://localhost:5000/api/admin/brands';
    const method = editingBrand ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify({ ten: brandName, mo_ta: brandDesc })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message);
        setIsBrandModalOpen(false);
        fetchPaginatedBrands();
      } else {
        showToast(data.message || 'Lỗi xử lý', true);
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', true);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hãng sản xuất này?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/brands/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message);
        fetchPaginatedBrands();
      } else {
        showToast(data.message, true);
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', true);
    }
  };

  // --- PRODUCT ACTIONS ---
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProdName(product.ten);
      setProdBrandId(product.hang_id);
      setProdDesc(product.mo_ta || '');
      setProdPrice(product.gia);
      setProdConHang(product.con_hang);
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdBrandId(brands[0]?.hang_id || '');
      setProdDesc('');
      setProdPrice('');
      setProdConHang(true);
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const url = editingProduct
      ? `http://localhost:5000/api/admin/products/${editingProduct.san_pham_id}`
      : 'http://localhost:5000/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify({
          hang_id: parseInt(prodBrandId),
          ten: prodName,
          mo_ta: prodDesc,
          gia: parseFloat(prodPrice),
          con_hang: prodConHang
        })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message);
        setIsProductModalOpen(false);
        fetchProducts();
      } else {
        showToast(data.message || 'Lỗi xử lý', true);
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', true);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message);
        fetchProducts();
      } else {
        showToast(data.message, true);
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', true);
    }
  };

  // --- ORDER ACTIONS ---
  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ trang_thai: nextStatus })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message);
        fetchOrders();
      } else {
        showToast(data.message, true);
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', true);
    }
  };

  // --- USER ACTIONS ---
  const handleOpenUserModal = (usr = null) => {
    if (usr) {
      setEditingUser(usr);
      setUserEmail(usr.email || '');
      setUserRole(usr.vai_tro || 'customer');
      setUserHoTen(usr.ho_ten || '');
      setUserSdt(usr.so_dien_thoai || '');
      setUserDiaChi(usr.dia_chi || '');
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const url = `http://localhost:5000/api/admin/users/${editingUser.tai_khoan_id}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          email: userEmail,
          vai_tro: userRole,
          ho_ten: userHoTen,
          so_dien_thoai: userSdt,
          dia_chi: userDiaChi
        })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message);
        setIsUserModalOpen(false);
        fetchUsers();
      } else {
        showToast(data.message || 'Lỗi xử lý', true);
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', true);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message);
        fetchUsers();
      } else {
        showToast(data.message || 'Lỗi xử lý', true);
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', true);
    }
  };

  // Utils
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="admin-layout">
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
          zIndex: 1100,
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      {/* Header Bar */}
      <header className="admin-header">
        <div className="admin-title-group">
          <span className="admin-title">⚡ TechShop Admin</span>
          <span className="admin-badge">Hệ thống Quản trị</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Chào, {user?.ho_ten}</span>
          <button onClick={logout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', gap: '6px' }}>
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Tab Selectors */}
      <nav className="admin-nav-tabs">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} /> Tổng quan
        </button>
        <button 
          onClick={() => setActiveTab('brands')} 
          className={`admin-tab-btn ${activeTab === 'brands' ? 'active' : ''}`}
        >
          <Tag size={18} /> Quản lý Hãng
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
        >
          <Laptop size={18} /> Quản lý Sản phẩm
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <ShoppingBag size={18} /> Quản lý Đơn hàng
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          <Users size={18} /> Quản lý Người dùng
        </button>
      </nav>

      {/* Main Panel Content */}
      <main className="admin-main-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="fade-in">
            {activeTab === 'overview' && reports && (
              <OverviewTab reports={reports} formatPrice={formatPrice} />
            )}
            
            {activeTab === 'brands' && (
              <BrandsTab
                paginatedBrands={paginatedBrands}
                brandSearchInput={brandSearchInput}
                setBrandSearchInput={setBrandSearchInput}
                brandPage={brandPage}
                setBrandPage={setBrandPage}
                brandTotalPages={brandTotalPages}
                setBrandSearch={setBrandSearch}
                handleOpenBrandModal={handleOpenBrandModal}
                handleDeleteBrand={handleDeleteBrand}
              />
            )}

            {activeTab === 'products' && (
              <ProductsTab
                products={products}
                productSearchInput={productSearchInput}
                setProductSearchInput={setProductSearchInput}
                productPage={productPage}
                setProductPage={setProductPage}
                productTotalPages={productTotalPages}
                setProductSearch={setProductSearch}
                handleOpenProductModal={handleOpenProductModal}
                handleDeleteProduct={handleDeleteProduct}
                formatPrice={formatPrice}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                orderSearchInput={orderSearchInput}
                setOrderSearchInput={setOrderSearchInput}
                orderPage={orderPage}
                setOrderPage={setOrderPage}
                orderTotalPages={orderTotalPages}
                setOrderSearch={setOrderSearch}
                handleUpdateOrderStatus={handleUpdateOrderStatus}
                formatPrice={formatPrice}
              />
            )}

            {activeTab === 'users' && (
              <UsersTab
                users={users}
                userSearchInput={userSearchInput}
                setUserSearchInput={setUserSearchInput}
                userPage={userPage}
                setUserPage={setUserPage}
                userTotalPages={userTotalPages}
                setUserSearch={setUserSearch}
                handleOpenUserModal={handleOpenUserModal}
                handleDeleteUser={handleDeleteUser}
                currentUser={user}
              />
            )}
          </div>
        )}
      </main>

      {/* Brand Form Dialog */}
      {isBrandModalOpen && (
        <BrandModal
          editingBrand={editingBrand}
          brandName={brandName}
          setBrandName={setBrandName}
          brandDesc={brandDesc}
          setBrandDesc={setBrandDesc}
          handleSaveBrand={handleSaveBrand}
          onClose={() => setIsBrandModalOpen(false)}
        />
      )}

      {isProductModalOpen && (
        <ProductModal
          editingProduct={editingProduct}
          brands={brands}
          prodName={prodName}
          setProdName={setProdName}
          prodBrandId={prodBrandId}
          setProdBrandId={setProdBrandId}
          prodDesc={prodDesc}
          setProdDesc={setProdDesc}
          prodPrice={prodPrice}
          setProdPrice={setProdPrice}
          prodConHang={prodConHang}
          setProdConHang={setProdConHang}
          handleSaveProduct={handleSaveProduct}
          onClose={() => setIsProductModalOpen(false)}
        />
      )}

      {isUserModalOpen && (
        <UserModal
          userEmail={userEmail}
          setUserEmail={setUserEmail}
          userRole={userRole}
          setUserRole={setUserRole}
          userHoTen={userHoTen}
          setUserHoTen={setUserHoTen}
          userSdt={userSdt}
          setUserSdt={setUserSdt}
          userDiaChi={userDiaChi}
          setUserDiaChi={setUserDiaChi}
          handleSaveUser={handleSaveUser}
          onClose={() => setIsUserModalOpen(false)}
        />
      )}
    </div>
  );
}
