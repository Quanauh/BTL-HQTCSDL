const { sql, poolPromise } = require('../../config/db');

exports.getOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;
  const { search } = req.query;

  try {
    const pool = await poolPromise;
    if (!pool) {
      // Mock order history for admin
      let mockOrders = [
        { don_hang_id: 1, khach_hang_id: 999, ma_don: 'DH782910', ngay_dat: new Date(), trang_thai: 'Chờ xử lý', dia_chi_giao: '123 Đường Demo, Hà Nội', tong_tien: 35000000, ho_ten: 'Khách hàng Demo', email: 'demo@example.com' }
      ];
      if (search) {
        const query = search.toLowerCase();
        mockOrders = mockOrders.filter(o => o.ma_don.toLowerCase().includes(query) || o.ho_ten.toLowerCase().includes(query));
      }
      const totalItems = mockOrders.length;
      const totalPages = Math.ceil(totalItems / limit);
      const paginatedOrders = mockOrders.slice(offset, offset + limit);
      return res.json({
        orders: paginatedOrders,
        totalItems,
        totalPages,
        currentPage: page,
        limit
      });
    }

    const countRequest = pool.request();
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM DON_HANG dh WITH (NOLOCK)
      INNER JOIN KHACH_HANG kh WITH (NOLOCK) ON dh.khach_hang_id = kh.khach_hang_id
      WHERE 1=1
    `;

    const dataRequest = pool.request();
    let dataQuery = `
      SELECT dh.don_hang_id, dh.khach_hang_id, dh.ma_don, dh.ngay_dat, dh.trang_thai, dh.dia_chi_giao, dh.tong_tien, 
             kh.ho_ten, kh.email
      FROM DON_HANG dh WITH (NOLOCK)
      INNER JOIN KHACH_HANG kh WITH (NOLOCK) ON dh.khach_hang_id = kh.khach_hang_id
      WHERE 1=1
    `;

    if (search) {
      countQuery += ` AND (dh.ma_don LIKE @search OR kh.ho_ten LIKE @search)`;
      dataQuery += ` AND (dh.ma_don LIKE @search OR kh.ho_ten LIKE @search)`;
      countRequest.input('search', sql.NVarChar, `%${search}%`);
      dataRequest.input('search', sql.NVarChar, `%${search}%`);
    }

    const countResult = await countRequest.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    dataQuery += ` ORDER BY dh.ngay_dat DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    dataRequest.input('offset', sql.Int, offset);
    dataRequest.input('limit', sql.Int, limit);

    const dataResult = await dataRequest.query(dataQuery);

    res.json({
      orders: dataResult.recordset,
      totalItems,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách đơn hàng' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params; // don_hang_id
  const { trang_thai } = req.body; // New order status: 'Chờ xử lý', 'Đang giao', 'Đã giao', 'Hủy'

  if (!trang_thai) return res.status(400).json({ message: 'Thiếu trạng thái cập nhật' });

  try {
    const pool = await poolPromise;
    if (!pool) return res.json({ message: 'Cập nhật trạng thái thành công (Mock Mode)' });

    // Begin Transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Update DON_HANG status
      const requestDonHang = new sql.Request(transaction);
      await requestDonHang
        .input('id', sql.Int, id)
        .input('trang_thai', sql.NVarChar, trang_thai)
        .query('UPDATE DON_HANG SET trang_thai = @trang_thai WHERE don_hang_id = @id');

      // 2. Sync Payment (THANH_TOAN) and Shipping (VAN_CHUYEN) based on state
      const requestPayment = new sql.Request(transaction);
      const requestShipping = new sql.Request(transaction);

      if (trang_thai === 'Đã giao') {
        // Order delivered: Mark payment as completed, shipping as delivered
        await requestPayment
          .input('id', sql.Int, id)
          .query("UPDATE THANH_TOAN SET trang_thai = N'Đã thanh toán' WHERE don_hang_id = @id");

        await requestShipping
          .input('id', sql.Int, id)
          .query("UPDATE VAN_CHUYEN SET trang_thai = N'Đã giao hàng', ngay_giao_thuc_te = GETDATE() WHERE don_hang_id = @id");

      } else if (trang_thai === 'Đang giao') {
        // Shipping: Mark shipping as in-transit
        await requestShipping
          .input('id', sql.Int, id)
          .query("UPDATE VAN_CHUYEN SET trang_thai = N'Đang vận chuyển' WHERE don_hang_id = @id");

      } else if (trang_thai === 'Hủy') {
        // Cancelled: Mark payment and shipping as cancelled
        await requestPayment
          .input('id', sql.Int, id)
          .query("UPDATE THANH_TOAN SET trang_thai = N'Đã hủy' WHERE don_hang_id = @id");

        await requestShipping
          .input('id', sql.Int, id)
          .query("UPDATE VAN_CHUYEN SET trang_thai = N'Đã hủy' WHERE don_hang_id = @id");
      }

      await transaction.commit();
      res.json({ message: 'Cập nhật trạng thái đơn hàng thành công!' });
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật trạng thái đơn hàng' });
  }
};
