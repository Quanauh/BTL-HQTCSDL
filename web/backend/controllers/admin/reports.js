const { sql, poolPromise } = require('../../config/db');

exports.getReports = async (req, res) => {
  try {
    const pool = await poolPromise;
    if (!pool) {
      // Mock reporting statistics for demo
      return res.json({
        stats: {
          totalOrders: 12,
          totalRevenue: 185600000,
          totalProducts: 9,
          activeBrands: 5
        },
        brandRevenue: [
          { name: 'Apple', value: 95470000 },
          { name: 'Samsung', value: 57980000 },
          { name: 'Sony', value: 9480000 },
          { name: 'Asus', value: 17990000 },
          { name: 'Xiaomi', value: 5990000 }
        ],
        topProducts: [
          { name: 'MacBook Pro 14 M3', value: 2 },
          { name: 'iPhone 15 Pro Max 256GB', value: 2 },
          { name: 'Samsung Galaxy S24 Ultra 256GB', value: 1 },
          { name: 'Sony WH-1000XM5', value: 1 },
          { name: 'Asus ROG Ally Z1 Extreme', value: 1 }
        ]
      });
    }

    // 1. Core KPIs
    const kpiResult = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM DON_HANG) AS totalOrders,
        (SELECT ISNULL(SUM(tong_tien), 0) FROM DON_HANG WHERE trang_thai <> N'Hủy') AS totalRevenue,
        (SELECT COUNT(*) FROM SAN_PHAM) AS totalProducts,
        (SELECT COUNT(*) FROM HANG) AS activeBrands
    `);

    // 2. Revenue split by Brand
    const brandRevenueResult = await pool.request().query(`
      SELECT h.ten AS name, ISNULL(SUM(ctdh.so_luong * ctdh.don_gia), 0) AS value
      FROM CHI_TIET_DON_HANG ctdh
      INNER JOIN SAN_PHAM sp ON ctdh.san_pham_id = sp.san_pham_id
      INNER JOIN HANG h ON sp.hang_id = h.hang_id
      INNER JOIN DON_HANG dh ON ctdh.don_hang_id = dh.don_hang_id
      WHERE dh.trang_thai <> N'Hủy'
      GROUP BY h.ten
    `);

    // 3. Top 5 best selling products
    const topProductsResult = await pool.request().query(`
      SELECT TOP 5 ctdh.ten_san_pham AS name, SUM(ctdh.so_luong) AS value
      FROM CHI_TIET_DON_HANG ctdh
      INNER JOIN DON_HANG dh ON ctdh.don_hang_id = dh.don_hang_id
      WHERE dh.trang_thai <> N'Hủy'
      GROUP BY ctdh.ten_san_pham
      ORDER BY value DESC
    `);

    res.json({
      stats: kpiResult.recordset[0],
      brandRevenue: brandRevenueResult.recordset,
      topProducts: topProductsResult.recordset
    });
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu báo cáo:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi kết xuất báo cáo' });
  }
};
