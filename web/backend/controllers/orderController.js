const { sql, poolPromise } = require('../config/db');
const { mockCarts } = require('./cartController');

// In-memory fallback for local demo when SQL Server is offline
const mockOrders = [];

exports.placeOrder = async (req, res) => {
  const khach_hang_id = req.user.khach_hang_id;
  const { dia_chi_giao, phuong_thuc_thanh_toan } = req.body;

  if (!dia_chi_giao) {
    return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ giao hàng' });
  }

  const ma_don = 'DH' + Date.now().toString().slice(-8);

  try {
    const pool = await poolPromise;
    if (!pool) {
      // Mock database fallback
      const cart = mockCarts[khach_hang_id] || [];
      if (cart.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống' });
      }

      const tong_tien = cart.reduce((sum, item) => sum + (item.gia * item.so_luong), 0);
      const don_hang_id = mockOrders.length + 1;

      const newOrder = {
        don_hang_id,
        khach_hang_id,
        ma_don,
        ngay_dat: new Date(),
        trang_thai: 'Chờ xử lý',
        dia_chi_giao,
        tong_tien,
        items: cart.map(item => ({
          ctdh_id: Math.floor(Math.random() * 10000),
          don_hang_id,
          san_pham_id: item.san_pham_id,
          so_luong: item.so_luong,
          don_gia: item.gia,
          ten_san_pham: item.ten
        })),
        thanh_toan: {
          thanh_toan_id: Math.floor(Math.random() * 10000),
          don_hang_id,
          trang_thai: 'Chờ thanh toán',
          phuong_thuc: phuong_thuc_thanh_toan || 'COD',
          tong_tien
        },
        van_chuyen: {
          van_chuyen_id: Math.floor(Math.random() * 10000),
          don_hang_id,
          don_vi_vc: 'Giao Hàng Nhanh (GHN)',
          ma_vc_cua_don: 'VC' + Math.floor(100000 + Math.random() * 900000),
          trang_thai: 'Chờ lấy hàng',
          ngay_giao_thuc_te: null,
          du_kien_giao: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }
      };

      mockOrders.unshift(newOrder);
      mockCarts[khach_hang_id] = []; // Clear mock cart
      return res.status(201).json({ message: 'Đặt hàng thành công (Mock Mode)', orderId: don_hang_id, ma_don });
    }

    // --- TRANSACTIONAL DATABASE EXECUTION ---

    // 1. Get cart items from SQL Server
    const cartResult = await pool.request()
      .input('khach_hang_id', sql.Int, khach_hang_id)
      .query(`
        SELECT gh.san_pham_id, gh.so_luong, sp.ten, sp.gia
        FROM GIO_HANG gh
        INNER JOIN SAN_PHAM sp ON gh.san_pham_id = sp.san_pham_id
        WHERE gh.khach_hang_id = @khach_hang_id
      `);

    const cartItems = cartResult.recordset;
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống, không thể đặt hàng' });
    }

    // 2. Compute total
    const tong_tien = cartItems.reduce((sum, item) => sum + (item.gia * item.so_luong), 0);

    // 3. Begin transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 4. Insert DON_HANG
      const requestDonHang = new sql.Request(transaction);
      const resDonHang = await requestDonHang
        .input('khach_hang_id', sql.Int, khach_hang_id)
        .input('ma_don', sql.NVarChar, ma_don)
        .input('trang_thai', sql.NVarChar, 'Chờ xử lý')
        .input('dia_chi_giao', sql.NVarChar, dia_chi_giao)
        .input('tong_tien', sql.Decimal(18, 2), tong_tien)
        .query(`
          INSERT INTO DON_HANG (khach_hang_id, ma_don, ngay_dat, trang_thai, dia_chi_giao, tong_tien)
          OUTPUT Inserted.don_hang_id
          VALUES (@khach_hang_id, @ma_don, GETDATE(), @trang_thai, @dia_chi_giao, @tong_tien)
        `);

      const don_hang_id = resDonHang.recordset[0].don_hang_id;

      // 5. Insert CHI_TIET_DON_HANG and clear GIO_HANG
      for (const item of cartItems) {
        const requestCtdh = new sql.Request(transaction);
        await requestCtdh
          .input('don_hang_id', sql.Int, don_hang_id)
          .input('san_pham_id', sql.Int, item.san_pham_id)
          .input('so_luong', sql.Int, item.so_luong)
          .input('don_gia', sql.Decimal(18, 2), item.gia)
          .input('ten_san_pham', sql.NVarChar, item.ten)
          .query(`
            INSERT INTO CHI_TIET_DON_HANG (don_hang_id, san_pham_id, so_luong, don_gia, ten_san_pham)
            VALUES (@don_hang_id, @san_pham_id, @so_luong, @don_gia, @ten_san_pham)
          `);
      }

      // 6. Delete items from GIO_HANG
      const requestClearCart = new sql.Request(transaction);
      await requestClearCart
        .input('khach_hang_id', sql.Int, khach_hang_id)
        .query('DELETE FROM GIO_HANG WHERE khach_hang_id = @khach_hang_id');

      // 7. Insert THANH_TOAN log
      const requestThanhToan = new sql.Request(transaction);
      await requestThanhToan
        .input('don_hang_id', sql.Int, don_hang_id)
        .input('trang_thai', sql.NVarChar, 'Chưa thanh toán')
        .input('phuong_thuc', sql.NVarChar, phuong_thuc_thanh_toan || 'COD')
        .input('tong_tien', sql.Decimal(18, 2), tong_tien)
        .query(`
          INSERT INTO THANH_TOAN (don_hang_id, trang_thai, phuong_thuc, tong_tien)
          VALUES (@don_hang_id, @trang_thai, @phuong_thuc, @tong_tien)
        `);

      // 8. Insert VAN_CHUYEN tracker (3 days delivery estimation)
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 3);

      const requestVanChuyen = new sql.Request(transaction);
      await requestVanChuyen
        .input('don_hang_id', sql.Int, don_hang_id)
        .input('don_vi_vc', sql.NVarChar, 'Giao Hàng Nhanh (GHN)')
        .input('ma_vc_cua_don', sql.NVarChar, 'VC' + Math.floor(100000 + Math.random() * 900000))
        .input('trang_thai', sql.NVarChar, 'Chờ lấy hàng')
        .input('du_kien_giao', sql.DateTime, expectedDate)
        .query(`
          INSERT INTO VAN_CHUYEN (don_hang_id, don_vi_vc, ma_vc_cua_don, trang_thai, ngay_giao_thuc_te, du_kien_giao)
          VALUES (@don_hang_id, @don_vi_vc, @ma_vc_cua_don, @trang_thai, NULL, @du_kien_giao)
        `);

      // 9. Commit Transaction
      await transaction.commit();
      res.status(201).json({ message: 'Đặt hàng thành công!', orderId: don_hang_id, ma_don });
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error('Lỗi khi thanh toán đặt hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi đặt hàng' });
  }
};

exports.getOrders = async (req, res) => {
  const khach_hang_id = req.user.khach_hang_id;
  try {
    const pool = await poolPromise;
    if (!pool) {
      // Mock fallback filter by active user
      const userOrders = mockOrders.filter(o => o.khach_hang_id === khach_hang_id);
      return res.json(userOrders);
    }

    const result = await pool.request()
      .input('khach_hang_id', sql.Int, khach_hang_id)
      .query('SELECT don_hang_id, ma_don, ngay_dat, trang_thai, dia_chi_giao, tong_tien FROM DON_HANG WHERE khach_hang_id = @khach_hang_id ORDER BY ngay_dat DESC');

    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy lịch sử đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách đơn hàng' });
  }
};

exports.getOrderDetail = async (req, res) => {
  const { id } = req.params; // don_hang_id
  const khach_hang_id = req.user.khach_hang_id;

  try {
    const pool = await poolPromise;
    if (!pool) {
      const order = mockOrders.find(o => o.don_hang_id === parseInt(id) && o.khach_hang_id === khach_hang_id);
      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      return res.json(order);
    }

    // 1. Fetch main order detail
    const orderResult = await pool.request()
      .input('id', sql.Int, id)
      .input('khach_hang_id', sql.Int, khach_hang_id)
      .query('SELECT don_hang_id, ma_don, ngay_dat, trang_thai, dia_chi_giao, tong_tien FROM DON_HANG WHERE don_hang_id = @id AND khach_hang_id = @khach_hang_id');

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    const order = orderResult.recordset[0];

    // 2. Fetch order items
    const itemsResult = await pool.request()
      .input('don_hang_id', sql.Int, id)
      .query('SELECT ctdh_id, san_pham_id, so_luong, don_gia, ten_san_pham FROM CHI_TIET_DON_HANG WHERE don_hang_id = @don_hang_id');
    order.items = itemsResult.recordset;

    // 3. Fetch payment info
    const payResult = await pool.request()
      .input('don_hang_id', sql.Int, id)
      .query('SELECT thanh_toan_id, trang_thai, phuong_thuc, tong_tien FROM THANH_TOAN WHERE don_hang_id = @don_hang_id');
    order.thanh_toan = payResult.recordset[0] || null;

    // 4. Fetch shipping tracker
    const shipResult = await pool.request()
      .input('don_hang_id', sql.Int, id)
      .query('SELECT van_chuyen_id, don_vi_vc, ma_vc_cua_don, trang_thai, ngay_giao_thuc_te, du_kien_giao FROM VAN_CHUYEN WHERE don_hang_id = @don_hang_id');
    order.van_chuyen = shipResult.recordset[0] || null;

    res.json(order);
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết đơn hàng' });
  }
};
