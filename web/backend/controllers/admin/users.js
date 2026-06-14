const { sql, poolPromise } = require('../../config/db');

exports.getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;
  const { search } = req.query;

  try {
    const pool = await poolPromise;
    if (!pool) {
      let mockUsers = [
        { tai_khoan_id: 1, email: 'admin@example.com', vai_tro: 'admin', khach_hang_id: 1, ho_ten: 'Quản trị viên', so_dien_thoai: '0123456789', dia_chi: 'Hà Nội' },
        { tai_khoan_id: 2, email: 'customer@example.com', vai_tro: 'customer', khach_hang_id: 2, ho_ten: 'Nguyễn Văn A', so_dien_thoai: '0987654321', dia_chi: 'Hồ Chí Minh' },
        { tai_khoan_id: 999, email: 'demo@example.com', vai_tro: 'customer', khach_hang_id: 999, ho_ten: 'Khách hàng Demo', so_dien_thoai: '0987654321', dia_chi: '123 Đường Demo, Hà Nội' }
      ];
      if (search) {
        const query = search.toLowerCase();
        mockUsers = mockUsers.filter(u => u.email.toLowerCase().includes(query) || u.ho_ten.toLowerCase().includes(query));
      }
      const totalItems = mockUsers.length;
      const totalPages = Math.ceil(totalItems / limit);
      const paginatedUsers = mockUsers.slice(offset, offset + limit);
      return res.json({
        users: paginatedUsers,
        totalItems,
        totalPages,
        currentPage: page,
        limit
      });
    }

    const countRequest = pool.request();
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM TAI_KHOAN tk
      LEFT JOIN KHACH_HANG kh ON tk.tai_khoan_id = kh.tai_khoan_id
      WHERE 1=1
    `;

    const dataRequest = pool.request();
    let dataQuery = `
      SELECT tk.tai_khoan_id, tk.email, tk.vai_tro, kh.khach_hang_id, kh.ho_ten, kh.so_dien_thoai, kh.dia_chi
      FROM TAI_KHOAN tk
      LEFT JOIN KHACH_HANG kh ON tk.tai_khoan_id = kh.tai_khoan_id
      WHERE 1=1
    `;

    if (search) {
      countQuery += ` AND (tk.email LIKE @search OR kh.ho_ten LIKE @search)`;
      dataQuery += ` AND (tk.email LIKE @search OR kh.ho_ten LIKE @search)`;
      countRequest.input('search', sql.NVarChar, `%${search}%`);
      dataRequest.input('search', sql.NVarChar, `%${search}%`);
    }

    const countResult = await countRequest.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    dataQuery += ` ORDER BY tk.tai_khoan_id DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    dataRequest.input('offset', sql.Int, offset);
    dataRequest.input('limit', sql.Int, limit);

    const dataResult = await dataRequest.query(dataQuery);

    res.json({
      users: dataResult.recordset,
      totalItems,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách người dùng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách người dùng' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params; // tai_khoan_id
  const { email, vai_tro, ho_ten, so_dien_thoai, dia_chi } = req.body;

  if (!email || !vai_tro || !ho_ten) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin (email, vai trò, họ tên)' });
  }

  const roleLower = vai_tro.toLowerCase();
  if (roleLower !== 'admin' && roleLower !== 'customer') {
    return res.status(400).json({ message: 'Vai trò không hợp lệ (chỉ chấp nhận admin hoặc customer)' });
  }

  try {
    const pool = await poolPromise;
    if (!pool) return res.json({ message: 'Cập nhật tài khoản thành công (Mock Mode)' });

    // Check email collision
    const checkEmail = await pool.request()
      .input('id', sql.Int, id)
      .input('email', sql.NVarChar, email)
      .query('SELECT tai_khoan_id FROM TAI_KHOAN WHERE email = @email AND tai_khoan_id <> @id');

    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({ message: 'Email này đã được sử dụng bởi tài khoản khác' });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Update TAI_KHOAN
      const requestTaiKhoan = new sql.Request(transaction);
      await requestTaiKhoan
        .input('id', sql.Int, id)
        .input('email', sql.NVarChar, email)
        .input('vai_tro', sql.NVarChar, roleLower)
        .query('UPDATE TAI_KHOAN SET email = @email, vai_tro = @vai_tro WHERE tai_khoan_id = @id');

      // 2. Check if customer profile exists
      const requestCheckKhach = new sql.Request(transaction);
      const checkKhach = await requestCheckKhach
        .input('tai_khoan_id', sql.Int, id)
        .query('SELECT khach_hang_id FROM KHACH_HANG WHERE tai_khoan_id = @tai_khoan_id');

      const requestProfile = new sql.Request(transaction);
      requestProfile
        .input('tai_khoan_id', sql.Int, id)
        .input('ho_ten', sql.NVarChar, ho_ten)
        .input('email', sql.NVarChar, email)
        .input('so_dien_thoai', sql.NVarChar, so_dien_thoai || null)
        .input('dia_chi', sql.NVarChar, dia_chi || null);

      if (checkKhach.recordset.length > 0) {
        await requestProfile.query(`
          UPDATE KHACH_HANG 
          SET ho_ten = @ho_ten, email = @email, so_dien_thoai = @so_dien_thoai, dia_chi = @dia_chi 
          WHERE tai_khoan_id = @tai_khoan_id
        `);
      } else {
        await requestProfile.query(`
          INSERT INTO KHACH_HANG (tai_khoan_id, ho_ten, email, so_dien_thoai, dia_chi)
          VALUES (@tai_khoan_id, @ho_ten, @email, @so_dien_thoai, @dia_chi)
        `);
      }

      await transaction.commit();
      res.json({ message: 'Cập nhật thông tin tài khoản thành công!' });
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error('Lỗi cập nhật tài khoản:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật tài khoản' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params; // tai_khoan_id

  try {
    const pool = await poolPromise;
    if (!pool) return res.json({ message: 'Xóa tài khoản thành công (Mock Mode)' });

    // Prevent deleting the currently acting admin account
    const actingAdminId = req.headers['x-account-id'];
    if (actingAdminId && parseInt(actingAdminId) === parseInt(id)) {
      return res.status(400).json({ message: 'Không thể tự xóa tài khoản của chính mình!' });
    }

    // Check order history
    const checkOrders = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT COUNT(dh.don_hang_id) AS count 
        FROM DON_HANG dh
        INNER JOIN KHACH_HANG kh ON dh.khach_hang_id = kh.khach_hang_id
        WHERE kh.tai_khoan_id = @id
      `);

    if (checkOrders.recordset[0].count > 0) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản này vì đã có lịch sử đơn hàng. Vui lòng giữ lại để đối soát.' });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Delete from GIO_HANG
      const requestGioHang = new sql.Request(transaction);
      await requestGioHang
        .input('id', sql.Int, id)
        .query('DELETE FROM GIO_HANG WHERE khach_hang_id IN (SELECT khach_hang_id FROM KHACH_HANG WHERE tai_khoan_id = @id)');

      // 2. Delete from KHACH_HANG
      const requestKhach = new sql.Request(transaction);
      await requestKhach
        .input('id', sql.Int, id)
        .query('DELETE FROM KHACH_HANG WHERE tai_khoan_id = @id');

      // 3. Delete from TAI_KHOAN
      const requestTaiKhoan = new sql.Request(transaction);
      await requestTaiKhoan
        .input('id', sql.Int, id)
        .query('DELETE FROM TAI_KHOAN WHERE tai_khoan_id = @id');

      await transaction.commit();
      res.json({ message: 'Đã xóa tài khoản thành công!' });
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error('Lỗi khi xóa tài khoản:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa tài khoản' });
  }
};
