import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ProductsTab({
  products,
  productSearchInput,
  setProductSearchInput,
  productPage,
  setProductPage,
  productTotalPages,
  setProductSearch,
  handleOpenProductModal,
  handleDeleteProduct,
  formatPrice
}) {
  const triggerSearch = () => {
    setProductPage(1);
    setProductSearch(productSearchInput);
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Danh sách Sản phẩm</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-search-wrapper">
            <input 
              type="text" 
              placeholder="Tìm tên sản phẩm..." 
              value={productSearchInput}
              onChange={(e) => setProductSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') triggerSearch(); }}
              className="admin-search-input"
            />
            <button onClick={triggerSearch} className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>Tìm</button>
          </div>
          <button onClick={() => handleOpenProductModal()} className="btn btn-primary" style={{ gap: '6px', padding: '8px 16px' }}>
            <Plus size={16} /> Thêm sản phẩm mới
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã SP (ID)</th>
              <th>Hãng</th>
              <th>Tên sản phẩm</th>
              <th>Mô tả tóm tắt</th>
              <th>Giá bán lẻ</th>
              <th>Kho hàng</th>
              <th style={{ width: '120px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.san_pham_id}>
                <td style={{ fontWeight: 700 }}>#{prod.san_pham_id}</td>
                <td>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#e2e8f0' }}>
                    {prod.ten_hang}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{prod.ten}</td>
                <td style={{ color: 'var(--text-secondary)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {prod.mo_ta}
                </td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(prod.gia)}</td>
                <td>
                  {prod.con_hang ? (
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>Còn hàng</span>
                  ) : (
                    <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Hết hàng</span>
                  )}
                </td>
                <td>
                  <div className="admin-action-btn-group">
                    <button onClick={() => handleOpenProductModal(prod)} className="admin-action-btn edit" title="Sửa">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDeleteProduct(prod.san_pham_id)} className="admin-action-btn delete" title="Xóa">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button 
          disabled={productPage <= 1} 
          onClick={() => setProductPage(prev => prev - 1)}
          className="btn btn-secondary btn-sm"
        >
          Trước
        </button>
        <span className="pagination-info">Trang {productPage} / {productTotalPages}</span>
        <button 
          disabled={productPage >= productTotalPages} 
          onClick={() => setProductPage(prev => prev + 1)}
          className="btn btn-secondary btn-sm"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
