import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function BrandsTab({
  paginatedBrands,
  brandSearchInput,
  setBrandSearchInput,
  brandPage,
  setBrandPage,
  brandTotalPages,
  setBrandSearch,
  handleOpenBrandModal,
  handleDeleteBrand
}) {
  const triggerSearch = () => {
    setBrandPage(1);
    setBrandSearch(brandSearchInput);
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Danh mục Hãng sản xuất</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-search-wrapper">
            <input 
              type="text" 
              placeholder="Tìm tên hãng..." 
              value={brandSearchInput}
              onChange={(e) => setBrandSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') triggerSearch(); }}
              className="admin-search-input"
            />
            <button onClick={triggerSearch} className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>Tìm</button>
          </div>
          <button onClick={() => handleOpenBrandModal()} className="btn btn-primary" style={{ gap: '6px', padding: '8px 16px' }}>
            <Plus size={16} /> Thêm hãng mới
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã hãng (ID)</th>
              <th>Tên hãng</th>
              <th>Mô tả thương hiệu</th>
              <th style={{ width: '120px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBrands.map(brand => (
              <tr key={brand.hang_id}>
                <td style={{ fontWeight: 700 }}>#{brand.hang_id}</td>
                <td style={{ fontWeight: 600 }}>{brand.ten}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{brand.mo_ta || '(Chưa có mô tả)'}</td>
                <td>
                  <div className="admin-action-btn-group">
                    <button onClick={() => handleOpenBrandModal(brand)} className="admin-action-btn edit" title="Sửa">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDeleteBrand(brand.hang_id)} className="admin-action-btn delete" title="Xóa">
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
          disabled={brandPage <= 1} 
          onClick={() => setBrandPage(prev => prev - 1)}
          className="btn btn-secondary btn-sm"
        >
          Trước
        </button>
        <span className="pagination-info">Trang {brandPage} / {brandTotalPages}</span>
        <button 
          disabled={brandPage >= brandTotalPages} 
          onClick={() => setBrandPage(prev => prev + 1)}
          className="btn btn-secondary btn-sm"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
