import React from 'react';
import { ShoppingBag, Laptop, Tag } from 'lucide-react';

export default function OverviewTab({ reports, formatPrice }) {
  if (!reports) return null;

  return (
    <div>
      {/* KPIs Grid */}
      <div className="admin-stats-grid">
        <div className="glass-card admin-stat-card">
          <div className="admin-stat-icon-box" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <ShoppingBag size={24} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Tổng số đơn hàng</span>
            <span className="admin-stat-val">{reports.stats.totalOrders}</span>
          </div>
        </div>

        <div className="glass-card admin-stat-card">
          <div className="admin-stat-icon-box" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>₫</span>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Doanh thu tổng</span>
            <span className="admin-stat-val">{formatPrice(reports.stats.totalRevenue)}</span>
          </div>
        </div>

        <div className="glass-card admin-stat-card">
          <div className="admin-stat-icon-box" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Laptop size={24} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Số sản phẩm đăng bán</span>
            <span className="admin-stat-val">{reports.stats.totalProducts}</span>
          </div>
        </div>

        <div className="glass-card admin-stat-card">
          <div className="admin-stat-icon-box" style={{ backgroundColor: '#e0f7fa', color: '#00bcd4' }}>
            <Tag size={24} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Hãng liên kết</span>
            <span className="admin-stat-val">{reports.stats.activeBrands}</span>
          </div>
        </div>
      </div>

      {/* Sales splits reports charts */}
      <div className="admin-reports-grid">
        {/* Revenue by Brand */}
        <div className="glass-card admin-report-card">
          <h3 className="admin-report-title">
            <Tag size={18} style={{ color: 'var(--primary)' }} /> Doanh thu theo Hãng sản xuất
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reports.brandRevenue.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Chưa có doanh số theo hãng.</p>
            ) : (
              reports.brandRevenue.map((item, idx) => {
                const maxVal = Math.max(...reports.brandRevenue.map(b => b.value), 1);
                const pct = (item.value / maxVal) * 100;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                      <span>{item.name}</span>
                      <span>{formatPrice(item.value)}</span>
                    </div>
                    <div className="admin-report-bar-bg">
                      <div className="admin-report-bar-fill" style={{ width: `${pct}%`, backgroundColor: 'var(--primary)' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="glass-card admin-report-card">
          <h3 className="admin-report-title">
            <Laptop size={18} style={{ color: 'var(--success)' }} /> Top sản phẩm bán chạy nhất
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reports.topProducts.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Chưa có sản phẩm bán được.</p>
            ) : (
              reports.topProducts.map((item, idx) => {
                const maxQty = Math.max(...reports.topProducts.map(p => p.value), 1);
                const pct = (item.value / maxQty) * 100;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                      <span>{item.name}</span>
                      <span>{item.value} sản phẩm</span>
                    </div>
                    <div className="admin-report-bar-bg">
                      <div className="admin-report-bar-fill" style={{ width: `${pct}%`, backgroundColor: 'var(--success)' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
