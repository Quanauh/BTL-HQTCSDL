import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, Eye, PackageOpen, Filter } from 'lucide-react';
import './ProductList.css';

export default function ProductList({ searchQuery, onSelectProduct, setShowAuthModal }) {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  
  // Product & brand list state
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Price & Sorting states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [sort, setSort] = useState('');

  // Reset page when category, search, or price filters change
  useEffect(() => {
    setPage(1);
  }, [selectedBrand, searchQuery, appliedMinPrice, appliedMaxPrice, sort]);

  // Fetch Brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products/brands');
        if (response.ok) {
          const data = await response.json();
          setBrands(data);
        }
      } catch (err) {
        console.error('Lỗi lấy hãng sản xuất:', err);
      }
    };
    fetchBrands();
  }, []);

  // Fetch paginated products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:5000/api/products';
        const params = [`page=${page}`, `limit=8`];
        
        if (selectedBrand) params.push(`brandId=${selectedBrand}`);
        if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
        if (appliedMinPrice) params.push(`minPrice=${appliedMinPrice}`);
        if (appliedMaxPrice) params.push(`maxPrice=${appliedMaxPrice}`);
        if (sort) params.push(`sort=${sort}`);
        
        url += `?${params.join('&')}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.totalItems || 0);
        }
      } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedBrand, searchQuery, page, appliedMinPrice, appliedMaxPrice, sort]);

  const handleApplyPriceFilter = (e) => {
    e.preventDefault();
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
  };

  const handleResetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setSort('');
    setSelectedBrand(null);
  };

  const handleAddToCart = async (productId, productName) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const res = await addToCart(productId, 1);
    if (res.success) {
      showToast(`Đã thêm ${productName} vào giỏ hàng!`);
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

  const getBrandTagStyle = (brandName) => {
    const name = brandName?.toLowerCase() || '';
    if (name.includes('apple')) return { background: '#f5f5f7', color: '#1d1d1f', border: '1px solid #d2d2d7' };
    if (name.includes('samsung')) return { background: '#e8f0fe', color: '#1a73e8' };
    if (name.includes('sony')) return { background: '#fce8e6', color: '#d93025' };
    if (name.includes('asus')) return { background: '#f3e8ff', color: '#9333ea' };
    return { background: '#f0fdf4', color: '#16a34a' };
  };

  return (
    <div className="fade-in">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.isError ? 'bg-danger' : 'bg-success'}`} style={{
          backgroundColor: toast.isError ? 'var(--danger)' : 'var(--success)'
        }}>
          {toast.message}
        </div>
      )}

      {/* Hero Section Banner */}
      <div className="hero-banner">
        <h1 className="hero-title">Cửa Hàng Công Nghệ Demo</h1>
        <p className="hero-desc">
          Trải nghiệm mua sắm thiết bị di động, laptop, phụ kiện chính hãng với quy trình giao dịch nhanh chóng và lịch trình đơn hàng minh bạch.
        </p>
      </div>

      {/* Filters Area */}
      <div className="filters-wrapper">
        {/* Brand chips */}
        <div>
          <h3 className="filter-group-title">Hãng sản xuất</h3>
          <div className="brand-filters">
            <button 
              onClick={() => setSelectedBrand(null)}
              className="btn"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: selectedBrand === null ? 'var(--primary)' : 'var(--surface)',
                color: selectedBrand === null ? 'white' : 'var(--text-secondary)',
                border: selectedBrand === null ? 'none' : '1px solid var(--border)'
              }}
            >
              Tất cả
            </button>
            {brands.map(brand => (
              <button
                key={brand.hang_id}
                onClick={() => setSelectedBrand(brand.hang_id)}
                className="btn"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: selectedBrand === brand.hang_id ? 'var(--primary)' : 'var(--surface)',
                  color: selectedBrand === brand.hang_id ? 'white' : 'var(--text-secondary)',
                  border: selectedBrand === brand.hang_id ? 'none' : '1px solid var(--border)'
                }}
              >
                {brand.ten}
              </button>
            ))}
          </div>
        </div>

        {/* Price filter inputs and Sort dropdown */}
        <form onSubmit={handleApplyPriceFilter} className="price-filter-row">
          
          <div className="price-input-control">
            <span className="price-input-label">Giá tối thiểu (đ)</span>
            <input 
              type="number" 
              placeholder="Ví dụ: 5000000" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="price-field-input"
            />
          </div>

          <div className="price-input-control">
            <span className="price-input-label">Giá tối đa (đ)</span>
            <input 
              type="number" 
              placeholder="Ví dụ: 30000000" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="price-field-input"
            />
          </div>

          <div className="price-input-control">
            <span className="price-input-label">Sắp xếp theo giá</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="sort-select-field"
            >
              <option value="">Mặc định</option>
              <option value="asc">Giá tăng dần ↑</option>
              <option value="desc">Giá giảm dần ↓</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px', gap: '6px' }}>
              <Filter size={14} /> Lọc giá
            </button>
            <button type="button" onClick={handleResetFilters} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Reset bộ lọc
            </button>
          </div>

        </form>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card product-empty-card">
          <PackageOpen size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Không tìm thấy sản phẩm nào</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
        </div>
      ) : (
        <>
          <div className="grid-products">
            {products.map(prod => (
              <div key={prod.san_pham_id} className="glass-card product-card hover-lift">
                {/* Product Badge Area */}
                <div className="product-card-badge-area">
                  <span className="product-card-brand-logo">
                    {prod.ten_hang}
                  </span>
                  
                  {/* Brand Tag overlay */}
                  <span className="product-card-brand-tag" style={getBrandTagStyle(prod.ten_hang)}>
                    {prod.ten_hang}
                  </span>

                  {/* Stock Status */}
                  {!prod.con_hang && (
                    <span className="product-card-stock-tag">
                      Hết hàng
                    </span>
                  )}
                </div>

                {/* Info Container */}
                <div className="product-card-info">
                  <h4 onClick={() => onSelectProduct(prod.san_pham_id)} className="product-card-title">
                    {prod.ten}
                  </h4>
                  
                  <p className="product-card-desc">
                    {prod.mo_ta}
                  </p>

                  <div className="product-card-footer">
                    <span className="product-card-price">
                      {formatPrice(prod.gia)}
                    </span>
                    
                    <div className="product-card-actions">
                      <button 
                        onClick={() => onSelectProduct(prod.san_pham_id)}
                        className="btn btn-secondary"
                        title="Chi tiết"
                        style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleAddToCart(prod.san_pham_id, prod.ten)}
                        disabled={!prod.con_hang}
                        className="btn btn-primary"
                        title="Thêm vào giỏ"
                        style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="btn btn-secondary"
                style={{
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1
                }}
              >
                Trước
              </button>

              <span className="pagination-text">
                Trang {page} / {totalPages} ({totalItems} sản phẩm)
              </span>

              <button 
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="btn btn-secondary"
                style={{
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1
                }}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
