const { sql, poolPromise } = require('../config/db');

// In-memory fallback for local demo when SQL Server is offline
const mockCarts = {};

exports.getCart = async (req, res) => {
  const khach_hang_id = req.user.khach_hang_id;
  try {
    const pool = await poolPromise;
    if (!pool) {
      const cart = mockCarts[khach_hang_id] || [];
      return res.json(cart);
    }

    const result = await pool.request()
      .input('khach_hang_id', sql.Int, khach_hang_id)
      .query(`
        SELECT gh.gio_hang_id, gh.san_pham_id, gh.so_luong, sp.ten, sp.gia, sp.anh_url, h.ten AS ten_hang
        FROM GIO_HANG gh
        INNER JOIN SAN_PHAM sp ON gh.san_pham_id = sp.san_pham_id
        LEFT JOIN HANG h ON sp.hang_id = h.hang_id
        WHERE gh.khach_hang_id = @khach_hang_id
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy giỏ hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy giỏ hàng' });
  }
};

exports.addToCart = async (req, res) => {
  const khach_hang_id = req.user.khach_hang_id;
  const { san_pham_id, so_luong } = req.body;
  
  if (!san_pham_id) {
    return res.status(400).json({ message: 'Thiếu san_pham_id' });
  }

  const qty = parseInt(so_luong) || 1;

  try {
    const pool = await poolPromise;
    if (!pool) {
      // Mock database fallback
      const mockProducts = [
        { san_pham_id: 1, hang_id: 1, ten: 'iPhone 15 Pro Max', mo_ta: 'Điện thoại thông minh cao cấp nhất của Apple với khung Titan siêu bền và camera zoom 5x.', gia: 29990000, con_hang: true, anh_url: '/images/iphone15.png', ten_hang: 'Apple' },
        { san_pham_id: 2, hang_id: 2, ten: 'Samsung Galaxy S24 Ultra', mo_ta: 'Flagship đỉnh cao từ Samsung tích hợp bút S-Pen và tính năng AI thông minh vượt trội.', gia: 28990000, con_hang: true, anh_url: '/images/s24ultra.png', ten_hang: 'Samsung' },
        { san_pham_id: 3, hang_id: 1, ten: 'MacBook Pro M3', mo_ta: 'Laptop làm việc chuyên nghiệp, chip Apple M3 hiệu năng mạnh mẽ, thời lượng pin 22 tiếng.', gia: 39990000, con_hang: true, anh_url: '/images/macbookm3.png', ten_hang: 'Apple' },
        { san_pham_id: 4, hang_id: 3, ten: 'Sony WH-1000XM5', mo_ta: 'Tai nghe chụp tai chống ồn hàng đầu thế giới với âm thanh chất lượng cao Hi-Res audio.', gia: 6490000, con_hang: true, anh_url: '/images/sonyheadphones.png', ten_hang: 'Sony' },
        { san_pham_id: 5, hang_id: 4, ten: 'Asus ROG Ally', mo_ta: 'Máy chơi game cầm tay chạy Windows 11 mạnh mẽ, màn hình 120Hz mượt mà ấn tượng.', gia: 17990000, con_hang: true, anh_url: '/images/rogally.png', ten_hang: 'Asus' }
      ];

      const product = mockProducts.find(p => p.san_pham_id === parseInt(san_pham_id));
      if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

      if (!mockCarts[khach_hang_id]) {
        mockCarts[khach_hang_id] = [];
      }

      const existingIndex = mockCarts[khach_hang_id].findIndex(item => item.san_pham_id === parseInt(san_pham_id));
      if (existingIndex >= 0) {
        mockCarts[khach_hang_id][existingIndex].so_luong += qty;
      } else {
        mockCarts[khach_hang_id].push({
          gio_hang_id: Date.now() + Math.floor(Math.random() * 1000), // Random temporary ID
          san_pham_id: parseInt(san_pham_id),
          so_luong: qty,
          ten: product.ten,
          gia: product.gia,
          anh_url: product.anh_url,
          ten_hang: product.ten_hang
        });
      }
      return res.json({ message: 'Thêm vào giỏ hàng thành công (Mock Mode)' });
    }

    // Check if item already exists in the customer's cart
    const checkExist = await pool.request()
      .input('khach_hang_id', sql.Int, khach_hang_id)
      .input('san_pham_id', sql.Int, san_pham_id)
      .query('SELECT gio_hang_id, so_luong FROM GIO_HANG WHERE khach_hang_id = @khach_hang_id AND san_pham_id = @san_pham_id');

    if (checkExist.recordset.length > 0) {
      const newQty = checkExist.recordset[0].so_luong + qty;
      await pool.request()
        .input('gio_hang_id', sql.Int, checkExist.recordset[0].gio_hang_id)
        .input('so_luong', sql.Int, newQty)
        .query('UPDATE GIO_HANG SET so_luong = @so_luong WHERE gio_hang_id = @gio_hang_id');
    } else {
      await pool.request()
        .input('khach_hang_id', sql.Int, khach_hang_id)
        .input('san_pham_id', sql.Int, san_pham_id)
        .input('so_luong', sql.Int, qty)
        .query('INSERT INTO GIO_HANG (khach_hang_id, san_pham_id, so_luong) VALUES (@khach_hang_id, @san_pham_id, @so_luong)');
    }

    res.json({ message: 'Thêm vào giỏ hàng thành công!' });
  } catch (err) {
    console.error('Lỗi khi thêm vào giỏ hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm vào giỏ hàng' });
  }
};

exports.updateQuantity = async (req, res) => {
  const khach_hang_id = req.user.khach_hang_id;
  const { gio_hang_id, so_luong } = req.body;

  if (!gio_hang_id || so_luong === undefined) {
    return res.status(400).json({ message: 'Thiếu thông tin cập nhật' });
  }

  const qty = parseInt(so_luong);
  if (qty <= 0) {
    return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
  }

  try {
    const pool = await poolPromise;
    if (!pool) {
      // Mock mode
      if (mockCarts[khach_hang_id]) {
        const item = mockCarts[khach_hang_id].find(i => i.gio_hang_id === parseInt(gio_hang_id));
        if (item) {
          item.so_luong = qty;
        }
      }
      return res.json({ message: 'Cập nhật số lượng thành công (Mock Mode)' });
    }

    const result = await pool.request()
      .input('gio_hang_id', sql.Int, gio_hang_id)
      .input('khach_hang_id', sql.Int, khach_hang_id)
      .input('so_luong', sql.Int, qty)
      .query('UPDATE GIO_HANG SET so_luong = @so_luong WHERE gio_hang_id = @gio_hang_id AND khach_hang_id = @khach_hang_id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng để cập nhật' });
    }

    res.json({ message: 'Cập nhật số lượng thành công!' });
  } catch (err) {
    console.error('Lỗi khi cập nhật số lượng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật giỏ hàng' });
  }
};

exports.removeFromCart = async (req, res) => {
  const khach_hang_id = req.user.khach_hang_id;
  const { id } = req.params; // gio_hang_id

  try {
    const pool = await poolPromise;
    if (!pool) {
      // Mock mode
      if (mockCarts[khach_hang_id]) {
        mockCarts[khach_hang_id] = mockCarts[khach_hang_id].filter(i => i.gio_hang_id !== parseInt(id));
      }
      return res.json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công (Mock Mode)' });
    }

    const result = await pool.request()
      .input('gio_hang_id', sql.Int, id)
      .input('khach_hang_id', sql.Int, khach_hang_id)
      .query('DELETE FROM GIO_HANG WHERE gio_hang_id = @gio_hang_id AND khach_hang_id = @khach_hang_id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng' });
    }

    res.json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công!' });
  } catch (err) {
    console.error('Lỗi khi xóa khỏi giỏ hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa sản phẩm khỏi giỏ hàng' });
  }
};
// Export the mock database references for seeding orders later if needed
exports.mockCarts = mockCarts;
