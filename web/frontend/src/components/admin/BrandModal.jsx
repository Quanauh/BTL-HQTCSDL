import React from 'react';
import { X, Save } from 'lucide-react';

export default function BrandModal({
  editingBrand,
  brandName,
  setBrandName,
  brandDesc,
  setBrandDesc,
  handleSaveBrand,
  onClose
}) {
  return (
    <div className="admin-modal-overlay">
      <div className="glass-card admin-modal-card fade-in">
        <button onClick={onClose} className="admin-modal-close">
          <X size={18} />
        </button>
        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
          {editingBrand ? `Sửa hãng: ${editingBrand.ten}` : 'Thêm hãng sản xuất mới'}
        </h3>
        
        <form onSubmit={handleSaveBrand} className="admin-form">
          <div className="admin-form-group">
            <label className="admin-form-label">Tên hãng sản xuất *</label>
            <input 
              type="text" 
              required
              placeholder="Ví dụ: Apple, Sony..."
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Mô tả thương hiệu</label>
            <textarea 
              rows={4}
              placeholder="Nhập thông tin giới thiệu về thương hiệu..."
              value={brandDesc}
              onChange={(e) => setBrandDesc(e.target.value)}
              className="admin-form-input"
              style={{ resize: 'none' }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ height: '44px', gap: '6px', marginTop: '10px' }}>
            <Save size={16} /> Lưu thông tin hãng
          </button>
        </form>
      </div>
    </div>
  );
}
