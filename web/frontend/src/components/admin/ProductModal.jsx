import React from 'react';
import { X, Save } from 'lucide-react';

export default function ProductModal({
  editingProduct,
  brands,
  prodName,
  setProdName,
  prodBrandId,
  setProdBrandId,
  prodDesc,
  setProdDesc,
  prodPrice,
  setProdPrice,
  prodConHang,
  setProdConHang,
  handleSaveProduct,
  onClose
}) {
  return (
    <div className="admin-modal-overlay">
      <div className="glass-card admin-modal-card fade-in">
        <button onClick={onClose} className="admin-modal-close">
          <X size={18} />
        </button>
        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
          {editingProduct ? `Sửa sản phẩm: ${editingProduct.ten}` : 'Thêm sản phẩm mới'}
        </h3>
        
        <form onSubmit={handleSaveProduct} className="admin-form">
          <div className="admin-form-group">
            <label className="admin-form-label">Hãng sản xuất *</label>
            <select
              value={prodBrandId}
              onChange={(e) => setProdBrandId(e.target.value)}
              className="admin-form-select"
              required
            >
              <option value="" disabled>-- Chọn hãng sản xuất --</option>
              {brands.map(b => (
                <option key={b.hang_id} value={b.hang_id}>{b.ten}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Tên sản phẩm *</label>
            <input 
              type="text" 
              required
              placeholder="Ví dụ: iPhone 15 Pro Max 256GB..."
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Giá bán lẻ đề xuất (VND) *</label>
            <input 
              type="number" 
              required
              placeholder="Ví dụ: 29990000"
              value={prodPrice}
              onChange={(e) => setProdPrice(e.target.value)}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Trạng thái kho hàng</label>
            <select
              value={prodConHang ? 'true' : 'false'}
              onChange={(e) => setProdConHang(e.target.value === 'true')}
              className="admin-form-select"
            >
              <option value="true">Còn hàng đăng bán</option>
              <option value="false">Hết hàng tạm thời</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Mô tả thông tin chi tiết</label>
            <textarea 
              rows={4}
              placeholder="Nhập mô tả thông số kỹ thuật hoặc tính năng..."
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              className="admin-form-input"
              style={{ resize: 'none' }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ height: '44px', gap: '6px', marginTop: '10px' }}>
            <Save size={16} /> Lưu sản phẩm
          </button>
        </form>
      </div>
    </div>
  );
}
